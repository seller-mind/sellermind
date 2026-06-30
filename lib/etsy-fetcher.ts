/**
 * SM Free Etsy SEO Checker — Etsy URL fetcher with SSRF defense.
 *
 * Threats explicitly defended against (red-team scenarios §11):
 *   1. SSRF to AWS metadata / localhost / link-local (169.254.x.x / 10.x / 172.16-31.x / 192.168.x.x / fc00::)
 *   2. Open redirect via lookalike hostnames (etsy.com.evil.com)
 *   3. Non-https schemes (file://, gopher://, data:)
 *   4. Etsy reverse-proxy / cache poisoning via IP literals
 *   5. Response-body bomb (>500KB hard cap)
 *   6. Slow-loris (5s hard timeout via AbortController)
 *   7. Redirect chain ping-pong (max 3 hops, all re-validated)
 *
 * IMPORTANT: this module is server-side only. Calling it from a client
 * component will leak the user's IP to Etsy.
 */

import * as cheerio from "cheerio";
import type { EtsyListingSnapshot } from "./etsy-types";

// ============ Constants ============

export const ETSY_URL_RE =
  /^https?:\/\/(www\.)?etsy\.com\/listing\/(\d+)(\/[^?#]*)?(\?[^#]*)?(#.*)?$/i;

const FETCH_TIMEOUT_MS = 6_000;
const MAX_BODY_BYTES = 500 * 1024; // 500 KB
const MAX_REDIRECTS = 3;
const ALLOWED_HOSTS = new Set(["www.etsy.com", "etsy.com"]);
const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

// ============ Public API ============

export interface UrlValidationResult {
  ok: boolean;
  /** canonical url (lowercased host, https forced, anchor stripped) */
  canonical?: string;
  listing_id?: string;
  reason?: string;
}

/**
 * Strictly validate a candidate Etsy listing URL. Returns a CANONICAL form
 * suitable for cache key + outbound fetch.
 *
 * This is the SSRF gate. Anything that passes here is safe to fetch.
 */
export function validateEtsyUrl(input: unknown): UrlValidationResult {
  if (typeof input !== "string") {
    return { ok: false, reason: "URL must be a string." };
  }
  const trimmed = input.trim();
  if (trimmed.length === 0 || trimmed.length > 2048) {
    return { ok: false, reason: "URL is empty or too long." };
  }

  // Regex pre-gate — also reject obvious tricks (newlines, control chars).
  if (/[\x00-\x1f\x7f\s"<>\\^`{|}]/.test(trimmed)) {
    return { ok: false, reason: "URL contains forbidden characters." };
  }

  // Reject path-traversal sequences in the raw URL before URL.parse
  // collapses them (it would resolve "/../foo" to "/foo" and hide the
  // attacker's intent).
  if (/\/\.\.(\/|$)/.test(trimmed) || /\/\.(\/|$)/.test(trimmed)) {
    return { ok: false, reason: "Path traversal is not allowed." };
  }

  // Match strict listing shape.
  const m = ETSY_URL_RE.exec(trimmed);
  if (!m) {
    return {
      ok: false,
      reason:
        "URL does not match an Etsy listing pattern (https://www.etsy.com/listing/{id}/...).",
    };
  }
  const listingId = m[2];

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return { ok: false, reason: "URL failed to parse." };
  }

  // Hostname must be EXACTLY www.etsy.com or etsy.com (case-insensitive).
  const host = parsed.hostname.toLowerCase();
  if (!ALLOWED_HOSTS.has(host)) {
    return {
      ok: false,
      reason: "Hostname must be www.etsy.com or etsy.com (no subdomains).",
    };
  }

  // Reject IP-literal hostnames belt-and-braces (Etsy never serves on IPs).
  if (isIpLiteral(host)) {
    return { ok: false, reason: "IP-literal hostnames are not allowed." };
  }

  // Force https in production for outbound fetch.
  const protocol = parsed.protocol.toLowerCase();
  if (protocol !== "https:" && protocol !== "http:") {
    return { ok: false, reason: "Scheme must be http(s)." };
  }

  // Reject port (Etsy uses default 443).
  if (parsed.port && parsed.port !== "" && parsed.port !== "443" && parsed.port !== "80") {
    return { ok: false, reason: "Non-default ports are not allowed." };
  }

  // Reject any embedded credentials (https://user:pass@etsy.com/...)
  if (parsed.username || parsed.password) {
    return { ok: false, reason: "URL must not contain credentials." };
  }

  // Reject path traversal attempts that survived the regex.
  if (parsed.pathname.includes("..")) {
    return { ok: false, reason: "Path traversal is not allowed." };
  }

  // Canonicalise: force https, lowercase host, drop fragment, drop tracking junk.
  const canonical = new URL(parsed.toString());
  canonical.protocol = "https:";
  canonical.hostname = "www.etsy.com";
  canonical.hash = "";
  // strip common tracking params (don't influence cache hit ratio)
  const dropParams = ["ref", "frs", "click_key", "click_sum", "share_time", "utm_source", "utm_medium", "utm_campaign"];
  for (const p of dropParams) canonical.searchParams.delete(p);

  return {
    ok: true,
    canonical: canonical.toString(),
    listing_id: listingId,
  };
}

/**
 * Quick check whether a hostname is an IP literal. Conservative — anything
 * vaguely numeric is rejected. Note: ALLOWED_HOSTS gate catches normal cases,
 * this is defence-in-depth for hostname-normalisation surprises (e.g. punycode).
 */
function isIpLiteral(host: string): boolean {
  if (host.includes(":")) return true; // IPv6 has colons; etsy.com hostnames never do
  // IPv4 dotted quad — any 4-part numeric host
  if (/^\d+\.\d+\.\d+\.\d+$/.test(host)) return true;
  // Decimal/hex/octal IPv4 weirdness — host with no letters at all
  if (/^[0-9.]+$/.test(host) || /^0x[0-9a-f]+$/i.test(host)) return true;
  return false;
}

// ============ HTML parser ============

/**
 * Best-effort parse of a public Etsy listing HTML. Tries multiple selector
 * paths since Etsy A/B-tests the DOM. Returns parse_quality so callers can
 * decide fallback strategy.
 */
export function parseEtsyHtml(
  html: string,
  url: string,
  listing_id: string
): EtsyListingSnapshot {
  const $ = cheerio.load(html);

  // ---- Title ----
  const title =
    text($('meta[property="og:title"]').attr("content")) ||
    text($("h1").first().text()) ||
    text($("title").text()) ||
    "";

  // ---- Description ----
  let description =
    text($('meta[property="og:description"]').attr("content")) ||
    text($('meta[name="description"]').attr("content")) ||
    "";

  // Look for the listing description div (Etsy frequently uses these data-ids).
  const descSelectors = [
    "[data-product-details-description-text-content]",
    "[data-id='listing-description']",
    "#description-text",
    ".listing-page-description",
  ];
  for (const sel of descSelectors) {
    const el = $(sel).first();
    if (el.length) {
      const t = text(el.text());
      if (t.length > description.length) description = t;
    }
  }
  // Hard cap before sending to LLM — prompt-injection / token bomb defence.
  description = description.slice(0, 2_000);

  // ---- Tags (from JSON-LD or fallbacks) ----
  const tags = extractTags($);

  // ---- Images + alt coverage ----
  const { image_count, alt_coverage } = extractImageStats($);

  // ---- Parse quality heuristic ----
  let parse_quality: EtsyListingSnapshot["parse_quality"] = "high";
  let signals = 0;
  if (title.length >= 5) signals++;
  if (description.length >= 30) signals++;
  if (tags.length >= 1) signals++;
  if (image_count >= 1) signals++;
  if (signals === 4) parse_quality = "high";
  else if (signals >= 2) parse_quality = "medium";
  else parse_quality = "low";

  return {
    url,
    listing_id,
    title,
    tags,
    description,
    image_count,
    alt_coverage,
    parse_quality,
  };
}

function text(v: string | undefined | null): string {
  if (!v) return "";
  return v
    .replace(/\s+/g, " ")
    .replace(/[\x00-\x1f\x7f]/g, "") // strip control chars (log-injection defence)
    .trim();
}

function extractTags($: cheerio.CheerioAPI): string[] {
  const tags: string[] = [];

  // 1) JSON-LD <script type="application/ld+json">
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const raw = $(el).contents().text();
      if (!raw) return;
      const data = JSON.parse(raw);
      const arr = Array.isArray(data) ? data : [data];
      for (const node of arr) {
        if (!node || typeof node !== "object") continue;
        // Product.keywords as comma-separated string OR array
        const kw = node.keywords;
        if (typeof kw === "string") {
          for (const t of kw.split(",")) {
            const x = text(t);
            if (x) tags.push(x.toLowerCase());
          }
        } else if (Array.isArray(kw)) {
          for (const t of kw) {
            const x = text(typeof t === "string" ? t : "");
            if (x) tags.push(x.toLowerCase());
          }
        }
      }
    } catch {
      /* swallow — bad JSON shouldn't 500 the route */
    }
  });

  // 2) Meta keywords fallback
  if (tags.length === 0) {
    const meta = $('meta[name="keywords"]').attr("content");
    if (meta) {
      for (const t of meta.split(",")) {
        const x = text(t);
        if (x) tags.push(x.toLowerCase());
      }
    }
  }

  // Dedupe + cap at 13 (Etsy max).
  return Array.from(new Set(tags)).slice(0, 13);
}

