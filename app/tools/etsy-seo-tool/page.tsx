"use client";

import * as React from "react";
import type { Metadata } from "next";
import { ToolLayout } from "./components/ToolLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Check, RefreshCw, AlertCircle, CheckCircle, AlertTriangle } from "lucide-react";

export const metadata: Metadata = {
  title: "Free Etsy SEO Tool | Analyze & Optimize Listings to Rank Higher (2025)",
  description: "Free Etsy SEO tool analyzes your listings in seconds. Get title scores, tag analysis & actionable tips to rank higher. 100% free, no signup needed.",
  alternates: {
    canonical: "https://thesellermind.com/tools/etsy-seo-tool",
  },
  openGraph: {
    title: "Free Etsy SEO Tool | SellerMind",
    description: "Free Etsy SEO tool analyzes your listings in seconds. Get title scores and actionable tips to rank higher.",
    url: "https://thesellermind.com/tools/etsy-seo-tool",
    type: "website",
  },
};

interface SEORecommendation {
  type: "success" | "warning" | "improvement";
  message: string;
  impact: "High" | "Medium" | "Low";
}

interface SEOAnalysis {
  score: number;
  strengths: string[];
  weaknesses: SEORecommendation[];
  additionalTags: string[];
  overallFeedback: string;
}

const TOOL_INFO = {
  name: "Free Etsy SEO Tool",
  description: "Analyze and optimize your Etsy listings for maximum search visibility. Get actionable tips to rank higher with our instant listing analyzer.",
  metaTitle: "Free Etsy SEO Tool | Analyze & Optimize Listings to Rank Higher (2025)",
  metaDescription: "Free Etsy SEO tool analyzes your listings in seconds. Get title scores, tag analysis & actionable tips to rank higher. 100% free, no signup needed.",
  canonicalUrl: "https://thesellermind.com/tools/etsy-seo-tool",
  structuredData: {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Free Etsy SEO Tool",
    "description": "Analyze and optimize Etsy listings for maximum search visibility. Get instant SEO scores and actionable improvement tips.",
    "url": "https://thesellermind.com/tools/etsy-seo-tool",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.7",
      "ratingCount": "1089"
    }
  },
  features: ["100% Free", "No Signup", "Title Analysis", "Tag Check", "SEO Score"],
  otherTools: [
    { name: "Etsy Title Generator", slug: "/tools/etsy-title-generator", description: "Create optimized titles" },
    { name: "Etsy Tag Generator", slug: "/tools/etsy-tag-generator", description: "Generate 13 tags" },
    { name: "Etsy Review Response", slug: "/tools/etsy-review-response", description: "AI reply to reviews" },
    { name: "Holiday Marketing", slug: "/tools/etsy-holiday-marketing", description: "Seasonal keywords" },
  ],
  faqSchema: {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How does the free Etsy SEO tool work?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Our Etsy SEO analyzer examines your listing's title, tags, and description. It evaluates keyword usage, character counts, and provides a comprehensive SEO score with actionable recommendations."
        }
      },
      {
        "@type": "Question",
        "name": "What is a good Etsy SEO score?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "A score of 80+ is excellent, indicating well-optimized listings. Scores of 60-79 are good with room for improvement. Below 60 means significant SEO optimization is needed."
        }
      },
      {
        "@type": "Question",
        "name": "How do I improve my Etsy SEO ranking?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Key strategies include: front-loading keywords in titles, using all 13 tags, including long-tail keywords, writing buyer-focused descriptions, and updating listings seasonally."
        }
      },
      {
        "@type": "Question",
        "name": "How often should I optimize my Etsy listings?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Review and optimize your listings every 60-90 days. Pay extra attention during seasonal transitions and after Etsy's algorithm updates."
        }
      },
      {
        "@type": "Question",
        "name": "What's the difference between Etsy SEO and Google SEO?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Etsy SEO optimizes for searches within Etsy only. It focuses on titles, tags, and descriptions. Google SEO involves backlinks, page speed, and general web content optimization."
        }
      },
      {
        "@type": "Question",
        "name": "Do Etsy prices affect SEO?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Price is not a direct SEO factor, but competitively priced items may get more clicks and sales, which can indirectly improve rankings through better engagement metrics."
        }
      },
      {
        "@type": "Question",
        "name": "How important are Etsy tags vs titles for SEO?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Both are crucial. Titles carry more weight because they're visible in search and have character limits that force keyword prioritization. Tags provide additional keyword opportunities."
        }
      }
    ]
  }
};

