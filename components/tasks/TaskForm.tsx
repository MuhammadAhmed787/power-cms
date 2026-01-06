"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Building, User, Phone, MapPin, Search, FileText, Plus, Trash2, AlertTriangle, TrendingUp, Info, Paperclip } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface Company {
  _id: string
  code: string
  companyName: string
  city: string
  address: string
  phoneNumber: string
  companyRepresentative: string
  support: string
}

interface TaskCompany {
  id: string
  name: string
  city: string
  address: string
  companyRepresentative: string
  support: string
}

interface TaskContact {
  name: string
  phone: string
}

interface Task {
  _id?: string
  code: string
  company: TaskCompany
  contact: TaskContact
  working: string
  dateTime: string
  priority: "Urgent" | "High" | "Normal"
  status: string
  TaskRemarks: string
  TasksAttachment: File[]
}

interface TaskFormProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (taskData: Omit<Task, '_id'>) => Promise<void>
  isLoading: boolean
  companies: Company[]
  initialData?: Task
  mode: "create" | "edit"
}

export function TaskForm({ 
  isOpen, 
  onOpenChange, 
  onSubmit, 
  isLoading, 
  companies, 
  initialData,
  mode 
}: TaskFormProps) {
  const [formData, setFormData] = useState<Omit<Task, '_id'>>({
    code: `TSK-${Date.now()}`,
    company: {
      id: "",
      name: "",
      city: "",
      address: "",
      companyRepresentative: "",
      support: "",
    },
    contact: {
      name: "",
      phone: "",
    },
    working: "",
    dateTime: new Date().toISOString().slice(0, 16),
    priority: "Normal",
    status: "pending",
    TaskRemarks: "",
    TasksAttachment: [],
  })

  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [companySearchOpen, setCompanySearchOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  // Filter companies based on search
  const filteredCompanies = companies.filter(company =>
    company.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.code.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Reset form when dialog opens/closes or initialData changes
  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && initialData) {
        setFormData(initialData)
        // Find the company if it exists in companies list
        const company = companies.find(c => c._id === initialData.company.id)
        setSelectedCompany(company || null)
      } else {
        setFormData({
          code: `TSK-${Date.now()}`,
          company: {
            id: "",
            name: "",
            city: "",
            address: "",
            companyRepresentative: "",
            support: "",
          },
          contact: {
            name: "",
            phone: "",
          },
          working: "",
          dateTime: new Date().toISOString().slice(0, 16),
          priority: "Normal",
          status: "pending",
          TaskRemarks: "",
          TasksAttachment: [],
        })
        setSelectedCompany(null)
      }
    }
  }, [isOpen, initialData, mode, companies])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate required fields
    if (!formData.company.name || !formData.contact.name || !formData.contact.phone || !formData.working) {
      alert("Please fill in all required fields: Company Name, Contact Name, Contact Phone, and Work Description")
      return
    }

    try {
      // Ensure all required fields are present
      const submitData = {
        ...formData,
        // Ensure status is always included
        status: formData.status || "pending",
        // Ensure company has all required fields
        company: {
          id: formData.company.id || "",
          name: formData.company.name,
          city: formData.company.city || "",
          address: formData.company.address || "",
          companyRepresentative: formData.company.companyRepresentative || "",
          support: formData.company.support || "",
        },
        // Ensure contact has all required fields
        contact: {
          name: formData.contact.name,
          phone: formData.contact.phone,
        }
      }

      await onSubmit(submitData)
      
      // Reset form after successful creation
      if (mode === "create") {
        setFormData({
          code: `TSK-${Date.now()}`,
          company: {
            id: "",
            name: "",
            city: "",
            address: "",
            companyRepresentative: "",
            support: "",
          },
          contact: {
            name: "",
            phone: "",
          },
          working: "",
          dateTime: new Date().toISOString().slice(0, 16),
          priority: "Normal",
          status: "pending",
          TaskRemarks: "",
          TasksAttachment: [],
        })
        setSelectedCompany(null)
      }
    } catch (error) {
      // Error handling is done in parent component
      throw error
    }
  }

  const handleOpenChange = (open: boolean) => {
    onOpenChange(open)
    if (!open) {
      setCompanySearchOpen(false)
      setSearchTerm("")
    }
  }

  const handleCompanySelect = (company: Company) => {
    setSelectedCompany(company)
    setFormData(prev => ({
      ...prev,
      company: {
        id: company._id,
        name: company.companyName,
        city: company.city,
        address: company.address,
        companyRepresentative: company.companyRepresentative,
        support: company.support,
      }
    }))
    setCompanySearchOpen(false)
    setSearchTerm("")
  }

  const handleManualInput = () => {
    setSelectedCompany(null)
    setFormData(prev => ({
      ...prev,
      company: {
        id: "",
        name: "",
        city: "",
        address: "",
        companyRepresentative: "",
        support: "",
      }
    }))
    setCompanySearchOpen(false)
    setSearchTerm("")
  }

  const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const validFiles = Array.from(files).filter(file => 
        file.type === "application/pdf" || 
        file.type.startsWith("image/") ||
        file.type.includes("spreadsheet") ||
        file.type.includes("word") ||
        file.name.endsWith(".xlsx") ||
        file.name.endsWith(".xls") ||
        file.name.endsWith(".doc") ||
        file.name.endsWith(".docx")
      )
      
      if (validFiles.length > 0) {
        setFormData(prev => ({ 
          ...prev, 
          TasksAttachment: [...prev.TasksAttachment, ...validFiles] 
        }))
      }
    }
  }

  const removeAttachment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      TasksAttachment: prev.TasksAttachment.filter((_, i) => i !== index)
    }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Create New Task" : "Edit Task"}</DialogTitle>
          <DialogDescription>
            {mode === "create" ? "Add a new task to the system" : "Update task details"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Task Code and Date Time */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="code">Task Code</Label>
              <Input 
                id="code" 
                value={formData.code} 
                readOnly 
                className="bg-muted/50 font-mono text-sm" 
              />
              <p className="text-xs text-muted-foreground">Auto-generated unique identifier</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateTime">Date & Time</Label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="dateTime"
                  type="datetime-local"
                  value={formData.dateTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, dateTime: e.target.value }))}
                  className="pl-10"
                  required
                />
              </div>
            </div>
          </div>

          {/* Priority and Company Selection */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value: "Urgent" | "High" | "Normal") => 
                  setFormData(prev => ({ ...prev, priority: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Urgent">
                    <div className="flex items-center">
                      <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
                      Urgent
                    </div>
                  </SelectItem>
                  <SelectItem value="High">
                    <div className="flex items-center">
                      <TrendingUp className="h-4 w-4 text-orange-500 mr-2" />
                      High
                    </div>
                  </SelectItem>
                  <SelectItem value="Normal">
                    <div className="flex items-center">
                      <Info className="h-4 w-4 text-blue-500 mr-2" />
                      Normal
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Popover open={companySearchOpen} onOpenChange={setCompanySearchOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={companySearchOpen}
                    className="w-full justify-between"
                  >
                    {selectedCompany ? selectedCompany.companyName : "Select company..."}
                    <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0">
                  <Command>
                    <CommandInput 
                      placeholder="Search company..." 
                      value={searchTerm}
                      onValueChange={setSearchTerm}
                    />
                    <CommandList>
                      <CommandEmpty>No companies found.</CommandEmpty>
                      <CommandGroup>
                        {filteredCompanies.map((company) => (
                          <CommandItem
                            key={company._id}
                            value={company.companyName}
                            onSelect={() => handleCompanySelect(company)}
                          >
                            {company.companyName}
                          </CommandItem>
                        ))}
                        <CommandItem onSelect={handleManualInput}>
                          Enter manually
                        </CommandItem>
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Company Information Display */}
          {selectedCompany && (
            <div className="bg-muted/30 rounded-lg p-4 border">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-medium text-muted-foreground">Company Name</Label>
                  <p className="font-medium">{selectedCompany.companyName}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-medium text-muted-foreground">City</Label>
                  <p>{selectedCompany.city}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-medium text-muted-foreground">Representative</Label>
                  <p>{selectedCompany.companyRepresentative || "N/A"}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-medium text-muted-foreground">Support</Label>
                  <p>{selectedCompany.support || "N/A"}</p>
                </div>
                <div className="space-y-1 md:col-span-2">
                  <Label className="text-xs font-medium text-muted-foreground">Address</Label>
                  <p>{selectedCompany.address}</p>
                </div>
              </div>
            </div>
          )}

          {/* Manual Company Input */}
          {!selectedCompany && (
            <>
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <div className="relative">
                  <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="companyName"
                    placeholder="Enter company name"
                    value={formData.company.name}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      company: {
                        ...prev.company,
                        name: e.target.value
                      }
                    }))}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="city"
                      placeholder="Enter city"
                      value={formData.company.city}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        company: {
                          ...prev.company,
                          city: e.target.value
                        }
                      }))}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="address"
                      placeholder="Enter address"
                      value={formData.company.address}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        company: {
                          ...prev.company,
                          address: e.target.value
                        }
                      }))}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="companyRepresentative">Company Representative</Label>
                  <Input
                    id="companyRepresentative"
                    placeholder="Enter company representative"
                    value={formData.company.companyRepresentative}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      company: {
                        ...prev.company,
                        companyRepresentative: e.target.value
                      }
                    }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="support">Support</Label>
                  <Input
                    id="support"
                    placeholder="Enter support details"
                    value={formData.company.support}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      company: {
                        ...prev.company,
                        support: e.target.value
                      }
                    }))}
                  />
                </div>
              </div>
            </>
          )}

          {/* Contact Information */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="contactName">Contact Person Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="contactName"
                  placeholder="Enter contact person name"
                  value={formData.contact.name}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    contact: {
                      ...prev.contact,
                      name: e.target.value
                    }
                  }))}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactPhone">Contact Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="contactPhone"
                  type="tel"
                  placeholder="Enter contact number"
                  value={formData.contact.phone}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    contact: {
                      ...prev.contact,
                      phone: e.target.value
                    }
                  }))}
                  className="pl-10"
                  required
                />
              </div>
            </div>
          </div>

          {/* Work Description */}
          <div className="space-y-2">
            <Label htmlFor="working">Work Description</Label>
            <Textarea
              id="working"
              placeholder="Describe the work to be done..."
              value={formData.working}
              onChange={(e) => setFormData(prev => ({ ...prev, working: e.target.value }))}
              className="min-h-[100px] resize-none"
              required
            />
          </div>

          {/* Attachments */}
          <div className="space-y-4">
            <Label>Task Attachments</Label>
            <div className="border rounded-md p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Paperclip className="h-4 w-4" />
                  <span className="text-sm font-medium">Attachments</span>
                </div>
                <div className="relative">
                  <Input
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png,.xlsx,.xls,.doc,.docx,.txt"
                    onChange={handleAttachmentChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Button type="button" variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Files
                  </Button>
                </div>
              </div>
              
              {formData.TasksAttachment.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs text-muted-foreground">Selected files:</div>
                  <div className="grid gap-2">
                    {formData.TasksAttachment.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          <span className="text-sm truncate max-w-xs">{file.name}</span>
                          <span className="text-xs text-muted-foreground">
                            ({(file.size / 1024).toFixed(1)} KB)
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAttachment(index)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Task Remarks */}
          <div className="space-y-2">
            <Label htmlFor="TaskRemarks">Task Remarks</Label>
            <Textarea
              id="TaskRemarks"
              placeholder="Enter task remarks..."
              value={formData.TaskRemarks}
              onChange={(e) => setFormData(prev => ({ ...prev, TaskRemarks: e.target.value }))}
              className="min-h-[100px]"
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  {mode === "create" ? "Creating..." : "Saving..."}
                </div>
              ) : (
                mode === "create" ? "Create Task" : "Save Changes"
              )}
            </Button>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}