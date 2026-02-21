import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CheckCircle, Clock, Upload, Code2, Rocket, BarChart3, Store } from "lucide-react"
import Navbar from "@/components/landing/navbar"
import Footer from "@/components/landing/footer"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center max-w-4xl mx-auto">
            <p className="text-sm font-medium text-primary mb-4">
              → Now accepting beta testers
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Your Menu. Your Website.{" "}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Our AI.
              </span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Turn any menu into an intelligent chatbot your customers can talk
              to — right on your website. Upload a photo, PDF, or URL and go
              live in minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button size="lg" asChild>
                <Link href="/auth/register">Start Free →</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/#how-it-works">See How It Works</Link>
              </Button>
            </div>
            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-green-600" />
                No credit card required
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-blue-600" />
                Setup in 10 minutes
              </span>
            </div>
          </div>

          {/* Product mockup placeholder */}
          <div className="mt-16 max-w-5xl mx-auto">
            <div className="bg-muted border rounded-xl h-[400px] flex items-center justify-center">
              <p className="text-muted-foreground text-sm">
                Product screenshot coming soon
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Client Logos Section */}
      <section className="py-12 border-t border-b">
        <div className="container mx-auto px-4 max-w-7xl text-center">
          <p className="text-xs tracking-widest text-muted-foreground uppercase mb-8">
            Empowering modern hospitality businesses
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
            {["The Local", "BURGER.CO", "La Piazza", "COFFEE_LAB", "FRESH&GREEN"].map(
              (name) => (
                <span
                  key={name}
                  className="text-lg font-semibold text-muted-foreground/50"
                >
                  {name}
                </span>
              )
            )}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 md:py-20">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Go live in minutes, not months</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              No coding skills required. Upload your menu, copy one line of code, and your AI assistant is live.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Upload,
                title: "Upload Menu",
                description:
                  "Upload a photo, PDF, or paste a URL. Our OCR engine extracts every item, price, and description automatically.",
              },
              {
                icon: Code2,
                title: "Copy Code",
                description:
                  "Get a single line of embed code. Paste it into your website — works with any platform or page builder.",
              },
              {
                icon: Rocket,
                title: "Go Live",
                description:
                  "Your AI-powered menu chat is live instantly. Customers can ask about dishes, allergens, and specials in real time.",
              },
            ].map((step) => (
              <div key={step.title} className="text-center">
                <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-muted mb-4">
                  <step.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-20 bg-muted/50">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Everything you need for smarter service</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              From menu digitization to intelligent conversations, MenuAI gives you the tools to delight every guest.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: "Upload from Any Source",
                description:
                  "Snap a photo of a paper menu, upload a PDF, or paste a URL. Our OCR handles it all — even handwritten specials.",
              },
              {
                title: "Embed in Minutes",
                description:
                  "One line of code is all it takes. Works with WordPress, Squarespace, Wix, or any custom site. No developer needed.",
              },
              {
                title: "Intelligent Conversations",
                description:
                  "Your AI doesn't just search keywords — it understands context, dietary needs, and can recommend dishes like a trained server.",
              },
            ].map((feature) => (
              <div key={feature.title} className="bg-white rounded-xl border p-6">
                <div className="bg-muted rounded-lg h-48 mb-4 flex items-center justify-center">
                  <span className="text-muted-foreground text-sm">Illustration</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roadmap Section */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">What&apos;s Next?</h2>
            <Link
              href="/features"
              className="text-sm font-medium text-primary hover:underline"
            >
              View full Roadmap →
            </Link>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="border rounded-xl p-6 flex gap-4">
              <div className="flex-shrink-0 h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Conversation Analytics</h3>
                <p className="text-sm text-muted-foreground">
                  Understand what your customers are asking. Track popular dishes, common
                  questions, and peak chat times to make better decisions.
                </p>
              </div>
            </div>
            <div className="border rounded-xl p-6 flex gap-4">
              <div className="flex-shrink-0 h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center">
                <Store className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Multi-Restaurant Management</h3>
                <p className="text-sm text-muted-foreground">
                  Manage multiple locations from one dashboard. Shared menus, unified
                  analytics, and per-location customization — all in one place.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
