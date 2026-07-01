import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { JsonLdScript } from "@/components/shared/JsonLdScript";
import {
  getAllPosts,
  getPostBySlug,
  getPostContent,
} from "@/lib/blog/posts";

interface PageProps {
  params: { slug: string };
}

export async function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const post = getPostBySlug(params.slug);
  if (!post) return {};

  const url = `https://thesellermind.com/blog/${post.slug}`;
  return {
    title: `${post.title} | SellerMind Blog`,
    description: post.description,
    keywords: post.keywords,
    authors: [{ name: post.author }],
    alternates: { canonical: url },
    openGraph: {
      title: post.title,
      description: post.description,
      url,
      type: "article",
      siteName: "SellerMind",
      publishedTime: post.date,
      authors: [post.author],
      images: [
        {
          url: "https://thesellermind.com/icons/icon-512.svg",
          width: 512,
          height: 512,
          alt: "SellerMind",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: ["https://thesellermind.com/icons/icon-512.svg"],
    },
  };
}

export default function BlogPostPage({ params }: PageProps) {
  const post = getPostBySlug(params.slug);
  if (!post) notFound();

  const markdown = getPostContent(post);
  const url = `https://thesellermind.com/blog/${post.slug}`;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    author: {
      "@type": "Organization",
      name: post.author,
      url: "https://thesellermind.com",
    },
    publisher: {
      "@type": "Organization",
      name: "SellerMind",
      url: "https://thesellermind.com",
      logo: {
        "@type": "ImageObject",
        url: "https://thesellermind.com/icons/icon-512.svg",
      },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    keywords: post.keywords.join(", "),
    inLanguage: "en-US",
  };

  return (
    <article className="mx-auto max-w-3xl py-10">
      <JsonLdScript data={structuredData} />

      <nav className="mb-6 text-sm text-foreground-muted">
        <Link href="/blog" className="hover:text-primary">
          ← Back to blog
        </Link>
      </nav>

      <header className="mb-8 border-b border-border pb-6">
        <h1 className="text-3xl font-bold text-foreground-primary sm:text-4xl">
          {post.title}
        </h1>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-foreground-muted">
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
      </header>

      <div className="blog-prose">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
      </div>

      <footer className="mt-12 rounded-2xl border border-border bg-background-secondary/40 p-6">
        <p className="text-sm text-foreground-secondary">
          Want to try SellerMind on your own listings?{" "}
          <Link
            href="/tools/etsy-title-generator"
            className="font-medium text-primary hover:underline"
          >
            Start with the AI title generator
          </Link>{" "}
          — Free tier, no card needed.
        </p>
      </footer>
    </article>
  );
}
