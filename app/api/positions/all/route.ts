import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

interface Position {
  _id: ObjectId
  title: string
  companyName: string
  companyId: string
  description: string
  requirements: string[]
  responsibilities: string[]
  salary: {
    min: number
    max: number
    currency: string
  } | string
  location: string
  workLocation: 'remote' | 'hybrid' | 'onsite'
  employmentType: 'full-time' | 'part-time' | 'contract'
  experienceLevel: 'entry' | 'mid' | 'senior'
  skills: string[]
  department: string
  industry: string
  applicationDeadline?: Date
  status: 'active' | 'closed' | 'draft'
  applicants?: string[]
  createdAt: Date
  updatedAt: Date
}

export async function GET() {
  try {
    const { db } = await connectToDatabase()
    
    // Fetch all positions with all fields
    const positions = await db
      .collection('positions')
      .aggregate([
        {
          $lookup: {
            from: "companies",
            localField: "companyId",
            foreignField: "_id",
            as: "company"
          }
        },
        {
          $unwind: {
            path: "$company",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $project: {
            _id: 1,
            title: 1,
            companyName: 1,
            companyId: 1,
            description: 1,
            requirements: 1,
            responsibilities: 1,
            salary: 1,
            location: 1,
            workLocation: 1,
            employmentType: 1,
            experienceLevel: 1,
            skills: 1,
            department: 1,
            industry: 1,
            applicationDeadline: 1,
            status: 1,
            applicants: 1,
            createdAt: 1,
            updatedAt: 1,
            "company.logo": 1,
            "company.name": 1,
            "company.industry": 1
          }
        },
        {
          $sort: { createdAt: -1 }
        }
      ])
      .toArray()

    // Transform the data before sending
    const transformedPositions = positions.map(position => ({
      ...position,
      _id: position._id.toString(),
      companyId: position.companyId?.toString(),
      companyLogo: position.company?.logo || null,
      companyName: position.company?.name || position.companyName,
      applicants: position.applicants?.map((id: ObjectId) => id.toString()) || [],
      applicationDeadline: position.applicationDeadline?.toISOString() || null,
      createdAt: position.createdAt?.toISOString() || null,
      updatedAt: position.updatedAt?.toISOString() || null
    }))

    return NextResponse.json({
      success: true,
      positions: transformedPositions
    })
  } catch (error) {
    console.error('Error fetching all positions:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch positions' },
      { status: 500 }
    )
  }
} 