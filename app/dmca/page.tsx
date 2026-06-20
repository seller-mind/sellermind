import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "DMCA Copyright Policy | SellerMind",
  description: "SellerMind DMCA Copyright Policy - Learn how we handle copyright infringement notices and takedown requests.",
  alternates: {
    canonical: "https://thesellermind.com/dmca",
  },
  openGraph: {
    title: "DMCA Copyright Policy | SellerMind",
    description: "SellerMind DMCA Copyright Policy - Learn how we handle copyright infringement notices and takedown requests.",
    url: "https://thesellermind.com/dmca",
    type: "website",
  },
};

export default function DMCAPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground-primary sm:text-4xl">
          DMCA Copyright Policy
        </h1>
        <p className="mt-2 text-foreground-secondary">
          Effective: June 2026
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Introduction</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none text-foreground-secondary">
          <p>
            SellerMind (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) respects the intellectual property rights of others and expects its users to do the same. In accordance with the Digital Millennium Copyright Act (DMCA), we will respond promptly to claims of copyright infringement committed using our Service.
          </p>
          <p className="mt-4">
            <strong>SellerMind is not affiliated with, endorsed by, or connected to Etsy, Inc.</strong> Etsy is a trademark of Etsy, Inc.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Designated Copyright Agent</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none text-foreground-secondary">
          <p>
            We have designated a Copyright Agent to receive copyright infringement notices. If you believe that your copyrighted work has been infringed, please contact our Copyright Agent in writing:
          </p>
          <ul className="list-disc pl-5 space-y-2 mt-4">
            <li><strong>Recipient:</strong> Copyright Agent</li>
            <li><strong>Company:</strong> SellerMind / Haimo Tech</li>
            <li><strong>Email:</strong> dmca@thesellermind.com</li>
          </ul>
          <p className="mt-4">
            Only DMCA notices and counter-notices should be sent to the Copyright Agent. All other inquiries will not receive a response.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>How to Submit a DMCA Takedown Notice</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none text-foreground-secondary">
          <p>
            To file a copyright infringement notification, you must provide a written communication that includes substantially the following:
          </p>
          <ol className="list-decimal pl-5 space-y-2 mt-4">
            <li>
              <strong>Physical or Electronic Signature:</strong> A physical or electronic signature of a person authorized to act on behalf of the owner of the copyright interest that is alleged to have been infringed.
            </li>
            <li>
              <strong>Identification of Copyrighted Work:</strong> Identification of the copyrighted work claimed to have been infringed, or, if multiple copyrighted works are covered by a single notification, a representative list of such works.
            </li>
            <li>
              <strong>Identification of Infringing Material:</strong> Identification of the material that is claimed to be infringing or to be the subject of infringing activity and that is to be removed or access to which is to be disabled, and information reasonably sufficient to permit us to locate the material.
            </li>
            <li>
              <strong>Contact Information:</strong> Information reasonably sufficient to permit us to contact the complaining party, such as an address, telephone number, and, if available, an electronic mail address at which the complaining party may be contacted.
            </li>
            <li>
              <strong>Good Faith Belief:</strong> A statement that the complaining party has a good faith belief that use of the material in the manner complained of is not authorized by the copyright owner, its agent, or the law.
            </li>
            <li>
              <strong>Accuracy Statement:</strong> A statement that the information in the notification is accurate, and under penalty of perjury, that the complaining party is authorized to act on behalf of the owner of an exclusive right that is allegedly infringed.
            </li>
          </ol>
          <p className="mt-4">
            Please note that under Section 512(f) of the DMCA, any person who knowingly materially misrepresents that material or activity is infringing may be subject to liability.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Counter-Notification Procedure</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none text-foreground-secondary">
          <p>
            If you believe that your material that was removed or disabled by us was not infringing, you may send a counter-notice containing the following information to our Copyright Agent:
          </p>
          <ol className="list-decimal pl-5 space-y-2 mt-4">
            <li>
              <strong>Your Physical or Electronic Signature:</strong> Your physical or electronic signature.
            </li>
            <li>
              <strong>Identification of Removed Material:</strong> Identification of the material that has been removed or to which access has been disabled and the location at which the material appeared before it was removed or access was disabled.
            </li>
            <li>
              <strong>Good Faith Belief Statement:</strong> A statement under penalty of perjury that you have a good faith belief that the material was removed or disabled as a result of mistake or misidentification of the material to be removed or disabled.
            </li>
            <li>
              <strong>Contact Information:</strong> Your name, address, telephone number, and email address, and a statement that you consent to the jurisdiction of the Federal District Court for the judicial district in which your address is located (or if you are located outside the United States, any judicial district in which we may be found), and that you will accept service of process from the person who provided the original notification or an agent of such person.
            </li>
          </ol>
          <p className="mt-4">
            Upon receipt of a valid counter-notice, we will forward it to the complaining party. If the complaining party does not file a court action within 10 business days, we may restore the removed material or cease disabling access to it.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Repeat Infringer Policy</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none text-foreground-secondary">
          <p>
            SellerMind&apos;s policy is to terminate the accounts of users who are repeat infringers in appropriate circumstances. We will terminate a user&apos;s access to the Service if, under appropriate circumstances, the user is determined to be a repeat infringer.
          </p>
          <p className="mt-4">
            <strong>Three-Strike Policy:</strong> Upon receiving three (3) valid DMCA takedown notices against a user&apos;s account, we will terminate that user&apos;s account and permanently block their access to the Service. We will make a good faith effort to notify the user before terminating their account after the third strike.
          </p>
          <p className="mt-4">
            Repeat infringers are defined as users who have had content they uploaded to our Service removed or disabled due to copyright infringement claims multiple times.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>What Happens After a Valid Notice?</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none text-foreground-secondary">
          <p>
            Upon receiving a valid DMCA takedown notice, we will:
          </p>
          <ul className="list-disc pl-5 space-y-2 mt-4">
            <li>Remove or disable access to the allegedly infringing material promptly</li>
            <li>Notify the affected user about the takedown and their right to submit a counter-notice</li>
            <li>Attempt to contact the complaining party with confirmation of action taken</li>
            <li>Document the notice and takedown for our records</li>
          </ul>
          <p className="mt-4">
            Please note that DMCA takedown notices must be submitted in good faith. Knowingly misrepresenting that material is infringing may result in civil and criminal penalties.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none text-foreground-secondary">
          <p>For copyright infringement matters, please contact us:</p>
          <ul className="list-disc pl-5 space-y-2 mt-4">
            <li><strong>Email:</strong> dmca@thesellermind.com</li>
            <li><strong>Website:</strong> https://thesellermind.com</li>
          </ul>
          <p className="mt-4">
            For all other inquiries, please use our general contact channels.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Fair Use Notice</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none text-foreground-secondary">
          <p>
            SellerMind generates AI-powered content that may reference or be inspired by publicly available information. Such use constitutes a &quot;fair use&quot; of any such copyrighted material as provided for in Title 17 U.S.C. Section 107. AI-generated content is transformative in nature and does not reproduce copyrighted material verbatim.
          </p>
          <p className="mt-4">
            If you wish to use copyrighted material from this service for purposes of your own that go beyond &quot;fair use,&quot; you must obtain permission from the copyright owner.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Disclaimer</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none text-foreground-secondary">
          <p>
            This DMCA policy is provided for informational purposes only. SellerMind is not a law firm and does not provide legal advice. The information provided on this page should not be construed as legal advice. If you have questions about the DMCA or copyright law, please consult a qualified attorney.
          </p>
          <p className="mt-4">
            SellerMind reserves the right to modify this DMCA policy at any time. Any changes will be effective upon posting on this page.
          </p>
        </CardContent>
      </Card>

      <div className="flex justify-center gap-6">
        <Link
          href="/privacy"
          className="text-primary hover:text-primary-hover font-medium"
        >
          Privacy Policy
        </Link>
        <Link
          href="/terms"
          className="text-primary hover:text-primary-hover font-medium"
        >
          Terms of Service
        </Link>
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
