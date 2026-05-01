import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      level: string;
    } & DefaultSession["user"]
  }

  interface User {
    id?: string; // Kita paksa jadi string agar sinkron dengan authorize
    level?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    level: string;
  }
}