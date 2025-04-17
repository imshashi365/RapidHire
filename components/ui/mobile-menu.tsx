"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, LayoutDashboard, Users, Briefcase, Video, BarChart, MessageSquare, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

interface MobileMenuProps {
  isAuthenticated: boolean
  userRole?: string | null
  variant?: "main" | "dashboard"
}

export function MobileMenu({ isAuthenticated, userRole, variant = "main" }: MobileMenuProps) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  const dashboardMenuItems = (
    <>
      <Link
        href="/dashboard/company"
        className={cn(
          "flex items-center gap-2 rounded-lg px-3 py-2 text-gray-300 transition-all hover:text-[#229799]",
          isActive("/dashboard/company") && "bg-[#229799]/10 text-[#229799]"
        )}
        onClick={() => setOpen(false)}
      >
        <LayoutDashboard className="h-4 w-4" />
        Dashboard
      </Link>
      <Link
        href="/dashboard/company/candidates"
        className={cn(
          "flex items-center gap-2 rounded-lg px-3 py-2 text-gray-300 transition-all hover:text-[#229799]",
          isActive("/dashboard/company/candidates") && "bg-[#229799]/10 text-[#229799]"
        )}
        onClick={() => setOpen(false)}
      >
        <Users className="h-4 w-4" />
        Candidates
      </Link>
      <Link
        href="/dashboard/company/positions"
        className={cn(
          "flex items-center gap-2 rounded-lg px-3 py-2 text-gray-300 transition-all hover:text-[#229799]",
          isActive("/dashboard/company/positions") && "bg-[#229799]/10 text-[#229799]"
        )}
        onClick={() => setOpen(false)}
      >
        <Briefcase className="h-4 w-4" />
        Positions
      </Link>
      <Link
        href="/dashboard/company/interviews"
        className={cn(
          "flex items-center gap-2 rounded-lg px-3 py-2 text-gray-300 transition-all hover:text-[#229799]",
          isActive("/dashboard/company/interviews") && "bg-[#229799]/10 text-[#229799]"
        )}
        onClick={() => setOpen(false)}
      >
        <Video className="h-4 w-4" />
        Interviews
      </Link>
      <Link
        href="/dashboard/company/analytics"
        className={cn(
          "flex items-center gap-2 rounded-lg px-3 py-2 text-gray-300 transition-all hover:text-[#229799]",
          isActive("/dashboard/company/analytics") && "bg-[#229799]/10 text-[#229799]"
        )}
        onClick={() => setOpen(false)}
      >
        <BarChart className="h-4 w-4" />
        Analytics
      </Link>
      <Link
        href="/dashboard/company/feedback"
        className={cn(
          "flex items-center gap-2 rounded-lg px-3 py-2 text-gray-300 transition-all hover:text-[#229799]",
          isActive("/dashboard/company/feedback") && "bg-[#229799]/10 text-[#229799]"
        )}
        onClick={() => setOpen(false)}
      >
        <MessageSquare className="h-4 w-4" />
        Feedback
      </Link>
      <Link
        href="/dashboard/company/settings"
        className={cn(
          "flex items-center gap-2 rounded-lg px-3 py-2 text-gray-300 transition-all hover:text-[#229799]",
          isActive("/dashboard/company/settings") && "bg-[#229799]/10 text-[#229799]"
        )}
        onClick={() => setOpen(false)}
      >
        <Settings className="h-4 w-4" />
        Settings
      </Link>
    </>
  )

  const mainMenuItems = isAuthenticated ? (
    userRole === "company" ? (
      <>
        <Link
          href="/#features"
          className={cn(
            "flex items-center gap-2 rounded-lg px-3 py-2 text-gray-300 transition-all hover:text-[#229799]",
            isActive("/#features") && "bg-[#229799]/10 text-[#229799]"
          )}
          onClick={() => setOpen(false)}
        >
          Features
        </Link>
        <Link
          href="/#how-it-works"
          className={cn(
            "flex items-center gap-2 rounded-lg px-3 py-2 text-gray-300 transition-all hover:text-[#229799]",
            isActive("/#how-it-works") && "bg-[#229799]/10 text-[#229799]"
          )}
          onClick={() => setOpen(false)}
        >
          How It Works
        </Link>
        <Link
          href="/#jobs"
          className={cn(
            "flex items-center gap-2 rounded-lg px-3 py-2 text-gray-300 transition-all hover:text-[#229799]",
            isActive("/#jobs") && "bg-[#229799]/10 text-[#229799]"
          )}
          onClick={() => setOpen(false)}
        >
          Jobs Portal
        </Link>
        <Link
          href="/#pricing"
          className={cn(
            "flex items-center gap-2 rounded-lg px-3 py-2 text-gray-300 transition-all hover:text-[#229799]",
            isActive("/#pricing") && "bg-[#229799]/10 text-[#229799]"
          )}
          onClick={() => setOpen(false)}
        >
          Pricing
        </Link>
      </>
    ) : (
      <>
        <Link
          href="/#features"
          className={cn(
            "flex items-center gap-2 rounded-lg px-3 py-2 text-gray-300 transition-all hover:text-[#229799]",
            isActive("/#features") && "bg-[#229799]/10 text-[#229799]"
          )}
          onClick={() => setOpen(false)}
        >
          Features
        </Link>
        <Link
          href="/#how-it-works"
          className={cn(
            "flex items-center gap-2 rounded-lg px-3 py-2 text-gray-300 transition-all hover:text-[#229799]",
            isActive("/#how-it-works") && "bg-[#229799]/10 text-[#229799]"
          )}
          onClick={() => setOpen(false)}
        >
          How It Works
        </Link>
        <Link
          href="/#pricing"
          className={cn(
            "flex items-center gap-2 rounded-lg px-3 py-2 text-gray-300 transition-all hover:text-[#229799]",
            isActive("/#pricing") && "bg-[#229799]/10 text-[#229799]"
          )}
          onClick={() => setOpen(false)}
        >
          Pricing
        </Link>
      </>
    )
  ) : (
    <>
      <Link
        href="/#features"
        className="flex items-center gap-2 rounded-lg px-3 py-2 text-gray-300 transition-all hover:text-[#229799]"
        onClick={() => setOpen(false)}
      >
        Features
      </Link>
      <Link
        href="/#how-it-works"
        className="flex items-center gap-2 rounded-lg px-3 py-2 text-gray-300 transition-all hover:text-[#229799]"
        onClick={() => setOpen(false)}
      >
        How It Works
      </Link>
      <Link
        href="/#jobs"
        className="flex items-center gap-2 rounded-lg px-3 py-2 text-gray-300 transition-all hover:text-[#229799]"
        onClick={() => setOpen(false)}
      >
        Jobs Portal
      </Link>
      <Link
        href="/#pricing"
        className="flex items-center gap-2 rounded-lg px-3 py-2 text-gray-300 transition-all hover:text-[#229799]"
        onClick={() => setOpen(false)}
      >
        Pricing
      </Link>
    </>
  )

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="md:hidden px-0 text-white hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent 
        side="left" 
        className="w-72 bg-black/95 border-r border-[#229799]/20 p-0"
        title={variant === "dashboard" ? "Dashboard Navigation" : "Site Navigation"}
      >
        <div className="flex flex-col gap-4 py-4">
          <div className="px-4 py-2">
            <h2 className="text-lg font-semibold text-white">
              {variant === "dashboard" ? "Dashboard Menu" : "Menu"}
            </h2>
          </div>
          <nav className="flex flex-col gap-2 px-2">
            {variant === "dashboard" ? dashboardMenuItems : mainMenuItems}
          </nav>
          {!isAuthenticated && variant === "main" && (
            <div className="flex flex-col gap-2 px-4 mt-4">
              <Link href="/login">
                <Button variant="outline" className="w-full border-[#229799] text-[#229799] hover:bg-[#229799] hover:text-white">
                  Log In
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="w-full bg-[#229799] text-white hover:bg-[#229799]/90">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
} 