import { DefaultSession, DefaultUser } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: string
      churchId: string
    } & DefaultSession["user"]
  }

  interface User extends DefaultUser {
    id: string
    role: string
    churchId: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: string
    churchId: string
  }
}
