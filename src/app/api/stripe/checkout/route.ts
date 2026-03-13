import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { orgId } = await req.json();

    const membership = await prisma.membership.findUnique({
      where: { userId_orgId: { userId: session.user.id, orgId } },
      include: { org: true },
    });

    if (!membership || membership.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const org = membership.org;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const checkoutSession = await stripe.checkout.sessions.create({
      customer_email: session.user.email!,
      line_items: [
        {
          price: process.env.STRIPE_PRO_PRICE_ID!,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${appUrl}/${org.slug}/billing?success=true`,
      cancel_url: `${appUrl}/${org.slug}/billing?canceled=true`,
      metadata: { orgId: org.id },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("[STRIPE_CHECKOUT_ERROR]", error);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
