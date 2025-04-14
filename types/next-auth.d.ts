import NextAuth from "next-auth"

declare module "next-auth" {
  interface User {
    id: string
    name?: string | null
    email?: string | null
    role: string
  }

  interface Session {
    user: User & {
      id: string
      role: string
    }
    accessToken: any
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: string
  }
} 