import type { Metadata } from "next"
import Link from "next/link"
import Navbar from "@/components/landing/navbar"
import Footer from "@/components/landing/footer"

export const metadata: Metadata = {
  title: "Terms of Service - Platovia",
  description: "Terms of Service for using the Platovia platform.",
}

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className="bg-white min-h-screen">
        <div className="container mx-auto px-4 max-w-4xl py-16">
          <h1 className="text-4xl font-bold mb-2">Terms of Service</h1>
          <p className="text-muted-foreground mb-8">Last updated: February 22, 2026</p>

          <div className="prose prose-slate max-w-none">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing or using the Platovia platform (&quot;Service&quot;), you agree to be bound by these Terms of
              Service (&quot;Terms&quot;). If you do not agree to these Terms, you may not use the Service.
            </p>

            <h2>2. Eligibility</h2>
            <p>
              You must be at least 16 years of age to use this Service. By using the Service, you represent and warrant
              that you meet this age requirement and have the legal capacity to enter into these Terms.
            </p>

            <h2>3. Account Registration</h2>
            <p>
              To access certain features of the Service, you must register for an account. You agree to provide accurate,
              current, and complete information during registration and to keep your account information updated. You are
              responsible for maintaining the confidentiality of your account credentials and for all activity under your account.
            </p>

            <h2>4. Service Description</h2>
            <p>
              Platovia is a software-as-a-service (SaaS) platform that provides restaurants with:
            </p>
            <ul>
              <li>AI-powered menu digitization from images, PDFs, or URLs</li>
              <li>QR code generation for restaurant menus</li>
              <li>AI chatbot for customer inquiries about menus, allergens, and dietary information</li>
              <li>Analytics and reporting tools</li>
            </ul>

            <h2>5. Subscription Plans &amp; Payment</h2>
            <p>
              Platovia offers free and paid subscription plans. All payments are processed through Paddle.com Market
              Limited (&quot;Paddle&quot;), which acts as our Merchant of Record. Paddle handles all billing, invoicing, sales
              tax, and payment processing. By subscribing to a paid plan, you also agree to{" "}
              <a href="https://www.paddle.com/legal/terms" target="_blank" rel="noopener noreferrer">Paddle&apos;s Terms of Service</a>.
            </p>

            <h2>6. Auto-Renewal</h2>
            <p>
              Paid subscriptions automatically renew at the end of each billing period (monthly or annually) unless you
              cancel before the renewal date. You will be charged the then-current rate for your plan at each renewal.
            </p>

            <h2>7. Cancellation &amp; Refunds</h2>
            <p>
              You may cancel your subscription at any time from your Dashboard under Settings &gt; Billing. We offer a
              14-day money-back guarantee on paid plans. For full details, please see our{" "}
              <Link href="/refund-policy" className="text-primary hover:underline">Refund &amp; Cancellation Policy</Link>.
            </p>

            <h2>8. User Content &amp; Intellectual Property</h2>
            <p>
              You retain ownership of all content you upload to the Service, including menu data, images, and restaurant
              information (&quot;User Content&quot;). By uploading User Content, you grant Platovia a limited, non-exclusive
              license to process, store, and display your content solely to provide the Service.
            </p>

            <h2>9. AI-Generated Content Disclaimer</h2>
            <p>
              Platovia uses artificial intelligence to process menus (via OCR) and generate chatbot responses. While we
              strive for accuracy, AI-generated content may contain errors, inaccuracies, or omissions. You are responsible
              for reviewing and verifying the accuracy of digitized menu data. Chatbot responses are generated
              automatically and should not be relied upon as the sole source of allergen or dietary information.
            </p>

            <h2>10. Acceptable Use</h2>
            <p>You agree not to:</p>
            <ul>
              <li>Use the Service for any unlawful purpose</li>
              <li>Upload content that infringes on intellectual property rights of others</li>
              <li>Attempt to gain unauthorized access to the Service or its related systems</li>
              <li>Interfere with or disrupt the Service or servers</li>
              <li>Use the Service to transmit malicious code or spam</li>
              <li>Reverse-engineer, decompile, or disassemble any part of the Service</li>
            </ul>

            <h2>11. Data Handling</h2>
            <p>
              Your use of the Service is also governed by our{" "}
              <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>, which describes how
              we collect, use, and protect your personal information.
            </p>

            <h2>12. Intellectual Property</h2>
            <p>
              The Service, including its design, features, code, and branding, is owned by Platovia Inc. and is protected
              by intellectual property laws. You may not copy, modify, distribute, or create derivative works based on the
              Service without our prior written consent.
            </p>

            <h2>13. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, Platovia Inc. shall not be liable for any indirect, incidental,
              special, consequential, or punitive damages, including but not limited to loss of profits, data, or business
              opportunities, arising from your use of the Service. Our total liability shall not exceed the amount you
              paid to us in the twelve (12) months preceding the claim.
            </p>

            <h2>14. Disclaimer of Warranties</h2>
            <p>
              The Service is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind, whether express or
              implied, including but not limited to implied warranties of merchantability, fitness for a particular
              purpose, and non-infringement.
            </p>

            <h2>15. Dispute Resolution</h2>
            <p>
              Any disputes arising from these Terms or your use of the Service shall be resolved through good-faith
              negotiation. If a resolution cannot be reached, disputes shall be submitted to binding arbitration in
              accordance with the rules of the applicable arbitration body in the jurisdiction of Platovia Inc.
            </p>

            <h2>16. Modifications</h2>
            <p>
              We reserve the right to modify these Terms at any time. We will notify you of material changes by posting
              the updated Terms on this page and updating the &quot;Last updated&quot; date. Your continued use of the Service
              after changes constitutes acceptance of the revised Terms.
            </p>

            <h2>17. Contact</h2>
            <p>
              If you have questions about these Terms, please contact us at:
            </p>
            <ul>
              <li>Email: <a href="mailto:contact@platovia.com">contact@platovia.com</a></li>
              <li>Address: Platovia Inc., [Your Address]</li>
            </ul>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
