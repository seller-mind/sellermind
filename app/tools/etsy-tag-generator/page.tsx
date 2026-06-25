"use client";

import * as React from "react";
import { ToolLayout } from "../components/ToolLayout";
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
import { ApiErrorBanner } from "@/components/tools/ApiErrorBanner";
import { callToolApi, type ToolApiError } from "@/lib/api-client";

interface GeneratedTag {
  text: string;
  volume?: string; // legacy, deprecated — no longer displayed (P0-04 fix)
  competition: "Low" | "Medium" | "High";
}

interface TagApiResponse {
  tags: GeneratedTag[];
}

interface TagRequestPayload extends Record<string, unknown> {
  productDescription: string;
  currentTitle: string;
  category: string;
}

const TOOL_INFO = {
  toolName: "Free Etsy Tag Generator",
  toolDescription: "Generate all 13 Etsy tags with AI-powered suggestions. Find SEO-friendly tag candidates for your listings in seconds.",
  metaTitle: "Free Etsy Tag Generator | AI-Powered 13-Tag Suggestions for Etsy Listings",
  metaDescription: "Generate all 13 Etsy tags in seconds. Free AI tag generator that suggests SEO-friendly tag candidates with one-click copy. Suggestions are AI-generated based on best practices, not live Etsy search data.",
  canonicalUrl: "https://thesellermind.com/tools/etsy-tag-generator",
  structuredData: {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Free Etsy Tag Generator",
    "description": "Generate all 13 Etsy tags with AI-powered suggestions. Get SEO-friendly tag candidates for maximum search visibility, based on best practices.",
    "url": "https://thesellermind.com/tools/etsy-tag-generator",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    }
  },
  features: ["100% Free", "No Signup", "13 Tags", "AI-Powered", "One-Click Copy"],
  otherTools: [
    { name: "Etsy Title Generator", slug: "/tools/etsy-title-generator", description: "Create optimized titles" },
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
        "name": "How many tags can I use on Etsy?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Etsy allows exactly 13 tags per listing. Each tag can be up to 20 characters. Using all 13 tags maximizes your search visibility opportunities."
        }
      },
      {
        "@type": "Question",
        "name": "What's the difference between Etsy tags and keywords?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "On Etsy, 'tags' and 'keywords' often refer to the same thing - the 13 keyword phrases you add to each listing. These are hidden from buyers but help match your listing to search queries."
        }
      },
      {
        "@type": "Question",
        "name": "Should tags repeat words from my Etsy title?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No. Etsy's algorithm indexes titles and tags separately. If 'handmade mug' is in your title, use tags for additional keyword variations like 'coffee gift set' or 'kitchen decor' instead."
        }
      },
      {
        "@type": "Question",
        "name": "How do I find the best Etsy tags?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Look for tags that match what buyers actually search for. Focus on long-tail phrases (3-4 words) that are specific enough to attract real buyer intent but not so broad they get buried by big-shop competition. Our tag generator helps identify these opportunities using AI-driven best-practice patterns."
        }
      },
      {
        "@type": "Question",
        "name": "Should I use single words or phrases as Etsy tags?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Always use multi-word phrases. Single-word tags like 'necklace' have extreme competition. Multi-word tags like 'gold layered necklace women' are more specific and easier to rank for."
        }
      },
      {
        "@type": "Question",
        "name": "How often should I update my Etsy tags?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Review your tags every 60-90 days. Seasonal products should have tags updated for relevant holidays. Stay current with trending keywords in your niche."
        }
      },
      {
        "@type": "Question",
        "name": "Do Etsy tags need to be in English?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "If you sell internationally, consider adding tags in other languages. However, most Etsy buyers search in English, so English tags should be your priority."
        }
      }
    ]
  }
};

