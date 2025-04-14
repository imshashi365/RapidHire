import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle, Clock, FileText, Users } from "lucide-react"

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl">
            <span className="text-primary">Rapid</span>Hire
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-sm font-medium hover:underline">
              Features
            </Link>
            <Link href="#how-it-works" className="text-sm font-medium hover:underline">
              How It Works
            </Link>
            <Link href="#pricing" className="text-sm font-medium hover:underline">
              Pricing
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="outline">Log In</Button>
            </Link>
            <Link href="/signup">
              <Button>Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-b from-slate-50 to-white">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="space-y-4">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  AI-Powered Interview Screening That Saves Time & Improves Hiring
                </h1>
                <p className="text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Automate your candidate screening process with our AI interviewer. Get detailed insights, scores, and
                  recordings to make better hiring decisions.
                </p>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/signup?role=company">
                    <Button size="lg" className="w-full min-[400px]:w-auto">
                      For Companies
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/signup?role=candidate">
                    <Button size="lg" variant="outline" className="w-full min-[400px]:w-auto">
                      For Candidates
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="mx-auto lg:mx-0 lg:flex-1 rounded-lg overflow-hidden border shadow-lg">
                <img
                  alt="AI Interview Dashboard"
                  className="aspect-video object-cover w-full"
                  src="/placeholder.svg?height=720&width=1280"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 bg-white">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Key Features</h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our platform streamlines the interview process with powerful AI capabilities
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col items-center space-y-4 rounded-lg border p-6">
                <div className="rounded-full bg-primary/10 p-4">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Resume Analysis</h3>
                <p className="text-center text-gray-500">
                  AI analyzes candidate resumes to generate personalized interview questions
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 rounded-lg border p-6">
                <div className="rounded-full bg-primary/10 p-4">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">15-Minute Screening</h3>
                <p className="text-center text-gray-500">
                  Efficient 15-minute video interviews that respect everyone's time
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 rounded-lg border p-6">
                <div className="rounded-full bg-primary/10 p-4">
                  <CheckCircle className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Comprehensive Scoring</h3>
                <p className="text-center text-gray-500">
                  Candidates scored on grammar, speaking skills, accuracy, and relevance
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 rounded-lg border p-6">
                <div className="rounded-full bg-primary/10 p-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Dual Login System</h3>
                <p className="text-center text-gray-500">
                  Separate portals for companies and candidates with tailored experiences
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 rounded-lg border p-6">
                <div className="rounded-full bg-primary/10 p-4">
                  <svg
                    className="h-6 w-6 text-primary"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Secure Storage</h3>
                <p className="text-center text-gray-500">
                  All interview recordings securely stored and accessible to companies
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 rounded-lg border p-6">
                <div className="rounded-full bg-primary/10 p-4">
                  <svg
                    className="h-6 w-6 text-primary"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14Z" />
                    <path d="M7 22V11" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Shortlisting Tools</h3>
                <p className="text-center text-gray-500">
                  Easily shortlist top candidates for in-person interviews based on AI scores
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-16 bg-slate-50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">How It Works</h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our streamlined process makes screening candidates efficient and effective
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl gap-8 py-12">
              <div className="grid gap-8 md:grid-cols-3">
                <div className="flex flex-col items-center space-y-4 rounded-lg border bg-white p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white">1</div>
                  <h3 className="text-xl font-bold">Company Setup</h3>
                  <p className="text-center text-gray-500">
                    Companies add interview questions and upload candidate resumes
                  </p>
                </div>
                <div className="flex flex-col items-center space-y-4 rounded-lg border bg-white p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white">2</div>
                  <h3 className="text-xl font-bold">AI Analysis</h3>
                  <p className="text-center text-gray-500">
                    Our AI analyzes resumes and prepares personalized interview questions
                  </p>
                </div>
                <div className="flex flex-col items-center space-y-4 rounded-lg border bg-white p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white">3</div>
                  <h3 className="text-xl font-bold">Interview Link</h3>
                  <p className="text-center text-gray-500">
                    Companies generate and share interview links with candidates
                  </p>
                </div>
              </div>
              <div className="grid gap-8 md:grid-cols-3">
                <div className="flex flex-col items-center space-y-4 rounded-lg border bg-white p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white">4</div>
                  <h3 className="text-xl font-bold">Candidate Interview</h3>
                  <p className="text-center text-gray-500">
                    Candidates complete a 15-minute AI-led video interview at their convenience
                  </p>
                </div>
                <div className="flex flex-col items-center space-y-4 rounded-lg border bg-white p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white">5</div>
                  <h3 className="text-xl font-bold">AI Scoring</h3>
                  <p className="text-center text-gray-500">
                    System scores candidates on multiple factors and generates a comprehensive report
                  </p>
                </div>
                <div className="flex flex-col items-center space-y-4 rounded-lg border bg-white p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white">6</div>
                  <h3 className="text-xl font-bold">Company Review</h3>
                  <p className="text-center text-gray-500">
                    Companies review recordings, scores, and shortlist candidates for next steps
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-primary text-white">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Ready to Transform Your Hiring Process?
                </h2>
                <p className="max-w-[900px] md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Join hundreds of companies saving time and finding better candidates with AI Interviewer
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link href="/signup">
                  <Button size="lg" variant="secondary" className="w-full min-[400px]:w-auto">
                    Get Started Today
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/demo">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full min-[400px]:w-auto border-white text-white hover:bg-white hover:text-primary"
                  >
                    Request a Demo
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-center text-sm leading-loose text-gray-500 md:text-left">
            © 2025 AI Interviewer. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="text-sm text-gray-500 hover:underline">
              Terms
            </Link>
            <Link href="/privacy" className="text-sm text-gray-500 hover:underline">
              Privacy
            </Link>
            <Link href="/contact" className="text-sm text-gray-500 hover:underline">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

