import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle } from "lucide-react";

interface FeedbackDisplayProps {
  feedback: {
    rating: {
      englishCommunication: number;
      confidence: number;
      storytelling: number;
      customerHandling: number;
    };
    summary: string;
    recommendation: string;
    recommendationMsg: string;
  };
}

export function InterviewFeedbackDisplay({ feedback }: FeedbackDisplayProps) {
  // Calculate overall score using weighted average
  const weights = {
    englishCommunication: 0.40, // 40% weight
    confidence: 0.30,          // 30% weight
    storytelling: 0.15,        // 15% weight
    customerHandling: 0.15     // 15% weight
  };
  
  const weightedSum = 
    feedback.rating.englishCommunication * weights.englishCommunication + 
    feedback.rating.confidence * weights.confidence + 
    feedback.rating.storytelling * weights.storytelling + 
    feedback.rating.customerHandling * weights.customerHandling;
    
  const overallScore = Math.round(weightedSum);
  
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
              <span className="text-sm">English Communication</span>
              <span className="font-medium">{feedback.rating.englishCommunication}/100</span>
            </div>
            <Progress value={feedback.rating.englishCommunication} className="h-1" />
            <div className="text-xs text-gray-500 text-right">Weight: 40%</div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Confidence</span>
              <span className="font-medium">{feedback.rating.confidence}/100</span>
            </div>
            <Progress value={feedback.rating.confidence} className="h-1" />
            <div className="text-xs text-gray-500 text-right">Weight: 30%</div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Storytelling</span>
              <span className="font-medium">{feedback.rating.storytelling}/100</span>
            </div>
            <Progress value={feedback.rating.storytelling} className="h-1" />
            <div className="text-xs text-gray-500 text-right">Weight: 15%</div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Customer Handling</span>
              <span className="font-medium">{feedback.rating.customerHandling}/100</span>
            </div>
            <Progress value={feedback.rating.customerHandling} className="h-1" />
            <div className="text-xs text-gray-500 text-right">Weight: 15%</div>
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