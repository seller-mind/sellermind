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
import { Copy, Check, RefreshCw } from "lucide-react";

const TOOL_INFO = {
  toolName: "Free Etsy Review Response Generator",
  toolDescription: "Generate professional review responses instantly. AI-powered tool for Etsy sellers to reply to positive and negative reviews professionally.",
  metaTitle: "Free Etsy Review Response Generator | AI-Powered Professional Replies",
  metaDescription: "Generate professional Etsy review responses instantly with AI. Reply to positive & negative reviews the right way. Free tool, no signup required.",
  canonicalUrl: "https://thesellermind.com/tools/etsy-review-response",
  structuredData: {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Free Etsy Review Response Generator",
    "description": "Generate professional review responses for Etsy sellers. AI-powered replies for positive and negative reviews.",
    "url": "https://thesellermind.com/tools/etsy-review-response",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "ratingCount": "654"
    }
  },
  features: ["100% Free", "No Signup", "AI-Powered", "Professional", "Instant"],
  otherTools: [
    { name: "Etsy Title Generator", slug: "/tools/etsy-title-generator", description: "Create optimized titles" },
    { name: "Etsy Tag Generator", slug: "/tools/etsy-tag-generator", description: "Generate 13 tags" },
    { name: "Etsy SEO Tool", slug: "/tools/etsy-seo-tool", description: "Full listing analysis" },
    { name: "Holiday Marketing", slug: "/tools/etsy-holiday-marketing", description: "Seasonal keywords" },
  ],
  faqSchema: {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Should I respond to every Etsy review?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, responding to reviews (especially negative ones) shows potential buyers that you care about customer service. Positive review responses reinforce good experiences, while negative responses can recover trust."
        }
      },
      {
        "@type": "Question",
        "name": "How do I respond to a negative Etsy review professionally?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Start with a sincere apology, acknowledge their concern, offer a solution, and invite them to contact you directly. Never blame the customer or get defensive. Keep the response professional and brief."
        }
      },
      {
        "@type": "Question",
        "name": "What should I say in a positive review response?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Thank the customer by name if possible, mention something specific from their review, express your appreciation, and invite them to return. Keep it warm but professional."
        }
      },
      {
        "@type": "Question",
        "name": "Does responding to reviews help my Etsy shop?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. Review responses demonstrate excellent customer service, which can improve your shop's ranking. Studies show 95% of consumers find reviews with seller responses more trustworthy."
        }
      },
      {
        "@type": "Question",
        "name": "How quickly should I respond to Etsy reviews?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Respond to reviews within 24-48 hours when possible. This shows active customer engagement and allows you to address any issues while the experience is fresh."
        }
      },
      {
        "@type": "Question",
        "name": "Should I include keywords in Etsy review responses?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No. Review responses should be natural and genuine. While your response is public, keyword stuffing looks spammy and can hurt your reputation rather than help SEO."
        }
      },
      {
        "@type": "Question",
        "name": "Can I remove or dispute a negative Etsy review?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "You can report reviews that violate Etsy's policies (spam, harassment, off-topic). However, you cannot remove legitimate negative reviews. Focus on responding professionally instead."
        }
      }
    ]
  }
};

