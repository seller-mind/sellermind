import Link from "next/link";
import { Card } from "@/components/ui/card";

const FEATURES = [
  {
    href: "/tools/listing",
    emoji: "✨",
    title: "Listing Generator",
    description: "Create SEO-optimized titles, descriptions, and tags for your Etsy products in seconds.",
    color: "bg-primary-light",
    accent: "text-primary",
  },
  {
    href: "/tools/reply",
    emoji: "💬",
    title: "Auto Reply",
    description: "Generate professional, warm customer service responses for any inquiry scenario.",
    color: "bg-secondary-light",
    accent: "text-secondary",
  },
  {
    href: "/tools/holiday",
    emoji: "🎉",
    title: "Holiday Marketing",
    description: "Create compelling marketing copy for Christmas, Valentine's, Black Friday and more.",
    color: "bg-amber-50",
    accent: "text-amber-600",
  },
  {
    href: "/tools/review",
    emoji: "⭐",
    title: "Review Handler",
    description: "Transform negative reviews into opportunities with expert response strategies.",
    color: "bg-pink-50",
    accent: "text-pink-600",
  },
  {
    href: "/tools/batch",
    emoji: "🚀",
    title: "Batch Optimizer",
    description: "Analyze and optimize multiple listings at once with AI-powered suggestions.",
    color: "bg-blue-50",
    accent: "text-blue-600",
  },
];

const STEPS = [
  {
    number: "1",
    title: "Choose Your Tool",
    description: "Select from 5 powerful AI tools designed specifically for Etsy sellers.",
  },
  {
    number: "2",
    title: "Enter Your Info",
    description: "Fill in your product details, customer messages, or review content.",
  },
  {
    number: "3",
    title: "Generate & Copy",
    description: "Get professionally crafted content in seconds. One click to copy.",
  },
];

export default function HomePage() {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-primary-hover px-6 py-16 text-white sm:px-12 sm:py-24">
        {/* Decorative circles */}
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10" />
        <div className="absolute -bottom-8 -left-8 h-48 w-48 rounded-full bg-white/5" />
        <div className="absolute right-1/4 top-1/4 h-32 w-32 rounded-full bg-white/5" />

        <div className="relative mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
            <svg className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Seller<span className="text-accent">Mind</span>
          </h1>
          <p className="mb-8 text-lg text-white/90 sm:text-xl">
            Your AI Partner for Thriving Etsy Shop
          </p>
          <p className="mb-8 text-base text-white/80 sm:text-lg max-w-2xl mx-auto">
            Empower your Etsy business with AI-powered tools that simplify listing creation, customer service, and marketing — all in one intuitive interface.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/tools/listing"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-primary shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Start Creating — It's Free
            </Link>
            <Link
              href="#features"
              className="inline-flex items-center gap-2 rounded-xl border-2 border-white/40 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-200 hover:bg-white/20"
            >
              See All Features
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="space-y-8">
        <div className="text-center">
          <h2 className="mb-3 text-3xl font-bold text-foreground-primary sm:text-4xl">
            Everything You Need to <span className="text-primary">Grow</span>
          </h2>
          <p className="mx-auto max-w-2xl text-foreground-secondary">
            Five powerful AI tools, purpose-built for Etsy sellers. No more staring at a blank page.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <Link key={feature.href} href={feature.href} className="group">
              <Card className="h-full p-6 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5">
                <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${feature.color}`}>
                  <span className="text-2xl">{feature.emoji}</span>
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground-primary group-hover:text-primary">
                  {feature.title}
                </h3>
                <p className="text-sm text-foreground-secondary leading-relaxed">
                  {feature.description}
                </p>
                <div className="mt-4 flex items-center gap-1 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                  Try it now
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="space-y-8">
        <div className="text-center">
          <h2 className="mb-3 text-3xl font-bold text-foreground-primary sm:text-4xl">
            How It <span className="text-primary">Works</span>
          </h2>
          <p className="mx-auto max-w-2xl text-foreground-secondary">
            Get professional results in three simple steps. No training needed.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          {STEPS.map((step, index) => (
            <div key={step.number} className="relative text-center">
              {index < STEPS.length - 1 && (
                <div className="absolute -right-3 top-8 hidden text-border sm:block">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              )}
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-xl font-bold text-white shadow-md">
                {step.number}
              </div>
              <h3 className="mb-2 text-base font-semibold text-foreground-primary">
                {step.title}
              </h3>
              <p className="text-sm text-foreground-secondary">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Why SellerMind */}
      <section className="rounded-3xl bg-gradient-to-br from-secondary-light via-background-secondary to-accent/20 px-6 py-12 sm:px-12">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-6 text-3xl font-bold text-foreground-primary sm:text-4xl">
            Why Etsy Sellers Love <span className="text-primary">SellerMind</span>
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 text-left">
            {[
              { icon: "⚡", title: "Lightning Fast", desc: "Generate professional content in seconds, not hours." },
              { icon: "🎯", title: "SEO Optimized", desc: "Every output is crafted to rank higher in Etsy search." },
              { icon: "💰", title: "Cost Effective", desc: "No subscriptions. No credit card. Just results." },
              { icon: "🔒", title: "Privacy First", desc: "Your data is never stored or shared with anyone." },
              { icon: "🌍", title: "Etsy Native", desc: "Built specifically for Etsy sellers, not generic AI." },
              { icon: "✨", title: "No Learning Curve", desc: "Start creating immediately. No tutorials needed." },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-3 rounded-xl bg-white/60 p-4">
                <span className="mt-0.5 text-xl">{item.icon}</span>
                <div>
                  <h4 className="font-semibold text-foreground-primary">{item.title}</h4>
                  <p className="mt-0.5 text-sm text-foreground-secondary">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="text-center">
        <h2 className="mb-4 text-3xl font-bold text-foreground-primary sm:text-4xl">
          Ready to Transform Your Etsy Shop?
        </h2>
        <p className="mx-auto mb-8 max-w-xl text-foreground-secondary">
          Join thousands of Etsy sellers who use AI to save time and sell more.
        </p>
        <Link
          href="/tools/listing"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-4 text-base font-semibold text-white shadow-lg transition-all duration-200 hover:bg-primary-hover hover:shadow-xl hover:-translate-y-0.5"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Get Started for Free
        </Link>
      </section>
    </div>
  );
}
