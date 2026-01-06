import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { generateToken } from "@/lib/jwt"

export async function POST(request: Request) {
  try {
    const { userId } = await auth()   // <-- FIXED
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = generateToken({
      userId,
      timestamp: Date.now()
    })

    return NextResponse.json({ 
      token,
      expiresIn: '10m'
    })

  } catch (error: any) {
    console.error("Error generating token:", error)
    return NextResponse.json(
      { error: "Failed to generate token" },
      { status: 500 }
    )
  }
}
