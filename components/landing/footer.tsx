import Link from "next/link";
import { QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const productLinks = [
  { label: "Features", href: "/features" },
  { label: "Pricing", href: "/pricing" },
  { label: "FAQ", href: "/pricing#faq" },
];

const legalLinks = [
  { label: "Terms of Service", href: "/terms" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Refund Policy", href: "/refund-policy" },
];

const companyLinks = [
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export default function Footer() {
  return (
    <>
      {/* CTA Section */}
      <section className="bg-navy text-navy-foreground py-16 md:py-20">
        <div className="container mx-auto px-4 max-w-7xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to serve answers 24/7?
          </h2>
          <p className="text-lg opacity-80 mb-8 max-w-2xl mx-auto">
            Join forward-thinking restaurants using AI to delight customers
            before they even walk through the door.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto mb-4">
            <Input
              type="email"
              placeholder="Enter your work email"
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
            />
            <Button className="w-full sm:w-auto whitespace-nowrap">
              Get Access
            </Button>
          </div>
          <p className="text-sm opacity-60">
            Limited spots available for MVP launch.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t">
        <div className="container mx-auto px-4 max-w-7xl py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Brand column */}
            <div>
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                  <QrCode className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold">Platovia</span>
              </Link>
              <p className="text-sm text-muted-foreground">
                AI-powered restaurant website chat for modern hospitality.
              </p>
            </div>

            {/* Product column */}
            <div>
              <h3 className="font-semibold mb-3">Product</h3>
              <div className="flex flex-col gap-2">
                {productLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Company column */}
            <div>
              <h3 className="font-semibold mb-3">Company</h3>
              <div className="flex flex-col gap-2">
                {companyLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Legal column */}
            <div>
              <h3 className="font-semibold mb-3">Legal</h3>
              <div className="flex flex-col gap-2">
                {legalLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center gap-2">
            <p className="text-sm text-muted-foreground">
              &copy; 2026 Platovia Inc. All rights reserved.
            </p>
            <a
              href="mailto:contact@platovia.com"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              contact@platovia.com
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}
