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

    // Fetch total candidates based on positions created by the logged-in company
    const totalCandidates = await db.collection("applications").countDocuments({
      positionId: {
        $in: await db
          .collection("positions")
          .find({ companyId: new ObjectId(session.user.id) })
          .map((position) => position._id)
          .toArray(),
      },
    });

    return NextResponse.json({ totalCandidates });
  } catch (error) {
    console.error("Error fetching total candidates:", error);
    return NextResponse.json({ error: "Failed to fetch total candidates" }, { status: 500 });
  }
}