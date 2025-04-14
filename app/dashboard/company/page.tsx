"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import {
  BarChart,
  FileText,
  Plus,
  Search,
  Upload,
  Users,
  Video,
  Filter,
  ArrowUpDown,
  MoreHorizontal,
} from "lucide-react"
import { CompanyDashboardHeader } from "@/components/company-dashboard-header"
import { CompanyDashboardSidebar } from "@/components/company-dashboard-sidebar"

// Mock data
const mockCandidates = [
  {
    id: 1,
    name: "John Smith",
    position: "Frontend Developer",
    score: 87,
    status: "Completed",
    date: "2025-04-05",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 2,
    name: "Emily Johnson",
    position: "UX Designer",
    score: 92,
    status: "Completed",
    date: "2025-04-04",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 3,
    name: "Michael Brown",
    position: "Backend Developer",
    score: 78,
    status: "Completed",
    date: "2025-04-03",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 4,
    name: "Sarah Wilson",
    position: "Product Manager",
    score: 0,
    status: "Pending",
    date: "2025-04-07",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 5,
    name: "David Lee",
    position: "DevOps Engineer",
    score: 0,
    status: "Invited",
    date: "2025-04-06",
    avatar: "/placeholder.svg?height=40&width=40",
  },
]

const mockPositions = [
  {
    id: 1,
    title: "Frontend Developer",
    department: "Engineering",
    candidates: 12,
    active: true,
  },
  {
    id: 2,
    title: "UX Designer",
    department: "Design",
    candidates: 8,
    active: true,
  },
  {
    id: 3,
    title: "Backend Developer",
    department: "Engineering",
    candidates: 15,
    active: true,
  },
  {
    id: 4,
    title: "Product Manager",
    department: "Product",
    candidates: 6,
    active: true,
  },
]

