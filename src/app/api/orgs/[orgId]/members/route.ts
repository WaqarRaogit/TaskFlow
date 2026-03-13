import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(["MEMBER", "VIEWER"]),
});

// GET /api/orgs/[orgId]/members
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

  const members = await prisma.membership.findMany({
    where: { orgId },
    include: {
      user: { select: { id: true, name: true, email: true, image: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  const invites = await prisma.invite.findMany({
    where: { orgId, expiresAt: { gte: new Date() } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ members, invites });
}

// POST /api/orgs/[orgId]/members — Create invite
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
  if (!membership || membership.role !== "ADMIN") {
    return NextResponse.json({ error: "Only admins can invite members" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { email, role } = inviteSchema.parse(body);

    // Check if already a member
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      const existingMembership = await prisma.membership.findUnique({
        where: { userId_orgId: { userId: existingUser.id, orgId } },
      });
      if (existingMembership) {
        return NextResponse.json({ error: "User is already a member" }, { status: 409 });
      }
    }

    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours

    const invite = await prisma.invite.create({
      data: { email, role, orgId, expiresAt },
    });

    // In production you'd send an email here via Nodemailer
    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/invite/${invite.token}`;
    console.log(`Invite URL for ${email}: ${inviteUrl}`);

    return NextResponse.json({ invite, inviteUrl }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/orgs/[orgId]/members — Remove member
export async function DELETE(
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
    return NextResponse.json({ error: "Only admins can remove members" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const membershipId = searchParams.get("membershipId");
  if (!membershipId) return NextResponse.json({ error: "membershipId required" }, { status: 400 });

  await prisma.membership.delete({ where: { id: membershipId, orgId } });
  return NextResponse.json({ message: "Member removed" });
}
