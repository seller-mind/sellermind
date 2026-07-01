import { MetadataRoute } from 'next'
import { getAllPosts } from '@/lib/blog/posts'
import { etsySeoSlugs } from '@/data/etsy-seo-slugs'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.SITE_URL || 'https://thesellermind.com'

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/tools`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    // F-05 fix: legacy tool pages updated with fresh SEO metadata (F-07);
    // bump changeFrequency from monthly → weekly so Google re-crawls the
    // new titles/descriptions on the same cadence as etsy-* SEO landing pages.
    {
      url: `${baseUrl}/tools/listing`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/tools/reply`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/tools/holiday`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/tools/review`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/tools/batch`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    // SEO Free Tools
    {
      url: `${baseUrl}/tools/etsy-title-generator`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/tools/etsy-tag-generator`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/tools/etsy-seo-tool`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/tools/etsy-review-response`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/tools/etsy-holiday-marketing`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    // Blog index
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    // Legal Pages
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
    // F-03 / F-18 / F-22 fix: /dmca and /cookies were fully orphan (page
    // existed but not in sitemap and 0 internal links). Adding both with
    // priority 0.3, yearly (matching /privacy and /terms).
    {
      url: `${baseUrl}/dmca`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/cookies`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.3,
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
