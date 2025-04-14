"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { toast } from "sonner"

export default function PositionDetails({ params }: { params: { id: string } }) {
  const { data: session } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [position, setPosition] = useState<any>(null)

  const handleApply = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/positions/${params.id}/apply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to apply for position")
      }

      toast.success("Application submitted successfully!")
      router.push("/dashboard/candidate/interviews")
    } catch (error) {
      console.error("Apply error:", error)
      toast.error(error instanceof Error ? error.message : "Failed to apply for position")
    } finally {
      setIsLoading(false)
    }
  }

  if (!session?.user) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>{position?.title || "Loading..."}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Job Description</h3>
              <p>{position?.description || "Loading..."}</p>
            </div>
            <div>
              <h3 className="font-semibold">Requirements</h3>
              <p>{position?.requirements || "Loading..."}</p>
            </div>
            <div>
              <h3 className="font-semibold">Company</h3>
              <p>{position?.company?.name || "Loading..."}</p>
            </div>
            <div className="flex justify-end">
              <Button
                onClick={handleApply}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? "Applying..." : "Apply Now"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 