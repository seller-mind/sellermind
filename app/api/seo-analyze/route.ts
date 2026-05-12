import { NextRequest, NextResponse } from "next/server";

interface SEORequest {
  title: string;
  tags?: string;
  description?: string;
}

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

function analyzeListing(data: SEORequest): SEOAnalysis {
  const { title, tags, description } = data;
  
  let score = 30; // Base score
  const strengths: string[] = [];
  const weaknesses: SEORecommendation[] = [];
  const additionalTags: string[] = [];

  // Title analysis
  const titleLength = title.length;
  
  // Character length check
  if (titleLength >= 120 && titleLength <= 140) {
    score += 25;
    strengths.push("Excellent title length (120-140 characters)");
  } else if (titleLength >= 100 && titleLength < 120) {
    score += 15;
    strengths.push("Good title length");
  } else if (titleLength >= 80 && titleLength < 100) {
    score += 10;
    weaknesses.push({ type: "warning", message: "Title could be longer. Add more keywords to reach 120+ characters.", impact: "Medium" });
  } else if (titleLength > 140) {
    score += 5;
    weaknesses.push({ type: "warning", message: "Title exceeds 140 characters and will be truncated by Etsy.", impact: "High" });
  } else {
    weaknesses.push({ type: "improvement", message: "Title is too short. Use more keywords to maximize visibility.", impact: "High" });
  }

  // Title structure
  if (title.includes("|") || title.includes(",")) {
    score += 10;
    strengths.push("Good keyword separation with pipes or commas");
  }

  // Keywords analysis
  const titleLower = title.toLowerCase();
  const hasIntentKeywords = /\b(gift|for her|for him|for mom|for dad|birthday|wedding|anniversary|christmas|mothers day|fathers day)\b/i.test(titleLower);
  const hasMaterialKeywords = /\b(handmade|handcrafted|ceramic|wooden|leather|silver|gold|cotton|silk|vintage|antique)\b/i.test(titleLower);
  const hasStyleKeywords = /\b(minimalist|modern|boho|vintage|rustic|classic|elegant|simple|unique)\b/i.test(titleLower);

  if (hasIntentKeywords) {
    score += 15;
    strengths.push("Includes buyer intent keywords (gift, for her, etc.)");
  } else {
    weaknesses.push({ type: "improvement", message: "Add buyer intent keywords like 'gift', 'for her', 'birthday'", impact: "Medium" });
    additionalTags.push("gift for her");
  }

  if (hasMaterialKeywords) {
    score += 10;
    strengths.push("Includes material/style keywords");
  } else {
    additionalTags.push("handmade");
  }

  if (hasStyleKeywords) {
    score += 5;
    strengths.push("Includes descriptive style keywords");
  }

  // Tags analysis
  const tagList = tags ? tags.split("\n").filter(t => t.trim()) : [];
  const tagCount = tagList.length;

  if (tagCount === 13) {
    score += 20;
    strengths.push("All 13 tags filled - maximum search coverage");
  } else if (tagCount >= 10) {
    score += 15;
    weaknesses.push({ type: "warning", message: `Only ${tagCount} tags filled. Use all 13 for maximum coverage.`, impact: "Medium" });
  } else if (tagCount > 0) {
    score += Math.min(tagCount * 1.5, 12);
    weaknesses.push({ type: "improvement", message: `Only ${tagCount} tags filled. Fill all 13 tags to maximize visibility.`, impact: "High" });
  } else {
    weaknesses.push({ type: "improvement", message: "No tags provided. Add 13 relevant tags immediately.", impact: "High" });
    additionalTags.push("unique gift");
    additionalTags.push("best seller");
  }

  // Duplicate check between title and tags
  if (tagCount > 0) {
    const titleWords = titleLower.split(/\s+/).filter(w => w.length > 3);
    const duplicateTags = tagList.filter(tag => {
      const tagWords = tag.toLowerCase().split(/\s+/);
      return tagWords.some(word => titleWords.includes(word));
    });
    
    if (duplicateTags.length > 5) {
      weaknesses.push({ type: "warning", message: "Many tags duplicate title keywords. Use tags for NEW keywords not in title.", impact: "Medium" });
    } else {
      score += 5;
    }
  }

  // Description analysis
  const descLength = description ? description.length : 0;
  if (descLength >= 200) {
    score += 10;
    strengths.push("Good description length");
  } else if (descLength >= 100) {
    score += 5;
  } else if (descLength > 0) {
    weaknesses.push({ type: "warning", message: "Description is short. Add more details for better SEO.", impact: "Low" });
  }

  // Keywords in description
  if (description && description.length > 50) {
    const descLower = description.toLowerCase();
    if (!titleLower.split(/\s+/).some(w => descLower.includes(w) && w.length > 3)) {
      weaknesses.push({ type: "improvement", message: "Description doesn't reinforce title keywords.", impact: "Low" });
    }
  }

  // Finalize score
  score = Math.min(Math.max(score, 0), 100);

  // Overall feedback
  let overallFeedback = "";
  if (score >= 80) {
    overallFeedback = "Excellent optimization! Your listing is well-positioned for search visibility.";
  } else if (score >= 65) {
    overallFeedback = "Good foundation. Small improvements can significantly boost your ranking.";
  } else if (score >= 50) {
    overallFeedback = "Room for improvement. Focus on the high-priority items below.";
  } else {
    overallFeedback = "Needs significant optimization. Address all high-priority items to improve visibility.";
  }

  return {
    score,
    strengths,
    weaknesses,
    additionalTags: Array.from(new Set(additionalTags)).slice(0, 5),
    overallFeedback
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: SEORequest = await request.json();
    
    if (!body.title) {
      return NextResponse.json(
        { success: false, error: { message: "Listing title is required" } },
        { status: 400 }
      );
    }

    const analysis = analyzeListing(body);
    
    return NextResponse.json({
      success: true,
      data: analysis
    });
  } catch {
    return NextResponse.json(
      { success: false, error: { message: "Invalid request body" } },
      { status: 400 }
    );
  }
}
