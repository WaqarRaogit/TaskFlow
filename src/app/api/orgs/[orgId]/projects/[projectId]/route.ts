import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { updateProjectSchema } from "@/lib/validations/project";
import { z } from "zod";

// GET /api/orgs/[orgId]/projects/[projectId]
export async function GET(
  req: Request,
  { params }: { params: Promise<{ orgId: string; projectId: string }> }
) {
  const { orgId, projectId } = await params;
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const membership = await prisma.membership.findUnique({
    where: { userId_orgId: { userId: session.user.id, orgId } },
  });
  if (!membership) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const project = await prisma.project.findFirst({
    where: { id: projectId, orgId },
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

  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(project);
}

// PATCH /api/orgs/[orgId]/projects/[projectId]
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ orgId: string; projectId: string }> }
) {
  const { orgId, projectId } = await params;
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const membership = await prisma.membership.findUnique({
    where: { userId_orgId: { userId: session.user.id, orgId } },
  });
  if (!membership || membership.role === "VIEWER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const data = updateProjectSchema.parse(body);

    const project = await prisma.project.update({
      where: { id: projectId, orgId },
      data,
    });

    return NextResponse.json(project);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/orgs/[orgId]/projects/[projectId]
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ orgId: string; projectId: string }> }
) {
  const { orgId, projectId } = await params;
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const membership = await prisma.membership.findUnique({
    where: { userId_orgId: { userId: session.user.id, orgId } },
  });
  if (!membership || membership.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.project.delete({ where: { id: projectId, orgId } });

  return NextResponse.json({ message: "Project deleted" });
}
