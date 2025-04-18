"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle, Clock, FileText, Users, Brain, Video, Link as LinkIcon, ClipboardList } from "lucide-react"
import { useSession } from "next-auth/react"
import Aurora from './components/Aurora'
import { JobCarousel } from './components/JobCarousel'

export default function HomePage() {
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

      <main className="flex-1 relative pt-3">
        {/* Hero Section */}
        <section className="relative min-h-[calc(100vh-3.5rem)] flex items-center justify-center overflow-hidden py-20">
          {/* Aurora Background */}
          <div className="absolute inset-0 z-0">
            <Aurora
              colorStops={["#229799", "#FF94B4", "#002828"]}
              blend={0.5}
              amplitude={1.0}
              speed={0.5}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-transparent" />
          </div>

          <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center text-center max-w-5xl mx-auto space-y-12">
              <div className="space-y-8">
                {/* <div className="flex items-center justify-center gap-2 text-sm">
                  <span className="text-gray-400">Backed by</span>
                  <span className="bg-[#ff6b00] text-white px-1">Y</span>
                  <span className="text-[#ff6b00]">Combinator</span>
                </div> */}
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter leading-tight">
                  <span className="text-[#229799]">Transform your hiring</span><br /> with AI Recruiter AGENT
                </h1>
                <div className="relative justify-center items-center">

                </div>

                <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto">
                  99.9% Cheating Proof | Automated Interview | Instant results
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                <Button size="lg" className="w-full sm:w-auto bg-[#229799] hover:bg-[#229799]/90 min-w-[200px]">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto border-[#229799] text-[#229799] hover:bg-[#229799] hover:text-white min-w-[200px]"
                >
                  Book a demo
                </Button>
              </div>

            </div>
          </div>
        </section>



        {/* dashboard image section */}

        <section className="flex justify-center items-center mt-[-150px]">
          <div className="relative">
            <div className="absolute inset-0 bg-[#229799]/70 blur-3xl rounded-full" />
            <Image
              src="/dashpng.png"
              alt="dashboard image"
              width={1000}
              height={1000}
              className="relative z-10"
            />
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/90" />

          {/* Subtle grid background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#229799/10_1px,transparent_1px),linear-gradient(to_bottom,#229799/10_1px,transparent_1px)] bg-[size:24px_24px]" />

          <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-center space-y-8 text-center mb-20 animate-fade-up">
              <div className="space-y-4">
                <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#229799] to-white">
                  Key Features
                </h2>
                <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
                  Our platform streamlines the interview process with powerful AI capabilities
                </p>
              </div>
            </div>

            <div className="mx-auto max-w-6xl space-y-32">
              {/* Resume Analysis */}
              <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16 animate-fade-up">
                <div className="w-full md:w-1/2 space-y-6">
                  <div className="inline-block rounded-lg bg-[#229799]/10 p-2">
                    <FileText className="h-6 w-6 text-[#229799]" />
                  </div>
                  <h3 className="text-3xl md:text-4xl font-bold text-white">Resume Analysis</h3>
                  <p className="text-lg text-gray-400 leading-relaxed">
                    Our AI technology analyzes candidate resumes in detail to generate personalized interview questions, ensuring a thorough and relevant assessment of each applicant's background.
                  </p>
                  <div className="pt-4">
                    <Button variant="outline" className="border-[#229799] text-[#229799] hover:bg-[#229799] hover:text-white">
                      Learn More
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="w-full md:w-1/2 aspect-square relative group flex justify-center items-center">
                  <div className="absolute inset-0 bg-[#229799]/20 blur-3xl rounded-full" />
                  <Image
                    src="/resume.png"
                    alt="Resume Analysis"
                    width={600}
                    height={600}
                    className="rounded-2xl object-cover"
                  />
                </div>
              </div>

              {/* 15-Minute Screening */}
              <div className="flex flex-col md:flex-row-reverse items-center gap-8 md:gap-16 animate-fade-up">
                <div className="w-full md:w-1/2 space-y-6">
                  <div className="inline-block rounded-lg bg-[#229799]/10 p-2">
                    <Clock className="h-6 w-6 text-[#229799]" />
                  </div>
                  <h3 className="text-3xl md:text-4xl font-bold text-white">15-Minute Screening</h3>
                  <p className="text-lg text-gray-400 leading-relaxed">
                    Efficient video interviews that respect everyone's time. Our streamlined process captures all necessary insights in just 15 minutes, making screening both effective and convenient.
                  </p>
                  <div className="pt-4">
                    <Button variant="outline" className="border-[#229799] text-[#229799] hover:bg-[#229799] hover:text-white">
                      Learn More
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="w-full md:w-1/2 aspect-square relative group flex justify-center items-center">
                <div className="absolute inset-0 bg-[#229799]/20 blur-3xl rounded-full" />
                  <Image
                    src="/interview.webp"
                    alt="Video Interview"
                    width={600}
                    height={600}
                    className="rounded-md object-cover"
                  />
                </div>
              </div>

              {/* Comprehensive Scoring */}
              <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16 animate-fade-up">
                <div className="w-full md:w-1/2 space-y-6">
                  <div className="inline-block rounded-lg bg-[#229799]/10 p-2">
                    <CheckCircle className="h-6 w-6 text-[#229799]" />
                  </div>
                  <h3 className="text-3xl md:text-4xl font-bold text-white">Comprehensive Scoring</h3>
                  <p className="text-lg text-gray-400 leading-relaxed">
                    Advanced AI scoring system evaluates candidates on multiple parameters including grammar, speaking skills, technical accuracy, and response relevance.
                  </p>
                  <div className="pt-4">
                    <Button variant="outline" className="border-[#229799] text-[#229799] hover:bg-[#229799] hover:text-white">
                      Learn More
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="w-full md:w-1/2 aspect-square relative group flex justify-center items-center">
                <div className="absolute inset-0 bg-[#229799]/20 blur-3xl rounded-full" />
                  <Image
                    src="/scoring.png"
                    alt="Scoring System"
                    width={600}
                    height={600}
                    className="rounded-md object-cover"
                  />
                </div>
              </div>

              {/* Bottom CTA */}
              <div className="pt-8 text-center animate-fade-up">
                <Button
                  size="lg"
                  className="bg-[#229799] text-white hover:bg-[#229799]/90 text-lg px-8 py-6 rounded-xl shadow-lg shadow-[#229799]/20 hover:shadow-[#229799]/40 transition-all duration-300 hover:scale-105"
                >
                  Explore All Features
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/90" />

          {/* Animated gradient background */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#229799]/10 via-transparent to-[#229799]/10 bg-[length:200%_200%] animate-gradient" />

          <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-center space-y-8 text-center mb-16 animate-fade-up">
              <div className="space-y-4">
                <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#229799] to-white">
                  How It Works
                </h2>
                <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
                 Our streamlined process automates candidate interviews using AI, ensuring faster, fairer, and smarter hiring.
                </p>
              </div>
            </div>

            <div className="mx-auto max-w-7xl">
              {/* Steps Grid */}
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {[
                  {
                    number: 1,
                    title: "Create Position",
                    description: "Add job title, location, salary, description, and requirements to start the hiring process.",
                    icon: <FileText className="w-full h-full" />,
                    delay: "0"
                  },
                  {
                    number: 2,
                    title: "AI-Powered Question Generation",
                    description: "Our AI analyzes each resume and generates personalized interview questions, aligned with the role requirements and skills expected.",
                    icon: <Brain className="w-full h-full" />,
                    delay: "100"
                  },
                  {
                    number: 3,
                    title: "Interview Link Creation",
                    description: "Generate secure, one-click interview links and share them with candidates. No scheduling required — interviews happen on their time.",
                    icon: <LinkIcon className="w-full h-full" />,
                    delay: "200"
                  },
                  {
                    number: 4,
                    title: "Candidate Video Interview",
                    description: "Candidates complete an automated, AI-monitored video interview anytime, anywhere. Cheating detection ensures authenticity.",
                    icon: <Video className="w-full h-full" />,
                    delay: "300"
                  },
                  {
                    number: 5,
                    title: "AI Scoring & Report Generation",
                    description: "Our system scores candidates on communication, skill match, behavior, and confidence — with detailed reports delivered to your dashboard instantly.",
                    icon: <CheckCircle className="w-full h-full" />,
                    delay: "400"
                  },
                  {
                    number: 6,
                    title: "Final Review & Shortlisting",
                    description: "Access interview recordings, AI insights, and ranking charts. Shortlist top candidates or export the data to your ATS — all in a few clicks.",
                    icon: <ClipboardList className="w-full h-full" />,
                    delay: "500"
                  }
                ].map((step) => (
                  <div key={step.number} className="group relative animate-fade-up" style={{ animationDelay: `${step.delay}ms` }}>
                    <div className="relative z-10 rounded-2xl border border-[#229799]/20 bg-black/50 p-8 backdrop-blur-sm transition-all duration-300 hover:border-[#229799]/50 hover:bg-black/70 hover:scale-105">
                      <div className="mb-6 flex items-center justify-between">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#229799] text-3xl font-bold text-white">
                          {step.number}
                        </div>
                        <div className="h-12 w-12 text-[#229799] opacity-80 group-hover:opacity-100 transition-opacity">
                          {step.icon}
                        </div>
                      </div>
                      <h3 className="mb-4 text-2xl font-bold text-white group-hover:text-[#229799] transition-colors">
                        {step.title}
                      </h3>
                      <p className="text-lg text-gray-400 group-hover:text-gray-300 transition-colors">
                        {step.description}
                  </p>
                </div>
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#229799]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />
                  </div>
                ))}
              </div>

              {/* Bottom CTA */}
              <div className="mt-16 text-center animate-fade-up" style={{ animationDelay: "600ms" }}>
                <Button
                  size="lg"
                  className="bg-[#229799] text-white hover:bg-[#229799]/90 text-lg px-8 py-6 rounded-xl shadow-lg shadow-[#229799]/20 hover:shadow-[#229799]/40 transition-all duration-300 hover:scale-105"
                >
                  Start Your Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </section>


        {/* Jobs Portal Section */}
        <section id="jobs-portal" className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/90" />

          {/* Subtle grid background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#229799/10_1px,transparent_1px),linear-gradient(to_bottom,#229799/10_1px,transparent_1px)] bg-[size:24px_24px]" />

          <div className="container relative z-10 mx-auto">
            <div className="flex flex-col items-center justify-center space-y-8 text-center mb-16 animate-fade-up">
              <div className="space-y-4">
                <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#229799] to-white">
                  Explore Opportunities
                </h2>
                <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
                  Find your next career move with top companies worldwide
                  </p>
                </div>
            </div>

            {/* Job Carousel */}
            <JobCarousel />

            {/* Bottom CTA */}
            <div className="mt-16 text-center">
              <Button
                size="lg"
                className="bg-[#229799] text-white hover:bg-[#229799]/90 text-lg px-8 py-6 rounded-xl shadow-lg shadow-[#229799]/20 hover:shadow-[#229799]/40 transition-all duration-300 hover:scale-105"
              >
                View All Positions
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </section>


        {/* Pricing Section */}
        <section id="pricing" className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/90" />

          {/* Subtle grid background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#229799/10_1px,transparent_1px),linear-gradient(to_bottom,#229799/10_1px,transparent_1px)] bg-[size:24px_24px]" />

          <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-center space-y-8 text-center mb-16 animate-fade-up">
              <div className="space-y-4">
                <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#229799] to-white">
                  Pricing Plans
                </h2>
                <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
                  Choose the perfect plan for your hiring needs
                </p>
              </div>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 max-w-7xl mx-auto">
              {/* Free Plan */}
              <div className="relative group">
                <div className="relative z-10 rounded-2xl border border-[#229799]/20 bg-black/50 p-8 backdrop-blur-sm transition-all duration-300 hover:border-[#229799]/50 hover:bg-black/70">
                  <div className="mb-6 space-y-4">
                    <h3 className="text-2xl font-bold text-white">Free</h3>
                    <p className="text-sm text-gray-400">For small companies testing the platform</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold text-white">$0</span>
                      <span className="text-gray-400">/month</span>
                    </div>
                  </div>
                  <ul className="mb-8 space-y-4 text-sm">
                    <li className="flex items-center text-gray-300">
                      <CheckCircle className="mr-3 h-4 w-4 text-[#229799]" />
                      10 interviews/month
                    </li>
                    <li className="flex items-center text-gray-300">
                      <CheckCircle className="mr-3 h-4 w-4 text-[#229799]" />
                      10 min/interview
                    </li>
                    <li className="flex items-center text-gray-300">
                      <CheckCircle className="mr-3 h-4 w-4 text-[#229799]" />
                      7-day data retention
                    </li>
                    <li className="flex items-center text-gray-300">
                      <CheckCircle className="mr-3 h-4 w-4 text-[#229799]" />
                      Basic transcription
                    </li>
                    <li className="flex items-center text-gray-300">
                      <CheckCircle className="mr-3 h-4 w-4 text-[#229799]" />
                      Basic AI scoring
                    </li>
                    <li className="flex items-center text-gray-300">
                      <CheckCircle className="mr-3 h-4 w-4 text-[#229799]" />
                      Basic dashboard access
                    </li>
                  </ul>
                  <Button className="w-full bg-white text-[#229799] hover:bg-white/90">Get Started</Button>
                </div>
              </div>

              {/* Starter Plan */}
              <div className="relative group">
                <div className="relative z-10 rounded-2xl border border-[#229799]/20 bg-black/50 p-8 backdrop-blur-sm transition-all duration-300 hover:border-[#229799]/50 hover:bg-black/70">
                  <div className="mb-6 space-y-4">
                    <h3 className="text-2xl font-bold text-white">Starter</h3>
                    <p className="text-sm text-gray-400">For small-to-mid sized companies</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold text-white">$99</span>
                      <span className="text-gray-400">/month</span>
                    </div>
                  </div>
                  <ul className="mb-8 space-y-4 text-sm">
                    <li className="flex items-center text-gray-300">
                      <CheckCircle className="mr-3 h-4 w-4 text-[#229799]" />
                      500 interviews/month
                    </li>
                    <li className="flex items-center text-gray-300">
                      <CheckCircle className="mr-3 h-4 w-4 text-[#229799]" />
                      15 min/interview
                    </li>
                    <li className="flex items-center text-gray-300">
                      <CheckCircle className="mr-3 h-4 w-4 text-[#229799]" />
                      30-day data retention
                    </li>
                    <li className="flex items-center text-gray-300">
                      <CheckCircle className="mr-3 h-4 w-4 text-[#229799]" />
                      Enhanced Whisper transcription
                    </li>
                    <li className="flex items-center text-gray-300">
                      <CheckCircle className="mr-3 h-4 w-4 text-[#229799]" />
                      Advanced AI scoring
                    </li>
                    <li className="flex items-center text-gray-300">
                      <CheckCircle className="mr-3 h-4 w-4 text-[#229799]" />
                      Full dashboard access
                    </li>
                    <li className="flex items-center text-gray-300">
                      <CheckCircle className="mr-3 h-4 w-4 text-[#229799]" />
                      Email support
                    </li>
                  </ul>
                  <Button className="w-full bg-[#229799] text-white hover:bg-[#229799]/90">Get Started</Button>
                </div>
              </div>

              {/* Growth Plan */}
              <div className="relative group">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#229799] to-[#229799]/30 opacity-10 blur-xl transition-all duration-300 group-hover:opacity-20" />
                <div className="relative z-10 rounded-2xl border-2 border-[#229799] bg-black/50 p-8 backdrop-blur-sm transition-all duration-300 hover:bg-black/70">
                  <div className="absolute -top-5 left-0 right-0 mx-auto w-fit rounded-full bg-[#229799] px-4 py-1 text-sm font-medium text-white">
                    Popular
                  </div>
                  <div className="mb-6 space-y-4">
                    <h3 className="text-2xl font-bold text-white">Growth</h3>
                    <p className="text-sm text-gray-400">For mid-to-large sized companies</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold text-white">$249</span>
                      <span className="text-gray-400">/month</span>
                    </div>
                  </div>
                  <ul className="mb-8 space-y-4 text-sm">
                    <li className="flex items-center text-gray-300">
                      <CheckCircle className="mr-3 h-4 w-4 text-[#229799]" />
                      1,200 interviews/month
                    </li>
                    <li className="flex items-center text-gray-300">
                      <CheckCircle className="mr-3 h-4 w-4 text-[#229799]" />
                      15 min/interview
                    </li>
                    <li className="flex items-center text-gray-300">
                      <CheckCircle className="mr-3 h-4 w-4 text-[#229799]" />
                      90-day data retention
                    </li>
                    <li className="flex items-center text-gray-300">
                      <CheckCircle className="mr-3 h-4 w-4 text-[#229799]" />
                      Enhanced Whisper transcription
                    </li>
                    <li className="flex items-center text-gray-300">
                      <CheckCircle className="mr-3 h-4 w-4 text-[#229799]" />
                      Advanced scoring + insights
                    </li>
                    <li className="flex items-center text-gray-300">
                      <CheckCircle className="mr-3 h-4 w-4 text-[#229799]" />
                      Customizable dashboard
                    </li>
                    <li className="flex items-center text-gray-300">
                      <CheckCircle className="mr-3 h-4 w-4 text-[#229799]" />
                      Custom branding
                    </li>
                    <li className="flex items-center text-gray-300">
                      <CheckCircle className="mr-3 h-4 w-4 text-[#229799]" />
                      Priority support
                    </li>
                  </ul>
                  <Button className="w-full bg-[#229799] text-white hover:bg-[#229799]/90">Get Started</Button>
                </div>
              </div>

              {/* Enterprise Plan */}
              <div className="relative group">
                <div className="relative z-10 rounded-2xl border border-[#229799]/20 bg-black/50 p-8 backdrop-blur-sm transition-all duration-300 hover:border-[#229799]/50 hover:bg-black/70">
                  <div className="mb-6 space-y-4">
                    <h3 className="text-2xl font-bold text-white">Enterprise</h3>
                    <p className="text-sm text-gray-400">Custom solution for large organizations</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold text-white">Custom</span>
                    </div>
                  </div>
                  <ul className="mb-8 space-y-4 text-sm">
                    <li className="flex items-center text-gray-300">
                      <CheckCircle className="mr-3 h-4 w-4 text-[#229799]" />
                      Unlimited interviews
                    </li>
                    <li className="flex items-center text-gray-300">
                      <CheckCircle className="mr-3 h-4 w-4 text-[#229799]" />
                      Configurable duration
                    </li>
                    <li className="flex items-center text-gray-300">
                      <CheckCircle className="mr-3 h-4 w-4 text-[#229799]" />
                      Custom data retention
                    </li>
                    <li className="flex items-center text-gray-300">
                      <CheckCircle className="mr-3 h-4 w-4 text-[#229799]" />
                      Real-time Whisper transcription
                    </li>
                    <li className="flex items-center text-gray-300">
                      <CheckCircle className="mr-3 h-4 w-4 text-[#229799]" />
                      Custom AI scoring
                    </li>
                    <li className="flex items-center text-gray-300">
                      <CheckCircle className="mr-3 h-4 w-4 text-[#229799]" />
                      Full white-label solution
                    </li>
                    <li className="flex items-center text-gray-300">
                      <CheckCircle className="mr-3 h-4 w-4 text-[#229799]" />
                      Dedicated account manager
                    </li>
                    <li className="flex items-center text-gray-300">
                      <CheckCircle className="mr-3 h-4 w-4 text-[#229799]" />
                      Custom SLA
                    </li>
                  </ul>
                  <Button className="w-full bg-white text-[#229799] hover:bg-white/90">Contact Sales</Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative py-24 overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0 bg-[#229799]">
            {/* Animated gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40" />

            {/* Animated shapes */}
            <div className="absolute inset-0">
              <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000" />
            </div>

            {/* Grid pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#000/10_1px,transparent_1px),linear-gradient(to_bottom,#000/10_1px,transparent_1px)] bg-[size:24px_24px]" />
          </div>

          <div className="container relative">
            {/* Content */}
            <div className="max-w-6xl mx-auto">

              {/* Main CTA Content */}
              <div className="text-center space-y-8">
                <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight">
                  Ready to Transform Your
                  <br />
                  <span className="relative">
                    Hiring Process?
                    <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 400 20" xmlns="http://www.w3.org/2000/svg">
                      <path d="M 0 15 Q 200 0 400 15" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" />
                    </svg>
                  </span>
                </h2>

                <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed">
                  Join hundreds of companies saving time and finding better candidates with AI Interviewer
                </p>

                {/* CTA Buttons with Social Proof */}
                <div className="relative">
                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-xl mx-auto">
                    <Link href="/signup" className="w-full sm:w-auto">
                      <Button size="lg" className="w-full sm:w-auto bg-white text-[#229799] hover:bg-white/90 text-lg px-8 py-6 rounded-xl shadow-lg shadow-black/20 hover:shadow-black/40 transition-all duration-300 hover:scale-105">
                    Get Started Today
                        <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                    <Link href="/demo" className="w-full sm:w-auto">
                      <Button size="lg" className="w-full sm:w-auto bg-white text-[#229799] hover:bg-white/90 text-lg px-8 py-6 rounded-xl shadow-lg shadow-black/20 hover:shadow-black/40 transition-all duration-300 hover:scale-105">
                        Book Demo Now!
                        <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                  </div>

                  {/* Social Proof */}
                  <div className="mt-20 flex flex-col items-center space-y-4">
                    <div className="flex -space-x-4">
                      {[1, 2, 3, 4, 5].map((_, i) => (
                        <div
                          key={i}
                          className="w-12 h-12 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-[#229799] font-bold"
                        >
                          {String.fromCharCode(65 + i)}
                        </div>
                      ))}
                    </div>
                    <p className="text-white/90 text-sm">
                      Trusted by leading companies worldwide
                    </p>
                  </div>
                </div>

                {/* Features List */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-12">
                  {[
                    { icon: <Clock className="h-6 w-6" />, text: "Setup in 5 minutes" },
                    { icon: <CheckCircle className="h-6 w-6" />, text: "No credit card required" },
                    { icon: <Users className="h-6 w-6" />, text: "Team collaboration" }
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center justify-center gap-2 text-white/90">
                      {feature.icon}
                      <span>{feature.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
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
          <div className="flex flex-col gap-4 py-8 border-t border-[#229799]/20 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-6">
              <Link href="https://twitter.com" target="_blank" className="text-gray-400 hover:text-[#229799] transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
            </Link>
              <Link href="https://linkedin.com" target="_blank" className="text-gray-400 hover:text-[#229799] transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
            </Link>
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

