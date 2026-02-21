export interface PricingTier {
  name: string;
  price: number;
  conversations: number | string;
  restaurants: number | string;
  menusPerRestaurant: number | string;
  highlighted: boolean;
  badge?: string;
  ctaText: string;
  ctaLink: string;
  features: string[];
}

export interface ComparisonFeature {
  feature: string;
  free: string;
  starter: string;
  growth: string;
  enterprise: string;
}

export interface PricingFAQ {
  question: string;
  answer: string;
}

export const PRICING_TIERS: PricingTier[] = [
  {
    name: "Free",
    price: 0,
    conversations: 100,
    restaurants: 1,
    menusPerRestaurant: 1,
    highlighted: false,
    ctaText: "Start Free",
    ctaLink: "/auth/register",
    features: [
      "AI Menu Digitization",
      "QR Code Generation",
      "Basic AI Chat",
      "Basic Analytics",
    ],
  },
  {
    name: "Starter",
    price: 29,
    conversations: 500,
    restaurants: 1,
    menusPerRestaurant: 3,
    highlighted: false,
    ctaText: "Get Started",
    ctaLink: "/auth/register",
    features: [
      "Everything in Free",
      "Full Analytics",
      "Visual Menu Designer",
      "Email Support",
      "3 Team Members",
    ],
  },
  {
    name: "Growth",
    price: 79,
    conversations: 2000,
    restaurants: 3,
    menusPerRestaurant: 5,
    highlighted: true,
    badge: "MOST POPULAR",
    ctaText: "Get Started",
    ctaLink: "/auth/register",
    features: [
      "Everything in Starter",
      "Multi-Restaurant",
      "Advanced Chat Analytics",
      "Email + Chat Support",
      "10 Team Members",
      "Priority Email + Chat",
    ],
  },
  {
    name: "Enterprise",
    price: 199,
    conversations: 10000,
    restaurants: "Unlimited",
    menusPerRestaurant: "Unlimited",
    highlighted: false,
    ctaText: "Contact Sales",
    ctaLink: "/auth/register",
    features: [
      "Everything in Growth",
      "API Access",
      "Dedicated Account Manager",
      "Custom Integrations",
      "Unlimited Team Members",
    ],
  },
];

export const COMPARISON_FEATURES: ComparisonFeature[] = [
  {
    feature: "Conversations / mo",
    free: "100",
    starter: "500",
    growth: "2,000",
    enterprise: "10,000+",
  },
  {
    feature: "Restaurants",
    free: "1",
    starter: "1",
    growth: "3",
    enterprise: "Unlimited",
  },
  {
    feature: "Menus per Restaurant",
    free: "1",
    starter: "3",
    growth: "5",
    enterprise: "Unlimited",
  },
  {
    feature: "AI Menu Digitization",
    free: "✓",
    starter: "✓",
    growth: "✓",
    enterprise: "✓",
  },
  {
    feature: "QR Code Generation",
    free: "✓",
    starter: "✓",
    growth: "✓",
    enterprise: "✓",
  },
  {
    feature: "Analytics",
    free: "Basic",
    starter: "Full",
    growth: "Advanced",
    enterprise: "Advanced",
  },
  {
    feature: "Visual Menu Designer",
    free: "—",
    starter: "✓",
    growth: "✓",
    enterprise: "✓",
  },
  {
    feature: "Team Members",
    free: "1",
    starter: "3",
    growth: "10",
    enterprise: "Unlimited",
  },
  {
    feature: "API Access",
    free: "—",
    starter: "—",
    growth: "—",
    enterprise: "✓",
  },
  {
    feature: "Dedicated Account Manager",
    free: "—",
    starter: "—",
    growth: "—",
    enterprise: "✓",
  },
];

export const PRICING_FAQ: PricingFAQ[] = [
  {
    question: "Can I change plans at any time?",
    answer:
      "Yes! You can upgrade or downgrade your plan at any time. When upgrading, the new features are available immediately. When downgrading, the change takes effect at the end of your current billing cycle.",
  },
  {
    question: "What counts as a conversation?",
    answer:
      "A conversation is a single chat session between a customer and your AI assistant. Each time a customer starts a new chat on your menu page, it counts as one conversation, regardless of how many messages are exchanged.",
  },
  {
    question: "Is there a free trial for paid plans?",
    answer:
      "The Free plan lets you try MenuAI with no time limit. For paid plans, we offer a 14-day money-back guarantee — if you're not satisfied, contact us for a full refund.",
  },
  {
    question: "What happens if I exceed my conversation limit?",
    answer:
      "If you reach your monthly conversation limit, your AI chatbot will gracefully let customers know it's temporarily unavailable. You can upgrade your plan at any time to increase your limit.",
  },
  {
    question: "Do you offer annual billing?",
    answer:
      "Annual billing is coming soon! When available, you'll save 20% compared to monthly billing. Sign up for updates and we'll notify you when it launches.",
  },
];
