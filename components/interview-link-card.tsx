import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Copy, Link, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface InterviewLinkCardProps {
  positionId: string
  positionTitle: string
}

export function InterviewLinkCard({ positionId, positionTitle }: InterviewLinkCardProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [interviewLink, setInterviewLink] = useState<string | null>(null)
  const [isCopied, setIsCopied] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    fetchInterviewLink()
  }, [positionId])

  const fetchInterviewLink = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/positions/interview-link?positionId=${positionId}`)

      if (response.ok) {
        const data = await response.json()
        setInterviewLink(data.interviewLink)
      } else {
        // If no link exists, we'll generate one later
        setInterviewLink(null)
      }
    } catch (error) {
      console.error("Error fetching interview link:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const generateInterviewLink = async () => {
    try {
      setIsGenerating(true)
      const response = await fetch("/api/positions/generate-link", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ positionId })
      })

      if (!response.ok) {
        throw new Error("Failed to generate interview link")
      }

      const data = await response.json()
      setInterviewLink(data.interviewLink)
      toast.success("Interview link generated successfully")
    } catch (error) {
      console.error("Error generating interview link:", error)
      toast.error("Failed to generate interview link")
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = () => {
    if (interviewLink) {
      navigator.clipboard.writeText(interviewLink)
      setIsCopied(true)
      toast.success("Link copied to clipboard")

      setTimeout(() => {
        setIsCopied(false)
      }, 2000)
    }
  }

  return (
    <Card>


        {isLoading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : interviewLink ? (
          <div className="flex items-center gap-2">
            {/* <Input 
              value={interviewLink} 
              readOnly 
              className="font-mono text-sm"
            /> */}
            <Button
              size="icon"
              variant="outline"
              onClick={copyToClipboard}
              title="Copy to clipboard"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="text-center py-2">
            <p className="text-sm text-gray-500 mb-4">
              No interview
            </p>
            <Button
              onClick={generateInterviewLink}
              disabled={isGenerating}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Link className="mr-2 h-4 w-4" />
                  Generate Interview Link
                </>
              )}
            </Button>
          </div>
        )}

    </Card>
  )
}
