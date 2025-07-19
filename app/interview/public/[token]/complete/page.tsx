"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Loader2 } from "lucide-react"

export default function InterviewCompletePage({ params }: { params: { token: string } }) {
  const [isLoading, setIsLoading] = useState(false)
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-green-100 p-3">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <CardTitle>Interview Completed</CardTitle>
          <CardDescription>
            Thank you for completing your interview
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Your responses have been recorded and will be reviewed by the hiring team. 
            You will be contacted if your qualifications match the position requirements.
          </p>
          
          <div className="rounded-lg border p-4 bg-blue-50 text-blue-800 text-sm">
            <p>
              We appreciate your interest in this position and the time you've taken to complete the interview.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button variant="outline" onClick={() => window.close()}>
            Close Window
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
