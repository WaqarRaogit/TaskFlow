import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const commentSchema = z.object({
  content: z.string().min(1).max(5000),
});

// GET /api/orgs/[orgId]/projects/[projectId]/tasks/[taskId]/comments
export async function GET(
  req: Request,
  { params }: { params: Promise<{ orgId: string; projectId: string; taskId: string }> }
) {
  const { orgId, taskId } = await params;
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const membership = await prisma.membership.findUnique({
    where: { userId_orgId: { userId: session.user.id, orgId } },
  });
  if (!membership) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const comments = await prisma.comment.findMany({
    where: { taskId },
    include: {
      author: { select: { id: true, name: true, image: true, email: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(comments);
}

// POST /api/orgs/[orgId]/projects/[projectId]/tasks/[taskId]/comments
export async function POST(
  req: Request,
  { params }: { params: Promise<{ orgId: string; projectId: string; taskId: string }> }
) {
  const { orgId, taskId } = await params;
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
    const { content } = commentSchema.parse(body);

    const comment = await prisma.comment.create({
      data: { content, taskId, authorId: session.user.id },
      include: {
        author: { select: { id: true, name: true, image: true, email: true } },
      },
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