function extractImageStats($: cheerio.CheerioAPI): {
  image_count: number;
  alt_coverage: number;
} {
  // Prefer JSON-LD Product.image — it's the canonical product gallery count.
  let image_count = 0;
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const raw = $(el).contents().text();
      if (!raw) return;
      const data = JSON.parse(raw);
      const arr = Array.isArray(data) ? data : [data];
      for (const node of arr) {
        if (!node || typeof node !== "object") continue;
        if (Array.isArray(node.image)) {
          image_count = Math.max(image_count, node.image.length);
        } else if (typeof node.image === "string") {
          image_count = Math.max(image_count, 1);
        }
      }
    } catch {
      /* swallow */
    }
  });

  // DOM fallback — count <img> inside common listing gallery wrappers.
  let domImgs: cheerio.Cheerio<any> = $(
    "[data-listing-image], .listing-page-image, .image-carousel-container img, .vfl img"
  );
  if (domImgs.length === 0) domImgs = $("img");

  if (image_count === 0) image_count = Math.min(domImgs.length, 30);

  // Alt coverage — fraction of <img> with non-empty alt attribute.
  let nonEmpty = 0;
  let total = 0;
  domImgs.each((_, el) => {
    total++;
    const alt = $(el).attr("alt");
    if (alt && alt.trim().length > 0) nonEmpty++;
  });
  const alt_coverage = total > 0 ? nonEmpty / total : 0;

  return { image_count, alt_coverage };
}

