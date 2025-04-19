import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle } from "lucide-react";

interface FeedbackDisplayProps {
  feedback: {
    rating: {
      technicalSkills: number;
      communication: number;
      problemSolving: number;
      experience: number;
    };
    summary: string;
    recommendation: string;
    recommendationMsg: string;
  };
}

export function InterviewFeedbackDisplay({ feedback }: FeedbackDisplayProps) {
  // Calculate overall score
  const averageRating = (
    feedback.rating.technicalSkills +
    feedback.rating.communication +
    feedback.rating.problemSolving +
    feedback.rating.experience
  ) / 4;
  
  const overallScore = Math.round(averageRating * 10); // Convert to score out of 100
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Interview Feedback</CardTitle>
        <CardDescription>
          Performance assessment and recommendations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Score */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Overall Score</h3>
            <span className="font-semibold">{overallScore}/100</span>
          </div>
          <Progress value={overallScore} className="h-2" />
        </div>
        
        {/* Skill Ratings */}
        <div className="space-y-3">
          <h3 className="font-medium">Skill Assessment</h3>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Technical Skills</span>
              <span className="font-medium">{feedback.rating.technicalSkills}/10</span>
            </div>
            <Progress value={feedback.rating.technicalSkills * 10} className="h-1" />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Communication</span>
              <span className="font-medium">{feedback.rating.communication}/10</span>
            </div>
            <Progress value={feedback.rating.communication * 10} className="h-1" />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Problem Solving</span>
              <span className="font-medium">{feedback.rating.problemSolving}/10</span>
            </div>
            <Progress value={feedback.rating.problemSolving * 10} className="h-1" />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Experience</span>
              <span className="font-medium">{feedback.rating.experience}/10</span>
            </div>
            <Progress value={feedback.rating.experience * 10} className="h-1" />
          </div>
        </div>
        
        {/* Summary */}
        <div className="space-y-2">
          <h3 className="font-medium">Summary</h3>
          <p className="text-sm text-gray-700">{feedback.summary}</p>
        </div>
        
        {/* Recommendation */}
        <div className="space-y-2">
          <h3 className="font-medium">Recommendation</h3>
          <div className="flex items-center space-x-2">
            {feedback.recommendation.toLowerCase() === "yes" ? (
              <>
                <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Recommended</Badge>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </>
            ) : (
              <>
                <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Not Recommended</Badge>
                <XCircle className="h-4 w-4 text-red-600" />
              </>
            )}
          </div>
          <p className="text-sm text-gray-700 mt-2">{feedback.recommendationMsg}</p>
        </div>
      </CardContent>
    </Card>
  );
} 