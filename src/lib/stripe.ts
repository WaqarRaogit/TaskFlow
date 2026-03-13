import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});

export const PLANS = {
  FREE: {
    name: "Free",
    description: "Perfect for individuals and small teams getting started",
    price: 0,
    features: [
      "Up to 3 projects",
      "Up to 5 team members",
      "Basic Kanban board",
      "File attachments up to 5MB",
      "Email support",
    ],
    limits: { projects: 3, members: 5 },
  },
  PRO: {
    name: "Pro",
    description: "For growing teams that need more power and flexibility",
    price: 12,
    priceId: process.env.STRIPE_PRO_PRICE_ID!,
    features: [
      "Unlimited projects",
      "Unlimited team members",
      "Advanced Kanban with custom statuses",
      "File attachments up to 50MB",
      "Priority support",
      "Analytics & reporting",
      "Custom labels & workflows",
      "API access",
    ],
    limits: { projects: Infinity, members: Infinity },
  },
};
