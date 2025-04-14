"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Search, Filter, Calendar, Clock, Video, Play, Download, MoreHorizontal } from "lucide-react"
import { CompanyDashboardHeader } from "@/components/company-dashboard-header"
import { CompanyDashboardSidebar } from "@/components/company-dashboard-sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Mock data
const mockInterviews = [
  {
    id: 1,
    candidate: {
      name: "John Smith",
      email: "john.smith@example.com",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    position: "Frontend Developer",
    score: 87,
    status: "Completed",
    date: "2025-04-05",
    time: "10:30 AM",
    duration: "14:25",
    questions: 5,
    feedback: "Strong technical skills, good communication.",
  },
  {
    id: 2,
    candidate: {
      name: "Emily Johnson",
      email: "emily.johnson@example.com",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    position: "UX Designer",
    score: 92,
    status: "Completed",
    date: "2025-04-04",
    time: "2:15 PM",
    duration: "15:10",
    questions: 5,
    feedback: "Excellent design thinking and problem-solving skills.",
  },
  {
    id: 3,
    candidate: {
      name: "Michael Brown",
      email: "michael.brown@example.com",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    position: "Backend Developer",
    score: 78,
    status: "Completed",
    date: "2025-04-03",
    time: "11:00 AM",
    duration: "13:45",
    questions: 5,
    feedback: "Good technical knowledge but could improve communication.",
  },
  {
    id: 4,
    candidate: {
      name: "Sarah Wilson",
      email: "sarah.wilson@example.com",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    position: "Product Manager",
    status: "Scheduled",
    date: "2025-04-10",
    time: "3:00 PM",
  },
  {
    id: 5,
    candidate: {
      name: "David Lee",
      email: "david.lee@example.com",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    position: "DevOps Engineer",
    status: "Invited",
    date: "2025-04-06",
    expiresIn: "3 days",
  },
  {
    id: 6,
    candidate: {
      name: "Jennifer Garcia",
      email: "jennifer.garcia@example.com",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    position: "Frontend Developer",
    score: 85,
    status: "Completed",
    date: "2025-04-02",
    time: "9:45 AM",
    duration: "14:50",
    questions: 5,
    feedback: "Good technical skills and communication.",
  },
  {
    id: 7,
    candidate: {
      name: "Robert Taylor",
      email: "robert.taylor@example.com",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    position: "Backend Developer",
    status: "Invited",
    date: "2025-04-08",
    expiresIn: "5 days",
  },
]

export default function InterviewsPage() {
  const [selectedInterview, setSelectedInterview] = useState<any>(null)
  const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false)

  const handleViewDetails = (interview: any) => {
    setSelectedInterview(interview)
    setIsViewDetailsOpen(true)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <CompanyDashboardHeader />

      <div className="flex flex-1">
        <CompanyDashboardSidebar />

        <main className="flex-1 p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Interviews</h1>
          </div>

          <Tabs defaultValue="all" className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">All Interviews</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
              <TabsTrigger value="invited">Invited</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input type="search" placeholder="Search interviews..." className="w-[300px] pl-8" />
                  </div>
                  <Button variant="outline" size="sm">
                    <Filter className="mr-2 h-4 w-4" />
                    Filter
                  </Button>
                </div>
              </div>

              <div className="rounded-md border">
                <div className="relative w-full overflow-auto">
                  <table className="w-full caption-bottom text-sm">
                    <thead>
                      <tr className="border-b bg-slate-50">
                        <th className="h-12 px-4 text-left font-medium">Candidate</th>
                        <th className="h-12 px-4 text-left font-medium">Position</th>
                        <th className="h-12 px-4 text-left font-medium">Status</th>
                        <th className="h-12 px-4 text-left font-medium">Date & Time</th>
                        <th className="h-12 px-4 text-left font-medium">Score</th>
                        <th className="h-12 px-4 text-left font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockInterviews.map((interview) => (
                        <tr key={interview.id} className="border-b">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarImage src={interview.candidate.avatar} alt={interview.candidate.name} />
                                <AvatarFallback>{interview.candidate.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{interview.candidate.name}</p>
                                <p className="text-sm text-gray-500">{interview.candidate.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">{interview.position}</td>
                          <td className="p-4">
                            <Badge
                              variant={
                                interview.status === "Completed"
                                  ? "success"
                                  : interview.status === "Scheduled"
                                    ? "outline"
                                    : "secondary"
                              }
                            >
                              {interview.status}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <div className="flex flex-col">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3 text-gray-500" />
                                <span>{interview.date}</span>
                              </div>
                              {interview.time && (
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3 text-gray-500" />
                                  <span>{interview.time}</span>
                                </div>
                              )}
                              {interview.expiresIn && (
                                <div className="text-sm text-amber-600">Expires in {interview.expiresIn}</div>
                              )}
                            </div>
                          </td>
                          <td className="p-4">
                            {interview.score ? (
                              <span className="font-medium">{interview.score}/100</span>
                            ) : (
                              <span className="text-gray-500">—</span>
                            )}
                          </td>
                          <td className="p-4">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleViewDetails(interview)}>
                                  View Details
                                </DropdownMenuItem>
                                {interview.status === "Completed" && (
                                  <DropdownMenuItem>
                                    <Video className="mr-2 h-4 w-4" />
                                    Watch Interview
                                  </DropdownMenuItem>
                                )}
                                {interview.status === "Invited" && (
                                  <DropdownMenuItem>Resend Invitation</DropdownMenuItem>
                                )}
                                <DropdownMenuItem>Contact Candidate</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="completed" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {mockInterviews
                  .filter((interview) => interview.status === "Completed")
                  .map((interview) => (
                    <Card key={interview.id} className="overflow-hidden">
                      <CardContent className="p-0">
                        <div className="relative">
                          <div className="bg-slate-100 h-32 flex items-center justify-center">
                            <Video className="h-10 w-10 text-gray-400" />
                          </div>
                          <Button
                            size="icon"
                            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full h-12 w-12"
                          >
                            <Play className="h-5 w-5" />
                          </Button>
                          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                            {interview.duration}
                          </div>
                        </div>

                        <div className="p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <Avatar>
                              <AvatarImage src={interview.candidate.avatar} alt={interview.candidate.name} />
                              <AvatarFallback>{interview.candidate.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{interview.candidate.name}</p>
                              <p className="text-sm text-gray-500">{interview.position}</p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between mb-2">
                            <Badge variant="success">Completed</Badge>
                            <span className="font-medium">{interview.score}/100</span>
                          </div>

                          <p className="text-sm text-gray-500 line-clamp-2 mb-3">{interview.feedback}</p>

                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{interview.date}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{interview.time}</span>
                            </div>
                          </div>
                        </div>

                        <div className="border-t p-3 bg-slate-50 flex justify-between items-center">
                          <Button size="sm" variant="outline">
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </Button>
                          <Button size="sm" onClick={() => handleViewDetails(interview)}>
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="scheduled" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {mockInterviews
                  .filter((interview) => interview.status === "Scheduled")
                  .map((interview) => (
                    <Card key={interview.id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <Avatar>
                            <AvatarImage src={interview.candidate.avatar} alt={interview.candidate.name} />
                            <AvatarFallback>{interview.candidate.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{interview.candidate.name}</p>
                            <p className="text-sm text-gray-500">{interview.position}</p>
                          </div>
                        </div>

                        <div className="mb-4">
                          <Badge variant="outline">Scheduled</Badge>
                        </div>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span>{interview.date}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <span>{interview.time}</span>
                          </div>
                        </div>

                        <div className="flex justify-between">
                          <Button size="sm" variant="outline">
                            Reschedule
                          </Button>
                          <Button size="sm">Send Reminder</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="invited" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {mockInterviews
                  .filter((interview) => interview.status === "Invited")
                  .map((interview) => (
                    <Card key={interview.id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <Avatar>
                            <AvatarImage src={interview.candidate.avatar} alt={interview.candidate.name} />
                            <AvatarFallback>{interview.candidate.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{interview.candidate.name}</p>
                            <p className="text-sm text-gray-500">{interview.position}</p>
                          </div>
                        </div>

                        <div className="mb-4">
                          <Badge variant="secondary">Invited</Badge>
                        </div>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span>Invited on {interview.date}</span>
                          </div>
                          <div className="text-amber-600 text-sm">Expires in {interview.expiresIn}</div>
                        </div>

                        <div className="flex justify-between">
                          <Button size="sm" variant="outline">
                            Cancel Invitation
                          </Button>
                          <Button size="sm">Resend Invitation</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>

      {/* View Interview Details Dialog */}
      <Dialog open={isViewDetailsOpen} onOpenChange={setIsViewDetailsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          {selectedInterview && (
            <>
              <DialogHeader>
                <DialogTitle>Interview Details</DialogTitle>
                <DialogDescription>
                  {selectedInterview.candidate.name} • {selectedInterview.position}
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <div className="flex items-center gap-4 mb-6">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={selectedInterview.candidate.avatar} alt={selectedInterview.candidate.name} />
                    <AvatarFallback>{selectedInterview.candidate.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-bold">{selectedInterview.candidate.name}</h3>
                    <p className="text-gray-500">{selectedInterview.candidate.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant={
                          selectedInterview.status === "Completed"
                            ? "success"
                            : selectedInterview.status === "Scheduled"
                              ? "outline"
                              : "secondary"
                        }
                      >
                        {selectedInterview.status}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 mb-6">
                  <div>
                    <h4 className="font-medium mb-2">Interview Details</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span>{selectedInterview.date}</span>
                      </div>
                      {selectedInterview.time && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span>{selectedInterview.time}</span>
                        </div>
                      )}
                      {selectedInterview.duration && (
                        <div className="flex items-center gap-2">
                          <Video className="h-4 w-4 text-gray-500" />
                          <span>Duration: {selectedInterview.duration}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedInterview.status === "Completed" && (
                    <div>
                      <h4 className="font-medium mb-2">Performance</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span>Overall Score</span>
                          <span className="font-medium">{selectedInterview.score}/100</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Questions Answered</span>
                          <span>{selectedInterview.questions}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {selectedInterview.status === "Completed" && (
                  <div className="space-y-4">
                    <h4 className="font-medium">Feedback</h4>
                    <p className="text-gray-700">{selectedInterview.feedback}</p>

                    <div className="rounded-lg border overflow-hidden">
                      <div className="relative bg-slate-100 h-48 flex items-center justify-center">
                        <Video className="h-12 w-12 text-gray-400" />
                        <Button
                          size="icon"
                          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full h-14 w-14"
                        >
                          <Play className="h-6 w-6" />
                        </Button>
                        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                          {selectedInterview.duration}
                        </div>
                      </div>
                      <div className="p-3 bg-white border-t flex justify-between items-center">
                        <span className="text-sm text-gray-500">Interview Recording</span>
                        <Button size="sm" variant="outline">
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {selectedInterview.status === "Invited" && (
                  <div className="space-y-4">
                    <h4 className="font-medium">Invitation Status</h4>
                    <div className="rounded-lg border p-4 bg-amber-50 text-amber-800">
                      <p>
                        Invitation sent on {selectedInterview.date}. Expires in {selectedInterview.expiresIn}.
                      </p>
                    </div>
                    <Button className="w-full">Resend Invitation</Button>
                  </div>
                )}

                {selectedInterview.status === "Scheduled" && (
                  <div className="space-y-4">
                    <h4 className="font-medium">Scheduled Interview</h4>
                    <div className="rounded-lg border p-4 bg-blue-50 text-blue-800">
                      <p>
                        Interview scheduled for {selectedInterview.date} at {selectedInterview.time}.
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1">
                        Reschedule
                      </Button>
                      <Button className="flex-1">Send Reminder</Button>
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsViewDetailsOpen(false)}>
                  Close
                </Button>
                {selectedInterview.status === "Completed" && <Button>View Full Report</Button>}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

