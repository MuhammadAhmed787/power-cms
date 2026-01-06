"use client"

import { useDashboard } from "@/hooks/use-dashboard"
import { WelcomeView } from "@/components/dashboard/WelcomeView"
import { StatsCards } from "@/components/dashboard/StatsCards"
import { TaskProgress } from "@/components/dashboard/TaskProgress"
import { ComplaintProgress } from "@/components/dashboard/ComplaintProgress"
import { RecentActivities } from "@/components/dashboard/RecentActivities"
import { QuickActions } from "@/components/dashboard/QuickActions"
import { Loader2 } from "lucide-react"

export default function DashboardPage() {
  const {
    tasks,
    complaints,
    userTasks,
    userComplaints,
    stats,
    isLoading,
    user,
    isAdminOrManager,
    isTaskCreator,
    canViewComplaints,
    taskCompletionRate,
    complaintResolutionRate,
    taskApprovalRate,
    getQuickActions,
    prefetchedRoutes,
  } = useDashboard()

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Section */}
      <WelcomeView 
        user={user} 
        isAdminOrManager={isAdminOrManager}
        isTaskCreator={isTaskCreator}
      />

      {/* Stats Cards */}
      <StatsCards 
        stats={stats}
        isAdminOrManager={isAdminOrManager}
        isTaskCreator={isTaskCreator}
        canViewComplaints={canViewComplaints}
      />

      {/* Progress Sections */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <TaskProgress 
          stats={stats}
          taskCompletionRate={taskCompletionRate}
          taskApprovalRate={taskApprovalRate}
          isAdminOrManager={isAdminOrManager}
        />
        
        {canViewComplaints && (
          <ComplaintProgress 
            stats={stats}
            complaintResolutionRate={complaintResolutionRate}
            isAdminOrManager={isAdminOrManager}
          />
        )}
      </div>

      {/* Recent Activities */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <RecentActivities 
          tasks={tasks}
          complaints={complaints}
          userTasks={userTasks}
          userComplaints={userComplaints}
          isAdminOrManager={isAdminOrManager}
          isTaskCreator={isTaskCreator}
          canViewComplaints={canViewComplaints}
          type="tasks"
        />
        
        {canViewComplaints && (
          <RecentActivities 
            tasks={tasks}
            complaints={complaints}
            userTasks={userTasks}
            userComplaints={userComplaints}
            isAdminOrManager={isAdminOrManager}
            isTaskCreator={isTaskCreator}
            canViewComplaints={canViewComplaints}
            type="complaints"
          />
        )}
      </div>

      {/* Quick Actions */}
      <QuickActions 
        actions={getQuickActions}
        prefetchedRoutes={prefetchedRoutes}
      />
    </div>
  )
}