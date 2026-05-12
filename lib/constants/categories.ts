export const CATEGORIES = [
  { value: "jewelry", label: "Jewelry", icon: "💍" },
  { value: "clothing", label: "Clothing & Accessories", icon: "👗" },
  { value: "home-living", label: "Home & Living", icon: "🏠" },
  { value: "art-collectibles", label: "Art & Collectibles", icon: "🎨" },
  { value: "craft-supplies", label: "Craft Supplies", icon: "✂️" },
  { value: "vintage", label: "Vintage", icon: "🗺️" },
  { value: "weddings", label: "Weddings", icon: "💒" },
  { value: "electronics", label: "Electronics & Tech", icon: "🔌" },
  { value: "toys-games", label: "Toys & Games", icon: "🧩" },
  { value: "pet-supplies", label: "Pet Supplies", icon: "🐾" },
  { value: "bags-purses", label: "Bags & Purses", icon: "👜" },
  { value: "paper-party", label: "Paper & Party Supplies", icon: "🎉" },
  { value: "bath-beauty", label: "Bath & Beauty", icon: "🛁" },
  { value: "shoes", label: "Shoes", icon: "👟" },
  { value: "books-movies", label: "Books, Movies & Music", icon: "📚" },
  { value: "digital-products", label: "Digital Products", icon: "📱" },
] as const;

export type Category = (typeof CATEGORIES)[number]["value"];
