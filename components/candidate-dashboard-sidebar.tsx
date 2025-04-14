"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, FileText, Video, Settings, User, MessageSquare } from "lucide-react"

export function CandidateDashboardSidebar() {
  const pathname = usePathname()

  const navItems = [
    {
      title: "Dashboard",
      href: "/dashboard/candidate",
      icon: LayoutDashboard,
    },
    {
      title: "My Interviews",
      href: "/dashboard/candidate/interviews",
      icon: Video,
    },
    {
      title: "My Profile",
      href: "/dashboard/candidate/profile",
      icon: User,
    },
    {
      title: "Resume",
      href: "/dashboard/candidate/resume",
      icon: FileText,
    },
    {
      title: "Feedback",
      href: "/dashboard/candidate/feedback",
      icon: MessageSquare,
    },
    {
      title: "Settings",
      href: "/dashboard/candidate/settings",
      icon: Settings,
    },
  ]

  return (
    <aside className="hidden md:flex w-64 flex-col border-r bg-slate-50">
      <div className="flex flex-col gap-2 p-4">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium",
              pathname === item.href ? "bg-primary text-primary-foreground" : "hover:bg-slate-100",
            )}
          >
            <item.icon className="h-5 w-5" />
            {item.title}
          </Link>
        ))}
      </div>
    </aside>
  )
}

