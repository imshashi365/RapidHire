"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { use } from "react"
import { Briefcase, MapPin, Clock, DollarSign, Building, Calendar, Award, FileText, IndianRupee, ArrowRight, Loader2, CheckCircle, Send } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { MobileMenu } from "@/components/ui/mobile-menu"

interface Position {
  _id: string
  title: string
  department: string
  location: string
  type: string
  workLocation: string
  description: string
  requirements: string[]
  questions?: string[]
  minExperience: number
  maxExperience: number
  salaryRange: {
    min: number
    max: number
  }
  active: boolean
  companyName: string
  lastDate: string
  createdBy: {
    name: string
  }
  salary?: {
    min: number
    max: number
    currency: string
  }
}

interface PositionPageProps {
  params: Promise<{ id: string }>
}

const PositionPage = ({ params }: PositionPageProps) => {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [position, setPosition] = useState<Position | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isApplying, setIsApplying] = useState(false)
  const [hasApplied, setHasApplied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Use React.use() to unwrap the params promise
  const { id } = use(params)

  useEffect(() => {
    const fetchPosition = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/positions/${id}`)
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to fetch position")
        }

        const data = await response.json()
        
        if (!data) {
          throw new Error("Position not found")
        }

        console.log('Fetched position:', data) // Debug log
        setPosition(data)
        setError(null)
      } catch (err) {
        console.error("Error fetching position:", err)
        setError(err instanceof Error ? err.message : "Failed to fetch position")
      } finally {
        setIsLoading(false)
      }
    }

    if (id) {
      fetchPosition()
    }
  }, [id])

  useEffect(() => {
    const checkApplicationStatus = async () => {
      if (!session?.user?.id || session?.user?.role !== "candidate") {
        return
      }

        try {
          const response = await fetch(`/api/applications/check?positionId=${id}`)
          if (response.ok) {
            const data = await response.json()
            setHasApplied(data.hasApplied)
          }
        } catch (error) {
          console.error("Error checking application status:", error)
      }
    }

    checkApplicationStatus()
  }, [id, session])

  const handleApply = async () => {
    if (!session?.user) {
      router.push("/login")
      return
    }

    if (session?.user?.role !== "candidate") {
      toast.error("Only candidates can apply for positions")
      return
    }

    try {
      setIsApplying(true)
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          positionId: id,
          candidateId: session.user.id,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 400 && data.error === "You have already applied for this position") {
          toast.error("You have already applied for this position")
          router.push("/dashboard/candidate/interviews")
          return
        }
        throw new Error(data.error || "Failed to apply for position")
      }

      toast.success("Application submitted successfully")
      router.push("/dashboard/candidate/interviews")
    } catch (error) {
      console.error("Error applying for position:", error)
      toast.error(error instanceof Error ? error.message : "Failed to apply for position")
    } finally {
      setIsApplying(false)
    }
  }

  const formatSalary = (position: Position) => {
    // Check for salaryRange first
    if (position.salaryRange?.min && position.salaryRange?.max) {
      return `₹${position.salaryRange.min}L - ₹${position.salaryRange.max}L`
    }
    // Fallback to salary if salaryRange is not available
    if (position.salary?.min && position.salary?.max) {
      const currency = position.salary.currency || '₹'
      return `${currency}${position.salary.min}L - ${currency}${position.salary.max}L`
    }
    // Return a default message if no salary information is available
    return "Salary not specified"
  }

  const getWorkLocationColor = (workLocation: string) => {
    switch (workLocation.toLowerCase()) {
      case 'remote':
        return 'text-green-500'
      case 'hybrid':
        return 'text-blue-500'
      case 'onsite':
        return 'text-orange-500'
      default:
        return 'text-gray-500'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!position) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
        <div className="text-4xl">😕</div>
        <h1 className="text-2xl font-bold">Position Not Found</h1>
        <p className="text-gray-500">The position you're looking for doesn't exist or has been removed.</p>
        <Button variant="outline" onClick={() => router.push("/positions")}>
          Browse Other Positions
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-black text-white relative">
      {/* Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#229799/30_30px,transparent_1px),linear-gradient(to_bottom,#229799/3_1px,transparent_1px)] bg-[size:44px_44px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />

      <header className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur supports-[backdrop-filter]:bg-black/60 border-b border-[#229799]/20">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl">
            <span className="flex items-center gap-2">
              <Image src="/RapidHirelogo.png" alt="AI Interviewer" width={122} height={72} />
            </span>
              </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-sm font-medium text-gray-300 hover:text-[#229799] transition-colors">
              Features
            </Link>
            <Link href="#how-it-works" className="text-sm font-medium text-gray-300 hover:text-[#229799] transition-colors">
              How It Works
            </Link>
            <Link href="#features" className="text-sm font-medium text-gray-300 hover:text-[#229799] transition-colors">
              Jobs Portal
            </Link>
            <Link href="#pricing" className="text-sm font-medium text-gray-300 hover:text-[#229799] transition-colors">
              Pricing
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="outline" className="border-[#229799] text-[#229799] hover:bg-[#229799] hover:text-white">
                Log In
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-[#229799] text-white hover:bg-[#229799]/90">Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 relative pt-14">
        <div className="container mx-auto px-4 py-8">
          {isLoading ? (
            <div className="flex justify-center items-center min-h-[60vh]">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <h2 className="text-2xl font-semibold text-red-600 mb-2">Error</h2>
              <p className="text-gray-600">{error}</p>
            </div>
          ) : position ? (
            <div className="max-w-4xl mx-auto">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      {position.title}
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-300">
                      {position.companyName}
                    </p>
          </div>
                  <div className="flex flex-col items-end">
                    <Badge variant="outline" className="mb-2">
                      {position.type}
                    </Badge>
                    <Badge variant="secondary">
                      {position.location}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="flex items-center">
                    <Building className="w-5 h-5 mr-2 text-gray-500" />
                    <span className="text-gray-600 dark:text-gray-300">
                      {position.department}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <DollarSign className="w-5 h-5 mr-2 text-gray-500" />
                    <span className="text-gray-600 dark:text-gray-300">
                      {formatSalary(position)}
                    </span>
                  </div>
                </div>

                <div className="prose dark:prose-invert max-w-none mb-8">
                  <h2 className="text-xl font-semibold mb-4">Description</h2>
                  <div className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                    {position.description}
                  </div>
                </div>

                <div className="prose dark:prose-invert max-w-none mb-8">
                  <h2 className="text-xl font-semibold mb-4">Requirements</h2>
                  <div className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                    {position.requirements.map((req, index) => (
                      <li key={index}>{req}</li>
                    ))}
                  </div>
                </div>

                <div className="border-t dark:border-gray-700 pt-6">
                  {session?.user?.role === "candidate" ? (
                    hasApplied ? (
                      <div className="flex items-center justify-center bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
                        <span className="text-green-600 dark:text-green-400">
                          You have already applied for this position
                        </span>
                      </div>
                    ) : (
                      <Button
                        className="w-full md:w-auto"
                        onClick={handleApply}
                        disabled={isApplying}
                      >
                        {isApplying ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Applying...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Apply Now
                          </>
                        )}
                      </Button>
                    )
                  ) : !session?.user ? (
                    <div className="text-center">
                      <p className="text-gray-600 dark:text-gray-300 mb-4">
                        Sign in as a candidate to apply for this position
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => router.push("/login")}
                      >
                        Sign In
                      </Button>
                  </div>
                  ) : null}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </main>

      <footer className="relative border-t border-[#229799]/20 bg-black/95 backdrop-blur-sm">
        {/* Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#229799/5_1px,transparent_1px),linear-gradient(to_bottom,#229799/5_1px,transparent_1px)] bg-[size:24px_24px]" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#229799] to-transparent opacity-20" />
        </div>

        <div className="container relative">
          {/* Top Section with Newsletter */}
          <div className="grid gap-8 py-12 lg:grid-cols-3">
            <div className="space-y-4">
              <div className="flex items-center gap-2 font-bold text-xl">
                <Image src="/RapidHirelogo.png" alt="AI Interviewer" width={122} height={72} />
              </div>
              <p className="text-gray-400 max-w-sm">
                Transform your hiring process with AI-powered video interviews. Save time, reduce bias, and find the best candidates.
              </p>
            </div>

            <div className="lg:col-span-2">
              <div className="rounded-2xl border border-[#229799]/20 bg-black/50 p-6 backdrop-blur-sm">
                <h3 className="text-xl font-semibold text-white mb-2">Stay Updated</h3>
                <p className="text-gray-400 mb-4">Get the latest updates on AI interviewing and hiring trends.</p>
                <form className="flex gap-2">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 rounded-lg border border-[#229799]/20 bg-black/50 px-4 py-2 text-white placeholder-gray-500 focus:border-[#229799] focus:outline-none focus:ring-1 focus:ring-[#229799]"
                  />
                  <Button className="bg-[#229799] text-white hover:bg-[#229799]/90">
                    Subscribe
                  </Button>
                </form>
              </div>
            </div>
          </div>

          {/* Middle Section with Links */}
          <div className="grid gap-8 py-8 border-t border-[#229799]/20 lg:grid-cols-4">
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white">Product</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="#features" className="text-gray-400 hover:text-[#229799] transition-colors">Features</Link>
                </li>
                <li>
                  <Link href="#pricing" className="text-gray-400 hover:text-[#229799] transition-colors">Pricing</Link>
                </li>
                <li>
                  <Link href="/demo" className="text-gray-400 hover:text-[#229799] transition-colors">Book Demo</Link>
                </li>
                <li>
                  <Link href="/security" className="text-gray-400 hover:text-[#229799] transition-colors">Security</Link>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white">Company</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/about" className="text-gray-400 hover:text-[#229799] transition-colors">About Us</Link>
                </li>
                <li>
                  <Link href="/careers" className="text-gray-400 hover:text-[#229799] transition-colors">Careers</Link>
                </li>
                <li>
                  <Link href="/blog" className="text-gray-400 hover:text-[#229799] transition-colors">Blog</Link>
                </li>
                <li>
                  <Link href="/press" className="text-gray-400 hover:text-[#229799] transition-colors">Press</Link>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white">Resources</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/docs" className="text-gray-400 hover:text-[#229799] transition-colors">Documentation</Link>
                </li>
                <li>
                  <Link href="/help" className="text-gray-400 hover:text-[#229799] transition-colors">Help Center</Link>
                </li>
                <li>
                  <Link href="/guides" className="text-gray-400 hover:text-[#229799] transition-colors">Guides</Link>
                </li>
                <li>
                  <Link href="/api" className="text-gray-400 hover:text-[#229799] transition-colors">API Reference</Link>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white">Contact</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="mailto:contact@rapidhire.ai" className="text-gray-400 hover:text-[#229799] transition-colors">shashigdsc@gmail.com</Link>
                </li>
                <li>
                  <Link href="tel:+1234567890" className="text-gray-400 hover:text-[#229799] transition-colors">+91-9219612129</Link>
                </li>
                <li className="text-gray-400">
                  MAIT Delhi, Rohini Sector-22, New Delhi
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Section with Social Links and Copyright */}
          <div className="flex flex-col items-center gap-4 py-8 border-t border-[#229799]/20">
            <div className="flex items-center gap-4">
              <Link href="https://github.com" target="_blank" className="text-gray-400 hover:text-[#229799] transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
              <Link href="/privacy" className="hover:text-[#229799] transition-colors">Privacy Policy</Link>
              <span>•</span>
              <Link href="/terms" className="hover:text-[#229799] transition-colors">Terms of Service</Link>
              <span>•</span>
              <Link href="/cookies" className="hover:text-[#229799] transition-colors">Cookie Policy</Link>
            </div>

            <p className="text-sm text-gray-400">
              © {new Date().getFullYear()} RapidHire. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default PositionPage 