"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, FileText } from "lucide-react"
import { useProjectSearchReport } from "@/hooks/useProjectSearchReport"
import { ProjectReportTable } from "@/components/project/ProjectReportTable"
import { ProjectSearchReportInput } from "@/components/project/ProjectSearchReportInput"

export default function ProjectSearchPage() {
  const { 
    projects, 
    isLoading, 
    searchTerm, 
    setSearchTerm 
  } = useProjectSearchReport()

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
            <Search className="h-6 w-6 text-white" />
          </div>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
          Project Search Report
        </h1>
        <p className="text-muted-foreground">Search and view project details</p>
      </div>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Search Card */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-50 to-green-100/50 rounded-t-xl border-b border-green-200/50">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-600" />
              Search Projects
            </CardTitle>
            <CardDescription>
              Enter project name, company name, or company code to search
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <ProjectSearchReportInput
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              resultsCount={projects.length}
            />
          </CardContent>
        </Card>

        {/* Results Table */}
        <ProjectReportTable
          projects={projects}
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}