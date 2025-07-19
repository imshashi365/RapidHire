"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CandidateDashboardHeader } from "@/components/candidate-dashboard-header";
import { CandidateDashboardSidebar } from "@/components/candidate-dashboard-sidebar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export default function CandidatesPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const candidates = [
    {
      name: "John Doe",
      email: "john.doe@example.com",
      phone: "123-456-7890",
      position: "Frontend Developer",
      status: "Shortlisted",
      score: 85,
    },
    {
      name: "Jane Smith",
      email: "jane.smith@example.com",
      phone: "987-654-3210",
      position: "Backend Developer",
      status: "Interview Scheduled",
      score: 90,
    },
  ];

  return (
    <div className="flex min-h-screen">
      <CandidateDashboardSidebar />

      <main className="flex-1 p-6">
        <CandidateDashboardHeader />

        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Candidates</h1>
          <Button>Add Candidate</Button>
        </div>

        <div className="mb-6 flex items-center gap-4">
          <Input
            placeholder="Search candidates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="shortlisted">Shortlisted</SelectItem>
              <SelectItem value="interview-scheduled">Interview Scheduled</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Candidate List</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {candidates.map((candidate, index) => (
                  <TableRow key={index}>
                    <TableCell>{candidate.name}</TableCell>
                    <TableCell>{candidate.email}</TableCell>
                    <TableCell>{candidate.phone}</TableCell>
                    <TableCell>{candidate.position}</TableCell>
                    <TableCell>
                      <Badge>{candidate.status}</Badge>
                    </TableCell>
                    <TableCell>{candidate.score}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
                        View Profile
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

