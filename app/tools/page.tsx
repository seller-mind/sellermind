"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Sparkles, Zap, Shield, Clock } from "lucide-react";

const TOOLS = [
  {
    name: "Etsy Title Generator",
    slug: "/etsy-title-generator",
    description: "Create SEO-optimized Etsy listing titles that rank higher in search results",
    icon: "📝",
    features: ["AI-powered generation", "140-character optimization", "SEO scoring", "One-click copy"],
    keywords: ["etsy title generator", "free etsy title maker", "etsy seo title"]
  },
  {
    name: "Etsy Tag Generator",
    slug: "/etsy-tag-generator",
    description: "Generate all 13 Etsy tags with search volume data and competition scores",
    icon: "🏷️",
    features: ["13 tags generated", "Volume data included", "Competition analysis", "Smart suggestions"],
    keywords: ["etsy tag generator", "etsy keyword tags", "free etsy tags"]
  },
  {
    name: "Etsy SEO Tool",
    slug: "/etsy-seo-tool",
    description: "Analyze and optimize your Etsy listings for maximum search visibility",
    icon: "🔍",
    features: ["Instant analysis", "SEO score calculation", "Improvement tips", "Full listing check"],
    keywords: ["etsy seo tool", "free etsy seo", "etsy listing optimizer"]
  },
  {
    name: "Etsy Review Response",
    slug: "/etsy-review-response",
    description: "Generate professional review responses for positive and negative reviews",
    icon: "💬",
    features: ["AI-powered replies", "Professional tone", "Template options", "Instant generation"],
    keywords: ["etsy review response", "etsy customer reply", "review template"]
  },
  {
    name: "Etsy Holiday Marketing",
    slug: "/etsy-holiday-marketing",
    description: "Generate seasonal keywords and marketing templates for every holiday",
    icon: "🎄",
    features: ["8+ holidays covered", "Seasonal keywords", "Marketing templates", "Timing tips"],
    keywords: ["etsy holiday marketing", "etsy christmas keywords", "seasonal marketing"]
  }
];

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Free Etsy Seller Tools - SellerMind",
  "description": "Complete suite of free AI-powered Etsy seller tools. Generate titles, tags, analyze SEO, respond to reviews, and create holiday marketing campaigns.",
  "url": "https://thesellermind.com/tools",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web Browser",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "ratingCount": "3685"
  }
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://thesellermind.com"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Free Tools",
      "item": "https://thesellermind.com/tools"
    }
  ]
};

