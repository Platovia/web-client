import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CheckCircle, Clock } from "lucide-react"
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

      <Footer />
    </div>
  )
}
