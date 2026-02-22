import type { Metadata } from "next"
import Link from "next/link"
import Navbar from "@/components/landing/navbar"
import Footer from "@/components/landing/footer"

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy - Platovia",
  description: "Refund and cancellation policy for Platovia subscriptions.",
}

export default function RefundPolicyPage() {
  return (
    <>
      <Navbar />
      <main className="bg-white min-h-screen">
        <div className="container mx-auto px-4 max-w-4xl py-16">
          <h1 className="text-4xl font-bold mb-2">Refund &amp; Cancellation Policy</h1>
          <p className="text-muted-foreground mb-8">Last updated: February 22, 2026</p>

          <div className="prose prose-slate max-w-none">
            <h2>14-Day Money-Back Guarantee</h2>
            <p>
              We want you to be completely satisfied with Platovia. If you are not happy with your paid subscription,
              you may request a full refund within 14 days of your initial purchase — no questions asked.
            </p>

            <h2>How to Request a Refund</h2>
            <p>
              To request a refund within the 14-day guarantee period, email us at{" "}
              <a href="mailto:contact@platovia.com">contact@platovia.com</a> with your account email address and the
              reason for your request (optional). We will process your refund within 5-10 business days.
            </p>

            <h2>Cancellation Process</h2>
            <p>
              You can cancel your subscription at any time by following these steps:
            </p>
            <ol>
              <li>Log in to your Platovia dashboard</li>
              <li>Navigate to <strong>Settings &gt; Billing</strong></li>
              <li>Click <strong>Cancel Subscription</strong></li>
              <li>Confirm your cancellation</li>
            </ol>

            <h2>What Happens After Cancellation</h2>
            <p>
              When you cancel your subscription:
            </p>
            <ul>
              <li>
                You will continue to have access to your paid plan features until the end of your current billing
                period.
              </li>
              <li>
                After your billing period ends, your account will automatically revert to the Free plan.
              </li>
              <li>
                Your data (menus, QR codes, analytics) will be preserved on the Free plan, subject to Free plan
                limitations.
              </li>
              <li>
                You will not be charged again unless you re-subscribe.
              </li>
            </ul>

            <h2>After the 14-Day Period</h2>
            <p>
              After the initial 14-day money-back guarantee period, we do not offer refunds for the remaining time
              on your current billing cycle. However, you can still cancel your subscription at any time to prevent
              future charges. Your access will continue until the end of the current billing period.
            </p>

            <h2>Payment Processing</h2>
            <p>
              All payments and refunds are processed through Paddle.com Market Limited, which acts as our Merchant
              of Record. Refunds are issued to the original payment method used during purchase. Processing times
              may vary depending on your payment provider.
            </p>

            <h2>Free Plan</h2>
            <p>
              The Platovia Free plan does not require any payment information and incurs no charges. You can use
              the Free plan indefinitely with no obligation to upgrade.
            </p>

            <h2>Contact</h2>
            <p>
              If you have questions about refunds or cancellations, please contact us:
            </p>
            <ul>
              <li>Email: <a href="mailto:contact@platovia.com">contact@platovia.com</a></li>
              <li>Address: Platovia Inc., [Your Address]</li>
            </ul>
            <p>
              See also our <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link> and{" "}
              <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
