import type { Metadata } from "next"
import Link from "next/link"
import Navbar from "@/components/landing/navbar"
import Footer from "@/components/landing/footer"

export const metadata: Metadata = {
  title: "Privacy Policy - Platovia",
  description: "Privacy Policy for the Platovia platform. Learn how we collect, use, and protect your data.",
}

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="bg-white min-h-screen">
        <div className="container mx-auto px-4 max-w-4xl py-16">
          <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
          <p className="text-muted-foreground mb-8">Last updated: February 22, 2026</p>

          <div className="prose prose-slate max-w-none">
            <h2>1. Data Controller</h2>
            <p>
              Platovia Inc. (&quot;Platovia,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) is the data controller responsible for your
              personal information collected through the Platovia platform. For questions about this policy, contact us
              at <a href="mailto:contact@platovia.com">contact@platovia.com</a>.
            </p>

            <h2>2. Data We Collect</h2>

            <h3>Account Data</h3>
            <p>
              When you register, we collect your first name, last name, email address, and a hashed version of your
              password (using bcrypt). We also store your company name.
            </p>

            <h3>Restaurant &amp; Menu Data</h3>
            <p>
              Restaurant profiles, menu items, categories, prices, allergen information, dietary tags, and images you
              upload to the platform.
            </p>

            <h3>Chat Data</h3>
            <p>
              Messages exchanged between your customers and the AI chatbot, including questions about menu items,
              allergens, and dietary preferences. Chat sessions are associated with QR tokens, not individual end-user
              identities.
            </p>

            <h3>Analytics Data</h3>
            <p>
              We collect anonymized analytics including page views, QR code scans, and chat session metrics. IP
              addresses are anonymized using SHA-256 hashing before storage and are never stored in plain text.
            </p>

            <h3>Payment Data</h3>
            <p>
              Payment information is handled entirely by our payment processor, Paddle.com Market Limited. We do not
              store credit card numbers or bank account details. We receive subscription status, plan details, and
              transaction references from Paddle.
            </p>

            <h2>3. How We Use Your Data</h2>
            <ul>
              <li>To provide, maintain, and improve the Service</li>
              <li>To process your menu data and generate AI chatbot responses</li>
              <li>To send transactional emails (welcome, password reset, billing notifications)</li>
              <li>To generate anonymized analytics for your restaurant dashboard</li>
              <li>To respond to support requests</li>
              <li>To comply with legal obligations</li>
            </ul>

            <h2>4. Third-Party Services</h2>
            <p>We use the following third-party services to operate Platovia:</p>
            <ul>
              <li>
                <strong>Paddle</strong> — Payment processing and subscription management (Merchant of Record).
                See <a href="https://www.paddle.com/legal/privacy" target="_blank" rel="noopener noreferrer">Paddle&apos;s Privacy Policy</a>.
              </li>
              <li>
                <strong>Resend</strong> — Transactional email delivery. Email addresses are shared with Resend solely
                for sending account-related emails.
              </li>
              <li>
                <strong>OpenAI / Google AI</strong> — AI model providers used to process menu data and generate chatbot
                responses. Menu content and chat messages are sent to these providers for processing.
              </li>
              <li>
                <strong>Cloudflare R2</strong> — Object storage for uploaded images and files.
              </li>
            </ul>

            <h2>5. Cookies &amp; Tracking</h2>
            <p>
              Platovia uses the following types of cookies:
            </p>
            <ul>
              <li>
                <strong>Essential cookies:</strong> Required for authentication and core functionality (session tokens,
                CSRF protection).
              </li>
              <li>
                <strong>Functional cookies:</strong> Store your preferences such as cookie consent choice.
              </li>
            </ul>
            <p>
              We do not use third-party advertising or tracking cookies. The Paddle payment script is loaded for
              payment processing functionality only.
            </p>

            <h2>6. Your Rights Under GDPR</h2>
            <p>If you are located in the European Economic Area (EEA), you have the right to:</p>
            <ul>
              <li><strong>Access</strong> — Request a copy of your personal data</li>
              <li><strong>Rectification</strong> — Request correction of inaccurate data</li>
              <li><strong>Erasure</strong> — Request deletion of your personal data (&quot;right to be forgotten&quot;)</li>
              <li><strong>Restriction</strong> — Request restriction of processing</li>
              <li><strong>Data portability</strong> — Request your data in a machine-readable format</li>
              <li><strong>Object</strong> — Object to processing based on legitimate interests</li>
            </ul>
            <p>
              To exercise these rights, email <a href="mailto:contact@platovia.com">contact@platovia.com</a>. We will
              respond within 30 days.
            </p>

            <h2>7. Your Rights Under CCPA</h2>
            <p>If you are a California resident, you have the right to:</p>
            <ul>
              <li>Know what personal information we collect and how it is used</li>
              <li>Request deletion of your personal information</li>
              <li>Opt-out of the sale of personal information (we do not sell personal data)</li>
              <li>Non-discrimination for exercising your privacy rights</li>
            </ul>

            <h2>8. Data Retention</h2>
            <p>
              We retain your account data for as long as your account is active. Upon account deletion, we remove your
              personal data within 30 days, except where retention is required by law. Anonymized analytics data may
              be retained indefinitely as it cannot be linked to individuals.
            </p>

            <h2>9. Children&apos;s Privacy</h2>
            <p>
              The Service is not intended for individuals under 16 years of age. We do not knowingly collect personal
              information from children under 16. If we learn that we have collected data from a child under 16, we
              will take steps to delete it promptly.
            </p>

            <h2>10. International Transfers</h2>
            <p>
              Your data may be processed in countries outside your country of residence, including the United States.
              We ensure appropriate safeguards are in place for international data transfers in compliance with
              applicable data protection laws.
            </p>

            <h2>11. Security Measures</h2>
            <p>We implement industry-standard security measures to protect your data:</p>
            <ul>
              <li>Passwords are hashed using bcrypt (never stored in plaintext)</li>
              <li>IP addresses are anonymized via SHA-256 hashing</li>
              <li>All data is transmitted over HTTPS/TLS encryption</li>
              <li>Access controls and authentication for all API endpoints</li>
            </ul>

            <h2>12. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of material changes by updating
              the &quot;Last updated&quot; date and, where appropriate, notifying you via email. Your continued use of the
              Service after changes constitutes acceptance of the updated policy.
            </p>

            <h2>13. Contact</h2>
            <p>
              For questions or concerns about this Privacy Policy or our data practices, please contact us:
            </p>
            <ul>
              <li>Email: <a href="mailto:contact@platovia.com">contact@platovia.com</a></li>
              <li>Address: Platovia Inc., [Your Address]</li>
            </ul>
            <p>
              See also our <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link> and{" "}
              <Link href="/refund-policy" className="text-primary hover:underline">Refund Policy</Link>.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
