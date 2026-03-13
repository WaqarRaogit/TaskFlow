import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, AlertCircle } from "lucide-react";

interface InvitePageProps {
  params: Promise<{ token: string }>;
}

export default async function InvitePage({ params }: InvitePageProps) {
  const { token } = await params;
  const session = await auth();

  const invite = await prisma.invite.findUnique({
    where: { token },
    include: { org: true },
  });

  // Invalid or expired
  if (!invite || invite.expiresAt < new Date()) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-white text-xl font-bold mb-2">Invalid invite</h1>
          <p className="text-slate-400 text-sm mb-6">This invite link is invalid or has expired.</p>
          <Link href="/" className="text-violet-400 hover:text-violet-300 text-sm">← Back to home</Link>
        </div>
      </div>
    );
  }

  // Must be logged in
  if (!session?.user) {
    redirect(`/register?callbackUrl=/invite/${token}`);
  }

  // Already a member?
  const existingMembership = await prisma.membership.findUnique({
    where: { userId_orgId: { userId: session.user.id, orgId: invite.orgId } },
  });

  if (existingMembership) {
    redirect(`/${invite.org.slug}`);
  }

  // Accept invite
  await prisma.$transaction([
    prisma.membership.create({
      data: { userId: session.user.id, orgId: invite.orgId, role: invite.role },
    }),
    prisma.invite.delete({ where: { id: invite.id } }),
  ]);

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-emerald-400" />
        </div>
        <h1 className="text-white text-xl font-bold mb-2">You&apos;re in! 🎉</h1>
        <p className="text-slate-400 text-sm mb-6">
          You&apos;ve joined <strong className="text-white">{invite.org.name}</strong> as a {invite.role.toLowerCase()}.
        </p>
        <Link
          href={`/${invite.org.slug}`}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors"
        >
          Go to workspace
        </Link>
      </div>
    </div>
  );
}
