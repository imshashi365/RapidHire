import NextAuth, { AuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { MongoDBAdapter } from "@auth/mongodb-adapter"
import clientPromise from "@/lib/mongodb"
import { compare } from "bcryptjs"
import { JWT } from "next-auth/jwt"
import { Session } from "next-auth"

// Extend the built-in session types
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name: string
      email: string
      role: "company" | "candidate"
      username?: string
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: "company" | "candidate"
    username?: string
  }
}


export const authOptions: AuthOptions = {
  adapter: MongoDBAdapter(clientPromise) as any,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password || !credentials?.role) {
          return null
        }

        try {
          const client = await clientPromise
          const db = client.db()
          
          const user = await db.collection("users").findOne({ email: credentials.email })
          
          if (!user) {
            return null
          }

          const isValid = await compare(credentials.password, user.password)
          
          if (!isValid) {
            return null
          }

          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role as "company" | "candidate",
            username: user.username,
          }
        } catch (error) {
          console.error("Auth error:", error)
          return null
        }
      },
    }),
  ],
  session: {
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }: { token: JWT; user: any }) {
      if (user) {
        token.role = user.role
        token.id = user.id
        token.username = user.username
      }
      return token
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        session.user.role = token.role
        session.user.id = token.id
        session.user.username = token.username
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  debug: true, // Enable debug mode
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }

