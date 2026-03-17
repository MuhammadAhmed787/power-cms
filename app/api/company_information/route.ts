import { NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import CompanyInformation from "@/models/CompanyInformation"

// Connect to database once
const connectDB = dbConnect()

export async function GET(req: Request) {
  await connectDB

  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get("search")?.trim()
    const limitParam = searchParams.get("limit")

    // Parse limit, default to 10, max 1000
    let limit = 10
    if (limitParam) {
      const parsed = parseInt(limitParam, 10)
      if (!isNaN(parsed) && parsed > 0) {
        limit = Math.min(parsed, 1000) // cap at 1000
      }
    }

    let query = {}

    if (search && search.length >= 2) {
      query = {
        companyName: { $regex: search, $options: "i" }
      }
    }

    const companies = await CompanyInformation
      .find(query)
      .limit(limit)
      .lean()

    return NextResponse.json(companies, { status: 200 })
  } catch (error) {
    console.error("Error fetching companies:", error)
    return NextResponse.json(
      { error: "Failed to fetch companies" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  await connectDB
  try {
    const body = await req.json()
    const company = new CompanyInformation(body)
    const savedCompany = await company.save()
    return NextResponse.json(savedCompany, { status: 201 })
  } catch (error: any) {
    console.error("Error creating company:", error)
    return NextResponse.json(
      { error: "Failed to create company" },
      { status: 500 }
    )
  }
}