"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

function SignupContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultRole = searchParams.get("role") || "company"
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSignup = async (role: string, e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const formData = new FormData(e.target as HTMLFormElement)
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const confirmPassword = formData.get("confirmPassword") as string

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
          role,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong")
      }

      // Redirect to login page after successful registration
      router.push(`/login?role=${role}`)
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred")
      setIsLoading(false)
    }
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Link href="/" className="absolute left-4 top-4 md:left-8 md:top-8 flex items-center gap-2 font-bold text-xl">
        <span className="text-primary">AI</span>Interviewer
      </Link>

      <Tabs defaultValue={defaultRole} className="w-full max-w-md">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="company">Company</TabsTrigger>
          <TabsTrigger value="candidate">Candidate</TabsTrigger>
        </TabsList>

        <TabsContent value="company">
          <Card>
            <CardHeader>
              <CardTitle>Company Sign Up</CardTitle>
              <CardDescription>Create your company account to start managing interviews.</CardDescription>
            </CardHeader>
            <form onSubmit={(e) => handleSignup("company", e)}>
              <CardContent className="space-y-4">
                {error && (
                  <div className="text-sm text-red-500 text-center">{error}</div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="company-name">Company Name</Label>
                  <Input id="company-name" name="name" type="text" placeholder="TechCorp Inc." required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-email">Email</Label>
                  <Input id="company-email" name="email" type="email" placeholder="company@example.com" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-password">Password</Label>
                  <Input id="company-password" name="password" type="password" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-confirm-password">Confirm Password</Label>
                  <Input id="company-confirm-password" name="confirmPassword" type="password" required />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Creating account..." : "Sign Up"}
                </Button>
                <p className="text-sm text-center">
                  Already have an account?{" "}
                  <Link href="/login" className="text-primary underline-offset-4 hover:underline">
                    Login
                  </Link>
                </p>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="candidate">
          <Card>
            <CardHeader>
              <CardTitle>Candidate Sign Up</CardTitle>
              <CardDescription>Create your candidate account to start applying for positions.</CardDescription>
            </CardHeader>
            <form onSubmit={(e) => handleSignup("candidate", e)}>
              <CardContent className="space-y-4">
                {error && (
                  <div className="text-sm text-red-500 text-center">{error}</div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="candidate-name">Full Name</Label>
                  <Input id="candidate-name" name="name" type="text" placeholder="John Doe" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="candidate-email">Email</Label>
                  <Input id="candidate-email" name="email" type="email" placeholder="candidate@example.com" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="candidate-password">Password</Label>
                  <Input id="candidate-password" name="password" type="password" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="candidate-confirm-password">Confirm Password</Label>
                  <Input id="candidate-confirm-password" name="confirmPassword" type="password" required />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Creating account..." : "Sign Up"}
                </Button>
                <p className="text-sm text-center">
                  Already have an account?{" "}
                  <Link href="/login" className="text-primary underline-offset-4 hover:underline">
                    Login
                  </Link>
                </p>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignupContent />
    </Suspense>
  )
} 