"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { CandidateDashboardHeader } from "@/components/candidate-dashboard-header"
import { CandidateDashboardSidebar } from "@/components/candidate-dashboard-sidebar"
import { MessageSquare, Star, Calendar, Send, ThumbsUp, ThumbsDown } from "lucide-react"

// Mock feedback data
const feedbackData = {
  interviews: [
    {
      id: 1,
      company: "TechCorp Inc.",
      position: "Frontend Developer",
      date: "April 3, 2025",
      feedback:
        "Strong technical skills, good communication. Could improve on explaining design decisions and problem-solving approach.",
      rating: 4,
      status: "Completed",
    },
    {
      id: 2,
      company: "WebSolutions",
      position: "React Developer",
      date: "March 25, 2025",
      feedback:
        "Excellent knowledge of React and state management. Communication was clear and concise. Would benefit from more examples of past work.",
      rating: 5,
      status: "Completed",
    },
    {
      id: 3,
      company: "Digital Agency",
      position: "UI Engineer",
      date: "March 15, 2025",
      feedback:
        "Good understanding of UI principles. Could improve technical depth in some areas. Overall positive impression.",
      rating: 3,
      status: "Completed",
    },
  ],
  messages: [
    {
      id: 1,
      company: "TechCorp Inc.",
      position: "Frontend Developer",
      date: "April 5, 2025",
      message:
        "Thank you for completing the interview. We were impressed with your technical skills and would like to invite you for an in-person interview next week.",
      read: true,
    },
    {
      id: 2,
      company: "WebSolutions",
      position: "React Developer",
      date: "March 27, 2025",
      message:
        "Hi John, we've reviewed your interview and would like to discuss the next steps. Please let us know your availability for a call.",
      read: false,
    },
  ],
}

export default function FeedbackPage() {
  const [activeTab, setActiveTab] = useState("interviews")
  const [feedbackText, setFeedbackText] = useState("")
  const [selectedCompany, setSelectedCompany] = useState("")

  const handleSendFeedback = () => {
    // In a real app, you would send the feedback to the server here
    setFeedbackText("")
    setSelectedCompany("")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <CandidateDashboardHeader />

      <div className="flex flex-1">
        <CandidateDashboardSidebar />

        <main className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Feedback & Messages</h1>
            <p className="text-gray-500">View feedback from your interviews and communicate with companies</p>
          </div>

          <Tabs defaultValue="interviews" className="space-y-4" onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="interviews">Interview Feedback</TabsTrigger>
              <TabsTrigger value="messages">Messages</TabsTrigger>
              <TabsTrigger value="give-feedback">Give Feedback</TabsTrigger>
            </TabsList>

            <TabsContent value="interviews" className="space-y-4">
              {feedbackData.interviews.length > 0 ? (
                <div className="space-y-4">
                  {feedbackData.interviews.map((interview) => (
                    <Card key={interview.id}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle>{interview.position}</CardTitle>
                            <CardDescription>{interview.company}</CardDescription>
                          </div>
                          <Badge variant="secondary">Feedback Received</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Calendar className="h-4 w-4" />
                            <span>Interview on {interview.date}</span>
                          </div>

                          <div className="space-y-2">
                            <h3 className="font-medium">Feedback</h3>
                            <p className="text-sm text-gray-700">{interview.feedback}</p>
                          </div>

                          <div className="flex items-center gap-1">
                            {Array(5)
                              .fill(0)
                              .map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-5 w-5 ${i < interview.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                                />
                              ))}
                            <span className="ml-2 text-sm font-medium">{interview.rating}/5</span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="border-t bg-slate-50">
                        <div className="flex w-full justify-between">
                          <Button variant="outline" size="sm">
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Contact Company
                          </Button>
                          <Button size="sm">View Interview Details</Button>
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="rounded-full bg-primary/10 p-4 mb-4">
                    <MessageSquare className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No Feedback Yet</h3>
                  <p className="text-gray-500 max-w-md">
                    You haven't received any feedback from your interviews yet. Complete interviews to get feedback.
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="messages" className="space-y-4">
              {feedbackData.messages.length > 0 ? (
                <div className="space-y-4">
                  {feedbackData.messages.map((message) => (
                    <Card key={message.id} className={message.read ? "" : "border-primary"}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle>{message.company}</CardTitle>
                            <CardDescription>{message.position}</CardDescription>
                          </div>
                          {!message.read && <Badge>New</Badge>}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Calendar className="h-4 w-4" />
                            <span>Received on {message.date}</span>
                          </div>

                          <div className="rounded-lg border p-4 bg-slate-50">
                            <p className="text-sm text-gray-700">{message.message}</p>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="border-t">
                        <div className="flex w-full justify-between">
                          <Button variant="outline" size="sm">
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Reply
                          </Button>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <ThumbsDown className="mr-2 h-4 w-4" />
                              Decline
                            </Button>
                            <Button size="sm">
                              <ThumbsUp className="mr-2 h-4 w-4" />
                              Accept
                            </Button>
                          </div>
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="rounded-full bg-primary/10 p-4 mb-4">
                    <MessageSquare className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No Messages</h3>
                  <p className="text-gray-500 max-w-md">
                    You don't have any messages from companies yet. Messages will appear here when companies contact
                    you.
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="give-feedback" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Give Feedback</CardTitle>
                  <CardDescription>Share your thoughts about the interview experience</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Select Company</label>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={selectedCompany}
                        onChange={(e) => setSelectedCompany(e.target.value)}
                      >
                        <option value="">Select a company</option>
                        {feedbackData.interviews.map((interview) => (
                          <option key={interview.id} value={interview.company}>
                            {interview.company} - {interview.position}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Your Feedback</label>
                      <Textarea
                        placeholder="Share your thoughts about the interview process, questions, and overall experience..."
                        className="min-h-[150px]"
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Rate Your Experience</label>
                      <div className="flex items-center gap-1">
                        {Array(5)
                          .fill(0)
                          .map((_, i) => (
                            <Star key={i} className="h-6 w-6 cursor-pointer text-gray-300 hover:text-yellow-400" />
                          ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t">
                  <Button className="ml-auto" disabled={!selectedCompany || !feedbackText} onClick={handleSendFeedback}>
                    <Send className="mr-2 h-4 w-4" />
                    Send Feedback
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Why Give Feedback?</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-700">
                      Your feedback helps us improve the interview experience for all candidates. It also helps
                      companies refine their interview process and questions.
                    </p>

                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="rounded-lg border p-4">
                        <div className="rounded-full bg-primary/10 p-2 w-fit mb-2">
                          <MessageSquare className="h-4 w-4 text-primary" />
                        </div>
                        <h3 className="font-medium mb-1">Improve the Platform</h3>
                        <p className="text-xs text-gray-500">Help us make AI Interviewer better for everyone</p>
                      </div>
                      <div className="rounded-lg border p-4">
                        <div className="rounded-full bg-primary/10 p-2 w-fit mb-2">
                          <ThumbsUp className="h-4 w-4 text-primary" />
                        </div>
                        <h3 className="font-medium mb-1">Help Companies</h3>
                        <p className="text-xs text-gray-500">Companies value your input to improve their process</p>
                      </div>
                      <div className="rounded-lg border p-4">
                        <div className="rounded-full bg-primary/10 p-2 w-fit mb-2">
                          <Star className="h-4 w-4 text-primary" />
                        </div>
                        <h3 className="font-medium mb-1">Build Relationships</h3>
                        <p className="text-xs text-gray-500">Constructive feedback can strengthen your candidacy</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}

