import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import Sidebar from "@/components/dashboard/Sidebar";

interface OrgLayoutProps {
  children: React.ReactNode;
  params: Promise<{ orgSlug: string }>;
}

export default async function OrgLayout({ children, params }: OrgLayoutProps) {
  const { orgSlug } = await params;
  const session = await auth();

  if (!session?.user) redirect("/login");

  const membership = await prisma.membership.findFirst({
    where: {
      userId: session.user.id,
      org: { slug: orgSlug },
    },
    include: {
      org: {
        include: {
          projects: {
            orderBy: { createdAt: "asc" },
            select: { id: true, name: true, color: true },
          },
          _count: { select: { members: true } },
        },
      },
      user: { select: { id: true, name: true, email: true, image: true } },
    },
  });

  if (!membership) notFound();

  // Get all orgs this user is a member of (for org switcher)
  const allMemberships = await prisma.membership.findMany({
    where: { userId: session.user.id },
    include: {
      org: { select: { id: true, name: true, slug: true, plan: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="flex h-screen bg-[#0a0a0f] overflow-hidden">
      <Sidebar
        org={membership.org}
        role={membership.role}
        user={membership.user}
        allOrgs={allMemberships.map((m: { org: { id: string; name: string; slug: string; plan: string } }) => m.org)}
        currentOrgSlug={orgSlug}
      />
      <main className="flex-1 overflow-auto min-w-0">
        <div className="h-full">{children}</div>
      </main>
    </div>
  );
}
