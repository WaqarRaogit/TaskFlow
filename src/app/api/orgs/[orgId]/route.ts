import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const updateOrgSchema = z.object({
  name: z.string().min(2).max(100).optional(),
});

// PATCH /api/orgs/[orgId]
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const { orgId } = await params;
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const membership = await prisma.membership.findUnique({
    where: { userId_orgId: { userId: session.user.id, orgId } },
  });
  if (!membership || membership.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const data = updateOrgSchema.parse(body);
  const org = await prisma.organization.update({ where: { id: orgId }, data });
  return NextResponse.json(org);
}
