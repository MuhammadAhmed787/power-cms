import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export interface UserSession {
  id: string
  username: string
  role: {
    id: string
    name: string
    permissions: string[]
  }
}

export const useUserSession = (requiredPermission?: string) => {
  const [user, setUser] = useState<UserSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  const checkSession = useCallback(() => {
    try {
      const userData = localStorage.getItem("user")
      if (!userData) {
        toast({
          title: "Session Expired",
          description: "Please log in to continue.",
          variant: "destructive",
        })
        router.push("/login")
        return null
      }

      const parsedUser = JSON.parse(userData)
      
      if (requiredPermission && !parsedUser?.role?.permissions.includes(requiredPermission)) {
        toast({
          title: "Access Denied",
          description: "You do not have permission to access this page.",
          variant: "destructive",
        })
        router.push("/dashboard")
        return null
      }

      return parsedUser
    } catch (error) {
      console.error("Error parsing user data:", error)
      toast({
        title: "Session Error",
        description: "Invalid session data. Please log in again.",
        variant: "destructive",
      })
      localStorage.removeItem("user")
      router.push("/login")
      return null
    }
  }, [router, toast, requiredPermission])

  useEffect(() => {
    const userData = checkSession()
    if (userData) {
      setUser(userData)
    }
    setIsLoading(false)
  }, [checkSession])

  const updateSession = useCallback((updatedUser: UserSession) => {
    localStorage.setItem("user", JSON.stringify(updatedUser))
    setUser(updatedUser)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem("user")
    setUser(null)
    router.push("/login")
  }, [router])

  return {
    user,
    isLoading,
    updateSession,
    logout,
    checkSession,
  }
}