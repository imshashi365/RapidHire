"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Users, FileText, BarChart, Settings, Video, MessageSquare } from "lucide-react"

export function CompanyDashboardSidebar() {
  const pathname = usePathname()

  const navItems = [
    {
      title: "Dashboard",
      href: "/dashboard/company",
      icon: LayoutDashboard,
    },
    {
      title: "Candidates",
      href: "/dashboard/company/candidates",
      icon: Users,
    },
    {
      title: "Positions",
      href: "/dashboard/company/positions",
      icon: FileText,
    },
    {
      title: "Interviews",
      href: "/dashboard/company/interviews",
      icon: Video,
    },
    {
      title: "Analytics",
      href: "/dashboard/company/analytics",
      icon: BarChart,
    },
    {
      title: "Feedback",
      href: "/dashboard/company/feedback",
      icon: MessageSquare,
    },
    {
      title: "Settings",
      href: "/dashboard/company/settings",
      icon: Settings,
    },
  ]

  return (
    <aside className="hidden md:flex w-64 flex-col border-r bg-slate-50 bg-zinc-900">
      <div className="flex flex-col gap-2 p-4 bg-zinc-900">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium",
              pathname === item.href ? "bg-primary text-primary-foreground" : "hover:bg-[#044d4f]",
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

