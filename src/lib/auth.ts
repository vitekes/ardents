import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { NextAuthOptions, DefaultUser } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { SiweMessage } from "siwe";
import { prisma } from "./db";

/**
 * Конфигурация Next-Auth с авторизацией «Sign-in with Ethereum».
 */
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,

  /* ──────────────── Providers ──────────────── */
  providers: [
    CredentialsProvider({
      name: "Ethereum",
      credentials: {
        message:   { label: "Message",   type: "Auth" },
        signature: { label: "Signature", type: "Sign" },
      },

      /**
       * Проверка SIWE-сообщения и создание пользователя при первой авторизации.
       */
      async authorize(credentials, req) {
        try {
          /* 1. Разбираем сообщение SIWE */
          const siwe = new SiweMessage(JSON.parse(credentials?.message ?? "{}"));
          const csrf = (req?.body?.csrfToken as string) ?? "";

          /* 2. Определяем домен, указанный в сообщении */
          const hostHeader =
            typeof req?.headers === "object"
              ? (req.headers as Record<string, string | string[] | undefined>)["host"]
              : undefined;

          const host =
            (Array.isArray(hostHeader) ? hostHeader[0] : hostHeader) ??
            new URL(process.env.NEXTAUTH_URL ?? "http://localhost:3000").host;

          /* 3. Валидируем подпись */
          const { success } = await siwe.verify({
            signature: credentials?.signature ?? "",
            domain: host,
            nonce: csrf,
          });

          if (!success) return null;

          /* 4. Находим или создаём пользователя в БД */
          const address = siwe.address.toLowerCase();
          let user = await prisma.user.findUnique({ where: { id: address } });

          if (!user) {
            user = await prisma.user.create({ data: { id: address } });
          }

          /* 5. Возвращаем объект user с обязательным полем id */
          return { id: user.id };
        } catch (error) {
          console.error(error);
          return null;
        }
      },
    }),
  ],

  /* ──────────────── Сессии и колбэки ──────────────── */
  session: { strategy: "jwt" },

  callbacks: {
    /**
     * Записываем id пользователя в JWT, когда он впервые создаётся.
     */
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;          // id = адрес кошелька
      }
      return token;
    },

    /**
     * Прокидываем id из токена в session, чтобы клиент мог им пользоваться.
     */
    async session({ session, token }) {
      if (token?.sub) {
        const user = await prisma.user.findUnique({
          where: { id: token.sub as string },
          select: {
            nickname: true,
            bio: true,
            twitter: true,
            telegram: true,
            website: true,
            donationAddress: true,
            image: true,
            name: true,
          },
        });
        session.user = {
          ...(session.user ?? {}),
          id: token.sub as string,
          ...user,
        } as DefaultUser & { id: string } & typeof user;
      }
      return session;
    },
  },
};