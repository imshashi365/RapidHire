"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, CheckCircle, AlertCircle, ChevronRight } from "lucide-react"
import { CandidateDashboardHeader } from "@/components/candidate-dashboard-header"
import { CandidateDashboardSidebar } from "@/components/candidate-dashboard-sidebar"
import { useState } from "react"

const[time,setTIme]=useState("");


const mockInterviews = [
  {
    id: 1,
    company: "TechCorp Inc.",
    position: "Frontend Developer",
    status: "Completed",
    score: 87,
    date: "April 3, 2025",
    feedback: "Strong technical skills, good communication.",
  },
  {
    id: 2,
    company: "Design Studio",
    position: "UX Designer",
    status: "Scheduled",
    date: "April 10, 2025",
    time: "2:00 PM",
  },
  {
    id: 3,
    company: "Innovate Labs",
    position: "Product Manager",
    status: "Invited",
    expiresIn: "3 days",
  },
]

export default function CandidateDashboard() {
  return (
    <div className="flex min-h-screen flex-col">


      <div className="flex justify-around">
        <div className="bg-red">Div 1</div>
        <div className="bg-blue">Div 2</div>
        <div className="bg-yellow-50">Div 3</div>
      </div>
      <CandidateDashboardHeader />

      <div className="flex flex-1">
        <CandidateDashboardSidebar />

        <main className="flex-1 p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Dashboard</h1>
          </div>

          <div className="mb-6">
            <h1 className="text-2xl font-bold">Candidate Dashboard</h1>
            <p className="text-gray-500">Manage your interviews and track your applications</p>
          </div>

          {/* Active Interview Alert */}
          {mockInterviews.some((interview) => interview.status === "Invited") && (
            <div className="mb-6 rounded-lg border bg-primary/10 p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-primary" />
                <div className="flex-1">
                  <h3 className="font-medium">You have a pending interview invitation</h3>
                  <p className="text-sm text-gray-500">Complete your interview for Innovate Labs within 3 days</p>
                </div>
                <Button><a href="#">Start Interview</a> </Button>
                {/* <Button><a href="http://localhost:3000/dashboard/candidate/interview/start">Start Interview</a> </Button> */}
              </div>
            </div>
          )}

          <Tabs defaultValue="upcoming" className="space-y-4">
            <TabsList>
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="all">All Interviews</TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="space-y-4">
              {mockInterviews
                .filter((interview) => ["Invited", "Scheduled"].includes(interview.status))
                .map((interview) => (
                  <Card key={interview.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>{interview.position}</CardTitle>
                          <CardDescription>{interview.company}</CardDescription>
                        </div>
                        <Badge
                          variant={
                            interview.status === "Invited"
                              ? "secondary"
                              : interview.status === "Scheduled"
                                ? "outline"
                                : "default"
                          }
                        >
                          {interview.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {interview.status === "Invited" && (
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <span>Expires in {interview.expiresIn}</span>
                          </div>
                        )}
                        {interview.status === "Scheduled" && (
                          <>
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="h-4 w-4 text-gray-500" />
                              <span>{interview.date}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Clock className="h-4 w-4 text-gray-500" />
                              <span>{interview.time}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter>
                      {interview.status === "Invited" ? (
                        <Button className="w-full">Start Interview</Button>
                      ) : (
                        <Button className="w-full">Join at Scheduled Time</Button>
                      )}
                    </CardFooter>
                  </Card>
                ))}

              {mockInterviews.filter((interview) => ["Invited", "Scheduled"].includes(interview.status)).length ===
                0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="rounded-full bg-primary/10 p-4 mb-4">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No Upcoming Interviews</h3>
                  <p className="text-gray-500 max-w-md">
                    You don't have any upcoming interviews scheduled. Check back later or contact the hiring company.
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="completed" className="space-y-4">
              {mockInterviews
                .filter((interview) => interview.status === "Completed")
                .map((interview) => (
                  <Card key={interview.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>{interview.position}</CardTitle>
                          <CardDescription>{interview.company}</CardDescription>
                        </div>
                        <Badge variant="success">Completed</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span>Completed on {interview.date}</span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Overall Score</span>
                            <span className="text-sm font-medium">{interview.score}/100</span>
                          </div>
                          <Progress value={interview.score} className="h-2" />
                        </div>
                        <div className="space-y-1">
                          <span className="text-sm font-medium">Feedback</span>
                          <p className="text-sm text-gray-500">{interview.feedback}</p>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full">
                        View Detailed Results
                      </Button>
                    </CardFooter>
                  </Card>
                ))}

              {mockInterviews.filter((interview) => interview.status === "Completed").length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="rounded-full bg-primary/10 p-4 mb-4">
                    <CheckCircle className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No Completed Interviews</h3>
                  <p className="text-gray-500 max-w-md">
                    You haven't completed any interviews yet. Once you complete an interview, you'll see your results
                    here.
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="all" className="space-y-4">
              <div className="rounded-md border">
                <div className="relative w-full overflow-auto">
                  <table className="w-full caption-bottom text-sm">
                    <thead>
                      <tr className="border-b bg-slate-50">
                        <th className="h-12 px-4 text-left font-medium">Position</th>
                        <th className="h-12 px-4 text-left font-medium">Company</th>
                        <th className="h-12 px-4 text-left font-medium">Status</th>
                        <th className="h-12 px-4 text-left font-medium">Date</th>
                        <th className="h-12 px-4 text-left font-medium">Score</th>
                        <th className="h-12 px-4 text-left font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockInterviews.map((interview) => (
                        <tr key={interview.id} className="border-b">
                          <td className="p-4 font-medium">{interview.position}</td>
                          <td className="p-4">{interview.company}</td>
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
                            {interview.date || (interview.status === "Invited" ? "Pending" : "—")}
                          </td>
                          <td className="p-4">{interview.score ? `${interview.score}/100` : "—"}</td>
                          <td className="p-4">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <ChevronRight className="h-4 w-4" />
                              <span className="sr-only">View details</span>
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}

