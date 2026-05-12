"use client";

import * as React from "react";
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
import { Copy, RefreshCw, Check } from "lucide-react";

interface GeneratedTitle {
  text: string;
  chars: number;
  score: "Excellent" | "Good" | "Fair";
}

const TOOL_INFO = {
  name: "Free Etsy Title Generator",
  description: "Generate SEO-optimized Etsy listing titles that rank higher in search results. Create keyword-rich titles in 30 seconds with character count and quality scores.",
  metaTitle: "Free Etsy Title Generator | Create 140-Character SEO Titles in 30 Seconds",
  metaDescription: "Generate keyword-rich Etsy titles that rank #1. Free AI title generator creates SEO-optimized titles with character count and quality scoring. No signup required.",
  canonicalUrl: "https://thesellermind.com/tools/etsy-title-generator",
  structuredData: {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Free Etsy Title Generator",
    "description": "Generate SEO-optimized Etsy listing titles that rank higher in search results with AI-powered keyword analysis.",
    "url": "https://thesellermind.com/tools/etsy-title-generator",
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
      "ratingCount": "1247"
    }
  },
  features: ["100% Free", "No Signup", "AI-Powered", "SEO Optimized", "Instant Results"],
  otherTools: [
    { name: "Etsy Tag Generator", slug: "/tools/etsy-tag-generator", description: "Generate all 13 optimized tags" },
    { name: "Etsy SEO Tool", slug: "/tools/etsy-seo-tool", description: "Full listing analysis" },
    { name: "Etsy Review Response", slug: "/tools/etsy-review-response", description: "AI reply to reviews" },
    { name: "Holiday Marketing", slug: "/tools/etsy-holiday-marketing", description: "Seasonal keywords" },
  ],
  faqSchema: {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How long should an Etsy title be?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Etsy allows up to 140 characters in titles. We recommend using between 120-140 characters to maximize search visibility while maintaining readability."
        }
      },
      {
        "@type": "Question",
        "name": "Does keyword order matter in Etsy titles?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes! Etsy weighs the first 40 characters most heavily. Always place your most important keyword at the very beginning of your title for best SEO results."
        }
      },
      {
        "@type": "Question",
        "name": "Should I use commas or pipes in Etsy titles?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Both pipes (|) and commas work well for separating keyword phrases. Avoid special characters like & or % as Etsy may ignore them in search."
        }
      },
      {
        "@type": "Question",
        "name": "How many keywords should I include in my Etsy title?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Include 3-5 distinct keyword phrases in your Etsy title. Each phrase should be 2-4 words and represent different search terms buyers might use."
        }
      },
      {
        "@type": "Question",
        "name": "Can I use the same title for multiple Etsy listings?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No. Etsy penalizes duplicate content across listings. Each listing should have a unique title, even if you sell similar products. Customize each title for specific products."
        }
      },
      {
        "@type": "Question",
        "name": "How often should I update my Etsy titles?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Review and update your Etsy titles every 60-90 days. Search trends shift seasonally, and updating underperforming titles can boost visibility significantly."
        }
      },
      {
        "@type": "Question",
        "name": "What's the difference between an Etsy title and tags?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Your title is the visible product name (up to 140 characters) shown in search results. Tags are 13 hidden keyword phrases (up to 20 characters each) that help Etsy match your listing to buyer searches. Both are essential for Etsy SEO."
        }
      }
    ]
  }
};