export default function ToolsHubPage() {
  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* SEO Meta Tags */}
      <title>Free Etsy Seller Tools — AI-Powered Listing Optimization | SellerMind</title>
      <meta name="description" content="Complete suite of free Etsy seller tools. Generate titles, tags, analyze SEO, respond to reviews & create holiday marketing. 100% free, no signup required." />
      <meta property="og:title" content="Free Etsy Seller Tools — AI-Powered Listing Optimization | SellerMind" />
      <meta property="og:description" content="Complete suite of free Etsy seller tools. Generate titles, tags, analyze SEO, respond to reviews & create holiday marketing. 100% free, no signup." />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://thesellermind.com/tools" />
      <meta property="og:site_name" content="SellerMind" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="Free Etsy Seller Tools | SellerMind" />
      <meta name="twitter:description" content="Complete suite of free Etsy seller tools. Generate titles, tags, analyze SEO & more. 100% free." />
      <link rel="canonical" href="https://thesellermind.com/tools" />

      {/* Breadcrumb Navigation */}
      <nav className="mb-4 text-sm" aria-label="Breadcrumb">
        <ol className="flex items-center gap-2 text-foreground-muted">
          <li>
            <Link href="/" className="hover:text-foreground-primary transition-colors">
              Home
            </Link>
          </li>
          <li>/</li>
          <li className="text-foreground-primary font-medium">
            Free Tools
          </li>
        </ol>
      </nav>

      <div className="mx-auto max-w-4xl space-y-8">
        {/* Hero Section */}
        <div className="text-center py-8">
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            <Badge variant="secondary" className="bg-green-100 text-green-800 text-sm px-3 py-1">
              100% FREE
            </Badge>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-sm px-3 py-1">
              AI-POWERED
            </Badge>
            <Badge variant="secondary" className="bg-purple-100 text-purple-800 text-sm px-3 py-1">
              NO SIGNUP
            </Badge>
          </div>
          <h1 className="text-3xl font-bold text-foreground-primary sm:text-4xl">
            Free Etsy Seller Tools
          </h1>
          <p className="mt-4 text-lg text-foreground-secondary max-w-2xl mx-auto">
            Complete suite of AI-powered tools to optimize your Etsy listings, 
            boost search rankings, and grow your handmade business — all free, no signup required.
          </p>
        </div>

        {/* Benefits Section */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-100">
            <CardContent className="pt-6 text-center">
              <div className="text-3xl mb-2">⚡</div>
              <h3 className="font-semibold text-foreground-primary">Instant Results</h3>
              <p className="text-sm text-foreground-secondary mt-1">
                Generate optimized content in seconds
              </p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
            <CardContent className="pt-6 text-center">
              <div className="text-3xl mb-2">🎯</div>
              <h3 className="font-semibold text-foreground-primary">SEO Optimized</h3>
              <p className="text-sm text-foreground-secondary mt-1">
                Built on Etsy best practices
              </p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-100">
            <CardContent className="pt-6 text-center">
              <div className="text-3xl mb-2">💰</div>
              <h3 className="font-semibold text-foreground-primary">100% Free</h3>
              <p className="text-sm text-foreground-secondary mt-1">
                No credit card, no limits
              </p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-100">
            <CardContent className="pt-6 text-center">
              <div className="text-3xl mb-2">🚀</div>
              <h3 className="font-semibold text-foreground-primary">Easy to Use</h3>
              <p className="text-sm text-foreground-secondary mt-1">
                Simple interface, no learning curve
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tools Grid */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-foreground-primary text-center">
            All Free Etsy Tools
          </h2>
          
          <div className="grid gap-6">
            {TOOLS.map((tool, index) => (
              <Card key={tool.slug} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="flex flex-col md:flex-row">
                  {/* Icon Section */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 flex items-center justify-center md:w-32">
                    <span className="text-5xl">{tool.icon}</span>
                  </div>
                  
                  {/* Content Section */}
                  <div className="flex-1 p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs">
                            Tool #{index + 1}
                          </Badge>
                          <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                            FREE
                          </Badge>
                        </div>
                        <h3 className="text-xl font-bold text-foreground-primary mb-2">
                          {tool.name}
                        </h3>
                        <p className="text-foreground-secondary mb-3">
                          {tool.description}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {tool.features.map((feature, i) => (
                            <span 
                              key={i} 
                              className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                            >
                              ✓ {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                      <Button asChild className="bg-green-600 hover:bg-green-700 whitespace-nowrap">
                        <Link href={tool.slug}>
                          Use Tool <ArrowRight className="w-4 h-4 ml-2" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Keyword Coverage Section */}
        <Card className="bg-gradient-to-r from-gray-50 to-gray-100">
          <CardHeader>
            <CardTitle className="text-xl">🎯 Target Keywords Covered</CardTitle>
            <CardDescription>
              Our tools are optimized for these high-value Etsy seller keywords
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {[
                "etsy title generator", "etsy tag generator", "etsy seo tool",
                "free etsy title generator", "free etsy seo tool", "etsy keyword tool",
                "etsy listing generator", "etsy description generator", "etsy review response",
                "etsy holiday marketing", "etsy christmas keywords", "etsy tag optimization",
                "etsy seo tips", "etsy listing optimization", "etsy seasonal marketing"
              ].map((keyword, i) => (
                <span 
                  key={i}
                  className="text-sm bg-white border border-gray-200 text-gray-700 px-3 py-1 rounded-full hover:border-green-300 hover:text-green-700 transition-colors cursor-default"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* SellerMind CTA */}
        <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
          <CardContent className="pt-8 pb-8 text-center">
            <h3 className="text-2xl font-bold text-foreground-primary mb-3">
              💡 Want All-in-One Etsy Listing Creation?
            </h3>
            <p className="text-foreground-secondary mb-6 max-w-xl mx-auto">
              SellerMind generates complete Etsy listings with titles, descriptions, 
              and tags — all powered by AI. Perfect for sellers who want everything in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-green-600 hover:bg-green-700">
                <Link href="https://thesellermind.com">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Try SellerMind Free
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/tools/etsy-seo-tool">
                  <Zap className="w-5 h-5 mr-2" />
                  Try SEO Analyzer
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-foreground-primary mb-2">
                Are these Etsy tools really free?
              </h4>
              <p className="text-foreground-secondary">
                Yes, all our Etsy seller tools are 100% free to use. No signup, no credit card, no usage limits. We believe in helping Etsy sellers succeed.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground-primary mb-2">
                Is SellerMind affiliated with Etsy?
              </h4>
              <p className="text-foreground-secondary">
                No, SellerMind is not affiliated with, endorsed by, or connected to Etsy, Inc. We are an independent tool provider.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground-primary mb-2">
                How accurate is the SEO optimization?
              </h4>
              <p className="text-foreground-secondary">
                Our tools use AI trained on Etsy best practices and real marketplace data. While results are high-quality, always verify that generated content accurately describes your specific product.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground-primary mb-2">
                Can I use the generated content on Etsy?
              </h4>
              <p className="text-foreground-secondary">
                AI-generated content is for reference only. Please review and edit before publishing to ensure accuracy and compliance with Etsy's policies.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <Card className="bg-gray-50 border-gray-200">
          <CardContent className="pt-6">
            <ul className="space-y-2 text-xs text-gray-600">
              <li>
                <strong>SellerMind is not affiliated with, endorsed by, or connected to Etsy, Inc.</strong>
              </li>
              <li>
                <strong>AI-generated content is for reference only. Review and edit before publishing.</strong>
              </li>
              <li>
                <strong>Etsy is a trademark of Etsy, Inc.</strong>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
