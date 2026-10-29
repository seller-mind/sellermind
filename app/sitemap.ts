import { MetadataRoute } from 'next'
import { getAllPosts } from '@/lib/blog/posts'
import { etsySeoSlugs } from '@/data/etsy-seo-slugs'

// SM-05 fix (2026-10-28 QA): every static route used `lastModified: new Date()`,
// which is evaluated at build time. That reset the lastmod of 19 URLs to "just
// now" on every deploy, regardless of whether the page actually changed, and
// Google eventually learns to ignore a lastmod signal that is always the deploy
// time. Pin an explicit date per URL and bump it by hand only when the page
// content really changes. Blog posts already use their own publish date.
const SITE_LASTMOD: Record<string, string> = {
  '/': '2026-10-12',
  '/tools': '2026-10-12',
  '/tools/listing': '2026-10-12',
  '/tools/reply': '2026-10-12',
  '/tools/holiday': '2026-10-12',
  '/tools/review': '2026-10-12',
  '/tools/batch': '2026-10-12',
  '/tools/etsy-title-generator': '2026-10-12',
  '/tools/etsy-tag-generator': '2026-10-12',
  '/tools/etsy-seo-tool': '2026-10-12',
  '/tools/etsy-review-response': '2026-10-12',
  '/tools/etsy-holiday-marketing': '2026-10-12',
  '/tools/fee-calculator': '2026-10-12',
  '/blog': '2026-10-12',
  '/pricing': '2026-10-12',
  '/privacy': '2026-06-01',
  '/terms': '2026-06-01',
  '/dmca': '2026-06-01',
  '/cookies': '2026-06-01',
  // SM-11 fix (2026-10-29 audit): these six pages existed and were linked but
  // were never listed here, so Google never saw them in the sitemap.
  '/etsy-seo': '2026-07-17',
  '/free-etsy-seo-checker': '2026-06-30',
  '/free-etsy-seo-checker/methodology': '2026-06-29',
  '/free-etsy-seo-checker/privacy': '2026-06-29',
  '/legal/etsy-seo-checker-terms': '2026-06-30',
  '/resources/etsy-fee-guide': '2026-08-01',
  '/geo/etsy-seo-tools': '2026-10-29',
}

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.SITE_URL || 'https://thesellermind.com'
  // Falls back to a fixed epoch rather than "now" so a route added without an
  // entry above cannot silently reintroduce the always-fresh lastmod bug.
  const lm = (path: string) => new Date(SITE_LASTMOD[path] ?? '2026-06-01')

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: lm('/'),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/tools`,
      lastModified: lm('/tools'),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    // F-05 fix: legacy tool pages updated with fresh SEO metadata (F-07);
    // bump changeFrequency from monthly → weekly so Google re-crawls the
    // new titles/descriptions on the same cadence as etsy-* SEO landing pages.
    {
      url: `${baseUrl}/tools/listing`,
      lastModified: lm('/tools/listing'),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/tools/reply`,
      lastModified: lm('/tools/reply'),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/tools/holiday`,
      lastModified: lm('/tools/holiday'),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/tools/review`,
      lastModified: lm('/tools/review'),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/tools/batch`,
      lastModified: lm('/tools/batch'),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    // SEO Free Tools
    {
      url: `${baseUrl}/tools/etsy-title-generator`,
      lastModified: lm('/tools/etsy-title-generator'),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/tools/etsy-tag-generator`,
      lastModified: lm('/tools/etsy-tag-generator'),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/tools/etsy-seo-tool`,
      lastModified: lm('/tools/etsy-seo-tool'),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/tools/etsy-review-response`,
      lastModified: lm('/tools/etsy-review-response'),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/tools/etsy-holiday-marketing`,
      lastModified: lm('/tools/etsy-holiday-marketing'),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    // Fee Calculator — high-value tool page for Etsy fee breakdown
    {
      url: `${baseUrl}/tools/fee-calculator`,
      lastModified: lm('/tools/fee-calculator'),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    // Blog index
    {
      url: `${baseUrl}/blog`,
      lastModified: lm('/blog'),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    // Legal Pages
    {
      url: `${baseUrl}/pricing`,
      lastModified: lm('/pricing'),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: lm('/privacy'),
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: lm('/terms'),
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
    // F-03 / F-18 / F-22 fix: /dmca and /cookies were fully orphan (page
    // existed but not in sitemap and 0 internal links). Adding both with
    // priority 0.3, yearly (matching /privacy and /terms).
    {
      url: `${baseUrl}/dmca`,
      lastModified: lm('/dmca'),
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/cookies`,
      lastModified: lm('/cookies'),
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
    // SM-11 fix (2026-10-29 audit): index page for the 30 programmatic guides,
    // the free listing checker plus its methodology/privacy, the checker ToU,
    // and the fee guide added 2026-08-01. All six existed but were unlisted.
    {
      url: `${baseUrl}/etsy-seo`,
      lastModified: lm('/etsy-seo'),
      changeFrequency: 'monthly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/free-etsy-seo-checker`,
      lastModified: lm('/free-etsy-seo-checker'),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/free-etsy-seo-checker/methodology`,
      lastModified: lm('/free-etsy-seo-checker/methodology'),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/free-etsy-seo-checker/privacy`,
      lastModified: lm('/free-etsy-seo-checker/privacy'),
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/legal/etsy-seo-checker-terms`,
      lastModified: lm('/legal/etsy-seo-checker-terms'),
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/resources/etsy-fee-guide`,
      lastModified: lm('/resources/etsy-fee-guide'),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    // The /geo/ landing page is served by the geo-landing-edge Cloudflare Worker,
    // not by Next.js, so it never appeared in this sitemap and had no internal
    // links pointing at it. Listing it here is the only discovery path it has.
    {
      url: `${baseUrl}/geo/etsy-seo-tools`,
      lastModified: lm('/geo/etsy-seo-tools'),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
  ]

  const blogRoutes: MetadataRoute.Sitemap = getAllPosts().map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly' as const,
    priority: 0.85,
  }))

  // 30 programmatic Etsy SEO guides served from public/etsy-seo/<slug>.html
  // via next.config.js rewrite (/etsy-seo/:slug → /etsy-seo/:slug.html).
  const etsySeoRoutes: MetadataRoute.Sitemap = etsySeoSlugs.map((slug) => ({
    url: `${baseUrl}/etsy-seo/${slug}`,
    lastModified: new Date('2026-06-25'),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))

  return [...staticRoutes, ...blogRoutes, ...etsySeoRoutes]
}
