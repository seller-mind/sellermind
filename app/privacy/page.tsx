import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Privacy Policy | SellerMind",
  description: "Privacy policy for SellerMind - Learn how we collect, use, and protect your data when using our AI-powered Etsy seller tools.",
  alternates: {
    canonical: "https://thesellermind.com/privacy",
  },
  openGraph: {
    title: "Privacy Policy | SellerMind",
    description: "Privacy policy for SellerMind - Learn how we collect, use, and protect your data.",
    url: "https://thesellermind.com/privacy",
    type: "website",
  },
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground-primary sm:text-4xl">
          Privacy Policy
        </h1>
        <p className="mt-2 text-foreground-secondary">
          Last updated: January 2025
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Introduction</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none text-foreground-secondary">
          <p>
            SellerMind ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and AI-powered tools.
          </p>
          <p className="mt-4">
            <strong>SellerMind is not affiliated with, endorsed by, or connected to Etsy, Inc.</strong> Etsy is a trademark of Etsy, Inc.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Information We Collect</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none text-foreground-secondary space-y-4">
          <h3 className="text-base font-semibold text-foreground-primary">Information You Provide</h3>
          <ul className="list-disc pl-5 space-y-2">
            <li>Product details you enter for AI content generation</li>
            <li>Customer messages or reviews you submit for response generation</li>
            <li>Any other information you voluntarily provide through our tools</li>
          </ul>

          <h3 className="text-base font-semibold text-foreground-primary">Automatically Collected Information</h3>
          <ul className="list-disc pl-5 space-y-2">
            <li>Device type and browser information</li>
            <li>Pages visited and time spent on our site</li>
            <li>Referring website addresses</li>
            <li>General geographic location (country-level only)</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>How We Use Your Information</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none text-foreground-secondary">
          <p>We use the information we collect to:</p>
          <ul className="list-disc pl-5 space-y-2 mt-4">
            <li>Provide and improve our AI-powered tools</li>
            <li>Generate content based on your inputs</li>
            <li>Analyze usage patterns to enhance user experience</li>
            <li>Protect against fraud and abuse</li>
            <li>Comply with legal obligations</li>
          </ul>
          <p className="mt-4">
            <strong>Important:</strong> We do not store your product information or generated content after you leave our website. All AI processing is performed in real-time and no data is retained on our servers.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cookies and Tracking</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none text-foreground-secondary">
          <p>
            We use essential cookies to ensure our website functions properly. We may also use third-party analytics services like Microsoft Clarity to understand how visitors use our site.
          </p>
          <p className="mt-4">
            You can control cookies through your browser settings. Disabling cookies may affect some functionality of our tools.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Third-Party Services</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none text-foreground-secondary">
          <p>We use the following third-party services:</p>
          <ul className="list-disc pl-5 space-y-2 mt-4">
            <li><strong>OpenAI:</strong> For AI content generation - subject to their privacy policy</li>
            <li><strong>Vercel:</strong> For website hosting and analytics</li>
            <li><strong>Microsoft Clarity:</strong> For usage analytics - subject to their privacy policy</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Security</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none text-foreground-secondary">
          <p>
            We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet is 100% secure.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Rights</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none text-foreground-secondary">
          <p>Depending on your location, you may have the right to:</p>
          <ul className="list-disc pl-5 space-y-2 mt-4">
            <li>Access your personal information</li>
            <li>Correct inaccurate information</li>
            <li>Request deletion of your information</li>
            <li>Object to certain processing activities</li>
            <li>Data portability</li>
          </ul>
          <p className="mt-4">
            To exercise these rights, please contact us at privacy@thesellermind.com
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Children&apos;s Privacy</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none text-foreground-secondary">
          <p>
            Our services are not intended for individuals under the age of 18. We do not knowingly collect personal information from children.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>International Data Transfers</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none text-foreground-secondary">
          <p>
            Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place for such transfers.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Changes to This Policy</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none text-foreground-secondary">
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.
          </p>
          <p className="mt-4">
            We encourage you to review this policy periodically.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contact Us</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none text-foreground-secondary">
          <p>If you have any questions about this Privacy Policy, please contact us:</p>
          <ul className="list-disc pl-5 space-y-2 mt-4">
            <li>Email: privacy@thesellermind.com</li>
            <li>Website: https://thesellermind.com</li>
          </ul>
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Link
          href="/"
          className="text-primary hover:text-primary-hover font-medium"
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}
