import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import KanbanBoard from "@/components/kanban/KanbanBoard";
import { Metadata } from "next";

interface ProjectPageProps {
  params: Promise<{ orgSlug: string; projectId: string }>;
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { projectId } = await params;
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  return { title: project?.name || "Project Board" };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { orgSlug, projectId } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const membership = await prisma.membership.findFirst({
    where: { userId: session.user.id, org: { slug: orgSlug } },
    include: { org: true },
  });

  if (!membership) redirect("/dashboard");

  const project = await prisma.project.findFirst({
    where: { id: projectId, orgId: membership.org.id },
    include: {
      tasks: {
        include: {
          assignee: { select: { id: true, name: true, image: true, email: true } },
          labels: true,
          _count: { select: { comments: true } },
        },
        orderBy: { position: "asc" },
      },
    },
  });

  if (!project) notFound();

  const members = await prisma.membership.findMany({
    where: { orgId: membership.org.id },
    include: { user: { select: { id: true, name: true, image: true, email: true } } },
  });

  const labels = await prisma.label.findMany({ where: { orgId: membership.org.id } });

  return (
    <KanbanBoard
      project={project}
      orgId={membership.org.id}
      orgSlug={orgSlug}
      role={membership.role}
      members={members.map((m: { user: { id: string; name: string | null; image: string | null; email: string } }) => m.user)}
      labels={labels}
      currentUserId={session.user.id}
    />
  );
}