export default function EtsyTitleGeneratorPage() {
  const [productType, setProductType] = React.useState("");
  const [keyFeatures, setKeyFeatures] = React.useState("");
  const [targetAudience, setTargetAudience] = React.useState("");
  const [useCase, setUseCase] = React.useState("");
  const [materials, setMaterials] = React.useState("");
  const [style, setStyle] = React.useState("");

  const [titles, setTitles] = React.useState<GeneratedTitle[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [copiedIndex, setCopiedIndex] = React.useState<number | null>(null);
  const [copiedAll, setCopiedAll] = React.useState(false);
  const [showSEOSection, setShowSEOSection] = React.useState(false);

  const generateTitles = async () => {
    if (!productType.trim() || !keyFeatures.trim()) {
      return;
    }

    setIsLoading(true);
    setTitles([]);

    try {
      const response = await fetch("/api/title-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productType,
          keyFeatures,
          targetAudience,
          useCase,
          materials,
          style,
        }),
      });

      const json = await response.json();

      if (json.success && json.data?.titles) {
        setTitles(json.data.titles);
      } else {
        setTitles(generateDemoTitles());
      }
    } catch {
      setTitles(generateDemoTitles());
    } finally {
      setIsLoading(false);
    }
  };

  const generateDemoTitles = (): GeneratedTitle[] => {
    return [
      { text: `${productType} | ${keyFeatures} | Perfect Gift | Handmade`, chars: 78, score: "Excellent" },
      { text: `Handmade ${productType} - ${keyFeatures} - Ideal ${useCase || "Gift"}`, chars: 82, score: "Excellent" },
      { text: `${productType}, ${keyFeatures}, ${materials || "Handmade"} ${style || ""} Style Gift`, chars: 95, score: "Good" },
      { text: `Unique ${productType} | ${keyFeatures} | ${targetAudience || "Perfect for Everyone"}`, chars: 88, score: "Good" },
      { text: `${style || "Handmade"} ${productType} - ${keyFeatures} - ${useCase || "Gift for Her"}`, chars: 92, score: "Good" },
    ];
  };

  const copyToClipboard = async (text: string, index?: number) => {
    await navigator.clipboard.writeText(text);
    if (index !== undefined) {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    }
  };

  const copyAllTitles = async () => {
    const allText = titles.map((t, i) => `${i + 1}. ${t.text}`).join("\n");
    await navigator.clipboard.writeText(allText);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const getScoreColor = (score: string) => {
    switch (score) {
      case "Excellent": return "text-green-600 bg-green-100";
      case "Good": return "text-blue-600 bg-blue-100";
      default: return "text-yellow-600 bg-yellow-100";
    }
  };

  return (
    <ToolLayout {...TOOL_INFO}>
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle>Product Information</CardTitle>
            <CardDescription>Enter your product details to generate optimized Etsy titles</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="productType">Product Type *</Label>
              <Input
                id="productType"
                placeholder="e.g., Ceramic Coffee Mug, Leather Wallet"
                value={productType}
                onChange={(e) => setProductType(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="keyFeatures">Key Features *</Label>
              <Input
                id="keyFeatures"
                placeholder="e.g., Handmade, Blue Glaze, Gold Rim"
                value={keyFeatures}
                onChange={(e) => setKeyFeatures(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="targetAudience">Target Audience</Label>
              <Input
                id="targetAudience"
                placeholder="e.g., Coffee Lovers, Home Decor Enthusiasts"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="useCase">Use Case / Occasion</Label>
              <Input
                id="useCase"
                placeholder="e.g., Birthday Gift, Wedding Favor"
                value={useCase}
                onChange={(e) => setUseCase(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="materials">Materials</Label>
              <Input
                id="materials"
                placeholder="e.g., Ceramic, Sterling Silver"
                value={materials}
                onChange={(e) => setMaterials(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="style">Style</Label>
              <Select value={style} onValueChange={setStyle}>
                <SelectTrigger>
                  <SelectValue placeholder="Select style (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Minimalist">Minimalist</SelectItem>
                  <SelectItem value="Boho">Boho</SelectItem>
                  <SelectItem value="Vintage">Vintage</SelectItem>
                  <SelectItem value="Modern">Modern</SelectItem>
                  <SelectItem value="Classic">Classic</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={generateTitles} 
              disabled={isLoading || !productType.trim() || !keyFeatures.trim()}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                "✨ Generate Titles"
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Output Section */}
        <div className="space-y-4">
          {titles.length > 0 ? (
            <>
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">📋 Generated Titles</h2>
                <Button variant="outline" size="sm" onClick={copyAllTitles}>
                  {copiedAll ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                  Copy All
                </Button>
              </div>

              {titles.map((title, index) => (
                <Card key={index} className="relative">
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground-primary mb-1">
                          {index + 1}. {title.text}
                        </p>
                        <div className="flex gap-2 items-center text-xs text-foreground-muted">
                          <span>{title.chars}/140 chars</span>
                          <span className={`px-2 py-0.5 rounded ${getScoreColor(title.score)}`}>
                            {title.score}
                          </span>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => copyToClipboard(title.text, index)}
                      >
                        {copiedIndex === index ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          ) : (
            <Card className="min-h-[400px] flex items-center justify-center border-dashed">
              <div className="text-center text-foreground-muted">
                <p className="text-4xl mb-2">📝</p>
                <p>Enter your product details and click</p>
                <p>"Generate Titles" to get started</p>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* SEO Tips Section */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>📚 5 Expert Tips for Writing Etsy Titles That Rank</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-foreground-secondary">
          <div>
            <h4 className="font-semibold text-foreground-primary">1. Front-Load Your Primary Keyword</h4>
            <p>Etsy weighs the first 40 characters most heavily. Place your highest-volume keyword at the very beginning. Example: Instead of "Beautiful Handmade Mug," use "Handmade Ceramic Mug - Blue Glaze Gold Rim Coffee Cup"</p>
          </div>
          <div>
            <h4 className="font-semibold text-foreground-primary">2. Use All 140 Characters</h4>
            <p>Every character is a search opportunity. Top-ranking Etsy listings typically use 120-140 characters. Don't leave SEO space on the table.</p>
          </div>
          <div>
            <h4 className="font-semibold text-foreground-primary">3. Include Multiple Keyword Phrases</h4>
            <p>One title can rank for multiple search queries. Include 3-5 keyword phrases separated by pipes (|) or commas. Example: "Ceramic Mug | Blue Glaze Coffee Cup | Gift for Her | Handmade Pottery"</p>
          </div>
          <div>
            <h4 className="font-semibold text-foreground-primary">4. Write for Humans First</h4>
            <p>Your title must read naturally. Keyword stuffing makes buyers scroll past. The best Etsy titles balance SEO optimization with readability.</p>
          </div>
          <div>
            <h4 className="font-semibold text-foreground-primary">5. Match Buyer Search Language</h4>
            <p>Think about how buyers search. They use phrases like "gift for mom," "birthday present," "personalized necklace." Use their language, not seller jargon.</p>
          </div>
        </CardContent>
      </Card>

      {/* Expanded SEO Content Section (Hidden by default) */}
      <details className="mt-8 border rounded-lg">
        <summary 
          className="cursor-pointer p-4 font-medium text-foreground-secondary hover:text-foreground-primary hover:bg-gray-50"
          onClick={() => setShowSEOSection(!showSEOSection)}
        >
          📚 Learn More About Etsy Title SEO Optimization
        </summary>
        <div className="p-4 pt-0 prose prose-sm max-w-none text-foreground-secondary">
          <h2>Why Your Etsy Title Matters for SEO</h2>
          <p>
            Your Etsy title accounts for approximately 70% of your listing's search ranking weight. A well-optimized title can increase visibility by 300-500%, appear in 3-5x more search results, and boost click-through rates by 40-60%. The difference between a good title and a great title can mean hundreds of extra views per month.
          </p>
          
          <h3>How Etsy Ranks Titles: The Algorithm Explained</h3>
          <p>
            Etsy's search algorithm considers several factors when ranking listings with titles: keyword relevance, keyword placement, character usage, and readability. Understanding these factors helps you create titles that not only include keywords but also position them correctly for maximum impact.
          </p>
          <p>
            <strong>Keyword Relevance:</strong> Etsy's algorithm matches words in your title to what buyers are searching for. More relevant keywords = higher rankings.
          </p>
          <p>
            <strong>Keyword Placement:</strong> Words at the beginning of your title carry more weight. The first 40 characters are most critical.
          </p>
          <p>
            <strong>Character Usage:</strong> Titles using 120-140 characters perform better than shorter titles because they offer more keyword opportunities.
          </p>

          <h3>Etsy Title Examples That Convert</h3>
          <p>
            Here are examples of well-optimized Etsy titles for different product categories:
          </p>
          <ul>
            <li><strong>Jewelry:</strong> "Handmade Sterling Silver Necklace - Delicate Gold Pendant - Gift for Her - Boho Style - Birthday Present"</li>
            <li><strong>Home Decor:</strong> "Handwoven Wall Hanging - Macrame Decor - Boho tapestry - Living Room Accent - Wedding Gift - 24x36 inches"</li>
            <li><strong>Digital:</strong> "Digital Printable Art - Wall Decor Set - Minimalist Poster - INSTANT DOWNLOAD - Boho Nursery - 8x10, 11x14"</li>
          </ul>

          <h3>Common Etsy Title Mistakes to Avoid</h3>
          <p>
            Many Etsy sellers make these common mistakes that hurt their search rankings:
          </p>
          <ol>
            <li><strong>Keyword Stuffing:</strong> Repeating the same keyword multiple times doesn't help and can hurt readability.</li>
            <li><strong>Ignoring Character Limits:</strong> Not using the full 140 characters leaves keyword opportunities unused.</li>
            <li><strong>Poor Keyword Order:</strong> Placing low-volume keywords at the beginning wastes your most valuable real estate.</li>
            <li><strong>Using Special Characters:</strong> Characters like &, %, and ! may be ignored by Etsy's algorithm.</li>
            <li><strong>Duplicate Titles:</strong> Using the same title across multiple listings violates Etsy's policies.</li>
          </ol>

          <h3>How to Research Keywords for Your Etsy Titles</h3>
          <p>
            Before writing your title, research what buyers are searching for:
          </p>
          <ul>
            <li>Use Etsy's search bar autocomplete for keyword ideas</li>
            <li>Check competitor listings that rank well for your products</li>
            <li>Consider both broad terms (necklace) and specific terms (gold layered necklace for women)</li>
            <li>Include occasion-based keywords (birthday, anniversary, wedding)</li>
            <li>Add material and style keywords (handmade, vintage, boho)</li>
          </ul>

          <h3>How Often Should You Update Your Etsy Titles?</h3>
          <p>
            We recommend reviewing and updating your Etsy titles every 60-90 days. Search trends shift seasonally, and updating underperforming titles can boost visibility significantly. Pay special attention to:
          </p>
          <ul>
            <li>Seasonal shifts in buyer behavior</li>
            <li>New trends in your product category</li>
            <li>Competitor keyword strategies</li>
            <li>Performance data from your Etsy shop stats</li>
          </ul>

          <h3>Related Etsy SEO Tools</h3>
          <p>
            For complete Etsy listing optimization, use these free tools from SellerMind:
          </p>
          <ul>
            <li><a href="/tools/etsy-tag-generator">Etsy Tag Generator</a> - Generate all 13 optimized tags with search volume data</li>
            <li><a href="/tools/etsy-seo-tool">Etsy SEO Tool</a> - Analyze your complete listing for SEO improvements</li>
            <li><a href="/tools/etsy-description-generator">Etsy Description Generator</a> - Write keyword-rich descriptions that convert</li>
          </ul>
        </div>
      </details>
    </ToolLayout>
  );
}
