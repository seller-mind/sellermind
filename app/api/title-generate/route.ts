import { NextRequest, NextResponse } from "next/server";

interface TitleRequest {
  productType: string;
  keyFeatures: string;
  targetAudience?: string;
  useCase?: string;
  materials?: string;
  style?: string;
}

function generateTitles(data: TitleRequest) {
  const { productType, keyFeatures, targetAudience, useCase, materials, style } = data;
  
  const titles = [
    `${productType} | ${keyFeatures} | Perfect ${useCase || "Gift"} | Handmade`,
    `Handmade ${productType} - ${keyFeatures} - Ideal ${useCase || "Gift"} for ${targetAudience || "Everyone"}`,
    `${productType}, ${keyFeatures}, ${materials || "Handmade"} ${style || ""} Style Gift`.trim(),
    `Unique ${productType} | ${keyFeatures} | Perfect for ${targetAudience || "Everyone"}`,
    `${style || "Handmade"} ${productType} - ${keyFeatures} - ${useCase || "Gift"}`.trim(),
  ];

  return titles.map(title => {
    const chars = title.length;
    let score: "Excellent" | "Good" | "Fair" = "Good";
    if (chars >= 120 && chars <= 140 && title.includes("|")) score = "Excellent";
    else if (chars < 80) score = "Fair";
    
    return { text: title, chars, score };
  });
}

export async function POST(request: NextRequest) {
  try {
    const body: TitleRequest = await request.json();
    
    if (!body.productType || !body.keyFeatures) {
      return NextResponse.json(
        { success: false, error: { message: "Product type and key features are required" } },
        { status: 400 }
      );
    }

    const titles = generateTitles(body);
    
    return NextResponse.json({
      success: true,
      data: { titles }
    });
  } catch {
    return NextResponse.json(
      { success: false, error: { message: "Invalid request body" } },
      { status: 400 }
    );
  }
}
