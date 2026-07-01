import { headers } from "next/headers";

/**
 * Emits a `<script type="application/ld+json">` block carrying the current
 * request's CSP nonce (set by middleware.ts, 2026-07-01 P3 fix).
 *
 * Server Component only — `headers()` requires the RSC runtime. If you need
 * to render JSON-LD from a Client Component, either:
 *   (a) render this component as a `children` slot passed in from a Server
 *       Component parent, or
 *   (b) accept `nonce` as an explicit prop and use a bare `<script>` (see
 *       `ToolLayout` which threads the nonce through as a prop).
 */
export function JsonLdScript({ data }: { data: unknown }) {
  const nonce = headers().get("x-nonce") || undefined;
  return (
    <script
      type="application/ld+json"
      nonce={nonce}
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
