import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { SiweMessage } from "siwe";
import { prisma } from "./db";
import type { DefaultUser } from "next-auth";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "Ethereum",
      credentials: {
        message: { label: "Message", type: "text" },
        signature: { label: "Signature", type: "text" },
      },
        async authorize(credentials, req) {
        try {
          const siwe = new SiweMessage(JSON.parse(credentials?.message || "{}"));
          const csrf = (req?.body?.csrfToken as string) ?? "";
          const host =
            (typeof req?.headers?.get === "function"
              ? req.headers.get("host")
              : (req?.headers as Record<string, string> | undefined)?.host) ??
            new URL(process.env.NEXTAUTH_URL ?? "http://localhost:3000").host;
          const { success } = await siwe.verify({
            signature: credentials?.signature || "",
            domain: host,
            nonce: csrf,
          });
          if (success) {
            const address = siwe.address.toLowerCase();
            let user = await prisma.user.findUnique({ where: { id: address } });
            if (!user) {
              user = await prisma.user.create({ data: { id: address } });
            }
            return { id: user.id };
          }
          return null;
        } catch (e) {
          console.error(e);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, user }) {
      const u = user as DefaultUser & { id: string };
      session.user = { ...(session.user ?? {}), id: u.id } as DefaultUser & { id: string };
      return session;
    },
  },
};
