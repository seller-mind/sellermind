export const HOLIDAYS = [
  {
    value: "christmas",
    label: "Christmas",
    emoji: "🎄",
    date: "December 25",
    marketingWindow: "November - December",
    description: "The biggest gift-giving season of the year",
  },
  {
    value: "valentine",
    label: "Valentine's Day",
    emoji: "💕",
    date: "February 14",
    marketingWindow: "January - February",
    description: "Romantic gifts and couple-themed items",
  },
  {
    value: "black_friday",
    label: "Black Friday",
    emoji: "🖤",
    date: "Last Friday of November",
    marketingWindow: "October - November",
    description: "Year's biggest shopping event",
  },
  {
    value: "mothers_day",
    label: "Mother's Day",
    emoji: "🌷",
    date: "Second Sunday of May",
    marketingWindow: "April - May",
    description: "Honor moms with personalized gifts",
  },
  {
    value: "halloween",
    label: "Halloween",
    emoji: "🎃",
    date: "October 31",
    marketingWindow: "September - October",
    description: "Spooky decorations and costumes",
  },
  {
    value: "easter",
    label: "Easter",
    emoji: "🐰",
    date: "Spring (varies)",
    marketingWindow: "February - April",
    description: "Spring celebrations and family gatherings",
  },
] as const;

export type Holiday = (typeof HOLIDAYS)[number]["value"];

export const PROMOTION_TYPES = [
  { value: "percentage_off", label: "Percentage Off", icon: "💰" },
  { value: "buy_x_get_y", label: "Buy X Get Y", icon: "📦" },
  { value: "free_shipping", label: "Free Shipping", icon: "🚚" },
  { value: "limited_time", label: "Limited Time", icon: "⏰" },
  { value: "bundle_deal", label: "Bundle Deal", icon: "🎁" },
] as const;

export type PromotionType = (typeof PROMOTION_TYPES)[number]["value"];
