// types/next-auth.d.ts
import { DefaultSession, DefaultUser } from "next-auth";
import { JWT, DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: string; // lowercase 'string'
      roles: string[]; // lowercase 'string[]'
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    id: string;
    email: string;
    name: string;
    role: string; // lowercase 'string'
    roles: string[]; // lowercase 'string[]'
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    email: string;
    name: string;
    role: string; // lowercase 'string'
    roles: string[]; // lowercase 'string[]'
  }
}
