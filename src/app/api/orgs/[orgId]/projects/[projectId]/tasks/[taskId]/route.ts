import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { updateTaskSchema } from "@/lib/validations/task";
import { z } from "zod";

// PATCH /api/orgs/[orgId]/projects/[projectId]/tasks/[taskId]
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ orgId: string; projectId: string; taskId: string }> }
) {
  const { orgId, projectId, taskId } = await params;
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
    const { labelIds, ...data } = updateTaskSchema.parse(body);

    const task = await prisma.task.update({
      where: { id: taskId, projectId },
      data: {
        ...data,
        dueDate: data.dueDate ? new Date(data.dueDate) : data.dueDate === null ? null : undefined,
        labels: labelIds !== undefined
          ? { set: labelIds.map((id) => ({ id })) }
          : undefined,
      },
      include: {
        assignee: { select: { id: true, name: true, image: true, email: true } },
        labels: true,
        _count: { select: { comments: true } },
      },
    });

    return NextResponse.json(task);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/orgs/[orgId]/projects/[projectId]/tasks/[taskId]
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ orgId: string; projectId: string; taskId: string }> }
) {
  const { orgId, projectId, taskId } = await params;
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const membership = await prisma.membership.findUnique({
    where: { userId_orgId: { userId: session.user.id, orgId } },
  });
  if (!membership || membership.role === "VIEWER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.task.delete({ where: { id: taskId, projectId } });
  return NextResponse.json({ message: "Task deleted" });
}