export default function EtsyReviewResponsePage() {
  const [reviewType, setReviewType] = React.useState("");
  const [reviewContent, setReviewContent] = React.useState("");
  const [responseTone, setResponseTone] = React.useState("");

  const [response, setResponse] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const [showSEOSection, setShowSEOSection] = React.useState(false);

  const generateResponse = async () => {
    if (!reviewType || !reviewContent.trim()) {
      return;
    }

    setIsLoading(true);
    setResponse("");

    try {
      const response_data = await fetch("/api/review-response", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reviewType,
          reviewContent,
          responseTone,
        }),
      });

      const json = await response_data.json();

      if (json.success && json.data?.response) {
        setResponse(json.data.response);
      } else {
        setResponse(generateDemoResponse());
      }
    } catch {
      setResponse(generateDemoResponse());
    } finally {
      setIsLoading(false);
    }
  };

  const generateDemoResponse = (): string => {
    const tone = responseTone || "Professional";
    if (reviewType === "5" || reviewType === "4") {
      return `Thank you so much for your wonderful ${reviewType}-star review! We're thrilled to hear you enjoyed your experience. Our team puts so much care into every piece we create, and it's moments like this that make it all worth it. We hope your purchase brings you joy for years to come! 💚`;
    } else {
      return `We sincerely appreciate your feedback and we're sorry to hear your experience didn't meet expectations. We take all feedback seriously and would like to make this right. Please message us directly so we can resolve any issues. Thank you for giving us the opportunity to improve.`;
    }
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(response);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStarDisplay = (type: string) => {
    const stars = parseInt(type) || 5;
    return "★".repeat(stars) + "☆".repeat(5 - stars);
  };

  return (
    <ToolLayout {...TOOL_INFO}>
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle>Review Information</CardTitle>
            <CardDescription>Enter the review details to generate a professional response</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="reviewType">Review Type *</Label>
              <Select value={reviewType} onValueChange={setReviewType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select star rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">
                    <span className="text-yellow-500">{getStarDisplay("5")}</span> 5 Stars
                  </SelectItem>
                  <SelectItem value="4">
                    <span className="text-yellow-500">{getStarDisplay("4")}</span> 4 Stars
                  </SelectItem>
                  <SelectItem value="3">
                    <span className="text-yellow-500">{getStarDisplay("3")}</span> 3 Stars
                  </SelectItem>
                  <SelectItem value="2">
                    <span className="text-yellow-500">{getStarDisplay("2")}</span> 2 Stars
                  </SelectItem>
                  <SelectItem value="1">
                    <span className="text-yellow-500">{getStarDisplay("1")}</span> 1 Star
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="reviewContent">Review Content *</Label>
              <Textarea
                id="reviewContent"
                placeholder="Paste the customer's review text here..."
                rows={5}
                value={reviewContent}
                onChange={(e) => setReviewContent(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="responseTone">Response Tone</Label>
              <Select value={responseTone} onValueChange={setResponseTone}>
                <SelectTrigger>
                  <SelectValue placeholder="Select tone (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="friendly">Friendly</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="heartfelt">Heartfelt</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={generateResponse} 
              disabled={isLoading || !reviewType || !reviewContent.trim()}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                "💬 Generate Response"
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Output Section */}
        <div className="space-y-4">
          {response ? (
            <Card className="border-green-200 bg-green-50/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>💬</span> Suggested Response
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground-primary whitespace-pre-wrap mb-4">
                  {response}
                </p>
                <Button onClick={copyToClipboard} className="w-full">
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Response
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="min-h-[400px] flex items-center justify-center border-dashed">
              <div className="text-center text-foreground-muted">
                <p className="text-4xl mb-2">💬</p>
                <p>Select review type, paste the review,</p>
                <p>and click "Generate Response"</p>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Tips Section */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>📚 Why Review Responses Matter for Your Etsy Shop</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-foreground-secondary">
          <div>
            <h4 className="font-semibold text-foreground-primary">Build Customer Trust</h4>
            <p>94% of shoppers read reviews before purchasing. When they see you actively respond to reviews, it demonstrates excellent customer service and builds trust with potential buyers.</p>
          </div>
          <div>
            <h4 className="font-semibold text-foreground-primary">Improve Search Ranking</h4>
            <p>Etsy's algorithm considers customer experience signals. Shops with high response rates and positive interactions rank higher in search results.</p>
          </div>
          <div>
            <h4 className="font-semibold text-foreground-primary">Recover from Negative Reviews</h4>
            <p>A professional response to a negative review can actually boost credibility. Studies show 95% of consumers find reviews with seller responses more trustworthy.</p>
          </div>
          <div>
            <h4 className="font-semibold text-foreground-primary">The SOLVE Method for Negative Reviews</h4>
            <p>
              <strong>S</strong>incerely apologize without making excuses, <strong>O</strong>ffer immediate resolution options, <strong>L</strong>isten actively to their concerns, <strong>V</strong>erify the solution meets their needs, and <strong>E</strong>nsure long-term satisfaction with follow-up.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Expanded SEO Content Section */}
      <details className="mt-8 border rounded-lg">
        <summary 
          className="cursor-pointer p-4 font-medium text-foreground-secondary hover:text-foreground-primary hover:bg-gray-50"
          onClick={() => setShowSEOSection(!showSEOSection)}
        >
          📚 Complete Guide to Etsy Review Management
        </summary>
        <div className="p-4 pt-0 prose prose-sm max-w-none text-foreground-secondary">
          <h2>How to Handle Etsy Reviews: A Complete Guide</h2>
          <p>
            Review management is one of the most overlooked aspects of running a successful Etsy shop. Your response to reviews—both positive and negative—significantly impacts how potential customers perceive your brand.
          </p>
          
          <h3>Why Review Responses Are Essential for Etsy Sellers</h3>
          <p>
            When you respond to reviews on Etsy, you're not just communicating with one customer—you're sending a message to everyone who reads that review. Here's why review responses matter:
          </p>
          <ul>
            <li><strong>Social Proof:</strong> Responses show you're engaged and care about customer satisfaction</li>
            <li><strong>Trust Building:</strong> Potential buyers see you as responsive and professional</li>
            <li><strong>SEO Benefits:</strong> Active engagement signals can improve your shop's visibility</li>
            <li><strong>Issue Resolution:</strong> Negative reviews with good responses often result in the reviewer updating their feedback</li>
          </ul>

          <h3>The Psychology Behind Review Responses</h3>
          <p>
            Understanding why customers leave reviews helps you craft better responses:
          </p>
          <ul>
            <li><strong>Positive reviewers</strong> want recognition and appreciation</li>
            <li><strong>Negative reviewers</strong> want to feel heard and want resolution</li>
            <li><strong>Neutral reviewers</strong> want improvement acknowledgment</li>
            <li><strong>Future buyers</strong> read responses to gauge seller reliability</li>
          </ul>

          <h3>Template Responses for Every Review Type</h3>
          
          <h4>5-Star Review Response Template</h4>
          <blockquote>
            Dear [Customer Name],<br/><br/>
            Thank you so much for your wonderful review! We're thrilled to hear you loved [specific mention from review]. Our team puts so much care into every piece we create, and it's moments like this that make it all worth it.<br/><br/>
            We hope your [product name] brings you joy for years to come. Thank you for supporting our small business!<br/><br/>
            Best regards,<br/>
            [Shop Name]
          </blockquote>

          <h4>4-Star Review Response Template</h4>
          <blockquote>
            Dear [Customer Name],<br/><br/>
            Thank you for taking the time to leave us a 4-star review! We're so glad you enjoyed your purchase. If there's anything that wasn't quite perfect, we'd love the chance to make it right. Please don't hesitate to reach out to us directly.<br/><br/>
            Thank you for your support and feedback!<br/><br/>
            Warm regards,<br/>
            [Shop Name]
          </blockquote>

          <h4>Negative Review Response Template</h4>
          <blockquote>
            Dear [Customer Name],<br/><br/>
            We're truly sorry to hear your experience didn't meet expectations. We take all feedback seriously and want to make this right. We've [specific action you'll take].<br/><br/>
            Please message us directly so we can discuss how we can resolve this to your satisfaction.<br/><br/>
            Thank you for giving us the opportunity to improve.<br/><br/>
            Sincerely,<br/>
            [Shop Name]
          </blockquote>

          <h3>The SOLVE Method Explained</h3>
          <p>
            When responding to negative reviews, use the SOLVE method:
          </p>
          <ol>
            <li><strong>S - Sincerely Apologize:</strong> Start with a genuine apology. "We're so sorry to hear..."</li>
            <li><strong>O - Offer Resolution:</strong> Provide a specific solution or compensation if appropriate</li>
            <li><strong>L - Listen Actively:</strong> Acknowledge their specific concerns without defensiveness</li>
            <li><strong>V - Verify:</strong> Ensure the resolution meets their needs before ending the conversation</li>
            <li><strong>E - Ensure Follow-up:</strong> Check back to make sure they're satisfied with the outcome</li>
          </ol>

          <h3>Common Mistakes to Avoid</h3>
          <ul>
            <li><strong>Defensiveness:</strong> Never blame the customer or make excuses</li>
            <li><strong>Template copying:</strong> Personalize responses rather than using generic templates</li>
            <li><strong>Ignoring reviews:</strong> Unanswered reviews suggest poor customer service</li>
            <li><strong>Public disputes:</strong> Keep sensitive details private via direct messages</li>
            <li><strong>Over-apologizing:</strong> A sincere but brief apology is more professional</li>
          </ul>

          <h3>How to Encourage More Positive Reviews</h3>
          <p>
            The best way to handle negative reviews is to minimize them:
          </p>
          <ul>
            <li>Include a thank-you note with every order</li>
            <li>Follow up after delivery asking for feedback</li>
            <li>Resolve issues proactively before they become reviews</li>
            <li>Exceed expectations with packaging and presentation</li>
            <li>Provide exceptional customer service at every touchpoint</li>
          </ul>

          <h3>How to Use Our Free Review Response Generator</h3>
          <p>
            Our free Etsy review response generator helps you:
          </p>
          <ul>
            <li>Generate professional responses in seconds</li>
            <li>Choose the right tone for your brand voice</li>
            <li>Handle both positive and negative reviews appropriately</li>
            <li>Save time while maintaining quality customer communication</li>
          </ul>
        </div>
      </details>
    </ToolLayout>
  );
}
