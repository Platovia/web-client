import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Camera,
  FileText,
  Globe,
  ShieldCheck,
  Brain,
  Zap,
  Smartphone,
  BarChart3,
  Users,
} from "lucide-react"
import Navbar from "@/components/landing/navbar"
import Footer from "@/components/landing/footer"

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 max-w-7xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            The Engine Behind{" "}
            <em className="not-italic bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent italic">
              Intelligent Menus
            </em>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From OCR-powered menu digitization to context-aware AI
            conversations, discover the technology that makes MenuAI the
            smartest restaurant assistant on the web.
          </p>
        </div>
      </section>

      {/* Section 1 — From Paper to Pixel-Perfect Data */}
      <section className="py-16 md:py-20 bg-muted/50">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-8">
                From Paper to Pixel-Perfect Data
              </h2>

              <div className="space-y-8">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Camera className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Menu & PDF OCR</h3>
                    <p className="text-sm text-muted-foreground">
                      Snap a photo of a paper menu or upload a PDF. Our
                      OCR engine extracts every dish name, description,
                      price, and category — even from handwritten specials
                      and complex multi-column layouts.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <ShieldCheck className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Confidence Scoring</h3>
                    <p className="text-sm text-muted-foreground">
                      Every extracted item gets an AI confidence score. Low
                      confidence items are flagged for your review so you
                      can ensure 100% accuracy before going live.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                    <Brain className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">
                      Contextual Awareness
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Upload your About Us page, chef&apos;s bio, or allergen
                      policy as context sources. The AI weaves this
                      information into conversations for richer, more
                      personalized responses.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Mockup placeholder */}
            <div className="bg-white border rounded-xl p-6 shadow-sm">
              <div className="bg-muted rounded-lg h-80 flex items-center justify-center">
                <div className="text-center">
                  <FileText className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">
                    OCR extraction demo
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2 — One Line of Code */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              One Line of Code. Infinite Possibilities.
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Embed an AI-powered menu assistant on any website. No
              frameworks, no dependencies — just paste and go.
            </p>
          </div>

          {/* Code snippet */}
          <div className="max-w-3xl mx-auto mb-12">
            <div className="bg-slate-900 rounded-lg p-6 overflow-x-auto">
              <pre className="text-green-400 text-sm font-mono">
                <code>{`<!-- MenuAI Widget -->
<script
  src="https://widget.menuai.com/loader.js"
  data-restaurant-id="YOUR_RESTAURANT_ID"
  async>
</script>`}</code>
              </pre>
            </div>
          </div>

          {/* Feature highlights */}
          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <div className="text-center border rounded-xl p-6">
              <div className="inline-flex items-center justify-center h-10 w-10 rounded-lg bg-blue-100 mb-3">
                <Zap className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-1">Zero Latency</h3>
              <p className="text-sm text-muted-foreground">
                Async loading means zero impact on your page speed. The
                widget loads after your site, never slowing it down.
              </p>
            </div>
            <div className="text-center border rounded-xl p-6">
              <div className="inline-flex items-center justify-center h-10 w-10 rounded-lg bg-purple-100 mb-3">
                <Smartphone className="h-5 w-5 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-1">Responsive</h3>
              <p className="text-sm text-muted-foreground">
                Looks perfect on every screen — from desktop browsers to
                mobile phones. Automatically adapts to your site&apos;s layout.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3 — More Than Keywords */}
      <section className="py-16 md:py-20 bg-muted/50">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 mb-4">
                <span className="text-xs font-medium bg-primary/10 text-primary px-2.5 py-1 rounded-full">
                  AI-Powered
                </span>
              </div>
              <h2 className="text-3xl font-bold mb-4">
                More Than Keywords. True Understanding.
              </h2>
              <p className="text-muted-foreground mb-6">
                MenuAI doesn&apos;t just match keywords — it understands intent,
                dietary needs, and preferences to deliver answers that feel
                like talking to a knowledgeable server.
              </p>
              <ul className="space-y-3">
                {[
                  "Understands dietary restrictions and allergens",
                  "Recommends dishes based on preferences",
                  "Answers questions about ingredients and preparation",
                  "Handles follow-up questions with full context",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <Globe className="h-4 w-4 text-primary flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Chat mockup */}
            <div className="bg-white border rounded-xl p-6 shadow-sm">
              <div className="space-y-4">
                {/* Customer message */}
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg p-4 max-w-[80%]">
                    <p className="text-sm">
                      Hi! I&apos;m allergic to nuts. What pasta dishes are safe
                      for me?
                    </p>
                  </div>
                </div>

                {/* AI response */}
                <div className="flex justify-end">
                  <div className="bg-primary/10 rounded-lg p-4 max-w-[80%]">
                    <p className="text-sm">
                      Great question! Here are our nut-free pasta options:
                      <br /><br />
                      <strong>Spaghetti Marinara</strong> — classic tomato
                      sauce, completely nut-free.
                      <br />
                      <strong>Penne Arrabbiata</strong> — spicy tomato with
                      chili flakes, no nuts.
                      <br />
                      <strong>Linguine alle Vongole</strong> — clam sauce
                      with white wine.
                      <br /><br />
                      I&apos;d recommend avoiding our Pesto Genovese as it
                      contains pine nuts. Want more details on any of these?
                    </p>
                  </div>
                </div>

                {/* Customer follow-up */}
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg p-4 max-w-[80%]">
                    <p className="text-sm">
                      The Marinara sounds great! Is it made fresh daily?
                    </p>
                  </div>
                </div>

                {/* AI response */}
                <div className="flex justify-end">
                  <div className="bg-primary/10 rounded-lg p-4 max-w-[80%]">
                    <p className="text-sm">
                      Yes! Our chef prepares the Marinara sauce fresh every
                      morning using San Marzano tomatoes, fresh basil, and
                      extra virgin olive oil. It&apos;s one of our most popular
                      dishes!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4 — The Future of MenuAI */}
      <section className="py-16 md:py-20 bg-navy text-navy-foreground">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">The Future of MenuAI</h2>
            <p className="opacity-80 max-w-2xl mx-auto">
              We&apos;re building the most complete restaurant AI platform.
              Here&apos;s what&apos;s coming next.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <div className="bg-white/10 border border-white/20 rounded-xl p-6">
              <div className="h-12 w-12 rounded-lg bg-blue-500/20 flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="font-semibold text-lg mb-2">
                Deep Insights Dashboard
              </h3>
              <p className="text-sm opacity-70">
                Understand what customers ask, track popular dishes, monitor
                peak chat hours, and uncover trends to optimize your menu and
                operations.
              </p>
            </div>

            <div className="bg-white/10 border border-white/20 rounded-xl p-6">
              <div className="h-12 w-12 rounded-lg bg-purple-500/20 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-purple-400" />
              </div>
              <h3 className="font-semibold text-lg mb-2">
                Multi-Role Teams
              </h3>
              <p className="text-sm opacity-70">
                Invite managers, chefs, and marketing staff with role-based
                access. Collaborate on menus, review analytics, and manage
                multiple locations together.
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10" asChild>
              <Link href="/auth/register">Get Early Access →</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
