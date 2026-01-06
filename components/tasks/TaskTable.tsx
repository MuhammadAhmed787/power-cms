"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Building, Edit, Trash2, FileText, ChevronLeft, ChevronRight, ClipboardList, User, Phone } from "lucide-react"

interface Task {
  _id?: string
  code: string
  company: {
    name: string
    city: string
    address: string
  }
  contact: {
    name: string
    phone: string
  }
  working: string
  dateTime: string
  priority: "Urgent" | "High" | "Normal"
  status: string
  TaskRemarks: string
  TasksAttachment: string[]
  createdAt?: string
}

interface TaskTableProps {
  tasks: Task[]
  isLoading: boolean
  onEdit: (task: Task) => void
  onDelete: (taskId: string) => void
}

export function TaskTable({ tasks, isLoading, onEdit, onDelete }: TaskTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)

  // Filter tasks to show only pending ones
  const pendingTasks = tasks.filter(task => task.status === "pending")
  const totalPages = Math.ceil(pendingTasks.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentTasks = pendingTasks.slice(startIndex, endIndex)

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value))
    setCurrentPage(1)
  }

  const getPageNumbers = () => {
    const maxVisiblePages = 5
    const pages = []
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }

    if (startPage > 1) {
      pages.unshift('...')
      pages.unshift(1)
    }
    if (endPage < totalPages) {
      pages.push('...')
      pages.push(totalPages)
    }

    return pages
  }

  const downloadFile = async (fileId: string, filename: string) => {
    try {
      const response = await fetch(`/api/download?fileId=${fileId}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Download failed:', error)
    }
  }

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-background to-muted/20">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100/50 rounded-t-xl border-b border-purple-200/50 py-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileText className="h-5 w-5 text-purple-600" />
          Pending Tasks ({pendingTasks.length})
        </CardTitle>
        <CardDescription className="text-sm">
          Tasks waiting to be processed. Total tasks: {tasks.length}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">
            <div className="h-16 w-16 mx-auto mb-4 opacity-50 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-lg font-medium">Loading tasks...</p>
          </div>
        ) : pendingTasks.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <ClipboardList className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No pending tasks found</p>
            <p className="text-sm">All tasks have been processed or create a new task</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gradient-to-r from-muted/50 to-muted/30 border-b sticky top-0">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Code
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Company
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">
                      Contact
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                      Phone
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Work
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">
                      Date
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Task Remarks
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Task Attachment
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-background divide-y divide-border/50">
                  {currentTasks.map((task, index) => (
                    <tr
                      key={task._id}
                      className={`${index % 2 === 0 ? "bg-background" : "bg-muted/20"} hover:bg-muted/30 transition-colors`}
                    >
                      <td className="px-3 py-3">
                        <Badge variant="outline" className="text-xs font-mono">
                          {task.code?.split("-")[1]}
                        </Badge>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center">
                          <Building className="h-3 w-3 text-muted-foreground mr-2" />
                          <span
                            className="font-medium text-foreground truncate max-w-[80px] sm:max-w-24"
                            title={task.company.name}
                          >
                            {task.company.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-3 hidden sm:table-cell">
                        <div className="flex items-center">
                          <User className="h-3 w-3 text-muted-foreground mr-2" />
                          <span className="text-foreground truncate max-w-20 block" title={task.contact.name}>
                            {task.contact.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-3 hidden md:table-cell">
                        <div className="flex items-center">
                          <Phone className="h-3 w-3 text-muted-foreground mr-2" />
                          <span className="text-foreground text-xs">{task.contact.phone}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <Badge
                          className={`text-xs ${
                            task.priority === "Urgent"
                              ? "bg-red-100 text-red-700"
                              : task.priority === "High"
                              ? "bg-orange-100 text-orange-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {task.priority}
                        </Badge>
                      </td>
                      <td className="px-3 py-3">
                        <span className="text-foreground truncate max-w-[100px] block text-xs" title={task.working}>
                          {task.working}
                        </span>
                      </td>
                      <td className="px-3 py-3 hidden lg:table-cell">
                        <span className="text-foreground text-xs">
                          {new Date(task.dateTime).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <span className="text-foreground truncate max-w-[100px] block text-xs" title={task.TaskRemarks}>
                          {task.TaskRemarks || "None"}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-xs text-muted-foreground">
  {task.TasksAttachment && task.TasksAttachment.length > 0
    ? `${task.TasksAttachment.length} file${task.TasksAttachment.length > 1 ? 's' : ''}`
    : 'None'}
</td>
                      <td className="px-3 py-3">
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(task)}
                            disabled={isLoading}
                          >
                            <Edit className="h-4 w-4 text-blue-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => task._id && onDelete(task._id)}
                            disabled={isLoading}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center px-4 py-3 gap-4">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <label htmlFor="itemsPerPage" className="text-sm font-medium">
                  Tasks per page:
                </label>
                <Select
                  value={itemsPerPage.toString()}
                  onValueChange={handleItemsPerPageChange}
                >
                  <SelectTrigger id="itemsPerPage" className="w-[100px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="15">15</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || isLoading}
                  className="min-w-[90px] text-xs sm:text-sm"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <div className="flex items-center gap-1 hidden sm:flex">
                  {getPageNumbers().map((page, index) => (
                    <Button
                      key={index}
                      variant={page === currentPage ? "default" : page === '...' ? "ghost" : "outline"}
                      size="sm"
                      onClick={() => typeof page === 'number' && handlePageChange(page)}
                      disabled={page === '...' || isLoading}
                      className={page === '...' ? "cursor-default" : "min-w-[32px] text-xs"}
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || isLoading}
                  className="min-w-[90px] text-xs sm:text-sm"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}