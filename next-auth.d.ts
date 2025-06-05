import { DefaultSession, DefaultUser } from "next-auth";

/**
 * Типовые объявления модуля next-auth.
 * Расширяем свойства `session.user` и `user` в БД
 * дополнительными полями профиля.
 */
declare module "next-auth" {
  interface Session {
    user?: DefaultSession["user"] & {
      id: string;
      nickname?: string | null;
      bio?: string | null;
      twitter?: string | null;
      telegram?: string | null;
      website?: string | null;
      donationAddress?: string | null;
    };
  }

  interface User extends DefaultUser {
    nickname?: string | null;
    bio?: string | null;
    twitter?: string | null;
    telegram?: string | null;
    website?: string | null;
    donationAddress?: string | null;
  }
}

export {};
