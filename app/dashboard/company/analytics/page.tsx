"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CompanyDashboardHeader } from "@/components/company-dashboard-header"
import { CompanyDashboardSidebar } from "@/components/company-dashboard-sidebar"
import { BarChart, LineChart, PieChart, Users, Clock, CheckCircle, TrendingUp, TrendingDown } from "lucide-react"

export default function AnalyticsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <CompanyDashboardHeader />

      <div className="flex flex-1">
        <CompanyDashboardSidebar />

        <main className="flex-1 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">Analytics</h1>
              <p className="text-gray-500">Track and analyze your interview data</p>
            </div>
            <div className="flex items-center gap-2">
              <Select defaultValue="30days">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select time period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">Last 7 days</SelectItem>
                  <SelectItem value="30days">Last 30 days</SelectItem>
                  <SelectItem value="90days">Last 90 days</SelectItem>
                  <SelectItem value="year">Last year</SelectItem>
                  <SelectItem value="all">All time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Overview Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Interviews</p>
                    <div className="flex items-center gap-2">
                      <h3 className="text-2xl font-bold">42</h3>
                      <span className="text-xs text-green-600 bg-green-100 px-1.5 py-0.5 rounded-full flex items-center">
                        <TrendingUp className="h-3 w-3 mr-0.5" />
                        12%
                      </span>
                    </div>
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
                    <p className="text-sm font-medium text-gray-500">Avg. Interview Duration</p>
                    <div className="flex items-center gap-2">
                      <h3 className="text-2xl font-bold">14:30</h3>
                      <span className="text-xs text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded-full flex items-center">
                        <TrendingUp className="h-3 w-3 mr-0.5" />
                        2%
                      </span>
                    </div>
                  </div>
                  <div className="rounded-full bg-primary/10 p-3">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Completion Rate</p>
                    <div className="flex items-center gap-2">
                      <h3 className="text-2xl font-bold">78%</h3>
                      <span className="text-xs text-green-600 bg-green-100 px-1.5 py-0.5 rounded-full flex items-center">
                        <TrendingUp className="h-3 w-3 mr-0.5" />
                        5%
                      </span>
                    </div>
                  </div>
                  <div className="rounded-full bg-primary/10 p-3">
                    <CheckCircle className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Avg. Score</p>
                    <div className="flex items-center gap-2">
                      <h3 className="text-2xl font-bold">84.2</h3>
                      <span className="text-xs text-red-600 bg-red-100 px-1.5 py-0.5 rounded-full flex items-center">
                        <TrendingDown className="h-3 w-3 mr-0.5" />
                        3%
                      </span>
                    </div>
                  </div>
                  <div className="rounded-full bg-primary/10 p-3">
                    <BarChart className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="positions">Positions</TabsTrigger>
              <TabsTrigger value="candidates">Candidates</TabsTrigger>
              <TabsTrigger value="scores">Scores</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Interview Trends</CardTitle>
                    <CardDescription>Number of interviews over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px] flex items-center justify-center">
                      <div className="flex flex-col items-center gap-2 text-gray-500">
                        <LineChart className="h-10 w-10" />
                        <p>Interview trend chart will appear here</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Interview Status</CardTitle>
                    <CardDescription>Distribution of interview statuses</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px] flex items-center justify-center">
                      <div className="flex flex-col items-center gap-2 text-gray-500">
                        <PieChart className="h-10 w-10" />
                        <p>Interview status chart will appear here</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Interview Completion Rate</CardTitle>
                  <CardDescription>Percentage of invited candidates who complete the interview</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] flex items-center justify-center">
                    <div className="flex flex-col items-center gap-2 text-gray-500">
                      <BarChart className="h-10 w-10" />
                      <p>Completion rate chart will appear here</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="positions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Position Performance</CardTitle>
                  <CardDescription>Average scores by position</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] flex items-center justify-center">
                    <div className="flex flex-col items-center gap-2 text-gray-500">
                      <BarChart className="h-10 w-10" />
                      <p>Position performance chart will appear here</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Candidates by Position</CardTitle>
                    <CardDescription>Number of candidates per position</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px] flex items-center justify-center">
                      <div className="flex flex-col items-center gap-2 text-gray-500">
                        <PieChart className="h-10 w-10" />
                        <p>Candidates by position chart will appear here</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Position Completion Rate</CardTitle>
                    <CardDescription>Interview completion rate by position</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px] flex items-center justify-center">
                      <div className="flex flex-col items-center gap-2 text-gray-500">
                        <BarChart className="h-10 w-10" />
                        <p>Position completion rate chart will appear here</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="candidates" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Top Performing Candidates</CardTitle>
                    <CardDescription>Candidates with highest scores</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px] flex items-center justify-center">
                      <div className="flex flex-col items-center gap-2 text-gray-500">
                        <BarChart className="h-10 w-10" />
                        <p>Top candidates chart will appear here</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Candidate Response Time</CardTitle>
                    <CardDescription>Average time to complete interview after invitation</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px] flex items-center justify-center">
                      <div className="flex flex-col items-center gap-2 text-gray-500">
                        <Clock className="h-10 w-10" />
                        <p>Response time chart will appear here</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Candidate Performance by Skill</CardTitle>
                  <CardDescription>Average scores across different skill categories</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] flex items-center justify-center">
                    <div className="flex flex-col items-center gap-2 text-gray-500">
                      <BarChart className="h-10 w-10" />
                      <p>Skills performance chart will appear here</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="scores" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Score Distribution</CardTitle>
                  <CardDescription>Distribution of candidate scores</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] flex items-center justify-center">
                    <div className="flex flex-col items-center gap-2 text-gray-500">
                      <BarChart className="h-10 w-10" />
                      <p>Score distribution chart will appear here</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Score Trends</CardTitle>
                    <CardDescription>Average scores over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px] flex items-center justify-center">
                      <div className="flex flex-col items-center gap-2 text-gray-500">
                        <LineChart className="h-10 w-10" />
                        <p>Score trends chart will appear here</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Score by Category</CardTitle>
                    <CardDescription>Performance across different assessment categories</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px] flex items-center justify-center">
                      <div className="flex flex-col items-center gap-2 text-gray-500">
                        <BarChart className="h-10 w-10" />
                        <p>Category scores chart will appear here</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}

