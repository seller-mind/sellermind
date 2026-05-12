# SellerMind — AI-Powered Assistant for Etsy Sellers

SellerMind is a free AI-powered tool suite designed specifically for Etsy sellers. Generate optimized listings, craft customer replies, create holiday marketing copy, handle negative reviews, and batch optimize your entire shop — all in one intuitive interface.

**SellerMind is not affiliated with, endorsed by, or connected to Etsy, Inc.** Etsy is a trademark of Etsy, Inc.

## Features

- **Listing Generator** - Create SEO-optimized titles, descriptions, and tags
- **Auto Reply** - Generate professional customer service responses
- **Holiday Marketing** - Create seasonal marketing copy for holidays
- **Review Handler** - Transform negative reviews into opportunities
- **Batch Optimizer** - Analyze and optimize multiple listings at once

### Free SEO Tools

- [Free Etsy Title Generator](/tools/etsy-title-generator) - Create 140-character SEO titles
- [Free Etsy Tag Generator](/tools/etsy-tag-generator) - Generate all 13 optimized tags
- [Free Etsy SEO Tool](/tools/etsy-seo-tool) - Full listing analysis
- [Free Etsy Review Response](/tools/etsy-review-response) - AI reply to reviews
- [Free Etsy Holiday Marketing](/tools/etsy-holiday-marketing) - Seasonal keywords

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **AI**: OpenAI API
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- OpenAI API key

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd sellermind

# Install dependencies
npm install

# Copy environment variables
cp .env.local.example .env.local

# Add your OpenAI API key to .env.local
# OPENAI_API_KEY=your_key_here

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to start using the tools.

### Deployment

This project is optimized for Vercel deployment:

1. Push your code to GitHub
2. Import project to Vercel
3. Add environment variable: `OPENAI_API_KEY`
4. Deploy!

## Project Structure

```
sellermind/
├── app/
│   ├── api/              # API routes for AI generation
│   ├── tools/            # Tool pages
│   │   ├── components/   # Shared tool components
│   │   ├── etsy-*/       # SEO free tools
│   │   └── *.tsx         # Main feature pages
│   ├── privacy/          # Privacy policy
│   ├── terms/            # Terms of service
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page
├── components/
│   ├── shared/           # Shared components (Header, Footer)
│   ├── tools/            # Tool-specific components
│   └── ui/               # UI components
├── lib/
│   ├── api/              # API utilities
│   └── constants/        # Constants
└── public/               # Static assets
```

## Legal

- **AI Content Disclaimer**: AI-generated content is for reference only. Please review and edit before publishing.
- **Privacy Policy**: [View Privacy Policy](/privacy)
- **Terms of Service**: [View Terms of Service](/terms)

## Development Notes

- All user-visible text is in English
- Brand uses coral color #E07A5F (not Etsy orange #F56400)
- SEO slugs preserve "etsy" keyword for search visibility
- Brand name is "SellerMind" (not "EtsyMind")

## License

Private - All rights reserved
