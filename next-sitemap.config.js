/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://thesellermind.com',
  generateRobotsTxt: false, // We already have robots.txt in public/
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/tools/components/'],
      },
    ],
  },
  exclude: ['/api/*'],
  changefreq: 'weekly',
  priority: 0.7,
  sitemaps: [
    {
      loc: 'https://thesellermind.com/sitemap.xml',
      changefreq: 'daily',
      priority: 1.0,
      links: [
        { loc: 'https://thesellermind.com/', changefreq: 'daily', priority: 1.0 },
        { loc: 'https://thesellermind.com/tools', changefreq: 'weekly', priority: 0.9 },
        { loc: 'https://thesellermind.com/tools/listing', changefreq: 'monthly', priority: 0.8 },
        { loc: 'https://thesellermind.com/tools/reply', changefreq: 'monthly', priority: 0.8 },
        { loc: 'https://thesellermind.com/tools/holiday', changefreq: 'monthly', priority: 0.8 },
        { loc: 'https://thesellermind.com/tools/review', changefreq: 'monthly', priority: 0.8 },
        { loc: 'https://thesellermind.com/tools/batch', changefreq: 'monthly', priority: 0.8 },
        // SEO Free Tools
        { loc: 'https://thesellermind.com/tools/etsy-title-generator', changefreq: 'weekly', priority: 0.9 },
        { loc: 'https://thesellermind.com/tools/etsy-tag-generator', changefreq: 'weekly', priority: 0.9 },
        { loc: 'https://thesellermind.com/tools/etsy-seo-tool', changefreq: 'weekly', priority: 0.9 },
        { loc: 'https://thesellermind.com/tools/etsy-review-response', changefreq: 'weekly', priority: 0.9 },
        { loc: 'https://thesellermind.com/tools/etsy-holiday-marketing', changefreq: 'weekly', priority: 0.9 },
        // Legal Pages
        { loc: 'https://thesellermind.com/privacy', changefreq: 'yearly', priority: 0.3 },
        { loc: 'https://thesellermind.com/terms', changefreq: 'yearly', priority: 0.3 },
      ],
    },
  ],
};
