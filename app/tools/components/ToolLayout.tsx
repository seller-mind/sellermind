"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ToolLayoutProps {
  children: React.ReactNode;
  toolName: string;
  toolDescription: string;
  features: string[];
  metaTitle: string;
  metaDescription: string;
  canonicalUrl: string;
  structuredData: object;
  otherTools: {
    name: string;
    slug: string;
    description: string;
  }[];
  faqSchema?: {
    "@context": string;
    "@type": string;
    "mainEntity": Array<{
      "@type": string;
      "name": string;
      "acceptedAnswer": {
        "@type": string;
        "text": string;
      };
    }>;
  };
}

export function ToolLayout({
  children,
  toolName,
  toolDescription,
  features,
  metaTitle,
  metaDescription,
  canonicalUrl,
  structuredData,
  otherTools,
  faqSchema,
}: ToolLayoutProps) {
  // SoftwareApplication schema
  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": toolName,
    "description": toolDescription,
    "url": canonicalUrl,
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "1000"
    },
    "screenshot": `${canonicalUrl}/screenshot.png`,
    "featureList": features.join(", ")
  };

  // BreadcrumbList schema
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
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": toolName,
        "item": canonicalUrl
      }
    ]
  };

  // HowTo schema
  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": `How to Use the ${toolName}`,
    "description": `Step-by-step guide for using the ${toolName} to optimize your Etsy listings`,
    "step": [
      {
        "@type": "HowToStep",
        "name": "1. Enter Product Information",
        "text": "Provide your product details including type, features, and target audience"
      },
      {
        "@type": "HowToStep",
        "name": "2. Generate Results",
        "text": "Click the generate button to create optimized content with AI"
      },
      {
        "@type": "HowToStep",
        "name": "3. Copy and Apply",
        "text": "Copy the generated content and apply it to your Etsy listings"
      }
    ]
  };

  // Default FAQ schema
  const defaultFaqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Is this tool really free?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, this tool is 100% free to use. No signup, no credit card, no limits."
        }
      },
      {
        "@type": "Question",
        "name": "Is SellerMind affiliated with Etsy?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No, SellerMind is not affiliated with, endorsed by, or connected to Etsy, Inc."
        }
      },
      {
        "@type": "Question",
        "name": "Can I use the generated content on Etsy?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "AI-generated content is for reference only. Please review and edit before publishing to ensure accuracy and compliance with Etsy's policies."
        }
      },
      {
        "@type": "Question",
        "name": "How accurate is the SEO optimization?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Our tools use AI trained on Etsy best practices. While results are high-quality, always verify that generated content accurately describes your specific product."
        }
      }
    ]
  };

  const activeFaqSchema = faqSchema || defaultFaqSchema;

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(activeFaqSchema) }}
      />

      {/* SEO Meta Tags */}
      <title>{metaTitle}</title>
      <meta name="description" content={metaDescription} />
      
      {/* Open Graph & Twitter Meta */}
      <meta property="og:title" content={metaTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content="SellerMind" />
      <meta property="og:image" content={`${canonicalUrl}/og-image.png`} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={metaTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={`${canonicalUrl}/og-image.png`} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Breadcrumb Navigation */}
      <nav className="mb-4 text-sm" aria-label="Breadcrumb">
        <ol className="flex items-center gap-2 text-foreground-muted">
          <li>
            <Link href="/" className="hover:text-foreground-primary transition-colors">
              Home
            </Link>
          </li>
          <li>/</li>
          <li>
            <Link href="/tools" className="hover:text-foreground-primary transition-colors">
              Free Tools
            </Link>
          </li>
          <li>/</li>
          <li className="text-foreground-primary font-medium">
            {toolName}
          </li>
        </ol>
      </nav>

      <div className="mx-auto max-w-4xl space-y-8">
        {/* Hero Section */}
        <div className="text-center sm:text-left">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              FREE
            </Badge>
            <Badge variant="outline">No Signup Required</Badge>
          </div>
          <h1 className="text-3xl font-bold text-foreground-primary sm:text-4xl">
            {toolName}
          </h1>
          <p className="mt-2 text-lg text-foreground-secondary">
            {toolDescription}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center gap-2 text-sm text-foreground-secondary">
              <span className="text-green-600">✓</span>
              <span>{feature}</span>
            </div>
          ))}
        </div>

        {/* Main Content - Tool Interface */}
        {children}

        {/* SellerMind CTA */}
        <Card className="border-2 border-green-100 bg-gradient-to-r from-green-50 to-emerald-50">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground-primary">
                  💡 Want to generate complete listings automatically?
                </h3>
                <p className="text-sm text-foreground-secondary">
                  Try SellerMind - Your all-in-one Etsy AI assistant
                </p>
              </div>
              <Button asChild className="bg-green-600 hover:bg-green-700">
                <Link href="https://thesellermind.com">
                  Go to SellerMind →
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Related Tools */}
        <div>
          <h2 className="text-xl font-semibold text-foreground-primary mb-4">
            📚 More Free Tools from SellerMind
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {otherTools.map((tool) => (
              <Link key={tool.slug} href={tool.slug} className="block">
                <Card className="h-full transition-shadow hover:shadow-md hover:border-green-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">{tool.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-foreground-secondary">
                      {tool.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <Card className="bg-gray-50 border-gray-200">
          <CardHeader>
            <CardTitle className="text-sm text-gray-600">Disclaimer</CardTitle>
          </CardHeader>
          <CardContent>
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

        {/* FAQ Section */}
        <FAQSection />
      </div>
    </>
  );
}

function FAQSection() {
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);

  return (
    <div>
      <h2 className="text-xl font-semibold text-foreground-primary mb-4">
        Frequently Asked Questions
      </h2>
      <div className="space-y-2">
        {[
          {
            question: "Is this tool really free?",
            answer: "Yes, this tool is 100% free to use. No signup, no credit card, no limits."
          },
          {
            question: "How accurate is the SEO optimization?",
            answer: "Our tools use AI trained on Etsy best practices. While results are high-quality, always verify that generated content accurately describes your specific product."
          },
          {
            question: "Is SellerMind affiliated with Etsy?",
            answer: "No, SellerMind is not affiliated with, endorsed by, or connected to Etsy, Inc."
          },
          {
            question: "Can I use the generated content directly on Etsy?",
            answer: "AI-generated content is for reference only. Please review and edit before publishing."
          }
        ].map((faq, index) => (
          <Card key={index}>
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full text-left p-4 flex justify-between items-center"
            >
              <span className="font-medium text-foreground-primary">{faq.question}</span>
              <span className="text-foreground-muted">
                {openIndex === index ? "−" : "+"}
              </span>
            </button>
            {openIndex === index && (
              <div className="px-4 pb-4 text-sm text-foreground-secondary">
                {faq.answer}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

export default ToolLayout;
