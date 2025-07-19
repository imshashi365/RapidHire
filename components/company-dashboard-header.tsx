"use client"

import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bell, LogOut, User, Settings, CreditCard, Menu } from "lucide-react"
import { signOut, useSession } from "next-auth/react"
import { toast } from "sonner"
import { ThemeToggle } from "@/components/theme-toggle"

export function CompanyDashboardHeader() {
  const router = useRouter()
  const { data: session } = useSession()

  const handleLogout = async () => {
    try {
      await signOut({ redirect: false })
      toast.success("Logged out successfully")
      router.push("/login")
    } catch (error) {
      toast.error("Failed to logout. Please try again.")
      console.error("Logout error:", error)
    }
  }

  // Get user initials for avatar fallback
  const getInitials = (name?: string | null) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
  }

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-white dark:bg-black/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-black/60 border-gray-200 dark:border-[#229799]/20 px-6">
      <div className="flex flex-1 items-center gap-4">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/RapidHirelogo.png" alt="AI Interviewer" width={122} height={72} priority />
        </Link>
      </div>
      <div className="flex items-center gap-4">
      <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5 text-gray-300" />
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#229799] text-[10px] font-medium text-white">
                2
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[300px]">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium">New application received</p>
                <p className="text-xs text-gray-500">John Smith applied for Frontend Developer position</p>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium">Interview completed</p>
                <p className="text-xs text-gray-500">Emily Johnson completed the interview for UX Designer position</p>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src={session?.user?.image || "/placeholder-user.jpg"} alt={session?.user?.name || "User"} />
                <AvatarFallback>{getInitials(session?.user?.name)}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/dashboard/company/profile")} className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/dashboard/company/settings")} className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/dashboard/company/billing")} className="cursor-pointer">
              <CreditCard className="mr-2 h-4 w-4" />
              Billing
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-500 cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      
      </div>
    </header>
  )
}

