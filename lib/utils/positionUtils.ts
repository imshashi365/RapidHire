import { ObjectId } from "mongodb"
import clientPromise from "@/lib/mongodb"
import { Position } from "@/lib/models/Position"

export async function createPosition(position: Omit<Position, "_id" | "createdAt" | "updatedAt">) {
  const client = await clientPromise
  const db = client.db()
  
  const newPosition = {
    ...position,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const result = await db.collection("positions").insertOne(newPosition)
  return result.insertedId
}

export async function getPositionById(id: string) {
  const client = await clientPromise
  const db = client.db()
  
  return await db.collection("positions").findOne({ _id: new ObjectId(id) })
}

export async function getPositionsByCompany(companyId: string) {
  const client = await clientPromise
  const db = client.db()
  
  return await db.collection("positions")
    .find({ companyId: new ObjectId(companyId) })
    .sort({ createdAt: -1 })
    .toArray()
}

export async function updatePosition(id: string, updates: Partial<Position>) {
  const client = await clientPromise
  const db = client.db()
  
  const result = await db.collection("positions").updateOne(
    { _id: new ObjectId(id) },
    { 
      $set: {
        ...updates,
        updatedAt: new Date()
      }
    }
  )
  
  return result.modifiedCount > 0
}

export async function deletePosition(id: string) {
  const client = await clientPromise
  const db = client.db()
  console.log("Deleting position with id:", id)
  if (!id) {
    throw new Error("Position ID is required")
  }

  try {
    console.log("Deleting position with id:", id)
    const objectId = new ObjectId(id)
    const result = await db.collection("positions").deleteOne({ _id: objectId })
    return result.deletedCount > 0
  } catch (error) {
    console.error("Error in deletePosition:", error)
    throw error
  }
}

export async function incrementPositionStats(id: string, field: "candidates" | "interviews") {
  const client = await clientPromise
  const db = client.db()
  
  const result = await db.collection("positions").updateOne(
    { _id: new ObjectId(id) },
    { 
      $inc: { [field]: 1 },
      $set: { updatedAt: new Date() }
    }
  )
  
  return result.modifiedCount > 0
} 