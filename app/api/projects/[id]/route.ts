import { NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import Project from "@/models/Project"
import mongoose from "mongoose"

const connectDB = dbConnect()

// No need for Params interface - Next.js 16 provides params as Promise

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // Changed: params is a Promise
) {
  await connectDB
  try {
    const { id } = await params // Changed: await params
    
    const project = await Project.findById(id).lean().exec()
    
    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      )
    }
    
    return NextResponse.json(project, { status: 200 })
  } catch (error: any) {
    console.error("Error fetching project:", error)
    return NextResponse.json(
      { error: "Failed to fetch project" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // Changed: Use consistent pattern
) {
  await dbConnect

  try {
    const { id } = await params // Changed: await params
    const body = await request.json()

    // Validate required fields
    if (!body.companyCode || !body.companyName || !body.projectName || !body.projectPath) {
      return NextResponse.json(
        { error: "Missing required fields: companyCode, companyName, projectName, projectPath" },
        { status: 400 }
      )
    }

    const projectId = new mongoose.Types.ObjectId(id)

    // Get current project
    const currentProject = await Project.findById(projectId)

    if (!currentProject) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    // Only check duplicates if the projectName changed
    if (currentProject.projectName !== body.projectName) {
      const existingProject = await Project.findOne({
        projectName: { $regex: new RegExp(`^${body.projectName}$`, "i") },
        _id: { $ne: projectId }
      })

      if (existingProject) {
        return NextResponse.json(
          { error: "Project name already exists" },
          { status: 409 }
        )
      }
    }

    const updatedProject = await Project.findByIdAndUpdate(
      projectId,
      body,
      {
        new: true,
        runValidators: true,
        context: "query"
      }
    )

    return NextResponse.json(updatedProject, { status: 200 })

  } catch (error: any) {
    console.error("Error updating project:", error)

    if (error.code === 11000) {
      return NextResponse.json(
        { error: "Project name must be unique" },
        { status: 409 }
      )
    }

    return NextResponse.json({ error: "Failed to update project" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest, // Changed: Use NextRequest
  { params }: { params: Promise<{ id: string }> } // Simplified: remove union type
) {
  await dbConnect();
  
  try {
    const { id } = await params; // Changed: await params
    
    const deletedProject = await Project.findByIdAndDelete(id).lean().exec();

    if (!deletedProject) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Project deleted successfully" }, { status: 200 });
  } catch (error: any) {
    console.error("Error deleting project:", error);
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
  }
}