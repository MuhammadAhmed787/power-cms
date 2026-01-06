import { NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import CompanyInformation from "@/models/CompanyInformation"



// Next.js 15: params is now a Promise
export async function PUT(
  req: Request, 
  { params }: { params: Promise<{ id: string }> } 
) {
  const { id } = await params
 

  try {
    const body = await req.json()
    const updatedCompany = await CompanyInformation.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    ).lean()

    if (!updatedCompany) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 })
    }
    return NextResponse.json(updatedCompany, { status: 200 })
  } catch (error: any) {
    console.error("Error updating company:", error)
    return NextResponse.json(
      { error: "Failed to update company" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: Request, 
  { params }: { params: Promise<{ id: string }> } 
)  {
  const { id } = await params


  try {
    const deletedCompany = await CompanyInformation.findByIdAndDelete(id)

    if (!deletedCompany) {
      return NextResponse.json({ message: "Company not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Company deleted successfully" }, { status: 200 })
  } catch (error: any) {
    console.error("Error deleting company:", error)
    return NextResponse.json(
      { message: "Failed to delete company" },
      { status: 500 }
    )
  }
}