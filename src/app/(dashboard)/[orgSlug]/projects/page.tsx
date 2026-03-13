import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ProjectsClient from "./ProjectsClient";
import { Metadata } from "next";

interface ProjectsPageProps {
  params: Promise<{ orgSlug: string }>;
}

export const metadata: Metadata = { title: "Projects" };

export default async function ProjectsPage({ params }: ProjectsPageProps) {
  const { orgSlug } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const membership = await prisma.membership.findFirst({
    where: { userId: session.user.id, org: { slug: orgSlug } },
    include: {
      org: {
        include: {
          projects: {
            include: { _count: { select: { tasks: true } }, tasks: { select: { status: true } } },
            orderBy: { createdAt: "desc" },
          },
          members: {
            include: { user: { select: { id: true, name: true, image: true } } },
            take: 10,
          },
        },
      },
    },
  });

  if (!membership) redirect("/dashboard");

  return (
    <ProjectsClient
      org={membership.org}
      role={membership.role}
      orgSlug={orgSlug}
    />
  );
}
