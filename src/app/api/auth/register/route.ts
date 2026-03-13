import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { slugify } from "@/lib/utils";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password } = registerSchema.parse(body);

    // Check if email exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user + default org in one transaction
    const user = await prisma.$transaction(async (tx: typeof prisma) => {
      const newUser = await tx.user.create({
        data: { name, email, password: hashedPassword },
      });

      // Auto-create personal workspace
      const baseSlug = slugify(email.split("@")[0]);
      let slug = baseSlug;
      let attempts = 0;

      // Ensure unique slug
      while (await tx.organization.findUnique({ where: { slug } })) {
        attempts++;
        slug = `${baseSlug}-${attempts}`;
      }

      await tx.organization.create({
        data: {
          name: `${name}'s Workspace`,
          slug,
          members: {
            create: { userId: newUser.id, role: "ADMIN" },
          },
        },
      });

      return newUser;
    });

    return NextResponse.json(
      { message: "Account created successfully", userId: user.id },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    console.error("[REGISTER_ERROR]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
