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
          Last updated: June 2026
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
          <p className="mt-4">
            <strong>AI Transparency Notice:</strong> This service uses artificial intelligence (DeepSeek) to generate content. AI-generated outputs may contain inaccuracies, errors, or omissions. Users should verify all information independently before making any business decisions or publishing any content. SellerMind does not guarantee the accuracy or completeness of AI-generated content.
          </p>
          <p className="mt-4">
            <strong>Geographic Restriction Notice:</strong> SellerMind services are not intended for users located in mainland China, the Hong Kong Special Administrative Region, Macau Special Administrative Region, or Taiwan. If you are located in these regions, please do not use our services. Our website may restrict access from these regions in accordance with applicable laws and regulations.
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
          <CardTitle>AI Data Processing</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none text-foreground-secondary">
          <p>
            Our AI-powered services utilize third-party AI APIs for content generation. When you use our tools:
          </p>
          <ul className="list-disc pl-5 space-y-2 mt-4">
            <li>Your inputs are processed in real-time through AI APIs to generate content</li>
            <li>We do not store the original data you input into our AI tools</li>
            <li>AI-generated content is displayed to you and is not retained after your session ends</li>
            <li>Your data is processed solely for the purpose of providing AI-generated responses</li>
            <li>We implement appropriate technical safeguards to protect data during transmission</li>
          </ul>
          <p className="mt-4">
            <strong>⚠️ Important Notice for EU/EEA Users:</strong> Our primary AI provider (DeepSeek) processes data on servers located in China. By using our Service, you acknowledge and consent to the transfer and processing of your data on servers in this jurisdiction. DeepSeek processes data in real-time and does not retain your input after generating the response.
          </p>
          <p className="mt-4">
            <strong>Note:</strong> When you use our AI tools, your input data may be transmitted to AI service providers. Please review their privacy policies to understand how they handle data.
          </p>
          <p className="mt-4">
            <strong>GDPR Safeguards (Article 44+):</strong> For international data transfers, we rely on Standard Contractual Clauses (SCCs) as the legal basis, in accordance with GDPR Article 46(2)(c). All data transfers are encrypted in transit using TLS 1.2+. We minimize the data sent to AI providers — only product details and customer messages, no personal identifiers beyond your email.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cookies and Tracking</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none text-foreground-secondary">
          <p>
            We use only essential cookies to ensure our website functions properly. We do not currently use any third-party analytics or tracking cookies.
          </p>

          <h3 className="text-base font-semibold text-foreground-primary mt-4">Cookie Categories</h3>
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li>
              <strong>Essential Cookies:</strong> Required for the website to function properly. These cookies enable core functionality such as security, session management, and accessibility. You cannot opt out of essential cookies as the Service would not function without them. Examples include authentication tokens and load balancing cookies.
            </li>
            <li>
              <strong>Analytics Cookies:</strong> We do not currently use any analytics cookies. If we introduce analytics services in the future, we will update this policy and provide appropriate consent mechanisms before enabling them.
            </li>
            <li>
              <strong>Functional Cookies:</strong> Enable enhanced functionality and personalization, such as remembering your preferences. These are optional and you can disable them without affecting the core functionality of the Service.
            </li>
          </ul>

          <h3 className="text-base font-semibold text-foreground-primary mt-4">Managing Your Cookie Preferences</h3>
          <p>
            You can control cookies through your browser settings or the Cookie Consent Banner displayed on your first visit. Disabling cookies may affect some functionality of our tools.
          </p>
          <p className="mt-4">
            <strong>Do Not Track:</strong> We respect Do Not Track (DNT) signals from browsers. If you have DNT enabled, we will not set non-essential cookies.
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
            <li><strong>DeepSeek:</strong> Primary AI content generation provider - servers located in China - subject to their privacy policy</li>
            <li><strong>Dodo Payments:</strong> Payment processing and subscription management — servers located in the United States (Merchant of Record / payment processor)</li>
            <li><strong>Supabase:</strong> Database and user data storage - servers located in Tokyo, Japan</li>
            <li><strong>Vercel:</strong> Website hosting and deployment - servers located in the United States</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>International Data Transfers</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none text-foreground-secondary">
          <p>
            Your information may be transferred to and processed in countries other than your own, including the United States and other jurisdictions where our service providers operate.
          </p>
          <p className="mt-4">
            When we transfer personal data outside of the European Economic Area (EEA) or your jurisdiction, we ensure appropriate safeguards are in place, which may include:
          </p>
          <ul className="list-disc pl-5 space-y-2 mt-4">
            <li>Standard Contractual Clauses (SCCs) approved by relevant authorities</li>
            <li>Data processing agreements with service providers</li>
            <li>Verifying that service providers maintain appropriate data protection standards</li>
          </ul>
          <p className="mt-4">
            <strong>For Users in Restricted Regions:</strong> If you are accessing our services despite geographic restrictions, please note that your data may be processed outside your country of residence. We do not target or intentionally collect data from users in mainland China, Hong Kong, Macau, or Taiwan.
          </p>
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
          <CardTitle>GDPR Compliance (European Users)</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none text-foreground-secondary">
          <p>
            For users located in the European Economic Area (EEA), this section provides additional information about our data processing practices in compliance with the General Data Protection Regulation (GDPR).
          </p>
          
          <h3 className="text-base font-semibold text-foreground-primary mt-4">Data Controller</h3>
          <p>SellerMind</p>
          <p>Contact: privacy@thesellermind.com</p>
          
          <h3 className="text-base font-semibold text-foreground-primary mt-4">Data Protection Officer (DPO)</h3>
          <p>For GDPR-related inquiries, please contact us at: privacy@thesellermind.com</p>
          
          <h3 className="text-base font-semibold text-foreground-primary mt-4">Legal Basis for Processing</h3>
          <p>We process your personal data based on one or more of the following legal grounds:</p>
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li><strong>Performance of Contract:</strong> Processing necessary to provide our services to you</li>
            <li><strong>Legitimate Interests:</strong> Processing for our legitimate business interests, provided these are not overridden by your rights</li>
            <li><strong>Consent:</strong> Where you have given explicit consent for specific processing activities</li>
          </ul>
          
          <h3 className="text-base font-semibold text-foreground-primary mt-4">Your GDPR Rights</h3>
          <p>If you are an EEA resident, you have the right to:</p>
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li><strong>Access:</strong> Request a copy of your personal data</li>
            <li><strong>Rectification:</strong> Request correction of inaccurate personal data</li>
            <li><strong>Erasure:</strong> Request deletion of your personal data ("right to be forgotten")</li>
            <li><strong>Restriction:</strong> Request restriction of processing</li>
            <li><strong>Portability:</strong> Receive your data in a structured, machine-readable format</li>
            <li><strong>Object:</strong> Object to processing based on legitimate interests</li>
            <li><strong>Withdraw Consent:</strong> Withdraw consent at any time where processing is based on consent</li>
          </ul>
          <p className="mt-4">
            To exercise any of these rights, please contact us at privacy@thesellermind.com. We will respond to your request within 30 days.
          </p>
          
          <h3 className="text-base font-semibold text-foreground-primary mt-4">Right to Lodge a Complaint</h3>
          <p>
            You have the right to lodge a complaint with your local data protection authority if you believe we have violated your GDPR rights.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>CCPA Compliance (California Users)</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none text-foreground-secondary">
          <p>
            If you are a California resident, you have rights under the California Consumer Privacy Act (CCPA):
          </p>
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li><strong>Right to Know:</strong> You can request information about the personal data we collect and how it is used</li>
            <li><strong>Right to Delete:</strong> You can request deletion of your personal information</li>
            <li><strong>Right to Correct:</strong> You can request correction of inaccurate personal information</li>
            <li><strong>Right to Opt Out:</strong> We do not sell personal information. There is nothing to opt out of</li>
            <li><strong>Right to Non-Discrimination:</strong> We will not discriminate against you for exercising your rights</li>
          </ul>
          <p className="mt-4">
            We do not sell, rent, or share personal information with third parties for marketing purposes. To exercise these rights, contact us at privacy@thesellermind.com.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Breach Notification</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none text-foreground-secondary">
          <p>
            In the event of a data breach that affects your personal information, we will:
          </p>
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li>Notify affected users via email within 72 hours of becoming aware of the breach, as required by GDPR Article 33</li>
            <li>Notify the relevant supervisory authority if the breach poses a risk to individuals&apos; rights and freedoms</li>
            <li>Take immediate steps to contain the breach and prevent further data loss</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>EU AI Act Compliance</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none text-foreground-secondary">
          <p>
            Our Service uses artificial intelligence to generate content. In accordance with the EU Artificial Intelligence Act:
          </p>
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li><strong>Transparency:</strong> All AI-generated content is clearly labeled and includes a disclaimer about potential inaccuracies</li>
            <li><strong>Human Oversight:</strong> Users can review, verify, and edit all AI-generated content before use</li>
            <li><strong>Accuracy:</strong> We use state-of-the-art AI models and encourage users to cross-reference with original sources</li>
            <li><strong>No Automated Decisions:</strong> The Service does not make decisions that produce legal effects for users</li>
          </ul>
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
            <li>Opt out of certain data collection practices</li>
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
            Our services are not intended for individuals under the age of <strong>16</strong>. We do not knowingly collect personal information from children under 16. If we become aware that we have collected personal data from a child under 16 without verified parental consent, we will take steps to delete that information promptly.
          </p>
          <p className="mt-4">
            If you are a parent or guardian and believe your child under 16 has provided us with personal information, please contact us at privacy@thesellermind.com.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>EU Consumer Rights (14-Day Withdrawal Right)</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none text-foreground-secondary">
          <p>
            If you are located in the European Union (EU) or European Economic Area (EEA), you have the right to withdraw from a distance contract within <strong>14 days</strong> without providing any reason, in accordance with the EU Consumer Rights Directive 2011/83/EU.
          </p>
          <p className="mt-4">
            The withdrawal period expires 14 days after the day on which you enter into the subscription contract. To exercise your right of withdrawal, you must notify us of your decision to withdraw before the withdrawal period has expired.
          </p>
          <h3 className="text-base font-semibold text-foreground-primary mt-4">How to Withdraw</h3>
          <p>
            To exercise your right of withdrawal, you may contact us:
          </p>
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li><strong>Email:</strong> privacy@thesellermind.com</li>
            <li>Using our <Link href="/contact" className="text-primary hover:underline">contact form</Link></li>
          </ul>
          <p className="mt-4">
            If you withdraw from a subscription contract within the 14-day period, we will reimburse all payments received from you, without undue delay and in any event no later than 14 days from the day on which we are informed about your decision to withdraw.
          </p>
          <p className="mt-4">
            <strong>Important:</strong> This right of withdrawal does not apply to digital content that has been delivered to you with your prior express consent and you acknowledge that you lose this right once the digital content has been delivered and used.
          </p>
          <h3 className="text-base font-semibold text-foreground-primary mt-4">Online Dispute Resolution (ODR)</h3>
          <p>
            In accordance with EU Regulation No 524/2013 on online dispute resolution for consumer disputes, EU consumers may use the{' '}
            <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              EU Online Dispute Resolution platform
            </a>{' '}
            to resolve disputes out of court. The ODR platform is available at: https://ec.europa.eu/consumers/odr
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
          <p className="mt-4">
            For GDPR requests or data protection inquiries from EEA users: privacy@thesellermind.com
          </p>
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
