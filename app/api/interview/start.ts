import { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "@/lib/mongodb";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { id } = req.query;
    const { name, email, phone } = req.body;

    if (!id || !name || !email || !phone) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    try {
      const { db } = await connectToDatabase();

      // Save candidate details and initialize interview
      const interviewData = {
        interviewId: id,
        candidate: { name, email, phone },
        status: "In Progress",
        createdAt: new Date(),
      };

      const result = await db.collection("interviews").insertOne(interviewData);

      res.status(200).json({ message: "Interview started successfully", interviewId: result.insertedId });
    } catch (error) {
      console.error("Error starting interview:", error);
      res.status(500).json({ error: "Failed to start the interview" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}