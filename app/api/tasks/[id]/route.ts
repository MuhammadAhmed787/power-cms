import { NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import Task from "@/models/Task"
import { getGridFS } from "@/lib/gridfs"
import { validateFileType, validateFileSize } from "@/lib/downloadUtils"
import { sseManager } from "@/lib/sse"
import mongoose from "mongoose"

// Connect to database once
const connectDB = dbConnect()

interface Params {
  params: {
    id: string
  }
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDB
  try {
    const { id } = await params
    
    const task = await Task.findById(id).lean().exec()
    
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }
    
    return NextResponse.json(task)
  } catch (error: any) {
    console.error("Error fetching task:", error)
    return NextResponse.json(
      { error: "Failed to fetch task" },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDB
  try {
    const { id } = await params
    const contentType = request.headers.get("content-type") || ""
    
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json(
        { error: "Content-Type must be multipart/form-data" },
        { status: 400 }
      )
    }

    const formData = await request.formData()

    console.log("Received form data fields for task update:", Array.from(formData.entries()))

    // Determine update type - MORE ROBUST CHECK
    const completionApproved = formData.get("completionApproved")
    const finalStatus = formData.get("finalStatus")
    
    // Only treat as completion update if completionApproved is true AND finalStatus is provided
    const isCompletionUpdate = completionApproved === "true" && finalStatus
    
    console.log("Update type detection:", {
      completionApproved,
      finalStatus,
      isCompletionUpdate
    })

    if (isCompletionUpdate) {
      return handleCompletionUpdate(id, formData)
    } else {
      return handleGeneralUpdate(id, formData)
    }
  } catch (error: any) {
    console.error("Error updating task:", error)
    return NextResponse.json(
      { error: "Failed to update task", details: error.message },
      { status: 500 }
    )
  }
}

// Handle general task updates
async function handleGeneralUpdate(taskId: string, formData: FormData) {
  try {
    // Parse form data
    const code = formData.get("code") as string
    const company = formData.get("company") as string
    const contact = formData.get("contact") as string
    const working = formData.get("working") as string
    const dateTime = formData.get("dateTime") as string
    const priority = formData.get("priority") as string
    const status = formData.get("status") as string
    const assigned = formData.get("assigned") as string
    const assignedTo = formData.get("assignedTo") as string | null
    const approved = formData.get("approved") as string
    const unposted = formData.get("unposted") as string
    const TaskRemarks = formData.get("TaskRemarks") as string | null
    
    // FIX: Get existing attachments from TasksAttachment field
    const tasksAttachmentField = formData.get("TasksAttachment") as string
    let existingAttachments: string[] = []
    
    if (tasksAttachmentField) {
      try {
        existingAttachments = JSON.parse(tasksAttachmentField)
      } catch (error) {
        console.error("Failed to parse TasksAttachment:", tasksAttachmentField)
        // Fallback to empty array
        existingAttachments = []
      }
    }

    const newAttachmentsCount = parseInt(formData.get("newAttachmentsCount") as string) || 0

    // Validate required fields
    if (!taskId || !code || !company || !contact || !working || !dateTime || !status) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Find existing task
    const existingTask = await Task.findById(taskId)
    if (!existingTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    let filePaths = [...existingAttachments] // Start with existing attachments

    // Handle new file uploads with GridFS
    if (newAttachmentsCount > 0) {
      const gfs = await getGridFS()

      for (let i = 0; i < newAttachmentsCount; i++) {
        const file = formData.get(`newAttachments_${i}`) as File | null
        
        if (file && file.size > 0) {
          // Validate file type and size
          if (!validateFileType(file)) {
            return NextResponse.json({ error: "Only PDF, image, Excel, and Word files are allowed" }, { status: 400 })
          }

          if (!validateFileSize(file)) {
            return NextResponse.json({ error: "File size exceeds 10MB" }, { status: 400 })
          }

          const bytes = await file.arrayBuffer()
          const buffer = Buffer.from(bytes)

          const uploadStream = gfs.openUploadStream(file.name, {
            contentType: file.type || undefined,
            metadata: {
              originalName: file.name,
              uploadedAt: new Date(),
              taskCode: code,
            },
          })

          await new Promise<void>((resolve, reject) => {
            uploadStream.end(buffer)
            uploadStream.on("finish", () => resolve())
            uploadStream.on("error", (err) => reject(err))
          })

          filePaths.push(uploadStream.id.toString())
        }
      }
    }

    // Parse JSON fields safely
    let companyObj, contactObj, assignedToObj
    
    try {
      companyObj = typeof company === 'string' ? JSON.parse(company) : company
    } catch (error) {
      console.error("Failed to parse company:", company)
      return NextResponse.json(
        { error: "Invalid company data format" },
        { status: 400 }
      )
    }

    try {
      contactObj = typeof contact === 'string' ? JSON.parse(contact) : contact
    } catch (error) {
      console.error("Failed to parse contact:", contact)
      return NextResponse.json(
        { error: "Invalid contact data format" },
        { status: 400 }
      )
    }

    try {
      assignedToObj = assignedTo ? (typeof assignedTo === 'string' ? JSON.parse(assignedTo) : assignedTo) : null
    } catch (error) {
      console.error("Failed to parse assignedTo:", assignedTo)
      return NextResponse.json(
        { error: "Invalid assignedTo data format" },
        { status: 400 }
      )
    }

    // Prepare update data
    const updateData = {
      code,
      company: companyObj,
      contact: contactObj,
      working,
      dateTime,
      priority,
      status,
      assigned: assigned === "true",
      assignedTo: assignedToObj,
      approved: approved === "true",
      unposted: unposted === "true",
      TaskRemarks: TaskRemarks || "",
      TasksAttachment: filePaths, // This now includes both existing and new attachments
    }

    console.log("Updating task with data:", {
      ...updateData,
      TasksAttachment: filePaths.length // Log just the count for brevity
    })

    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      updateData,
      { new: true, runValidators: true }
    ).lean()

    // Broadcast SSE update
    const allTasks = await Task.find({}).sort({ createdAt: -1 }).lean().exec()
    sseManager.broadcast("tasks", allTasks)

    console.log("Task after update - attachments count:", updatedTask.TasksAttachment?.length)
    return NextResponse.json(updatedTask)
  } catch (error: any) {
    console.error("Error in handleGeneralUpdate:", error)
    throw error
  }
}

// Handle completion approval updates
async function handleCompletionUpdate(taskId: string, formData: FormData) {
  try {
    const completionApproved = formData.get("completionApproved") === "true"
    const completionApprovedAt = formData.get("completionApprovedAt") as string
    const finalStatus = formData.get("finalStatus") as string
    const status = formData.get("status") as string
    const completionRemarks = formData.get("completionRemarks") as string
    const rejectionRemarks = formData.get("rejectionRemarks") as string
    const timeTaken = formData.get("timeTaken") as string
    
    // Get all attachment files (multiple files with same field name)
    const completionAttachmentFiles: File[] = []
    const rejectionAttachmentFiles: File[] = []
    
    // Extract all files from form data
    for (const [key, value] of formData.entries()) {
      if (value instanceof File && value.size > 0) {
        if (key === "completionAttachment") {
          completionAttachmentFiles.push(value)
        } else if (key === "rejectionAttachment") {
          rejectionAttachmentFiles.push(value)
        }
      }
    }

    // Validate required fields
    if (!taskId || !finalStatus || !status) {
      return NextResponse.json(
        { error: "Missing required fields for completion approval" },
        { status: 400 }
      )
    }

    // Find existing task
    const existingTask = await Task.findById(taskId)
    if (!existingTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    let completionAttachmentPaths: string[] = existingTask.completionAttachment || []
    let rejectionAttachmentPaths: string[] = existingTask.rejectionAttachment || []

    const gfs = await getGridFS()

    // Handle new completion files with GridFS
    if (completionAttachmentFiles.length > 0) {
      completionAttachmentPaths = []

      for (const file of completionAttachmentFiles) {
        // Validate file type and size
        if (!validateFileType(file)) {
          return NextResponse.json({ error: "Only PDF, image, Excel, and Word files are allowed" }, { status: 400 })
        }

        if (!validateFileSize(file)) {
          return NextResponse.json({ error: "File size exceeds 10MB" }, { status: 400 })
        }

        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        const uploadStream = gfs.openUploadStream(file.name, {
          contentType: file.type || "application/octet-stream",
          metadata: {
            originalName: file.name,
            uploadedAt: new Date(),
            taskId: taskId,
            attachmentType: 'completion'
          },
        })

        await new Promise<void>((resolve, reject) => {
          uploadStream.end(buffer)
          uploadStream.on("finish", () => resolve())
          uploadStream.on("error", (err) => reject(err))
        })

        completionAttachmentPaths.push(uploadStream.id.toString())
      }
    }

    // Handle new rejection files with GridFS
    if (rejectionAttachmentFiles.length > 0) {
      rejectionAttachmentPaths = []

      for (const file of rejectionAttachmentFiles) {
        // Validate file type and size
        if (!validateFileType(file)) {
          return NextResponse.json({ error: "Only PDF, image, Excel, and Word files are allowed" }, { status: 400 })
        }

        if (!validateFileSize(file)) {
          return NextResponse.json({ error: "File size exceeds 10MB" }, { status: 400 })
        }

        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        const uploadStream = gfs.openUploadStream(file.name, {
          contentType: file.type || "application/octet-stream",
          metadata: {
            originalName: file.name,
            uploadedAt: new Date(),
            taskId: taskId,
            attachmentType: 'rejection'
          },
        })

        await new Promise<void>((resolve, reject) => {
          uploadStream.end(buffer)
          uploadStream.on("finish", () => resolve())
          uploadStream.on("error", (err) => reject(err))
        })

        rejectionAttachmentPaths.push(uploadStream.id.toString())
      }
    }

    // Prepare update data
    const updateData: any = {
      completionApproved,
      completionApprovedAt: completionApprovedAt ? new Date(completionApprovedAt) : new Date(),
      finalStatus,
      status,
    }

    // Add appropriate remarks and attachments based on status
    if (finalStatus === "rejected") {
      updateData.rejectionRemarks = rejectionRemarks || ""
      updateData.rejectionAttachment = rejectionAttachmentPaths
    } else {
      updateData.completionRemarks = completionRemarks || ""
      updateData.completionAttachment = completionAttachmentPaths
    }

    // Add time taken if provided
    if (timeTaken) {
      updateData.timeTaken = parseInt(timeTaken)
    }

    console.log("Updating task completion with data:", updateData)

    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).lean()

    // Broadcast SSE update
    const allTasks = await Task.find({}).sort({ createdAt: -1 }).lean().exec()
    sseManager.broadcast("tasks", allTasks)

    console.log("Task after completion approval:", updatedTask)
    return NextResponse.json(updatedTask)
  } catch (error: any) {
    console.error("Error in handleCompletionUpdate:", error)
    throw error
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDB
  try {
    const { id } = await params
    
    // Find task first to get attachment IDs
    const task = await Task.findById(id)
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    const gfs = await getGridFS()

    // Delete task attachments from GridFS
    if (task.TasksAttachment && task.TasksAttachment.length > 0) {
      for (const fileId of task.TasksAttachment) {
        if (mongoose.Types.ObjectId.isValid(fileId)) {
          try {
            await gfs.delete(new mongoose.Types.ObjectId(fileId))
          } catch (error) {
            console.error(`Error deleting file ${fileId}:`, error)
          }
        }
      }
    }

    // Delete completion attachments
    if (task.completionAttachment && task.completionAttachment.length > 0) {
      for (const fileId of task.completionAttachment) {
        if (mongoose.Types.ObjectId.isValid(fileId)) {
          try {
            await gfs.delete(new mongoose.Types.ObjectId(fileId))
          } catch (error) {
            console.error(`Error deleting completion file ${fileId}:`, error)
          }
        }
      }
    }

    // Delete rejection attachments
    if (task.rejectionAttachment && task.rejectionAttachment.length > 0) {
      for (const fileId of task.rejectionAttachment) {
        if (mongoose.Types.ObjectId.isValid(fileId)) {
          try {
            await gfs.delete(new mongoose.Types.ObjectId(fileId))
          } catch (error) {
            console.error(`Error deleting rejection file ${fileId}:`, error)
          }
        }
      }
    }

    // Delete the task
    await Task.findByIdAndDelete(id)

    // Broadcast SSE update
    const allTasks = await Task.find({}).sort({ createdAt: -1 }).lean().exec()
    sseManager.broadcast("tasks", allTasks)

    return NextResponse.json({ message: "Task deleted successfully" })
  } catch (error: any) {
    console.error("Error deleting task:", error)
    return NextResponse.json(
      { 
        error: "Failed to delete task", 
        details: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    )
  }
}
