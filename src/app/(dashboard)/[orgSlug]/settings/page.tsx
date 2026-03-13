import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import SettingsClient from "./SettingsClient";
import { Metadata } from "next";

export const metadata: Metadata = { title: "Settings" };

interface SettingsPageProps {
  params: Promise<{ orgSlug: string }>;
}

export default async function SettingsPage({ params }: SettingsPageProps) {
  const { orgSlug } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const membership = await prisma.membership.findFirst({
    where: { userId: session.user.id, org: { slug: orgSlug } },
    include: { org: true },
  });

  if (!membership) redirect("/dashboard");

  return (
    <SettingsClient
      org={membership.org}
      role={membership.role}
      userId={session.user.id}
    />
  );
}
