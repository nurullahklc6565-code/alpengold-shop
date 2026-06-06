import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const adminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.role = user.role;
        token.permissions = user.permissions;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = token.role as string;
      session.user.permissions = (token.permissions as string[]) ?? [];
      return session;
    },
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = adminLoginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        const staff = await prisma.staffUser.findUnique({
          where: { email },
          include: {
            role: {
              include: {
                rolePermissions: { include: { permission: true } },
              },
            },
          },
        });

        if (!staff || !staff.active) return null;

        const isValid = await compare(password, staff.passwordHash);
        if (!isValid) return null;

        await prisma.staffUser.update({
          where: { id: staff.id },
          data: { lastLoginAt: new Date() },
        });

        const permissions = staff.role.rolePermissions.map(
          (rp) => `${rp.permission.resource}:${rp.permission.action}`
        );

        return {
          id: staff.id,
          email: staff.email,
          name: `${staff.firstName} ${staff.lastName}`,
          role: staff.role.name,
          permissions,
        };
      },
    }),
  ],
});
