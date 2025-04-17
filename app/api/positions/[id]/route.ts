import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/db"
import { ObjectId } from "mongodb"

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Wait for params to be available
    const { id } = await context.params
    
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid position ID' },
        { status: 400 }
      )
    }

    // Connect to database
    const { db } = await connectToDatabase()
    
    // Find the position
    const position = await db
      .collection('positions')
      .findOne({ _id: new ObjectId(id) })

    if (!position) {
      return NextResponse.json(
        { success: false, error: 'Position not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      position: {
        ...position,
        _id: position._id.toString()
      }
    })
  } catch (error) {
    console.error('Error fetching position:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch position' },
      { status: 500 }
    )
  }
}

// Optional: Add DELETE method if you want to handle position deletion
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Wait for params to be available
    const { id } = await context.params
    
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid position ID' },
        { status: 400 }
      )
    }

    const { db } = await connectToDatabase()
    const result = await db.collection("positions").deleteOne({ 
      _id: new ObjectId(id) 
    })

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Position not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ 
      success: true,
      message: "Position deleted successfully" 
    })
  } catch (error) {
    console.error("Error deleting position:", error)
    return NextResponse.json(
      { success: false, error: "Failed to delete position" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Wait for params to be available
    const { id } = await context.params
    
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid position ID' },
        { status: 400 }
      )
    }

    // Connect to database
    const { db } = await connectToDatabase()
    const body = await request.json()

    // Validate required fields
    const requiredFields = [
      'title',
      'companyName',
      'department',
      'location',
      'type',
      'workLocation',
      'description',
      'requirements',
      'questions',
      'minExperience',
      'maxExperience',
      'salaryRange',
      'applicationDeadline'
    ]

    for (const field of requiredFields) {
      if (!(field in body)) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    // Update the position
    const result = await db.collection('positions').updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          title: body.title,
          companyName: body.companyName,
          department: body.department,
          location: body.location,
          type: body.type,
          workLocation: body.workLocation,
          description: body.description,
          requirements: body.requirements,
          questions: body.questions,
          minExperience: body.minExperience,
          maxExperience: body.maxExperience,
          salaryRange: body.salaryRange,
          status: body.status,
          applicationDeadline: new Date(body.applicationDeadline),
          updatedAt: new Date()
        }
      }
    )

    if (!result.matchedCount) {
      return NextResponse.json(
        { success: false, error: 'Position not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Position updated successfully'
    })
  } catch (error) {
    console.error('Error updating position:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update position' },
      { status: 500 }
    )
  }
} 