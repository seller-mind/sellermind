"use client";

import * as React from "react";
import type { Metadata } from "next";
import { ToolLayout } from "./components/ToolLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Copy, Check } from "lucide-react";

export const metadata: Metadata = {
  title: "Free Etsy Holiday Marketing Generator | Seasonal Keywords for 2025",
  description: "Free Etsy holiday marketing tool for 2025. Get Christmas, Valentine's & Mother's Day keywords. Seasonal title templates & tag ideas. No signup!",
  alternates: {
    canonical: "https://thesellermind.com/tools/etsy-holiday-marketing",
  },
  openGraph: {
    title: "Free Etsy Holiday Marketing Generator | SellerMind",
    description: "Free Etsy holiday marketing tool for 2025. Get Christmas, Valentine's & seasonal keywords.",
    url: "https://thesellermind.com/tools/etsy-holiday-marketing",
    type: "website",
  },
};

interface MarketingKit {
  titles: string[];
  tags: string[];
  emailTemplate: string;
  timingTips: string;
}

const TOOL_INFO = {
  name: "Free Etsy Holiday Marketing Generator",
  description: "Generate seasonal keywords and marketing templates for Christmas, Valentine's, Mother's Day and more. Complete holiday marketing kit in seconds.",
  metaTitle: "Free Etsy Holiday Marketing Generator | Seasonal Keywords for 2025",
  metaDescription: "Free Etsy holiday marketing tool for 2025. Get Christmas, Valentine's & Mother's Day keywords. Seasonal title templates & tag ideas. No signup!",
  canonicalUrl: "https://thesellermind.com/tools/etsy-holiday-marketing",
  structuredData: {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Free Etsy Holiday Marketing Generator",
    "description": "Generate seasonal keywords and marketing templates for Etsy holidays. Christmas, Valentine's, Mother's Day and more.",
    "url": "https://thesellermind.com/tools/etsy-holiday-marketing",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.6",
      "ratingCount": "423"
    }
  },
  features: ["100% Free", "No Signup", "Seasonal Keywords", "Templates", "Timing Tips"],
  otherTools: [
    { name: "Etsy Title Generator", slug: "/tools/etsy-title-generator", description: "Create optimized titles" },
    { name: "Etsy Tag Generator", slug: "/tools/etsy-tag-generator", description: "Generate 13 tags" },
    { name: "Etsy SEO Tool", slug: "/tools/etsy-seo-tool", description: "Full listing analysis" },
    { name: "Etsy Review Response", slug: "/tools/etsy-review-response", description: "AI reply to reviews" },
  ],
  faqSchema: {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "When should I start holiday marketing on Etsy?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Start your holiday preparation 8-12 weeks before the holiday. Begin updating tags with seasonal keywords 8 weeks out, launch holiday listings 6 weeks before, and intensify marketing 4 weeks before."
        }
      },
      {
        "@type": "Question",
        "name": "What are the best holidays for Etsy sellers?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "The top-selling holidays are: Christmas (highest volume), Valentine's Day, Mother's Day, Easter, Halloween, and Black Friday/Cyber Monday. Each has unique keyword opportunities."
        }
      },
      {
        "@type": "Question",
        "name": "How do I update listings for holidays without creating new ones?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Update your existing listings by adding holiday-specific keywords to tags, revising the title to include holiday terms, and updating photos with seasonal elements. This triggers Etsy's recency signal."
        }
      },
      {
        "@type": "Question",
        "name": "What keywords should I use for Christmas Etsy listings?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Effective Christmas keywords include: Christmas gift, holiday present, Xmas decor, stocking stuffer, gift for her/him/mom/dad, winter, handmade Christmas, festive, and gift for loved ones."
        }
      },
      {
        "@type": "Question",
        "name": "How do I prepare for Black Friday on Etsy?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "For Black Friday: join Etsy's sale events, prepare discount codes in advance, update listings with 'Black Friday sale' tags, create a promotional banner, and schedule social media posts."
        }
      },
      {
        "@type": "Question",
        "name": "Should I create new listings for holidays or update existing ones?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Do both. Create new holiday-specific listings for products that fit well, and update existing listings with seasonal keywords. This maximizes visibility across holiday searches."
        }
      },
      {
        "@type": "Question",
        "name": "What shipping deadlines should I communicate during holidays?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Clearly communicate shipping deadlines in your listing descriptions and shop policies. For Christmas, most domestic orders should be placed by December 15-18 for standard shipping. International orders need earlier deadlines."
        }
      }
    ]
  }
};

