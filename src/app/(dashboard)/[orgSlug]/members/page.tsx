import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import MembersClient from "./MembersClient";
import { Metadata } from "next";

export const metadata: Metadata = { title: "Members" };

interface MembersPageProps {
  params: Promise<{ orgSlug: string }>;
}

export default async function MembersPage({ params }: MembersPageProps) {
  const { orgSlug } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const membership = await prisma.membership.findFirst({
    where: { userId: session.user.id, org: { slug: orgSlug } },
    include: {
      org: {
        include: {
          members: {
            include: { user: { select: { id: true, name: true, email: true, image: true } } },
            orderBy: { createdAt: "asc" },
          },
          invites: {
            where: { expiresAt: { gte: new Date() } },
            orderBy: { createdAt: "desc" },
          },
        },
      },
    },
  });

  if (!membership) redirect("/dashboard");

  return (
    <MembersClient
      org={membership.org}
      currentRole={membership.role}
      currentUserId={session.user.id}
    />
  );
}