export default function EtsyTagGeneratorPage() {
  const [productDescription, setProductDescription] = React.useState("");
  const [currentTitle, setCurrentTitle] = React.useState("");
  const [category, setCategory] = React.useState("");

  const [tags, setTags] = React.useState<GeneratedTag[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [apiError, setApiError] = React.useState<ToolApiError | null>(null);
  const [copiedIndex, setCopiedIndex] = React.useState<number | null>(null);
  const [copiedAll, setCopiedAll] = React.useState(false);
  const [showSEOSection, setShowSEOSection] = React.useState(false);

  const generateTags = async () => {
    if (!productDescription.trim()) {
      return;
    }

    setIsLoading(true);
    setTags([]);
    setApiError(null);

    const payload: TagRequestPayload = {
      productDescription,
      currentTitle,
      category,
    };

    const result = await callToolApi<TagRequestPayload, TagApiResponse>(
      "/api/tag-generate",
      payload
    );

    if (result.ok === false) {
      // P0 fix (etsy-*): surface 403 LIMIT_EXCEEDED + every other failure as
      // a persistent red banner with an Upgrade CTA. We deliberately do NOT
      // populate `tags` with hardcoded "ceramic mug" demo data — that
      // previously shipped fake tag suggestions to free-tier users hitting
      // the IP quota and could damage their listings if pasted into Etsy.
      setApiError(result.error);
      setIsLoading(false);
      return;
    }

    setTags(result.data.tags);
    setIsLoading(false);
  };

  const copyToClipboard = async (text: string, index?: number) => {
    await navigator.clipboard.writeText(text);
    if (index !== undefined) {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    }
  };

  const copyAllTags = async () => {
    const allTags = tags.map(t => t.text).join(", ");
    await navigator.clipboard.writeText(allTags);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const getCompetitionColor = (level: string) => {
    switch (level) {
      case "Low": return "text-green-600 bg-green-100";
      case "Medium": return "text-yellow-600 bg-yellow-100";
      default: return "text-red-600 bg-red-100";
    }
  };

  return (
    <ToolLayout {...TOOL_INFO}>
      <ApiErrorBanner
        error={apiError}
        onDismiss={() => setApiError(null)}
        className="mb-4"
      />
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle>Product Information</CardTitle>
            <CardDescription>Describe your product to generate optimized Etsy tags</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="productDescription">Product Description *</Label>
              <Textarea
                id="productDescription"
                placeholder="Describe your product: Handmade ceramic coffee mug with blue glaze and gold rim, perfect for morning coffee..."
                rows={5}
                value={productDescription}
                onChange={(e) => setProductDescription(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="currentTitle">Current Title (Optional)</Label>
              <Input
                id="currentTitle"
                placeholder="Paste your existing title to avoid duplicate keywords"
                value={currentTitle}
                onChange={(e) => setCurrentTitle(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="jewelry">Jewelry</SelectItem>
                  <SelectItem value="home-decor">Home Decor</SelectItem>
                  <SelectItem value="art">Art & Collectibles</SelectItem>
                  <SelectItem value="clothing">Clothing</SelectItem>
                  <SelectItem value="accessories">Accessories</SelectItem>
                  <SelectItem value="craft-supplies">Craft Supplies</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={generateTags} 
              disabled={isLoading || !productDescription.trim()}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {isLoading ? "Generating..." : "✨ Generate 13 Tags"}
            </Button>
          </CardContent>
        </Card>

        {/* Output Section */}
        <div className="space-y-4">
          {tags.length > 0 ? (
            <>
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">🏷️ 13 Etsy Tags</h2>
                <Button variant="outline" size="sm" onClick={copyAllTags}>
                  {copiedAll ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                  Copy All
                </Button>
              </div>

              <div className="grid gap-2">
                {tags.map((tag, index) => (
                  <Card key={index} className="relative">
                    <CardContent className="py-3 flex justify-between items-center">
                      <div className="flex-1">
                        <span className="text-sm font-medium">{tag.text}</span>
                        <div className="flex gap-2 items-center text-xs text-foreground-muted mt-1">
                          <span className={`px-2 py-0.5 rounded ${getCompetitionColor(tag.competition)}`}>
                            {tag.competition} competition
                          </span>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => copyToClipboard(tag.text, index)}
                      >
                        {copiedIndex === index ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <Card className="min-h-[400px] flex items-center justify-center border-dashed">
              <div className="text-center text-foreground-muted">
                <p className="text-4xl mb-2">🏷️</p>
                <p>Enter your product description and click</p>
                <p>"Generate 13 Tags" to get started</p>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Tips Section */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>📚 13 Must-Know Etsy Tag Strategies for Higher Rankings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-foreground-secondary">
          <div>
            <h4 className="font-semibold text-foreground-primary">1. Always Use All 13 Tags</h4>
            <p>Every empty tag slot is a missed search opportunity. Etsy allows 13 tags × 20 characters each. Fill every slot with relevant keywords.</p>
          </div>
          <div>
            <h4 className="font-semibold text-foreground-primary">2. Use Multi-Word Phrases</h4>
            <p>Single-word tags like "mug" have massive competition. Multi-word phrases like "handmade ceramic mug" or "gold layered necklace" rank easier.</p>
          </div>
          <div>
            <h4 className="font-semibold text-foreground-primary">3. Don't Repeat Title Keywords</h4>
            <p>Etsy indexes your title separately from tags. If "ceramic mug" is in your title, don't waste a tag slot on it. Use tags for additional keyword variations.</p>
          </div>
          <div>
            <h4 className="font-semibold text-foreground-primary">4. Include Search Intent Keywords</h4>
            <p>Add tags that match buyer search intent: "gift for her," "birthday present," "wedding favor." These signal purchase readiness.</p>
          </div>
          <div>
            <h4 className="font-semibold text-foreground-primary">5. Mix Broad and Long-Tail Tags</h4>
            <p>Use 7-8 long-tail phrases and 5-6 broader terms to capture different search queries.</p>
          </div>
        </CardContent>
      </Card>

      {/* Expanded SEO Content Section */}
      <details className="mt-8 border rounded-lg">
        <summary 
          className="cursor-pointer p-4 font-medium text-foreground-secondary hover:text-foreground-primary hover:bg-gray-50"
          onClick={() => setShowSEOSection(!showSEOSection)}
        >
          📚 Learn More About Etsy Tag Optimization
        </summary>
        <div className="p-4 pt-0 prose prose-sm max-w-none text-foreground-secondary">
          <h2>The Complete Guide to Etsy Tags: Maximize Your Search Visibility</h2>
          <p>
            Etsy tags (also called keywords) are one of the most powerful SEO tools available to sellers. Unlike titles, tags are hidden from buyers but play a crucial role in matching your listing to search queries. Understanding how to use all 13 tags effectively can dramatically increase your visibility.
          </p>
          
          <h3>Long-Tail vs. Broad Tags: Which Work Better?</h3>
          <p>
            The debate between long-tail and broad tags is essential for every Etsy seller:
          </p>
          <table>
            <thead>
              <tr>
                <th>Tag Type</th>
                <th>Example</th>
                <th>Competition</th>
                <th>Conversion Potential</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Broad</td>
                <td>jewelry</td>
                <td>Extremely High</td>
                <td>Low (browse intent)</td>
              </tr>
              <tr>
                <td>Medium</td>
                <td>gold necklace</td>
                <td>High</td>
                <td>Moderate</td>
              </tr>
              <tr>
                <td>Long-tail</td>
                <td>gold layered necklace for women</td>
                <td>Medium</td>
                <td>High (buyer intent)</td>
              </tr>
            </tbody>
          </table>
          <p>
            <strong>Recommendation:</strong> Long-tail tags convert better even when they attract fewer eyeballs. They reach buyers with clear purchase intent.
          </p>

          <h3>How to Choose Etsy Tags That Rank</h3>
          <p>
            Follow these steps to select tags that balance reach with realistic ranking potential:
          </p>
          <ol>
            <li><strong>Identify your main keyword:</strong> What would a buyer type to find your product?</li>
            <li><strong>Add specificity:</strong> Include material, style, size, or color descriptors</li>
            <li><strong>Consider the buyer:</strong> Who is this for? Add occasion and recipient keywords</li>
            <li><strong>Check competition:</strong> If a tag has extremely high competition, find more specific variations</li>
            <li><strong>Mix with low-competition tags:</strong> Balance broader competitive tags with easier, more specific wins</li>
          </ol>

          <h3>Etsy Tag Examples by Category</h3>
          <p>
            Here are effective tag strategies for different product types:
          </p>
          <h4>Jewelry Tags</h4>
          <ul>
            <li>gold layered necklace women</li>
            <li>minimalist jewelry gift</li>
            <li>handmade earrings for sensitive ears</li>
            <li>wedding jewelry bride</li>
            <li>boho accessories for summer</li>
          </ul>
          
          <h4>Home Decor Tags</h4>
          <ul>
            <li>boho wall art living room</li>
            <li>cottagecore aesthetic bedroom</li>
            <li>handmade vase for flowers</li>
            <li>farmhouse kitchen decor</li>
            <li>nursery wall hanging neutral</li>
          </ul>

          <h3>What to Avoid in Etsy Tags</h3>
          <ul>
            <li><strong>Repeating keywords:</strong> Using the same phrase multiple times wastes tag slots</li>
            <li><strong>Single words:</strong> They have extreme competition and low conversion</li>
            <li><strong>Irrelevant keywords:</strong> Tags should accurately describe your product</li>
            <li><strong>Special characters:</strong> Avoid &, %, !, and emoji in tags</li>
            <li><strong>Duplicate title words:</strong> Save tags for new keyword opportunities</li>
          </ul>

          <h3>Seasonal and Trendy Tags</h3>
          <p>
            Incorporate seasonal keywords when relevant:
          </p>
          <ul>
            <li><strong>Holiday:</strong> christmas gift, valentines day jewelry, mothers day present</li>
            <li><strong>Seasonal:</strong> spring aesthetic, summer vibes, fall decor, winter warmth</li>
            <li><strong>Trending:</strong> cottagecore, dark academia, coastal grandmother (when relevant)</li>
          </ul>

          <h3>Related Tools for Complete Etsy Optimization</h3>
          <p>
            For the best results, use these free tools together:
          </p>
          <ul>
            <li><a href="/tools/etsy-title-generator">Etsy Title Generator</a> - Create SEO-optimized titles with keyword placement</li>
            <li><a href="/tools/etsy-seo-tool">Etsy SEO Tool</a> - Analyze your complete listing for improvements</li>
            <li><a href="/tools/etsy-holiday-marketing">Holiday Marketing Generator</a> - Get seasonal keywords and templates</li>
          </ul>
        </div>
      </details>
    </ToolLayout>
  );
}
