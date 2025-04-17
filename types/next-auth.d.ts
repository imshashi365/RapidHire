import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name: string
      email: string
      image?: string
      role: "candidate" | "company"
      candidateProfile?: {
        resume?: string
        skills?: string[]
        experience?: string
        education?: string
      }
    }
  }

  interface User {
    id: string
    name: string
    email: string
    image?: string
    role: "candidate" | "company"
    candidateProfile?: {
      resume?: string
      skills?: string[]
      experience?: string
      education?: string
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: string
  }
} 