// ============ Fetcher ============

export interface FetchResult {
  ok: boolean;
  status: number;
  body?: string;
  error?: string;
}

/**
 * Server-side fetch of an Etsy listing HTML. Caller must have already
 * validateEtsyUrl()'d the input. SSRF defense relies on that contract.
 *
 * - Hard 5s timeout (AbortController)
 * - Max 3 follow-redirects (each re-validated against ALLOWED_HOSTS)
 * - Body size cap 500KB (streamed read with running total)
 */
export async function fetchEtsyListing(canonicalUrl: string): Promise<FetchResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  let currentUrl = canonicalUrl;
  let hops = 0;
  try {
    while (hops <= MAX_REDIRECTS) {
      const res = await fetch(currentUrl, {
        method: "GET",
        redirect: "manual",
        signal: controller.signal,
        headers: {
          "User-Agent": USER_AGENT,
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
          "Sec-Ch-Ua":
            '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
          "Sec-Ch-Ua-Mobile": "?0",
          "Sec-Ch-Ua-Platform": '"macOS"',
          "Sec-Fetch-Dest": "document",
          "Sec-Fetch-Mode": "navigate",
          "Sec-Fetch-Site": "none",
          "Sec-Fetch-User": "?1",
          "Upgrade-Insecure-Requests": "1",
        },
      });

      // 3xx — re-validate next hop.
      if (res.status >= 300 && res.status < 400) {
        const loc = res.headers.get("location");
        if (!loc) {
          return { ok: false, status: res.status, error: "redirect without Location header" };
        }
        let next: URL;
        try {
          next = new URL(loc, currentUrl);
        } catch {
          return { ok: false, status: res.status, error: "invalid redirect target" };
        }
        const nextHost = next.hostname.toLowerCase();
        if (!ALLOWED_HOSTS.has(nextHost) || next.protocol !== "https:") {
          return {
            ok: false,
            status: res.status,
            error: `redirect to disallowed host: ${nextHost}`,
          };
        }
        currentUrl = next.toString();
        hops++;
        continue;
      }

      if (!res.ok) {
        return { ok: false, status: res.status, error: `upstream ${res.status}` };
      }

      // Stream-bounded read.
      const body = await readBoundedBody(res);
      if (body === null) {
        return { ok: false, status: res.status, error: "response exceeded 500KB cap" };
      }
      return { ok: true, status: res.status, body };
    }
    return { ok: false, status: 0, error: "too many redirects" };
  } catch (err) {
    const msg =
      err instanceof Error
        ? err.name === "AbortError"
          ? "timeout"
          : err.message
        : "unknown error";
    return { ok: false, status: 0, error: msg };
  } finally {
    clearTimeout(timeout);
  }
}

async function readBoundedBody(res: Response): Promise<string | null> {
  if (!res.body) return await res.text();
  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (!value) continue;
    total += value.byteLength;
    if (total > MAX_BODY_BYTES) {
      try {
        await reader.cancel();
      } catch {
        /* swallow */
      }
      return null;
    }
    chunks.push(value);
  }
  const merged = new Uint8Array(total);
  let offset = 0;
  for (const c of chunks) {
    merged.set(c, offset);
    offset += c.byteLength;
  }
  return new TextDecoder("utf-8").decode(merged);
}
