// v0.05 mock title data — 5 curated groups keyed by rough product category.
// No real LLM call in v0.05; picked at runtime by simple keyword match.
// D13/D14 will replace with real Groq backend (see D12 spec).

export type MockTitle = {
  title: string;
  score: number; // 0-100
  tags: string[]; // Etsy 13-tag cap
};

export type MockGroup = {
  key: string;
  label: string;
  match: string[]; // lowercase substrings used to pick this group
  titles: MockTitle[];
};

export const MOCK_GROUPS: MockGroup[] = [
  {
    key: "jewelry",
    label: "Handmade jewelry",
    match: ["ring", "necklace", "earring", "bracelet", "pendant", "jewel", "silver", "gold", "gemstone"],
    titles: [
      {
        title: "Handmade Silver Ring, Boho Turquoise Stone Ring, Statement Ring for Women, Sterling Silver Jewelry Gift",
        score: 92,
        tags: ["silver ring", "turquoise ring", "boho ring", "handmade ring", "statement ring", "sterling silver", "womens ring", "gemstone ring", "boho jewelry", "gift for her", "hippie ring", "stackable ring", "artisan jewelry"],
      },
      {
        title: "Turquoise Ring Sterling Silver, Boho Statement Jewelry, Handmade Gemstone Ring, Southwestern Ring Gift",
        score: 88,
        tags: ["turquoise jewelry", "sterling silver ring", "gemstone ring", "boho ring", "southwestern", "handmade jewelry", "gift for women", "artisan ring", "boho jewelry", "silver jewelry", "statement ring", "birthday gift", "everyday ring"],
      },
      {
        title: "Sterling Silver Boho Ring, Turquoise Statement Ring, Handmade Womens Jewelry, Bohemian Gift for Her",
        score: 85,
        tags: ["boho ring", "silver ring", "turquoise", "handmade", "womens jewelry", "bohemian", "gift for her", "statement jewelry", "sterling silver", "artisan", "boho style", "layering ring", "everyday jewelry"],
      },
      {
        title: "Boho Turquoise Silver Ring, Sterling Statement Jewelry, Handmade Gemstone Gift, Southwestern Womens Ring",
        score: 82,
        tags: ["turquoise ring", "boho jewelry", "silver statement ring", "handmade", "gemstone", "southwestern jewelry", "womens ring", "gift for her", "sterling silver", "boho style", "artisan ring", "layering", "hippie jewelry"],
      },
      {
        title: "Handmade Turquoise Ring, Silver Boho Statement, Sterling Womens Jewelry, Southwestern Gift, Gemstone Band",
        score: 79,
        tags: ["turquoise", "handmade ring", "silver ring", "boho", "statement", "sterling", "womens", "southwestern", "gift", "gemstone", "band ring", "layering", "artisan"],
      },
      {
        title: "Silver Turquoise Statement Ring, Handmade Boho Jewelry, Sterling Gemstone Gift, Southwestern Womens Band",
        score: 76,
        tags: ["silver ring", "turquoise stone", "statement", "handmade", "boho jewelry", "sterling", "gemstone", "southwestern", "womens ring", "gift for her", "band", "artisan", "boho"],
      },
      {
        title: "Boho Sterling Silver Ring, Turquoise Gemstone, Handmade Southwestern Jewelry, Womens Statement Gift Ring",
        score: 74,
        tags: ["boho ring", "sterling silver", "turquoise", "handmade", "southwestern", "gemstone jewelry", "statement", "womens", "gift", "artisan", "boho jewelry", "layering ring", "band"],
      },
      {
        title: "Handmade Silver Boho Ring, Turquoise Statement Jewelry, Sterling Womens Gift, Southwestern Gemstone Ring",
        score: 71,
        tags: ["handmade ring", "silver", "boho", "turquoise", "statement jewelry", "sterling", "womens gift", "southwestern", "gemstone", "artisan", "boho jewelry", "band", "layering"],
      },
      {
        title: "Silver Boho Ring Handmade, Turquoise Gemstone Statement, Sterling Southwestern Jewelry, Womens Gift Band",
        score: 68,
        tags: ["silver ring", "boho", "handmade", "turquoise", "gemstone", "statement", "sterling silver", "southwestern jewelry", "womens", "gift", "band ring", "artisan", "boho jewelry"],
      },
      {
        title: "Turquoise Handmade Silver Ring, Boho Sterling Statement, Southwestern Womens Jewelry, Gemstone Gift Band",
        score: 65,
        tags: ["turquoise ring", "handmade", "silver", "boho ring", "sterling", "statement", "southwestern", "womens jewelry", "gemstone", "gift", "band", "artisan", "boho jewelry"],
      },
    ],
  },
  {
    key: "home-decor",
    label: "Home decor",
    match: ["candle", "vase", "pillow", "wall art", "throw", "decor", "planter", "mug", "rug"],
    titles: [
      {
        title: "Soy Wax Candle Hand Poured, Lavender Vanilla Scented Candle, Minimalist Home Decor Gift, Amber Jar Candle",
        score: 91,
        tags: ["soy candle", "hand poured candle", "lavender candle", "vanilla candle", "scented candle", "amber jar", "minimalist decor", "home fragrance", "gift for her", "housewarming gift", "aromatherapy", "natural candle", "handmade candle"],
      },
      {
        title: "Hand Poured Soy Candle, Lavender Scented Amber Jar, Minimalist Home Decor, Housewarming Gift for Her",
        score: 87,
        tags: ["soy wax candle", "lavender", "amber jar", "hand poured", "minimalist", "home decor", "housewarming", "gift for her", "scented candle", "aromatherapy", "natural", "handmade", "vanilla"],
      },
      {
        title: "Lavender Vanilla Soy Candle, Hand Poured Amber Jar, Minimalist Decor Gift, Aromatherapy Housewarming",
        score: 84,
        tags: ["lavender candle", "vanilla candle", "soy candle", "amber jar", "minimalist decor", "hand poured", "aromatherapy", "housewarming gift", "home fragrance", "gift", "natural candle", "handmade", "scented"],
      },
      {
        title: "Minimalist Soy Candle Amber Jar, Hand Poured Lavender Vanilla, Aromatherapy Home Decor, Gift for Her",
        score: 81,
        tags: ["minimalist candle", "amber jar candle", "soy wax", "hand poured", "lavender", "vanilla", "aromatherapy", "home decor", "gift for her", "housewarming", "natural candle", "handmade", "scented candle"],
      },
      {
        title: "Amber Jar Soy Candle, Hand Poured Lavender Vanilla Scent, Minimalist Home Fragrance, Housewarming Gift",
        score: 78,
        tags: ["amber jar", "soy candle", "hand poured", "lavender", "vanilla", "minimalist", "home fragrance", "housewarming", "gift for her", "aromatherapy", "natural", "handmade candle", "scented"],
      },
      {
        title: "Hand Poured Lavender Soy Candle, Amber Glass Jar, Minimalist Home Decor Gift, Vanilla Aromatherapy",
        score: 75,
        tags: ["hand poured candle", "lavender", "soy wax", "amber glass", "minimalist", "home decor", "gift", "vanilla", "aromatherapy", "housewarming", "natural candle", "handmade", "scented"],
      },
      {
        title: "Soy Wax Amber Jar Candle, Hand Poured Lavender Vanilla, Minimalist Decor, Aromatherapy Gift for Her",
        score: 72,
        tags: ["soy wax", "amber jar", "hand poured", "lavender", "vanilla", "minimalist decor", "aromatherapy", "gift for her", "home fragrance", "housewarming", "natural candle", "handmade", "scented candle"],
      },
      {
        title: "Lavender Amber Jar Candle, Hand Poured Soy Wax, Minimalist Home Fragrance, Vanilla Housewarming Gift",
        score: 69,
        tags: ["lavender candle", "amber jar", "hand poured", "soy wax candle", "minimalist", "home fragrance", "vanilla", "housewarming gift", "aromatherapy", "natural", "handmade", "scented candle", "gift"],
      },
      {
        title: "Handmade Soy Candle, Lavender Vanilla Amber Jar, Minimalist Aromatherapy Decor, Housewarming Her Gift",
        score: 66,
        tags: ["handmade candle", "soy wax", "lavender", "vanilla", "amber jar", "minimalist decor", "aromatherapy", "housewarming", "gift for her", "home fragrance", "natural", "scented", "hand poured"],
      },
      {
        title: "Soy Candle Amber Jar Hand Poured, Lavender Vanilla Scented, Minimalist Decor, Aromatherapy Gift Idea",
        score: 63,
        tags: ["soy candle", "amber jar", "hand poured", "lavender vanilla", "scented candle", "minimalist decor", "aromatherapy", "gift idea", "housewarming", "home fragrance", "natural candle", "handmade", "scent"],
      },
    ],
  },
  {
    key: "art-print",
    label: "Art & prints",
    match: ["print", "poster", "art", "painting", "wall", "watercolor", "digital download"],
    titles: [
      {
        title: "Botanical Watercolor Print, Wildflower Wall Art, Digital Download Printable, Boho Home Decor Poster Set",
        score: 90,
        tags: ["botanical print", "watercolor art", "wildflower wall art", "digital download", "printable art", "boho decor", "home poster", "flower art", "wall decor", "botanical illustration", "printable", "instant download", "gallery wall"],
      },
      {
        title: "Wildflower Watercolor Wall Art, Botanical Printable Poster, Boho Digital Download, Home Decor Print Set",
        score: 86,
        tags: ["wildflower art", "watercolor print", "botanical wall art", "printable poster", "boho decor", "digital download", "home decor print", "gallery wall", "flower painting", "printable art", "instant download", "boho art", "botanical"],
      },
      {
        title: "Botanical Wall Art Watercolor, Wildflower Print Set, Boho Printable Home Decor, Digital Download Poster",
        score: 83,
        tags: ["botanical wall art", "watercolor", "wildflower print", "boho printable", "home decor art", "digital download", "poster print", "flower art", "gallery wall", "instant download", "printable", "boho decor", "botanical art"],
      },
      {
        title: "Watercolor Wildflower Print, Botanical Wall Art Set, Boho Home Decor Poster, Digital Printable Download",
        score: 80,
        tags: ["watercolor wildflower", "print", "botanical wall art", "boho decor", "home poster", "digital download", "printable", "flower art", "gallery wall", "boho art", "botanical", "instant download", "wall decor"],
      },
      {
        title: "Boho Botanical Print, Watercolor Wildflower Wall Art, Digital Download Home Decor, Printable Poster Set",
        score: 77,
        tags: ["boho botanical", "watercolor print", "wildflower art", "wall decor", "digital download", "home decor", "printable poster", "flower painting", "gallery wall", "instant download", "boho art", "printable", "botanical"],
      },
      {
        title: "Botanical Wildflower Watercolor Poster, Boho Wall Art Print, Digital Home Decor Download, Printable Set",
        score: 74,
        tags: ["botanical wildflower", "watercolor poster", "boho wall art", "print", "digital download", "home decor", "printable set", "gallery wall", "flower art", "instant download", "boho decor", "botanical art", "printable"],
      },
      {
        title: "Wildflower Botanical Print, Watercolor Wall Art Poster, Boho Printable Decor, Instant Digital Download",
        score: 71,
        tags: ["wildflower botanical", "watercolor print", "wall art poster", "boho printable", "home decor", "instant download", "digital art", "flower painting", "gallery wall", "printable", "boho art", "botanical wall art", "print"],
      },
      {
        title: "Watercolor Botanical Poster, Wildflower Boho Wall Art, Printable Home Decor Print, Digital Download Set",
        score: 68,
        tags: ["watercolor botanical", "poster", "wildflower", "boho wall art", "printable", "home decor", "digital download", "print set", "flower art", "gallery wall", "instant download", "boho art", "botanical"],
      },
      {
        title: "Boho Wildflower Watercolor Print, Botanical Wall Art Decor, Digital Printable Poster, Home Download Set",
        score: 65,
        tags: ["boho wildflower", "watercolor print", "botanical wall art", "home decor", "digital printable", "poster", "download", "flower painting", "gallery wall", "printable", "instant download", "boho art", "botanical"],
      },
      {
        title: "Botanical Print Watercolor Wildflower, Boho Wall Decor Art, Printable Digital Poster, Home Download Set",
        score: 62,
        tags: ["botanical print", "watercolor", "wildflower", "boho wall decor", "art", "printable", "digital poster", "home decor", "download", "flower art", "gallery wall", "instant download", "boho"],
      },
    ],
  },
  {
    key: "clothing",
    label: "Clothing & apparel",
    match: ["shirt", "tee", "tshirt", "sweater", "dress", "hoodie", "hat", "cap"],
    titles: [
      {
        title: "Vintage Graphic Tee, Retro 70s Sunset Shirt, Boho Womens T-Shirt, Trendy Aesthetic Cotton Top, Gift Idea",
        score: 89,
        tags: ["vintage tee", "graphic t-shirt", "retro shirt", "70s style", "boho tee", "womens t-shirt", "aesthetic top", "cotton shirt", "trendy tee", "gift for her", "sunset shirt", "vintage graphic", "hippie tee"],
      },
      {
        title: "Retro 70s Sunset Tee, Vintage Graphic T-Shirt, Boho Aesthetic Womens Top, Cotton Trendy Shirt Gift Idea",
        score: 85,
        tags: ["retro tee", "70s sunset", "vintage t-shirt", "graphic shirt", "boho aesthetic", "womens top", "cotton tee", "trendy shirt", "gift idea", "vintage graphic", "hippie", "aesthetic tee", "boho tee"],
      },
      {
        title: "Boho Vintage Sunset T-Shirt, 70s Retro Graphic Tee, Aesthetic Womens Cotton Top, Trendy Shirt Gift Her",
        score: 82,
        tags: ["boho vintage", "sunset t-shirt", "70s retro", "graphic tee", "aesthetic top", "womens shirt", "cotton", "trendy", "gift for her", "vintage tee", "hippie", "boho tee", "retro shirt"],
      },
      {
        title: "70s Retro Sunset Graphic Tee, Vintage Boho Womens T-Shirt, Aesthetic Cotton Top, Trendy Gift Idea Her",
        score: 79,
        tags: ["70s retro", "sunset graphic", "vintage tee", "boho t-shirt", "womens shirt", "aesthetic", "cotton top", "trendy", "gift idea", "gift for her", "hippie tee", "retro shirt", "boho"],
      },
      {
        title: "Vintage Sunset Graphic T-Shirt, 70s Retro Boho Tee, Aesthetic Womens Cotton Top, Trendy Gift for Her",
        score: 76,
        tags: ["vintage sunset", "graphic t-shirt", "70s retro", "boho tee", "aesthetic top", "womens", "cotton shirt", "trendy tee", "gift for her", "hippie", "retro shirt", "boho tee", "vintage graphic"],
      },
      {
        title: "Aesthetic Boho Sunset Tee, Vintage 70s Retro Graphic T-Shirt, Womens Cotton Trendy Top, Gift Her Idea",
        score: 73,
        tags: ["aesthetic tee", "boho sunset", "vintage graphic", "70s retro", "t-shirt", "womens top", "cotton", "trendy", "gift for her", "gift idea", "retro tee", "hippie", "boho shirt"],
      },
      {
        title: "Sunset Retro Graphic Tee, Vintage 70s Boho T-Shirt, Aesthetic Womens Cotton Trendy Top, Gift for Her",
        score: 70,
        tags: ["sunset tee", "retro graphic", "vintage 70s", "boho t-shirt", "aesthetic", "womens top", "cotton shirt", "trendy", "gift for her", "hippie tee", "boho", "retro shirt", "vintage"],
      },
      {
        title: "Boho 70s Sunset Graphic T-Shirt, Retro Vintage Womens Tee, Aesthetic Cotton Top, Trendy Gift Idea Her",
        score: 67,
        tags: ["boho 70s", "sunset graphic", "t-shirt", "retro vintage", "womens tee", "aesthetic top", "cotton", "trendy", "gift idea", "gift for her", "hippie", "boho tee", "retro"],
      },
      {
        title: "Retro Boho Sunset Vintage Tee, 70s Graphic T-Shirt, Aesthetic Womens Cotton Top, Trendy Gift Her Idea",
        score: 64,
        tags: ["retro boho", "sunset vintage", "tee", "70s graphic", "t-shirt", "aesthetic", "womens top", "cotton", "trendy", "gift for her", "gift idea", "hippie", "boho tee"],
      },
      {
        title: "Vintage Retro Sunset Boho Tee, 70s Aesthetic Graphic T-Shirt, Womens Cotton Trendy Top, Gift for Her",
        score: 61,
        tags: ["vintage retro", "sunset boho", "tee", "70s aesthetic", "graphic t-shirt", "womens", "cotton top", "trendy", "gift for her", "hippie", "boho tee", "retro shirt", "vintage"],
      },
    ],
  },
  {
    key: "generic",
    label: "General product",
    match: [], // fallback
    titles: [
      {
        title: "Personalized Handmade Gift, Custom Name Keepsake, Unique Anniversary Present, Thoughtful Birthday Idea",
        score: 88,
        tags: ["personalized gift", "handmade", "custom name", "keepsake", "anniversary", "birthday gift", "thoughtful", "unique gift", "custom present", "gift for her", "gift for him", "special occasion", "custom made"],
      },
      {
        title: "Custom Handmade Keepsake, Personalized Name Gift, Unique Birthday Present, Anniversary Thoughtful Idea",
        score: 84,
        tags: ["custom handmade", "keepsake", "personalized", "name gift", "birthday present", "unique", "anniversary", "thoughtful gift", "special", "gift idea", "gift for her", "gift for him", "custom"],
      },
      {
        title: "Personalized Custom Gift, Handmade Name Keepsake, Anniversary Unique Present, Birthday Thoughtful Idea",
        score: 81,
        tags: ["personalized", "custom gift", "handmade", "name keepsake", "anniversary present", "unique", "birthday gift", "thoughtful", "gift idea", "special occasion", "gift for her", "gift for him", "custom made"],
      },
      {
        title: "Handmade Personalized Gift Idea, Custom Name Keepsake, Anniversary Birthday Present, Unique Thoughtful",
        score: 78,
        tags: ["handmade gift", "personalized", "gift idea", "custom name", "keepsake", "anniversary", "birthday present", "unique", "thoughtful", "gift for her", "gift for him", "special", "custom"],
      },
      {
        title: "Custom Personalized Handmade Present, Name Keepsake Gift, Anniversary Birthday Unique Thoughtful Idea",
        score: 75,
        tags: ["custom personalized", "handmade present", "name keepsake", "gift", "anniversary", "birthday", "unique gift", "thoughtful", "gift idea", "gift for her", "gift for him", "special occasion", "custom made"],
      },
      {
        title: "Personalized Name Handmade Gift, Custom Keepsake Present, Unique Anniversary Birthday Thoughtful Idea",
        score: 72,
        tags: ["personalized name", "handmade gift", "custom keepsake", "present", "unique", "anniversary", "birthday gift", "thoughtful", "gift idea", "gift for her", "gift for him", "special", "custom"],
      },
      {
        title: "Handmade Custom Name Gift, Personalized Keepsake Present, Anniversary Birthday Unique Thoughtful Idea",
        score: 69,
        tags: ["handmade custom", "name gift", "personalized keepsake", "present", "anniversary", "birthday", "unique gift", "thoughtful", "gift idea", "gift for her", "gift for him", "special occasion", "custom made"],
      },
      {
        title: "Personalized Handmade Name Present, Custom Anniversary Keepsake, Birthday Unique Gift, Thoughtful Idea",
        score: 66,
        tags: ["personalized handmade", "name present", "custom anniversary", "keepsake", "birthday", "unique gift", "thoughtful", "gift idea", "gift for her", "gift for him", "special", "custom made", "handmade gift"],
      },
      {
        title: "Custom Name Personalized Handmade Present, Anniversary Keepsake Gift, Birthday Unique Thoughtful Idea",
        score: 63,
        tags: ["custom name", "personalized", "handmade present", "anniversary keepsake", "gift", "birthday", "unique", "thoughtful", "gift idea", "gift for her", "gift for him", "special occasion", "custom made"],
      },
      {
        title: "Handmade Personalized Custom Name Gift, Anniversary Keepsake Present, Unique Birthday Thoughtful Idea",
        score: 60,
        tags: ["handmade personalized", "custom name", "gift", "anniversary keepsake", "present", "unique", "birthday", "thoughtful", "gift idea", "gift for her", "gift for him", "special", "custom made"],
      },
    ],
  },
];

export function pickMockGroup(input: string): MockGroup {
  const lc = (input || "").toLowerCase();
  for (const g of MOCK_GROUPS) {
    if (g.match.length === 0) continue;
    if (g.match.some((kw) => lc.includes(kw))) return g;
  }
  return MOCK_GROUPS[MOCK_GROUPS.length - 1]; // generic fallback
}
