import { NextRequest, NextResponse } from "next/server";

interface ReviewRequest {
  reviewType: string;
  reviewContent: string;
  responseTone?: string;
}

function generateReviewResponse(data: ReviewRequest): string {
  const { reviewType, reviewContent, responseTone } = data;
  const stars = parseInt(reviewType) || 5;
  const tone = responseTone || "professional";
  
  const isPositive = stars >= 4;
  const tonePrefix = tone === "friendly" ? "Hey there! " : tone === "casual" ? "Hi! " : "";
  
  if (isPositive) {
    return `${tonePrefix}Thank you so much for your wonderful ${stars}-star review! We're absolutely thrilled to hear you had a great experience. Our team puts so much care and passion into every piece we create, and knowing it brought you joy truly means the world to us.

We hope your purchase brings you happiness for years to come. If you ever need anything or want to share your experience, please don't hesitate to reach out.

Thank you for supporting our small business! 💚`;
  } else if (stars === 3) {
    return `${tonePrefix}Thank you for taking the time to leave us feedback. We appreciate your honest thoughts and we're sorry if your experience wasn't exactly what you hoped for.

We'd love to make things right. Could you please reach out to us directly so we can discuss how we can improve? Your feedback helps us grow and serve our customers better.

Thank you for giving us the opportunity to address your concerns.`;
  } else {
    return `Dear valued customer,

We sincerely apologize that your experience didn't meet our high standards. We take all feedback very seriously, and we're truly sorry for any disappointment.

Please know that this is not the experience we strive to provide. We'd like to make this right immediately.

Could you please contact us directly so we can resolve this issue as quickly as possible? We're committed to ensuring your complete satisfaction.

Thank you for giving us the chance to improve.`;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: ReviewRequest = await request.json();
    
    if (!body.reviewType || !body.reviewContent) {
      return NextResponse.json(
        { success: false, error: { message: "Review type and content are required" } },
        { status: 400 }
      );
    }

    const response = generateReviewResponse(body);
    
    return NextResponse.json({
      success: true,
      data: { response }
    });
  } catch {
    return NextResponse.json(
      { success: false, error: { message: "Invalid request body" } },
      { status: 400 }
    );
  }
}
