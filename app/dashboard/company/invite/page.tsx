"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Search, Loader2, Share2, Power } from "lucide-react"
import { CompanyDashboardHeader } from "@/components/company-dashboard-header"
import { CompanyDashboardSidebar } from "@/components/company-dashboard-sidebar"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface PublicInterview {
  _id: string
  title: string
  position: {
    _id: string
    title: string
    companyName: string
    department: string
  }
  status: string
  token: string
  isPublic: boolean
  views: number
  attempts: number
  maxAttempts: number
  createdAt: string
  candidateEmail?: string
  score?: number
}

export default function InvitePage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [interviews, setInterviews] = useState<PublicInterview[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchInput, setSearchInput] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedInterview, setSelectedInterview] = useState<PublicInterview | null>(null)
  const [showCopyDialog, setShowCopyDialog] = useState(false)

  useEffect(() => {
    fetchPublicInterviews()
  }, [])

  const fetchPublicInterviews = async () => {
    try {
      const response = await fetch("/api/interviews/public")
      if (!response.ok) {
        throw new Error("Failed to fetch public interviews")
      }
      const data = await response.json()
      setInterviews(data)
    } catch (error) {
      setError("Failed to load public interviews")
      console.error("Error fetching public interviews:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCopyLink = async (interview: PublicInterview) => {
    setSelectedInterview(interview)
    setShowCopyDialog(true)
  }

  const copyToClipboard = async () => {
    if (!selectedInterview) return

    const interviewLink = `${window.location.origin}/interview/public/${selectedInterview.token}`
    
    try {
      await navigator.clipboard.writeText(interviewLink)
      toast.success("Interview link copied to clipboard!")
      setShowCopyDialog(false)
    } catch (err) {
      toast.error("Failed to copy link")
      console.error("Error copying to clipboard:", err)
    }
  }

  const handleToggleStatus = async (interview: PublicInterview) => {
    try {
      const newStatus = interview.status === 'active' ? 'disabled' : 'active'
      
      const response = await fetch(`/api/interviews/public/${interview._id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (!response.ok) {
        throw new Error('Failed to update status')
      }

      toast.success(`Interview ${newStatus === 'active' ? 'activated' : 'disabled'} successfully`)
      fetchPublicInterviews() // Refresh the list
    } catch (error) {
      toast.error('Failed to update interview status')
      console.error('Error updating status:', error)
    }
  }

  const filteredInterviews = interviews.filter((interview) => {
    const positionTitle = interview.position?.title || "";
    const companyName = interview.position?.companyName || "";
    const department = interview.position?.department || "";

    const matchesSearch = 
      positionTitle.toLowerCase().includes(searchInput.toLowerCase()) ||
      companyName.toLowerCase().includes(searchInput.toLowerCase()) ||
      department.toLowerCase().includes(searchInput.toLowerCase());

    const matchesStatus = statusFilter === "all" || interview.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'default'
      case 'disabled':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <CompanyDashboardHeader />
        <div className="flex flex-1">
          <CompanyDashboardSidebar />
          <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-64px)]">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return <div className="text-red-500">{error}</div>
  }

  return (
    <div className="flex min-h-screen flex-col">
      <CompanyDashboardHeader />
      <div className="flex flex-1">
        <CompanyDashboardSidebar />
        <div className="flex-1 p-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Invite Candidates</h1>
            <div className="flex items-center gap-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="disabled">Disabled</SelectItem>
                </SelectContent>
              </Select>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search interviews"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </div>

          <div className="rounded-md border">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="p-4 text-left">Candidate Email</th>
                  <th className="p-4 text-left">Position</th>
                  <th className="p-4 text-left">Status</th>
                  <th className="p-4 text-left">Date</th>
                  <th className="p-4 text-left">Score</th>
                  <th className="p-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInterviews.map((interview) => (
                  <tr key={interview._id} className="border-b">
                    <td className="p-4">{interview.candidateEmail || "Not Started"}</td>
                    <td className="p-4">{interview.position.title}</td>
                    <td className="p-4">
                      <Badge
                        variant={getStatusBadgeVariant(interview.status)}
                      >
                        {interview.status}
                      </Badge>
                    </td>
                    <td className="p-4">{interview.createdAt ? new Date(interview.createdAt).toLocaleDateString() : "-"}</td>
                    <td className="p-4">{interview.score || "-"}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleStatus(interview)}
                          className="h-8 w-8 p-0"
                        >
                          <Power className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopyLink(interview)}
                          className="h-8 w-8 p-0"
                          disabled={interview.status === 'disabled'}
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Dialog open={showCopyDialog} onOpenChange={setShowCopyDialog}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Share Interview Link</DialogTitle>
              </DialogHeader>
              {selectedInterview ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Interview Details</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Position</span>
                        <span>{selectedInterview.position.title}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Department</span>
                        <span>{selectedInterview.position.department}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Company</span>
                        <span>{selectedInterview.position.companyName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Status</span>
                        <Badge variant={getStatusBadgeVariant(selectedInterview.status)}>
                          {selectedInterview.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Button 
                    onClick={copyToClipboard}
                    className="w-full flex items-center justify-center gap-2"
                  >
                    <Share2 className="h-4 w-4" />
                    Copy Interview Link
                  </Button>
                </div>
              ) : (
                <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                  No interview selected
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  )
}