import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts } from "@/lib/blog/posts";
import { JsonLdScript } from "@/components/shared/JsonLdScript";

export const metadata: Metadata = {
  title: "SellerMind Blog | Etsy SEO, AI Tools & Seller Playbooks",
  description:
    "Practical, AI-first playbooks for Etsy sellers — SEO comparisons, listing optimization tactics, and honest tool reviews from the SellerMind team.",
  alternates: {
    canonical: "https://thesellermind.com/blog",
  },
  openGraph: {
    title: "SellerMind Blog | Etsy SEO, AI Tools & Seller Playbooks",
    description:
      "Practical, AI-first playbooks for Etsy sellers — SEO comparisons, listing optimization tactics, and honest tool reviews.",
    url: "https://thesellermind.com/blog",
    type: "website",
    siteName: "SellerMind",
  },
  twitter: {
    card: "summary_large_image",
    title: "SellerMind Blog | Etsy SEO, AI Tools & Seller Playbooks",
    description:
      "Practical, AI-first playbooks for Etsy sellers — SEO comparisons, listing optimization tactics, and honest tool reviews.",
  },
};

export default function BlogIndexPage() {
  const posts = getAllPosts();

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "SellerMind Blog",
    description:
      "Etsy SEO, AI tools, and seller playbooks from the SellerMind team.",
    url: "https://thesellermind.com/blog",
    publisher: {
      "@type": "Organization",
      name: "SellerMind",
      url: "https://thesellermind.com",
    },
    blogPost: posts.map((p) => ({
      "@type": "BlogPosting",
      headline: p.title,
      description: p.description,
      datePublished: p.date,
      author: { "@type": "Organization", name: p.author },
      url: `https://thesellermind.com/blog/${p.slug}`,
    })),
  };

  return (
    <div className="mx-auto max-w-3xl py-10">
      <JsonLdScript data={structuredData} />
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-foreground-primary sm:text-5xl">
          SellerMind Blog
        </h1>
        <p className="mt-3 text-base text-foreground-secondary">
          Etsy SEO, AI tools, and honest seller playbooks.
        </p>
      </header>

      <ul className="space-y-6">
        {posts.map((post) => (
          <li
            key={post.slug}
            className="rounded-2xl border border-border bg-background-card p-6 shadow-sm transition hover:shadow-md"
          >
            <Link href={`/blog/${post.slug}`} className="group block">
              <h2 className="text-2xl font-semibold text-foreground-primary group-hover:text-primary">
                {post.title}
              </h2>
              <p className="mt-2 text-sm text-foreground-secondary">
                {post.description}
              </p>
              <div className="mt-4 flex items-center gap-3 text-xs text-foreground-muted">
                <time dateTime={post.date}>
                  {new Date(post.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </time>
                <span>·</span>
                <span>By {post.author}</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
