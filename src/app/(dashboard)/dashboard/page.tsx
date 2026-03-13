import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

// This catches /dashboard and redirects to the user's first org
export default async function DashboardRedirectPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const membership = await prisma.membership.findFirst({
    where: { userId: session.user.id },
    include: { org: true },
    orderBy: { createdAt: "asc" },
  });

  if (!membership) {
    // User has no org yet — shouldn't normally happen since we auto-create
    redirect("/new-org");
  }

  redirect(`/${membership.org.slug}`);
}
