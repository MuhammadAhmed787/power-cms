import { UserSession } from "@/hooks/use-dashboard"
import { Badge } from "@/components/ui/badge"
import { Activity } from "lucide-react"

interface WelcomeViewProps {
  user: UserSession
  isAdminOrManager: boolean
  isTaskCreator: boolean
}

export function WelcomeView({ user, isAdminOrManager, isTaskCreator }: WelcomeViewProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-6 md:p-8 text-primary-foreground shadow-xl">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3C/g fill=%22none%22 fillRule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fillOpacity=%220.05%22%3E%3Ccircle cx=%2230%22 cy=%2230%22 r=%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
      <div className="relative">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-2xl md:text-4xl font-bold">Welcome to TaskFlow, {user.username}!</h1>
            <p className="text-primary-foreground/80 text-sm md:text-base">
              {isAdminOrManager 
                ? "Manage all tasks, complaints, and team activities" 
                : isTaskCreator
                ? "Track your created tasks and complaints"
                : "Track your assigned tasks and complaints"}
            </p>
            <Badge variant="secondary" className="bg-white/20 text-white backdrop-blur-sm">
              {user.role.name}
            </Badge>
          </div>
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl p-3">
            <Activity className="w-5 h-5" />
            <span className="text-sm font-medium">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}