import type { Metadata } from "next"
import Link from "next/link"
import Navbar from "@/components/landing/navbar"
import Footer from "@/components/landing/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ScanLine, MessageSquare, BarChart3 } from "lucide-react"

export const metadata: Metadata = {
  title: "About Platovia - AI-Powered Restaurant Menus",
  description: "Learn about Platovia's mission to help restaurants digitize menus and serve customers with AI.",
}

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="bg-white min-h-screen">
        {/* Hero */}
        <section className="bg-slate-50 py-20">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Making restaurant menus smarter
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Platovia helps restaurants digitize their menus and serve customers better with AI-powered chat
              — answering questions about dishes, allergens, and dietary needs around the clock.
            </p>
          </div>
        </section>

        {/* What Platovia Does */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-3xl font-bold text-center mb-12">What Platovia Does</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <ScanLine className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Menu Digitization</h3>
                  <p className="text-muted-foreground text-sm">
                    Upload a photo, PDF, or URL of your menu and our AI will digitize it into a structured,
                    searchable format — complete with categories, prices, and dietary tags.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">AI Chat Assistant</h3>
                  <p className="text-muted-foreground text-sm">
                    Your customers can ask questions about your menu in natural language — from allergen info to
                    meal recommendations — and get instant, accurate answers.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <BarChart3 className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Analytics &amp; Insights</h3>
                  <p className="text-muted-foreground text-sm">
                    Track QR code scans, popular menu items, and customer questions to understand what your
                    diners care about most.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* How It Helps */}
        <section className="bg-slate-50 py-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-3xl font-bold text-center mb-6">How It Helps Restaurants</h2>
            <div className="max-w-2xl mx-auto space-y-4 text-muted-foreground">
              <p>
                Running a restaurant is demanding. Between managing staff, sourcing ingredients, and keeping
                customers happy, updating your menu and answering repetitive questions shouldn&apos;t eat up your time.
              </p>
              <p>
                Platovia automates the parts that don&apos;t need a human touch — digitizing your menu in minutes,
                generating QR codes for instant access, and letting AI handle common customer questions 24/7.
              </p>
              <p>
                Whether a customer wants to know if the pasta is gluten-free, what&apos;s in the house dressing, or
                which dishes are vegan-friendly, your AI assistant has the answer — accurately and instantly.
              </p>
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <h2 className="text-3xl font-bold mb-4">Our Team</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
              Platovia is built by a small team passionate about hospitality and technology. We believe
              every restaurant — from neighborhood cafes to fine dining — deserves tools that were once
              only available to large chains.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-slate-50 py-16">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Create your free account and have your menu digitized in minutes.
            </p>
            <Link href="/auth/register">
              <Button size="lg">Create Free Account</Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
