import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import BillingClient from "./BillingClient";
import { Metadata } from "next";

export const metadata: Metadata = { title: "Billing" };

interface BillingPageProps {
  params: Promise<{ orgSlug: string }>;
}

export default async function BillingPage({ params }: BillingPageProps) {
  const { orgSlug } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const membership = await prisma.membership.findFirst({
    where: { userId: session.user.id, org: { slug: orgSlug } },
    include: { org: true },
  });

  if (!membership) redirect("/dashboard");

  return <BillingClient org={membership.org} role={membership.role} />;
}
