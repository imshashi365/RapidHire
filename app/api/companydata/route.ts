import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ObjectId } from "mongodb";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "company") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    const companyId = new ObjectId(session.user.id);

    // Get all positions created by the company
    const positions = await db
      .collection("positions")
      .find({ companyId })
      .toArray();
    
    const positionIds = positions.map(p => p._id);

    // 1. Total Candidates
    const totalCandidates = await db.collection("applications").countDocuments({
      positionId: { $in: positionIds },
    });

    // 2. Active Positions (positions that are not closed or archived)
    const activePositions = await db.collection("positions").countDocuments({
      companyId,
      $or: [
        { status: { $exists: false } }, // Default to active if status not set
        { status: 'open' },
        { status: 'active' },
      ],
      $and: [
        { deadline: { $gte: new Date() } } // Only include positions where deadline hasn't passed
      ]
    });

    // 3. Completed Interviews
    const completedInterviews = await db.collection("interviews").countDocuments({
      positionId: { $in: positionIds },
      status: 'completed'
    });

    // 4. Average Interview Score (if applicable)
    const interviewResults = await db.collection("interviews")
      .aggregate([
        {
          $match: {
            positionId: { $in: positionIds },
            status: 'completed',
            'evaluation.score': { $exists: true }
          }
        },
        {
          $group: {
            _id: null,
            averageScore: { $avg: '$evaluation.score' }
          }
        }
      ])
      .toArray();

    const averageScore = interviewResults[0]?.averageScore || 0;

    return NextResponse.json({
      totalCandidates,
      activePositions,
      completedInterviews,
      averageScore: Math.round(averageScore * 10) / 10 // Round to 1 decimal place
    });
  } catch (error) {
    console.error("Error fetching company data:", error);
    return NextResponse.json(
      { error: "Failed to fetch company data" }, 
      { status: 500 }
    );
  }
}