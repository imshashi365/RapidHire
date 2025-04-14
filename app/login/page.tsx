"use client"

import { useState, useEffect } from "react"
import { signIn, useSession } from "next-auth/react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function LoginPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  // Redirect if already logged in
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      const defaultRedirect = session.user.role === "company" ? "/dashboard/company" : "/dashboard/candidate"
      const safeCallbackUrl = callbackUrl && !callbackUrl.includes("/login") ? callbackUrl : defaultRedirect
      router.push(safeCallbackUrl)
    }
  }, [status, session, router, callbackUrl])

  const handleLogin = async (role: string, e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const formData = new FormData(e.target as HTMLFormElement)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    try {
      const result = await signIn("credentials", {
        email,
        password,
        role,
        redirect: false,
      })

      if (result?.error) {
        setError("Invalid email or password")
        setIsLoading(false)
        return
      }

      // The useEffect will handle the redirect after successful login
    } catch (error) {
      setError("An error occurred. Please try again.")
      setIsLoading(false)
    }
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Link href="/" className="absolute left-4 top-4 md:left-8 md:top-8 flex items-center gap-2 font-bold text-xl">
        <span className="text-primary">AI</span>Interviewer
      </Link>

      <Tabs defaultValue="company" className="w-full max-w-md">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="company">Company</TabsTrigger>
          <TabsTrigger value="candidate">Candidate</TabsTrigger>
        </TabsList>

        <TabsContent value="company">
          <Card>
            <CardHeader>
              <CardTitle>Company Login</CardTitle>
              <CardDescription>Access your company dashboard to manage interviews and candidates.</CardDescription>
            </CardHeader>
            <form onSubmit={(e) => handleLogin("company", e)}>
              <CardContent className="space-y-4">
                {error && (
                  <div className="text-sm text-red-500 text-center">{error}</div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="company-email">Email</Label>
                  <Input id="company-email" name="email" type="email" placeholder="company@example.com" required />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="company-password">Password</Label>
                    <Link href="/forgot-password" className="text-sm text-primary underline-offset-4 hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                  <Input id="company-password" name="password" type="password" required />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Logging in..." : "Login"}
                </Button>
                <div className="text-center text-sm">
                  Don&apos;t have an account?{" "}
                  <Link href="/signup?role=company" className="text-primary underline-offset-4 hover:underline">
                    Sign up
                  </Link>
                </div>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="candidate">
          <Card>
            <CardHeader>
              <CardTitle>Candidate Login</CardTitle>
              <CardDescription>Access your candidate dashboard to view and manage your interviews.</CardDescription>
            </CardHeader>
            <form onSubmit={(e) => handleLogin("candidate", e)}>
              <CardContent className="space-y-4">
                {error && (
                  <div className="text-sm text-red-500 text-center">{error}</div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="candidate-email">Email</Label>
                  <Input id="candidate-email" name="email" type="email" placeholder="candidate@example.com" required />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="candidate-password">Password</Label>
                    <Link href="/forgot-password" className="text-sm text-primary underline-offset-4 hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                  <Input id="candidate-password" name="password" type="password" required />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Logging in..." : "Login"}
                </Button>
                <div className="text-center text-sm">
                  Don&apos;t have an account?{" "}
                  <Link href="/signup?role=candidate" className="text-primary underline-offset-4 hover:underline">
                    Sign up
                  </Link>
                </div>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

