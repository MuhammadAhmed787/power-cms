import { NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import OnlineComplaint from "@/models/OnlineComplaint"

export async function GET(request: Request) {
  await dbConnect()

  try {
    const { searchParams } = new URL(request.url)
    const complaintNumber = searchParams.get('complaintNumber')

    if (!complaintNumber) {
      return NextResponse.json(
        { error: "Complaint number is required" },
        { status: 400 }
      )
    }

    console.log("Searching for complaint:", complaintNumber)

    const complaint = await OnlineComplaint.findOne({ 
      complaintNumber: complaintNumber.toUpperCase() 
    }).lean()

    if (!complaint) {
      return NextResponse.json(
        { error: "Complaint not found. Please check your complaint number." },
        { status: 404 }
      )
    }

    // Return formatted complaint data
    const responseData = {
      complaintNumber: complaint.complaintNumber,
      status: complaint.status,
      company: complaint.company,
      softwareType: complaint.softwareType,
      contactPerson: complaint.contactPerson,
      contactPhone: complaint.contactPhone,
      complaintRemarks: complaint.complaintRemarks,
      createdAt: complaint.createdAt,
      updatedAt: complaint.updatedAt,
    }

    console.log("Complaint found:", responseData.complaintNumber)

    return NextResponse.json(responseData)

  } catch (error: any) {
    console.error("Error fetching complaint status:", error)
    return NextResponse.json(
      { error: "Failed to fetch complaint status" },
      { status: 500 }
    )
  }
}