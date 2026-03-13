import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const orgId = session.metadata?.orgId;
      if (!orgId) break;

      await prisma.organization.update({
        where: { id: orgId },
        data: {
          plan: "PRO",
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: session.subscription as string,
        },
      });
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const org = await prisma.organization.findFirst({
        where: { stripeSubscriptionId: subscription.id },
      });
      if (org) {
        await prisma.organization.update({
          where: { id: org.id },
          data: { plan: "FREE", stripeSubscriptionId: null },
        });
      }
      break;
    }

    default:
      console.log(`Unhandled Stripe event: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