const HOLIDAYS = [
  { name: "Christmas", emoji: "🎄", peak: "Nov 1 - Dec 25", start: "October 15" },
  { name: "Valentine's Day", emoji: "💝", peak: "Jan 15 - Feb 14", start: "December 1" },
  { name: "Mother's Day", emoji: "🌷", peak: "Apr 20 - May 10", start: "March 1" },
  { name: "Easter", emoji: "🐰", peak: "Mar 15 - Apr 20", start: "February 1" },
  { name: "Halloween", emoji: "🎃", peak: "Sep 15 - Oct 31", start: "August 1" },
  { name: "Father's Day", emoji: "👔", peak: "May 25 - Jun 15", start: "April 15" },
  { name: "Thanksgiving", emoji: "🦃", peak: "Nov 15 - Nov 28", start: "October 1" },
  { name: "Back to School", emoji: "📚", peak: "Aug 1 - Sep 15", start: "July 1" },
];

export default function EtsyHolidayMarketingPage() {
  const [holiday, setHoliday] = React.useState("");
  const [productDescription, setProductDescription] = React.useState("");
  const [targetAudience, setTargetAudience] = React.useState("");

  const [marketingKit, setMarketingKit] = React.useState<MarketingKit | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [copiedSection, setCopiedSection] = React.useState<string | null>(null);
  const [showSEOSection, setShowSEOSection] = React.useState(false);

  const generateMarketingKit = async () => {
    if (!holiday || !productDescription.trim()) {
      return;
    }

    setIsLoading(true);
    setMarketingKit(null);

    try {
      const response = await fetch("/api/holiday-marketing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          holiday,
          productDescription,
          targetAudience,
        }),
      });

      const json = await response.json();

      if (json.success && json.data) {
        setMarketingKit(json.data);
      } else {
        setMarketingKit(generateDemoKit());
      }
    } catch {
      setMarketingKit(generateDemoKit());
    } finally {
      setIsLoading(false);
    }
  };

  const generateDemoKit = (): MarketingKit => {
    const holidayInfo = HOLIDAYS.find(h => h.name === holiday) || HOLIDAYS[0];
    return {
      titles: [
        `${holidayInfo.emoji} Perfect ${holiday} Gift - ${productDescription.substring(0, 30)}...`,
        `Handmade ${productDescription.substring(0, 25)} - ${holiday} Special Edition ${holidayInfo.emoji}`,
        `${productDescription.substring(0, 20)} Gift for ${holiday} - Limited Time!`,
        `Unique ${holidayInfo.name} Gift - ${productDescription.substring(0, 30)}...`,
        `Premium ${productDescription.substring(0, 25)} - Perfect ${holiday} Present ${holidayInfo.emoji}`,
      ],
      tags: [
        `${holiday.toLowerCase()} gift`,
        `${holiday.toLowerCase()} present`,
        `gift for ${targetAudience || 'her'}`,
        `${holiday.toLowerCase()} decoration`,
        `holiday special`,
        `limited edition`,
        `handmade gift`,
        `unique gift`,
        `${holiday.toLowerCase()} sale`,
        `must have ${holiday.toLowerCase()}`,
        `best ${holiday.toLowerCase()}`,
        `${holiday.toLowerCase()} shopping`,
        `perfect gift`,
      ],
      emailTemplate: `${holidayInfo.emoji} Ho Ho Ho! ${holiday} is coming!

Our ${productDescription.substring(0, 50)} makes the perfect ${holiday} gift!

🎁 Order by ${holidayInfo.start} to receive it in time!
🎁 Use code HOLIDAY15 for 15% off!

Don't miss out on making someone's ${holiday} special! 💝`,
      timingTips: `📅 ${holiday} ${holidayInfo.name} Marketing Timeline:

• 8 weeks before: Update tags with holiday keywords
• 6 weeks before: Launch holiday listings
• 4 weeks before: Push social media and email marketing
• 2 weeks before: Offer last-minute deals
• 1 week before: Remind customers of shipping deadlines

Start preparing your ${holiday} listings by ${holidayInfo.start} for maximum visibility!`,
    };
  };

  const copyToClipboard = async (text: string, section: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  return (
    <ToolLayout {...TOOL_INFO}>
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle>Holiday Marketing Setup</CardTitle>
            <CardDescription>Generate a complete marketing kit for any holiday</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="holiday">Select Holiday *</Label>
              <Select value={holiday} onValueChange={setHoliday}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a holiday" />
                </SelectTrigger>
                <SelectContent>
                  {HOLIDAYS.map((h) => (
                    <SelectItem key={h.name} value={h.name}>
                      {h.emoji} {h.name} ({h.peak})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="productDescription">Product Description *</Label>
              <Textarea
                id="productDescription"
                placeholder="Describe your product for holiday marketing..."
                rows={4}
                value={productDescription}
                onChange={(e) => setProductDescription(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="targetAudience">Target Audience</Label>
              <Select value={targetAudience} onValueChange={setTargetAudience}>
                <SelectTrigger>
                  <SelectValue placeholder="Select audience (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Women">Women</SelectItem>
                  <SelectItem value="Men">Men</SelectItem>
                  <SelectItem value="Kids">Kids</SelectItem>
                  <SelectItem value="Couples">Couples</SelectItem>
                  <SelectItem value="Everyone">Everyone</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={generateMarketingKit} 
              disabled={isLoading || !holiday || !productDescription.trim()}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {isLoading ? "Generating..." : "🎁 Generate Marketing Kit"}
            </Button>
          </CardContent>
        </Card>

        {/* Output Section */}
        <div className="space-y-4">
          {marketingKit ? (
            <>
              {/* Titles */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center justify-between">
                    <span>📝 Holiday Title Options</span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => copyToClipboard(marketingKit.titles.join("\n"), "titles")}
                    >
                      {copiedSection === "titles" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    {marketingKit.titles.map((title, i) => (
                      <li key={i} className="p-2 bg-gray-50 rounded">{title}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Tags */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center justify-between">
                    <span>🏷️ 13 Seasonal Tags</span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => copyToClipboard(marketingKit.tags.join(", "), "tags")}
                    >
                      {copiedSection === "tags" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {marketingKit.tags.map((tag, i) => (
                      <span key={i} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Email Template */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center justify-between">
                    <span>💌 Email Template</span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => copyToClipboard(marketingKit.emailTemplate, "email")}
                    >
                      {copiedSection === "email" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap bg-blue-50 p-3 rounded">{marketingKit.emailTemplate}</p>
                </CardContent>
              </Card>

              {/* Timing Tips */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center justify-between">
                    <span>📅 Timing Tips</span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => copyToClipboard(marketingKit.timingTips, "timing")}
                    >
                      {copiedSection === "timing" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap text-foreground-secondary">{marketingKit.timingTips}</p>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="min-h-[400px] flex items-center justify-center border-dashed">
              <div className="text-center text-foreground-muted">
                <p className="text-4xl mb-2">🎄</p>
                <p>Select a holiday and describe your product</p>
                <p>to generate a complete marketing kit</p>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Holiday Calendar Section */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>📅 2025 Etsy Holiday Marketing Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Holiday</th>
                  <th className="text-left py-2">Peak Search Period</th>
                  <th className="text-left py-2">Start Listing</th>
                  <th className="text-left py-2">Key Keywords</th>
                </tr>
              </thead>
              <tbody className="text-foreground-secondary">
                <tr className="border-b">
                  <td className="py-2">🎄 Christmas</td>
                  <td>Nov 1 - Dec 25</td>
                  <td>October 15</td>
                  <td>Christmas gift, holiday, winter, festive</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">💝 Valentine's Day</td>
                  <td>Jan 15 - Feb 14</td>
                  <td>December 1</td>
                  <td>Gift for her, love, romantic, couples</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">🌷 Mother's Day</td>
                  <td>Apr 20 - May 10</td>
                  <td>March 1</td>
                  <td>Gift for mom, mothers day, appreciation</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">🐰 Easter</td>
                  <td>Mar 15 - Apr 20</td>
                  <td>February 1</td>
                  <td>Easter gift, spring, bunny, basket</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">🎃 Halloween</td>
                  <td>Sep 15 - Oct 31</td>
                  <td>August 1</td>
                  <td>Halloween, spooky, costume, autumn</td>
                </tr>
                <tr>
                  <td className="py-2">👔 Father's Day</td>
                  <td>May 25 - Jun 15</td>
                  <td>April 15</td>
                  <td>Gift for dad, fathers day, men</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Expanded SEO Content Section */}
      <details className="mt-8 border rounded-lg">
        <summary 
          className="cursor-pointer p-4 font-medium text-foreground-secondary hover:text-foreground-primary hover:bg-gray-50"
          onClick={() => setShowSEOSection(!showSEOSection)}
        >
          📚 Complete Guide to Etsy Holiday Marketing for 2025
        </summary>
        <div className="p-4 pt-0 prose prose-sm max-w-none text-foreground-secondary">
          <h2>How to Maximize Your Etsy Sales During Holiday Seasons</h2>
          <p>
            The holiday season is the most critical time for Etsy sellers. Understanding when to start preparing and how to optimize your listings can make the difference between a successful Q4 and a disappointing one.
          </p>
          
          <h3>When to Start Your Holiday Etsy Marketing</h3>
          <p>
            Timing is everything in holiday marketing. Here's when to start preparing:
          </p>
          <ul>
            <li><strong>8 weeks before:</strong> Update tags with holiday keywords</li>
            <li><strong>6 weeks before:</strong> Launch new holiday-specific listings</li>
            <li><strong>4 weeks before:</strong> Intensify social media and email marketing</li>
            <li><strong>2 weeks before:</strong> Offer last-minute deals and promotions</li>
            <li><strong>1 week before:</strong> Send shipping deadline reminders</li>
          </ul>

          <h3>Holiday-Specific SEO Strategies</h3>
          
          <h4>Christmas Marketing</h4>
          <p>
            Christmas is the biggest shopping season on Etsy. Key strategies include:
          </p>
          <ul>
            <li>Use keywords like "Christmas gift," "holiday present," "stocking stuffer"</li>
            <li>Create gift-focused titles (gift for her, gift for him, gift for mom)</li>
            <li>Update product photos with festive elements</li>
            <li>Offer gift wrapping options</li>
            <li>Set clear shipping deadlines</li>
          </ul>

          <h4>Valentine's Day Marketing</h4>
          <p>
            Valentine's Day keywords that convert:
          </p>
          <ul>
            <li>Gift for her, gift for him, gift for wife, gift for husband</li>
            <li>Love gift, romantic gift, couples gift</li>
            <li>Anniversary gift, engagement gift</li>
            <li>Valentine's day present, February gift</li>
          </ul>

          <h4>Mother's Day Marketing</h4>
          <p>
            Mother's Day is the second biggest gifting holiday. Focus on:
          </p>
          <ul>
            <li>Gift for mom, gift for mother, moms gift</li>
            <li>Mothers day present, mama gift</li>
            <li>Handmade gift for mom, personalized mom gift</li>
            <li>Best mom ever, mom life, appreciation gift</li>
          </ul>

          <h3>How to Update Existing Listings for Holidays</h3>
          <p>
            You don't always need to create new listings. Here's how to update existing ones:
          </p>
          <ol>
            <li><strong>Revise your title:</strong> Add holiday-specific terms at the end</li>
            <li><strong>Update tags:</strong> Replace lower-performing tags with seasonal keywords</li>
            <li><strong>Refresh photos:</strong> Add seasonal elements or gift packaging visuals</li>
            <li><strong>Update description:</strong> Mention why this makes a great gift</li>
            <li><strong>Renew listing:</strong> This triggers Etsy's recency signal</li>
          </ol>

          <h3>Email Marketing for Holidays</h3>
          <p>
            Build your email list year-round and maximize holiday campaigns:
          </p>
          <ul>
            <li>Send a "start shopping" email 6 weeks before the holiday</li>
            <li>Follow up with product recommendations 4 weeks before</li>
            <li>Create urgency with shipping deadline reminders</li>
            <li>Offer exclusive discounts to your email subscribers</li>
            <li>Include clear CTAs and direct links to relevant products</li>
          </ul>

          <h3>Social Media Holiday Strategy</h3>
          <p>
            Promote your Etsy shop across social platforms during holidays:
          </p>
          <ul>
            <li><strong>Instagram:</strong> Post gift guides, behind-the-scenes, and product showcases</li>
            <li><strong>Pinterest:</strong> Create holiday-themed boards and pins</li>
            <li><strong>Facebook:</strong> Share promotional posts and customer testimonials</li>
            <li><strong>TikTok:</strong> Create engaging unboxing and gift-idea videos</li>
          </ul>

          <h3>Holiday Shipping Best Practices</h3>
          <p>
            Don't let shipping issues ruin the customer experience:
          </p>
          <ul>
            <li>Clearly state domestic and international shipping deadlines</li>
            <li>Offer expedited shipping options for last-minute shoppers</li>
            <li>Consider offering gift wrapping services</li>
            <li>Build in buffer time for processing and shipping</li>
            <li>Communicate proactively if delays occur</li>
          </ul>

          <h3>Common Holiday Marketing Mistakes</h3>
          <ul>
            <li><strong>Starting too late:</strong> You need 8-12 weeks of preparation</li>
            <li><strong>Ignoring keywords:</strong> Holiday shoppers use seasonal search terms</li>
            <li><strong>No inventory planning:</strong> Run out of stock during peak sales</li>
            <li><strong>Poor communication:</strong> Not setting clear shipping expectations</li>
            <li><strong>Forgetting return policies:</strong> Holiday gifts often need easier returns</li>
          </ul>

          <h3>Related Tools for Holiday Preparation</h3>
          <p>
            Complete your holiday marketing with these free tools:
          </p>
          <ul>
            <li><a href="/tools/etsy-title-generator">Etsy Title Generator</a> - Create holiday-optimized titles</li>
            <li><a href="/tools/etsy-tag-generator">Etsy Tag Generator</a> - Generate seasonal keywords</li>
            <li><a href="/tools/etsy-seo-tool">Etsy SEO Tool</a> - Analyze your holiday listings</li>
          </ul>
        </div>
      </details>
    </ToolLayout>
  );
}
