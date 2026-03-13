import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { createTaskSchema } from "@/lib/validations/task";
import { z } from "zod";

// GET /api/orgs/[orgId]/projects/[projectId]/tasks
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

  const tasks = await prisma.task.findMany({
    where: { projectId, project: { orgId } },
    include: {
      assignee: { select: { id: true, name: true, image: true, email: true } },
      labels: true,
      _count: { select: { comments: true } },
    },
    orderBy: { position: "asc" },
  });

  return NextResponse.json(tasks);
}

// POST /api/orgs/[orgId]/projects/[projectId]/tasks
export async function POST(
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
    const { labelIds, ...data } = createTaskSchema.parse(body);

    // Get max position in the same status column
    const maxPos = await prisma.task.aggregate({
      where: { projectId, status: data.status || "TODO" },
      _max: { position: true },
    });

    const task = await prisma.task.create({
      data: {
        ...data,
        projectId,
        position: (maxPos._max.position ?? -1) + 1,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        labels: labelIds?.length
          ? { connect: labelIds.map((id) => ({ id })) }
          : undefined,
      },
      include: {
        assignee: { select: { id: true, name: true, image: true, email: true } },
        labels: true,
        _count: { select: { comments: true } },
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
