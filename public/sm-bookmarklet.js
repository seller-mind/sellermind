/*!
 * SellerMind Free Etsy SEO Checker — bookmarklet loader payload.
 *
 * Loaded by user-installed bookmarklet on https://www.etsy.com/listing/...
 * 1. Extracts public listing data from DOM (og: meta + JSON-LD + DOM fallback)
 * 2. POSTs to https://thesellermind.com/api/etsy-audit-from-browser
 * 3. Opens audit report in new tab with result encoded in URL hash
 *
 * No listing content is persisted server-side. Audit is run on the public
 * listing data the user is already viewing.
 */
(function () {
  "use strict";

  var API_BASE = "https://thesellermind.com";
  var RETURN_URL = API_BASE + "/free-etsy-seo-checker";
  var BUILD_TAG = "sm-bm-2026-06-30-v1";

  function isEtsyListing() {
    return /(^|\.)etsy\.com$/i.test(location.hostname) &&
      /^\/listing\/\d+/.test(location.pathname);
  }

  function bail(msg, kind) {
    var c = kind === "err" ? "#c0392b" : "#E07A5F";
    var box = document.createElement("div");
    box.style.cssText = "position:fixed;top:20px;right:20px;z-index:2147483647;background:" + c + ";color:#fff;padding:14px 20px;border-radius:8px;font-family:system-ui,-apple-system,sans-serif;font-size:14px;box-shadow:0 4px 12px rgba(0,0,0,.2);max-width:340px;line-height:1.45;white-space:pre-line";
    box.textContent = msg;
    document.body.appendChild(box);
    setTimeout(function () { box.remove(); }, 7000);
    return box;
  }

  if (!isEtsyListing()) {
    bail("SellerMind SEO Checker\n\nOpen an Etsy listing page first\n(URL should be etsy.com/listing/...)", "err");
    return;
  }

  var listingId = (location.pathname.match(/\/listing\/(\d+)/) || [])[1];
  if (!listingId) {
    bail("SellerMind SEO Checker\n\nCould not detect a listing ID in this URL.", "err");
    return;
  }

  // ===== DOM extraction with 3-layer fallback =====
  function getMeta(name) {
    var el = document.querySelector('meta[property="' + name + '"]') ||
             document.querySelector('meta[name="' + name + '"]');
    return el ? (el.getAttribute("content") || "").trim() : "";
  }

  function getLdProduct() {
    var nodes = document.querySelectorAll('script[type="application/ld+json"]');
    for (var i = 0; i < nodes.length; i++) {
      try {
        var d = JSON.parse(nodes[i].textContent || "null");
        if (!d) continue;
        if (d["@type"] === "Product") return d;
        if (Array.isArray(d["@graph"])) {
          for (var j = 0; j < d["@graph"].length; j++) {
            if (d["@graph"][j]["@type"] === "Product") return d["@graph"][j];
          }
        }
      } catch (e) { /* skip */ }
    }
    return null;
  }
  var ld = getLdProduct() || {};

  // ----- title -----
  var titleH1 = document.querySelector('h1[data-buy-box-listing-title], h1.wt-text-body-01, h1');
  var title = (
    getMeta("og:title") ||
    (titleH1 && (titleH1.innerText || titleH1.textContent) || "").trim() ||
    ld.name ||
    document.title || ""
  ).replace(/\s+/g, " ").trim().slice(0, 500);

  // ----- description -----
  var descEl = document.querySelector(
    '[data-product-details-description-text-content], ' +
    '#wt-content-toggle-product-details-read-more, ' +
    '[data-id="description-text"]'
  );
  var description = (
    (descEl && (descEl.innerText || descEl.textContent) || "").trim() ||
    ld.description ||
    getMeta("og:description") ||
    getMeta("description") || ""
  ).replace(/[\r\n]{3,}/g, "\n\n").trim().slice(0, 5000);

  // ----- tags (Etsy listing tag chips at bottom of page) -----
  var tagSet = {};
  var tagList = [];
  // Tag chips link to /market/<tag> usually
  var anchors = document.querySelectorAll('a[href*="/market/"]');
  for (var k = 0; k < anchors.length && tagList.length < 25; k++) {
    var a = anchors[k];
    var t = (a.innerText || a.textContent || "").trim();
    // Etsy tag chips are short phrases, not full sentences
    if (!t || t.length > 60 || t.length < 2) continue;
    // Filter out generic Etsy nav like "Home & Living" categories — those are usually under nav/breadcrumb
    if (a.closest('nav, [data-component-name="breadcrumb"], header')) continue;
    var lower = t.toLowerCase();
    if (tagSet[lower]) continue;
    tagSet[lower] = 1;
    tagList.push(t);
  }
  var tags = tagList.slice(0, 13);

  // ----- images + alt coverage -----
  var imgSeen = {};
  var imgs = [];
  // Primary product image carousel selectors (multiple fallbacks)
  var imgEls = document.querySelectorAll(
    'ul[data-component="listing-page-image-carousel"] img, ' +
    'ul.image-carousel-container img, ' +
    'li.image-carousel-container img, ' +
    '.carousel-image, ' +
    '[data-listing-image] img'
  );
  for (var n = 0; n < imgEls.length; n++) {
    var im = imgEls[n];
    var src = im.currentSrc || im.src || im.getAttribute("data-src") || "";
    if (!src || imgSeen[src]) continue;
    imgSeen[src] = 1;
    imgs.push({ src: src, alt: (im.alt || "").trim() });
  }
  // Fallback to og:image if gallery selector failed
  if (imgs.length === 0) {
    var ogImgs = document.querySelectorAll('meta[property="og:image"]');
    for (var p = 0; p < ogImgs.length; p++) {
      var oc = (ogImgs[p].getAttribute("content") || "").trim();
      if (oc && !imgSeen[oc]) {
        imgSeen[oc] = 1;
        imgs.push({ src: oc, alt: "" });
      }
    }
  }
  var image_count = imgs.length;
  var withAlt = 0;
  for (var q = 0; q < imgs.length; q++) if (imgs[q].alt) withAlt++;
  var alt_coverage = image_count > 0 ? withAlt / image_count : 0;

  // ----- parse_quality heuristic -----
  var parse_quality = "high";
  if (!title) parse_quality = "low";
  else if (tags.length < 3 || description.length < 40) parse_quality = "medium";

  // ===== POST + redirect =====
  var overlay = bail("🔍 SellerMind\n\nAnalyzing this listing…\n(typically 3-5s)", "ok");

  var payload = {
    listing_id: listingId,
    url: "https://www.etsy.com" + location.pathname,
    title: title, description: description, tags: tags,
    image_count: image_count, alt_coverage: alt_coverage,
    parse_quality: parse_quality, build_tag: BUILD_TAG
  };

  fetch(API_BASE + "/api/etsy-audit-from-browser", {
    method: "POST", mode: "cors", credentials: "omit",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  })
    .then(function (r) { return r.json().then(function (b) { return { st: r.status, b: b }; }); })
    .then(function (res) {
      overlay.remove();
      if (res.b && res.b.success && res.b.data) {
        var json = JSON.stringify(res.b.data);
        var b64 = btoa(unescape(encodeURIComponent(json)));
        var newTab = window.open(RETURN_URL + "?from=bm#r=" + b64, "_blank", "noopener");
        if (!newTab) {
          bail("✅ Audit complete\n\nPop-up blocked. Opening in this tab…", "ok");
          setTimeout(function () { location.href = RETURN_URL + "?from=bm#r=" + b64; }, 800);
        }
      } else {
        var emsg = (res.b && res.b.error && res.b.error.message) || ("Audit failed (HTTP " + res.st + ")");
        bail("❌ " + emsg, "err");
      }
    })
    .catch(function (err) {
      overlay.remove();
      bail("❌ Network error\n\n" + ((err && err.message) || err), "err");
    });
})();
