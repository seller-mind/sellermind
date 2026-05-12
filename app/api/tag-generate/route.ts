import { NextRequest, NextResponse } from "next/server";

interface TagRequest {
  productDescription: string;
  currentTitle?: string;
  category?: string;
}

function generateTags(data: TagRequest) {
  const { productDescription, currentTitle, category } = data;
  
  // Simple keyword extraction from description
  const words = productDescription.toLowerCase().split(/\s+/);
  const uniqueWords = [...new Set(words.filter(w => w.length > 3))];
  
  // Common high-value Etsy keywords
  const intentKeywords = ["gift", "gift for her", "gift for him", "birthday", "wedding", "anniversary"];
  const styleKeywords = ["handmade", "vintage", "minimalist", "boho", "modern", "rustic"];
  const materialKeywords = ["ceramic", "wood", "metal", "glass", "leather", "cotton", "silk"];
  
  const tags = [
    { text: "handmade gift", volume: "8,500", competition: "High" as const },
    { text: "unique gift", volume: "5,200", competition: "High" as const },
    { text: "gift for her", volume: "12,000", competition: "High" as const },
    { text: `${uniqueWords.slice(0, 2).join(" ")} gift`.trim(), volume: "2,100", competition: "Medium" as const },
    { text: `${uniqueWords.slice(0, 3).join(" ")}`.trim(), volume: "890", competition: "Low" as const },
    { text: "housewarming gift", volume: "3,400", competition: "Medium" as const },
    { text: `${uniqueWords[0] || "artisan"} decor`, volume: "1,200", competition: "Medium" as const },
    { text: "birthday present", volume: "6,500", competition: "High" as const },
    { text: "best seller", volume: "4,800", competition: "Medium" as const },
    { text: "handmade with love", volume: "2,300", competition: "Low" as const },
    { text: "perfect gift", volume: "9,100", competition: "High" as const },
    { text: `${uniqueWords.slice(0, 2).join(" ")} for mom`.trim(), volume: "780", competition: "Low" as const },
    { text: "limited edition", volume: "1,800", competition: "Low" as const },
  ];

  // Filter out empty tags and limit to 13
  return tags.filter(t => t.text.length > 3 && t.text.length <= 20).slice(0, 13);
}

export async function POST(request: NextRequest) {
  try {
    const body: TagRequest = await request.json();
    
    if (!body.productDescription) {
      return NextResponse.json(
        { success: false, error: { message: "Product description is required" } },
        { status: 400 }
      );
    }

    const tags = generateTags(body);
    
    return NextResponse.json({
      success: true,
      data: { tags }
    });
  } catch {
    return NextResponse.json(
      { success: false, error: { message: "Invalid request body" } },
      { status: 400 }
    );
  }
}
