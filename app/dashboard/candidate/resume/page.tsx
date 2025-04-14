"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Upload, FileText, CheckCircle, AlertCircle, Download, Eye } from "lucide-react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CandidateDashboardHeader } from "@/components/candidate-dashboard-header"
import { CandidateDashboardSidebar } from "@/components/candidate-dashboard-sidebar"

interface ResumeAnalysis {
  score: number
  strengths: string[]
  improvements: string[]
}

interface StoredResume {
  analysis: ResumeAnalysis
  pdfUrl: string
  updatedAt: string
}

export default function ResumePage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [storedResume, setStoredResume] = useState<StoredResume | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resumeFile, setResumeFile] = useState<string | null>(null)

  useEffect(() => {
    if (session?.user) {
      fetchResumeData()
    }
  }, [session?.user])

  const fetchResumeData = async () => {
    try {
      const response = await fetch("/api/resume/store")
      if (!response.ok) {
        throw new Error("Failed to fetch resume data")
      }
      const data = await response.json()
      setStoredResume(data)
    } catch (error) {
      console.error("Error fetching resume data:", error)
    }
  }

  if (status === "loading") {
    return <div>Loading...</div>
  }

  if (status === "unauthenticated") {
    router.push("/login")
    return null
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setUploading(true)
    setError(null)

    try {
      // Validate file type
      const allowedTypes = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"]
      if (!allowedTypes.includes(selectedFile.type)) {
        throw new Error("Please upload a PDF, DOCX, or TXT file")
      }

      // Validate file size (5MB limit)
      if (selectedFile.size > 5 * 1024 * 1024) {
        throw new Error("File size must be less than 5MB")
      }

      // Step 1: Upload file
      const formData = new FormData()
      formData.append("file", selectedFile)

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json()
        throw new Error(errorData.error || "Failed to upload file")
      }

      const { pdfUrl } = await uploadResponse.json()

      // Step 2: Analyze resume
      setIsAnalyzing(true)
      const analyzeResponse = await fetch("/api/resume/analyze", {
        method: "POST",
        body: formData,
      })

      if (!analyzeResponse.ok) {
        throw new Error("Failed to analyze resume")
      }

      const analysis = await analyzeResponse.json()

      // Step 3: Store resume data
      const storeResponse = await fetch("/api/resume/store", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          analysis,
          pdfUrl,
        }),
      })

      if (!storeResponse.ok) {
        throw new Error("Failed to store resume data")
      }

      // Update UI state
      setStoredResume({ analysis, pdfUrl, updatedAt: new Date().toISOString() })
      setIsUploadDialogOpen(false)
      setSelectedFile(null)
      toast.success("Resume uploaded and analyzed successfully")
    } catch (err) {
      console.error("Upload error:", err)
      setError(err instanceof Error ? err.message : "Failed to upload file")
      toast.error(err instanceof Error ? err.message : "Failed to upload file")
    } finally {
      setUploading(false)
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      <CandidateDashboardSidebar />
      <div className="flex-1">
        <CandidateDashboardHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">My Resume</h1>
            <div className="flex gap-4">
              {storedResume?.pdfUrl && (
                <>
                  <Button variant="outline" onClick={() => window.open(storedResume.pdfUrl, '_blank')}>
                    <Eye className="mr-2 h-4 w-4" />
                    View PDF
                  </Button>
                  <Button variant="outline" onClick={() => window.open(storedResume.pdfUrl, '_blank')}>
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                  </Button>
                </>
              )}
              <Button onClick={() => setIsUploadDialogOpen(true)}>
                <Upload className="mr-2 h-4 w-4" />
                Upload Resume
              </Button>
            </div>
          </div>

          {storedResume?.analysis ? (
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Resume Score</CardTitle>
                  <CardDescription>Your current resume analysis score</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <Progress value={storedResume.analysis.score} className="w-full" />
                    <span className="text-2xl font-bold">{storedResume.analysis.score}%</span>
                  </div>
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      Strengths
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {storedResume.analysis.strengths.map((strength, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-green-500">•</span>
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-yellow-500" />
                      Areas for Improvement
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {storedResume.analysis.improvements.map((improvement, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-yellow-500">•</span>
                          <span>{improvement}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No Resume Uploaded</CardTitle>
                <CardDescription>
                  Upload your resume to get a detailed analysis and improvement suggestions.
                </CardDescription>
              </CardHeader>
            </Card>
          )}

          <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Resume</DialogTitle>
                <DialogDescription>
                  Upload your resume in PDF, DOCX, or TXT format for analysis.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid w-full items-center gap-1.5">
                  <input
                    type="file"
                    accept=".pdf,.docx,.txt"
                    onChange={handleFileChange}
                    className="hidden"
                    id="resume-upload"
                  />
                  <Button 
                    onClick={() => document.getElementById('resume-upload')?.click()}
                    variant="outline"
                    className="w-full h-24 border-dashed"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="h-8 w-8" />
                      <div className="text-sm text-muted-foreground">
                        {selectedFile ? selectedFile.name : "Click to select a file"}
                      </div>
                    </div>
                  </Button>
                  {error && (
                    <div className="text-sm text-red-500 mt-1">
                      {error}
                    </div>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleUpload} 
                  disabled={!selectedFile || uploading || isAnalyzing}
                >
                  {uploading ? "Uploading..." : isAnalyzing ? "Analyzing..." : "Upload & Analyze"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  )
}

