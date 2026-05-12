import { NextRequest, NextResponse } from "next/server";

interface HolidayRequest {
  holiday: string;
  productDescription: string;
  targetAudience?: string;
}

const HOLIDAYS: Record<string, { emoji: string; peak: string; start: string }> = {
  "Christmas": { emoji: "🎄", peak: "Nov 1 - Dec 25", start: "October 15" },
  "Valentine's Day": { emoji: "💝", peak: "Jan 15 - Feb 14", start: "December 1" },
  "Mother's Day": { emoji: "🌷", peak: "Apr 20 - May 10", start: "March 1" },
  "Easter": { emoji: "🐰", peak: "Mar 15 - Apr 20", start: "February 1" },
  "Halloween": { emoji: "🎃", peak: "Sep 15 - Oct 31", start: "August 1" },
  "Father's Day": { emoji: "👔", peak: "May 25 - Jun 15", start: "April 15" },
  "Thanksgiving": { emoji: "🦃", peak: "Nov 15 - Nov 28", start: "October 1" },
  "Back to School": { emoji: "📚", peak: "Aug 1 - Sep 15", start: "July 1" },
};

function generateHolidayMarketingKit(data: HolidayRequest) {
  const { holiday, productDescription, targetAudience } = data;
  const holidayInfo = HOLIDAYS[holiday] || HOLIDAYS["Christmas"];
  const productSnippet = productDescription.substring(0, 40);
  
  const titles = [
    `${holidayInfo.emoji} Perfect ${holiday} Gift - ${productSnippet}...`,
    `Handmade ${productSnippet} - ${holiday} Special Edition ${holidayInfo.emoji}`,
    `${productSnippet} Gift for ${holiday} - Limited Time!`,
    `Unique ${holiday} Gift - ${productSnippet}...`,
    `Premium ${productSnippet} - Perfect ${holiday} Present ${holidayInfo.emoji}`,
  ];

  const tags = [
    `${holiday.toLowerCase()} gift`,
    `${holiday.toLowerCase()} present`,
    `gift for ${targetAudience?.toLowerCase() || 'her'}`,
    `${holiday.toLowerCase()} decoration`,
    "holiday special",
    "limited edition",
    "handmade gift",
    "unique gift",
    `${holiday.toLowerCase()} sale`,
    `must have ${holiday.toLowerCase()}`,
    `best ${holiday.toLowerCase()}`,
    `${holiday.toLowerCase()} shopping`,
    "perfect gift",
  ];

  const emailTemplate = `${holidayInfo.emoji} ${holiday} is coming!

Our ${productSnippet} makes the perfect ${holiday} gift!

🎁 Order by ${holidayInfo.start} to receive it in time!
🎁 Use code HOLIDAY15 for 15% off!

Don't miss out on making someone's ${holiday} special! 💝`;

  const timingTips = `📅 ${holiday} Marketing Timeline:

• 8 weeks before: Update tags with holiday keywords
• 6 weeks before: Launch holiday listings
• 4 weeks before: Push social media and email marketing
• 2 weeks before: Offer last-minute deals
• 1 week before: Remind customers of shipping deadlines

Start preparing your ${holiday} listings by ${holidayInfo.start} for maximum visibility!`;

  return {
    titles,
    tags,
    emailTemplate,
    timingTips
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: HolidayRequest = await request.json();
    
    if (!body.holiday || !body.productDescription) {
      return NextResponse.json(
        { success: false, error: { message: "Holiday and product description are required" } },
        { status: 400 }
      );
    }

    const marketingKit = generateHolidayMarketingKit(body);
    
    return NextResponse.json({
      success: true,
      data: marketingKit
    });
  } catch {
    return NextResponse.json(
      { success: false, error: { message: "Invalid request body" } },
      { status: 400 }
    );
  }
}