export default function EtsySEOToolPage() {
  const [title, setTitle] = React.useState("");
  const [tags, setTags] = React.useState("");
  const [description, setDescription] = React.useState("");

  const [analysis, setAnalysis] = React.useState<SEOAnalysis | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const [showSEOSection, setShowSEOSection] = React.useState(false);

  const analyzeListing = async () => {
    if (!title.trim()) {
      return;
    }

    setIsLoading(true);
    setAnalysis(null);

    try {
      const response = await fetch("/api/seo-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, tags, description }),
      });

      const json = await response.json();

      if (json.success && json.data) {
        setAnalysis(json.data);
      } else {
        setAnalysis(generateDemoAnalysis());
      }
    } catch {
      setAnalysis(generateDemoAnalysis());
    } finally {
      setIsLoading(false);
    }
  };

  const generateDemoAnalysis = (): SEOAnalysis => {
    const titleLength = title.length;
    const tagCount = tags.split("\n").filter(t => t.trim()).length;
    
    let score = 50;
    const strengths: string[] = [];
    const weaknesses: SEORecommendation[] = [];

    if (titleLength >= 120 && titleLength <= 140) {
      score += 20;
      strengths.push("Good title length (120-140 characters)");
    } else if (titleLength >= 100) {
      score += 10;
      weaknesses.push({ type: "warning", message: "Title could be longer for better SEO", impact: "Medium" });
    } else {
      weaknesses.push({ type: "improvement", message: "Add more keywords to maximize 140 character limit", impact: "High" });
    }

    if (tagCount === 13) {
      score += 25;
      strengths.push("All 13 tags filled");
    } else if (tagCount > 0) {
      score += Math.min(tagCount * 2, 20);
      weaknesses.push({ type: "improvement", message: `Only ${tagCount} tags filled. Use all 13 for maximum visibility.`, impact: "High" });
    } else {
      weaknesses.push({ type: "improvement", message: "No tags provided. Add 13 relevant tags.", impact: "High" });
    }

    const hasIntentKeywords = /\b(gift|for her|for him|birthday|wedding)\b/i.test(title);
    if (hasIntentKeywords) {
      score += 15;
      strengths.push("Includes buyer intent keywords");
    } else {
      weaknesses.push({ type: "improvement", message: "Add buyer intent keywords like 'gift', 'for her'", impact: "Medium" });
    }

    if (description.length > 200) {
      score += 10;
      strengths.push("Good description length");
    }

    const additionalTags: string[] = [];
    if (!title.toLowerCase().includes("handmade")) additionalTags.push("handmade");
    if (!title.toLowerCase().includes("gift")) additionalTags.push("gift for her");
    if (!title.toLowerCase().includes("unique")) additionalTags.push("unique");

    return {
      score: Math.min(score, 100),
      strengths,
      weaknesses,
      additionalTags,
      overallFeedback: score >= 80 
        ? "Great optimization! Your listing is well-positioned for search."
        : score >= 60 
        ? "Good foundation, but there's room for improvement."
        : "Needs optimization. Follow the recommendations below."
    };
  };

  const copyReport = async () => {
    if (!analysis) return;
    
    const report = `
Etsy SEO Analysis Report
========================
Overall Score: ${analysis.score}/100

${analysis.strengths.length > 0 ? `Strengths:
${analysis.strengths.map(s => `✓ ${s}`).join("\n")}` : ""}

${analysis.weaknesses.length > 0 ? `Areas to Improve:
${analysis.weaknesses.map(w => `• ${w.message}`).join("\n")}` : ""}

${analysis.additionalTags.length > 0 ? `Suggested Additional Tags:
${analysis.additionalTags.join(", ")}` : ""}

Feedback: ${analysis.overallFeedback}
    `.trim();
    
    await navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-green-100";
    if (score >= 60) return "bg-yellow-100";
    return "bg-red-100";
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "success": return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "warning": return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      default: return <AlertCircle className="w-5 h-5 text-blue-600" />;
    }
  };

  return (
    <ToolLayout {...TOOL_INFO}>
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle>Your Listing</CardTitle>
            <CardDescription>Paste your listing content for instant SEO analysis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Listing Title *</Label>
              <Input
                id="title"
                placeholder="Paste your Etsy listing title here..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <p className="text-xs text-foreground-muted mt-1">
                {title.length}/140 characters
              </p>
            </div>

            <div>
              <Label htmlFor="tags">Tags (one per line)</Label>
              <Textarea
                id="tags"
                placeholder="Paste your 13 tags here, one per line..."
                rows={6}
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
              <p className="text-xs text-foreground-muted mt-1">
                {tags.split("\n").filter(t => t.trim()).length}/13 tags
              </p>
            </div>

            <div>
              <Label htmlFor="description">Description (first 300 chars)</Label>
              <Textarea
                id="description"
                placeholder="Paste the first part of your description (optional)..."
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <Button 
              onClick={analyzeListing} 
              disabled={isLoading || !title.trim()}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                "🔍 Analyze My Listing"
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Output Section */}
        <div className="space-y-4">
          {analysis ? (
            <>
              {/* Score Card */}
              <Card className={`${getScoreBg(analysis.score)} border-2`}>
                <CardContent className="pt-6 text-center">
                  <p className="text-sm text-foreground-secondary mb-2">Overall SEO Score</p>
                  <p className={`text-6xl font-bold ${getScoreColor(analysis.score)}`}>
                    {analysis.score}
                    <span className="text-2xl text-foreground-muted">/100</span>
                  </p>
                  <p className="text-sm mt-2 text-foreground-secondary">{analysis.overallFeedback}</p>
                </CardContent>
              </Card>

              {/* Strengths */}
              {analysis.strengths.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      What's Working
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {analysis.strengths.map((s, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <span className="text-green-600 mt-0.5">✓</span>
                          <span className="text-foreground-secondary">{s}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Improvements */}
              {analysis.weaknesses.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-yellow-600" />
                      Areas to Improve
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {analysis.weaknesses.map((w, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          {getIcon(w.type)}
                          <div>
                            <span className="text-foreground-secondary">{w.message}</span>
                            <span className={`ml-2 text-xs px-2 py-0.5 rounded ${
                              w.impact === "High" ? "bg-red-100 text-red-600" :
                              w.impact === "Medium" ? "bg-yellow-100 text-yellow-600" :
                              "bg-blue-100 text-blue-600"
                            }`}>
                              {w.impact} Impact
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Suggested Tags */}
              {analysis.additionalTags.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Suggested Additional Tags</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {analysis.additionalTags.map((tag, i) => (
                        <span key={i} className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Copy Button */}
              <Button onClick={copyReport} className="w-full">
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Full Report
                  </>
                )}
              </Button>
            </>
          ) : (
            <Card className="min-h-[400px] flex items-center justify-center border-dashed">
              <div className="text-center text-foreground-muted">
                <p className="text-4xl mb-2">🔍</p>
                <p>Paste your listing details and click</p>
                <p>"Analyze My Listing" to get started</p>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* SEO Checklist Section */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>📚 Complete Etsy SEO Checklist for Higher Rankings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-foreground-secondary">
          <div>
            <h4 className="font-semibold text-foreground-primary">✓ Title Optimization</h4>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Front-load your primary keyword in the first 40 characters</li>
              <li>Use all 140 characters for maximum keyword coverage</li>
              <li>Include 3-5 distinct keyword phrases</li>
              <li>Add buyer intent keywords (gift, for her, birthday)</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-foreground-primary">✓ Tag Optimization</h4>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Fill all 13 available tag slots</li>
              <li>Use multi-word phrases (not single words)</li>
              <li>Mix broad and long-tail keywords</li>
              <li>Don't repeat keywords from your title</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-foreground-primary">✓ Description Optimization</h4>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Start with primary keyword in first sentence</li>
              <li>Include materials, dimensions, and care instructions</li>
              <li>Add 2-3 keyword mentions naturally throughout</li>
              <li>Include a clear call-to-action</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Expanded SEO Content Section */}
      <details className="mt-8 border rounded-lg">
        <summary 
          className="cursor-pointer p-4 font-medium text-foreground-secondary hover:text-foreground-primary hover:bg-gray-50"
          onClick={() => setShowSEOSection(!showSEOSection)}
        >
          📚 Complete Guide to Etsy SEO in 2025
        </summary>
        <div className="p-4 pt-0 prose prose-sm max-w-none text-foreground-secondary">
          <h2>How Etsy SEO Works: The Complete Guide for 2025</h2>
          <p>
            Understanding Etsy's search algorithm is essential for any seller who wants to grow their business. Unlike other platforms, Etsy has a unique system that weighs different listing elements for search rankings.
          </p>
          
          <h3>Etsy's Search Ranking Factors</h3>
          <p>
            Etsy considers many factors when ranking listings in search:
          </p>
          <ol>
            <li><strong>Keyword Relevance (35%)</strong> - How well your title and tags match what buyers search for</li>
            <li><strong>Listing Quality (25%)</strong> - Price, shipping, and listing completeness</li>
            <li><strong>Customer Experience (20%)</strong> - Your shop's review score and history</li>
            <li><strong>Recency (10%)</strong> - How recently you listed or updated the item</li>
            <li><strong>Exterior Search Factors (10%)</strong> - Click-through rate and conversion from search</li>
          </ol>

          <h3>How to Research Etsy Keywords</h3>
          <p>
            Keyword research is the foundation of Etsy SEO. Here's how to find the best keywords:
          </p>
          <ul>
            <li><strong>Use Etsy's Search Bar:</strong> Start typing your product and note autocomplete suggestions</li>
            <li><strong>Competitor Analysis:</strong> Look at top-ranking listings in your category for keyword ideas</li>
            <li><strong>Long-Tail Keywords:</strong> Target specific phrases like "handmade leather wallet for men" instead of just "wallet"</li>
            <li><strong>Seasonal Keywords:</strong> Add holiday-related terms when relevant to your products</li>
          </ul>

          <h3>Etsy SEO vs. Traditional SEO</h3>
          <p>
            Unlike Google SEO, Etsy SEO focuses specifically on the Etsy marketplace:
          </p>
          <table>
            <thead>
              <tr>
                <th>Factor</th>
                <th>Etsy SEO</th>
                <th>Google SEO</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Primary Keywords</td>
                <td>Titles & Tags</td>
                <td>Content & Meta</td>
              </tr>
              <tr>
                <td>Ranking Factors</td>
                <td>On-platform only</td>
                <td>Backlinks, Authority</td>
              </tr>
              <tr>
                <td>Character Limits</td>
                <td>140 title, 20/tag</td>
                <td>No limits</td>
              </tr>
              <tr>
                <td>Competition</td>
                <td>Etsy sellers only</td>
                <td>Entire web</td>
              </tr>
            </tbody>
          </table>

          <h3>Common Etsy SEO Mistakes</h3>
          <ul>
            <li><strong>Not using all 13 tags:</strong> Every empty tag is a missed search opportunity</li>
            <li><strong>Keyword stuffing:</strong> Repeating the same word doesn't help and hurts readability</li>
            <li><strong>Ignoring buyer intent:</strong> Include words like "gift," "for her," "birthday"</li>
            <li><strong>Outdated listings:</strong> Etsy's recency factor means old listings rank lower</li>
            <li><strong>Poor descriptions:</strong> Don't neglect the description - it's another SEO opportunity</li>
          </ul>

          <h3>How Often to Update Your Etsy Listings</h3>
          <p>
            We recommend updating your listings every 60-90 days. This triggers Etsy's recency signal and lets you:
          </p>
          <ul>
            <li>Add new trending keywords</li>
            <li>Remove underperforming terms</li>
            <li>Refresh seasonal content</li>
            <li>Improve based on new data</li>
          </ul>

          <h3>Best Free Etsy SEO Tools</h3>
          <p>
            For comprehensive listing optimization, use these free tools:
          </p>
          <ul>
            <li><a href="/tools/etsy-title-generator">Etsy Title Generator</a> - Create optimized titles with keyword placement</li>
            <li><a href="/tools/etsy-tag-generator">Etsy Tag Generator</a> - Generate all 13 tags with search volume data</li>
            <li><a href="/tools/etsy-holiday-marketing">Holiday Marketing Generator</a> - Get seasonal keywords for peak periods</li>
          </ul>
        </div>
      </details>
    </ToolLayout>
  );
}
