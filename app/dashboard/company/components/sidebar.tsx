"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Video, 
  BarChart2, 
  MessageSquare,
  Settings
} from "lucide-react"

const sidebarLinks = [
  {
    title: "Dashboard",
    href: "/dashboard/company",
    icon: LayoutDashboard
  },
  {
    title: "Candidates",
    href: "/dashboard/company/candidates",
    icon: Users
  },
  {
    title: "Positions",
    href: "/dashboard/company/positions",
    icon: FileText
  },
  {
    title: "Interviews",
    href: "/dashboard/company/interviews",
    icon: Video
  },
  {
    title: "Analytics",
    href: "/dashboard/company/analytics",
    icon: BarChart2
  },
  {
    title: "Feedback",
    href: "/dashboard/company/feedback",
    icon: MessageSquare
  },
  {
    title: "Settings",
    href: "/dashboard/company/settings",
    icon: Settings
  }
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="h-screen w-64 bg-black border-r border-gray-800">
      <div className="flex flex-col gap-2 p-4">
        <div className="px-3 py-2">
          <h2 className="text-xl font-bold text-white">Company Dashboard</h2>
        </div>
        <nav className="space-y-1">
          {sidebarLinks.map((link) => {
            const isActive = pathname === link.href
            const Icon = link.icon
            
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`sidebar-link ${isActive ? 'active' : ''}`}
              >
                <Icon className="h-5 w-5" />
                <span>{link.title}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
} 