"use client"

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
import { ChevronDown, LogOut, Settings } from "lucide-react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { ThemeToggle } from "@/components/theme-toggle"
import Link from "next/link"
import Image from "next/image"
import { Menu } from "lucide-react"

export function CandidateDashboardHeader() {
  const { data: session, status } = useSession();
  const router = useRouter()

  // Handle logout
  const handleLogout = async () => {
    await signOut({ redirect: false })
    router.push('/login')
  }

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      ?.split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase() || 'U'
  }

  // Loading state
  if (status === "loading") {
    return (
      <header className="flex h-14 items-center gap-4 border-b bg-gray-100/40 px-6 dark:bg-gray-800/40">
        <div className="flex flex-1 items-center gap-4">
          <h1 className="text-lg font-semibold">Loading...</h1>
        </div>
      </header>
    )
  }

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-black px-6">
      <div className="flex flex-1 items-center gap-4">
        <h1 className="text-lg font-semibold text-white">Candidate Dashboard</h1>
      </div>
      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage 
                  src={session?.user?.image || "/placeholder.svg?height=32&width=32"} 
                  alt={session?.user?.name || "User"} 
                />
                <AvatarFallback>{getInitials(session?.user?.name || "User")}</AvatarFallback>
              </Avatar>
              <div className="flex items-center gap-1">
                <span className="text-sm font-medium text-white">
                  {session?.user?.name || "Guest User"}
                </span>
                <ChevronDown className="h-4 w-4 text-white" />
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/dashboard/candidate/settings')}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <ThemeToggle />
      </div>
    </header>
  )
}

