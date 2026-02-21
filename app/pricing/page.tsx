"use client";

import { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Navbar from "@/components/landing/navbar";
import Footer from "@/components/landing/footer";
import {
  PRICING_TIERS,
  COMPARISON_FEATURES,
  PRICING_FAQ,
} from "@/lib/pricing-data";

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annual">(
    "monthly"
  );

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="py-16 md:py-24 text-center">
        <div className="container mx-auto px-4 max-w-7xl">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            Simple, Transparent Pricing
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Start free. Add AI-powered chat to your restaurant&apos;s website in
            minutes. Upgrade as you grow.
          </p>

          {/* Billing Toggle */}
          <div className="mt-8 inline-flex items-center rounded-lg bg-muted p-1">
            <button
              onClick={() => setBillingPeriod("monthly")}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                billingPeriod === "monthly"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod("annual")}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                billingPeriod === "annual"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Annual
            </button>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-16 md:pb-24">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {PRICING_TIERS.map((tier) => (
              <Card
                key={tier.name}
                className={`relative flex flex-col ${
                  tier.highlighted
                    ? "border-2 border-primary shadow-lg scale-105"
                    : ""
                }`}
              >
                {tier.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                      {tier.badge}
                    </span>
                  </div>
                )}
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-foreground">
                    {tier.name}
                  </CardTitle>
                  <div className="mt-2">
                    <span className="text-4xl font-bold text-foreground">
                      ${tier.price}
                    </span>
                    <span className="text-muted-foreground">/mo</span>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col flex-1">
                  <ul className="space-y-3 flex-1">
                    {tier.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-2 text-sm"
                      >
                        <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6">
                    <Button
                      asChild
                      variant={tier.highlighted ? "default" : "outline"}
                      className="w-full"
                    >
                      <Link href={tier.ctaLink}>{tier.ctaText}</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-16 md:py-20 bg-muted/50">
        <div className="container mx-auto px-4 max-w-7xl">
          <h2 className="text-3xl font-bold text-center text-foreground">
            Detailed Comparison
          </h2>
          <p className="mt-2 text-center text-muted-foreground mb-10">
            See exactly what&apos;s included in each plan.
          </p>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Feature</TableHead>
                  <TableHead className="text-center">Free</TableHead>
                  <TableHead className="text-center">Starter</TableHead>
                  <TableHead className="text-center text-primary font-semibold">
                    Growth
                  </TableHead>
                  <TableHead className="text-center">Enterprise</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {COMPARISON_FEATURES.map((row) => (
                  <TableRow key={row.feature}>
                    <TableCell className="font-medium">
                      {row.feature}
                    </TableCell>
                    <TableCell className="text-center">{row.free}</TableCell>
                    <TableCell className="text-center">
                      {row.starter}
                    </TableCell>
                    <TableCell className="text-center text-primary font-medium">
                      {row.growth}
                    </TableCell>
                    <TableCell className="text-center">
                      {row.enterprise}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl font-bold text-center text-foreground">
            Frequently Asked Questions
          </h2>
          <p className="mt-2 text-center text-muted-foreground mb-10">
            Everything you need to know about our pricing.
          </p>

          <Accordion type="single" collapsible className="w-full">
            {PRICING_FAQ.map((faq, index) => (
              <AccordionItem key={index} value={`faq-${index}`}>
                <AccordionTrigger className="text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 md:py-20 bg-muted/50">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h2 className="text-3xl font-bold text-foreground">
            Ready to let AI handle menu questions?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Join hundreds of restaurants already using MenuAI to delight their
            guests.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/auth/register">Get Started Free</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/features">Learn more →</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
