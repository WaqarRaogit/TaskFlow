import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { createProjectSchema } from "@/lib/validations/project";
import { z } from "zod";

// GET /api/orgs/[orgId]/projects
export async function GET(
  req: Request,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const { orgId } = await params;
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const membership = await prisma.membership.findUnique({
    where: { userId_orgId: { userId: session.user.id, orgId } },
  });
  if (!membership) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const projects = await prisma.project.findMany({
    where: { orgId },
    include: {
      _count: { select: { tasks: true } },
      tasks: { select: { status: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(projects);
}

// POST /api/orgs/[orgId]/projects
export async function POST(
  req: Request,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const { orgId } = await params;
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
    const data = createProjectSchema.parse(body);

    const project = await prisma.project.create({
      data: { ...data, orgId },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