export default function CompanyDashboard() {
  const [isCreatePositionOpen, setIsCreatePositionOpen] = useState(false)
  const [isUploadResumeOpen, setIsUploadResumeOpen] = useState(false)

  return (
    <div className="flex min-h-screen flex-col">
      <CompanyDashboardHeader />

      <div className="flex flex-1">
        <CompanyDashboardSidebar />

        <main className="flex-1 p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Company Dashboard</h1>
            <div className="flex items-center gap-2">
              <Button onClick={() => setIsCreatePositionOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                New Position
              </Button>
              <Button variant="outline" onClick={() => setIsUploadResumeOpen(true)}>
                <Upload className="mr-2 h-4 w-4" />
                Upload Resume
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Candidates</p>
                    <h3 className="text-2xl font-bold">42</h3>
                  </div>
                  <div className="rounded-full bg-primary/10 p-3">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Active Positions</p>
                    <h3 className="text-2xl font-bold">8</h3>
                  </div>
                  <div className="rounded-full bg-primary/10 p-3">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Completed Interviews</p>
                    <h3 className="text-2xl font-bold">27</h3>
                  </div>
                  <div className="rounded-full bg-primary/10 p-3">
                    <Video className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Avg. Score</p>
                    <h3 className="text-2xl font-bold">84.2</h3>
                  </div>
                  <div className="rounded-full bg-primary/10 p-3">
                    <BarChart className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="candidates" className="space-y-4">
            <TabsList>
              <TabsTrigger value="candidates">Candidates</TabsTrigger>
              <TabsTrigger value="positions">Positions</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="candidates" className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input type="search" placeholder="Search candidates..." className="w-[300px] pl-8" />
                  </div>
                  <Button variant="outline" size="sm">
                    <Filter className="mr-2 h-4 w-4" />
                    Filter
                  </Button>
                </div>
                <Button variant="outline" size="sm">
                  <ArrowUpDown className="mr-2 h-4 w-4" />
                  Sort
                </Button>
              </div>

              <div className="rounded-md border">
                <div className="relative w-full overflow-auto">
                  <table className="w-full caption-bottom text-sm">
                    <thead>
                      <tr className="border-b bg-slate-50">
                        <th className="h-12 px-4 text-left font-medium">Candidate</th>
                        <th className="h-12 px-4 text-left font-medium">Position</th>
                        <th className="h-12 px-4 text-left font-medium">Score</th>
                        <th className="h-12 px-4 text-left font-medium">Status</th>
                        <th className="h-12 px-4 text-left font-medium">Date</th>
                        <th className="h-12 px-4 text-left font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockCandidates.map((candidate) => (
                        <tr key={candidate.id} className="border-b">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarImage src={candidate.avatar} alt={candidate.name} />
                                <AvatarFallback>{candidate.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{candidate.name}</p>
                                <p className="text-sm text-gray-500">candidate{candidate.id}@example.com</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">{candidate.position}</td>
                          <td className="p-4">
                            {candidate.status === "Completed" ? (
                              <div className="flex flex-col gap-1">
                                <span className="font-medium">{candidate.score}/100</span>
                                <Progress value={candidate.score} className="h-2 w-20" />
                              </div>
                            ) : (
                              <span className="text-gray-500">—</span>
                            )}
                          </td>
                          <td className="p-4">
                            <Badge
                              variant={
                                candidate.status === "Completed"
                                  ? "success"
                                  : candidate.status === "Pending"
                                    ? "outline"
                                    : "secondary"
                              }
                            >
                              {candidate.status}
                            </Badge>
                          </td>
                          <td className="p-4">{candidate.date}</td>
                          <td className="p-4">
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="positions" className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input type="search" placeholder="Search positions..." className="w-[300px] pl-8" />
                  </div>
                  <Button variant="outline" size="sm">
                    <Filter className="mr-2 h-4 w-4" />
                    Filter
                  </Button>
                </div>
                <Button onClick={() => setIsCreatePositionOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  New Position
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {mockPositions.map((position) => (
                  <Card key={position.id}>
                    <CardHeader className="pb-2">
                      <CardTitle>{position.title}</CardTitle>
                      <CardDescription>{position.department}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">{position.candidates} candidates</span>
                        </div>
                        <Badge variant={position.active ? "default" : "outline"}>
                          {position.active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                      <Button size="sm">Manage</Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Interview Analytics</CardTitle>
                  <CardDescription>Overview of your interview performance and candidate metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] flex items-center justify-center border rounded-md bg-slate-50">
                    <p className="text-gray-500">Analytics dashboard will appear here</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>

      {/* Create Position Dialog */}
      <Dialog open={isCreatePositionOpen} onOpenChange={setIsCreatePositionOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Position</DialogTitle>
            <DialogDescription>Add a new position to start interviewing candidates</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="position-title">Position Title</Label>
              <Input id="position-title" placeholder="e.g. Frontend Developer" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input id="department" placeholder="e.g. Engineering" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Job Description</Label>
              <Textarea id="description" placeholder="Enter job description..." className="min-h-[100px]" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="questions">Interview Questions</Label>
              <Textarea
                id="questions"
                placeholder="Enter interview questions (one per line)..."
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreatePositionOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsCreatePositionOpen(false)}>Create Position</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload Resume Dialog */}
      <Dialog open={isUploadResumeOpen} onOpenChange={setIsUploadResumeOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Upload Candidate Resume</DialogTitle>
            <DialogDescription>Upload a resume to analyze and create an interview</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="candidate-name">Candidate Name</Label>
              <Input id="candidate-name" placeholder="e.g. John Smith" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="candidate-email">Candidate Email</Label>
              <Input id="candidate-email" type="email" placeholder="e.g. john@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="position">Position</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                <option value="">Select a position</option>
                {mockPositions.map((position) => (
                  <option key={position.id} value={position.id}>
                    {position.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Resume</Label>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-3 text-gray-500" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">PDF, DOCX (MAX. 5MB)</p>
                  </div>
                  <input type="file" className="hidden" />
                </label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUploadResumeOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsUploadResumeOpen(false)}>Upload & Analyze</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

