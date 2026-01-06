'use client'

import { useState, useRef } from 'react'
import { Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface FileUploadProps {
  onFilesChange: (files: File[]) => void
  acceptedTypes?: string
  maxSizeMB?: number
}

export function FileUpload({ 
  onFilesChange, 
  acceptedTypes = ".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx,.txt,.csv,.zip,.ppt,.pptx",
  maxSizeMB = 10 
}: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || [])
    
    // Validate files
    const validFiles = newFiles.filter(file => {
      const isValidType = true;
      const isValidSize = file.size <= maxSizeMB * 1024 * 1024
      
      return isValidType && isValidSize
    })
    
    const updatedFiles = [...files, ...validFiles]
    setFiles(updatedFiles)
    onFilesChange(updatedFiles)
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeFile = (index: number) => {
    const updatedFiles = files.filter((_, i) => i !== index)
    setFiles(updatedFiles)
    onFilesChange(updatedFiles)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const droppedFiles = Array.from(e.dataTransfer.files)
    
    const validFiles = droppedFiles.filter(file => {
      const isValidType = true;
      const isValidSize = file.size <= maxSizeMB * 1024 * 1024
      
      return isValidType && isValidSize
    })
    
    const updatedFiles = [...files, ...validFiles]
    setFiles(updatedFiles)
    onFilesChange(updatedFiles)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">
        Complaint Attachments
      </label>
      
      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
        <div className="mb-2">
          <span className="text-blue-600 hover:text-blue-500 font-medium">
            Click to upload files
          </span>
          <span className="text-gray-500"> or drag and drop</span>
        </div>
        <p className="text-xs text-gray-500">
          PDF, JPG, PNG, DOC, XLS up to {maxSizeMB}MB each
        </p>
        
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileChange}
          className="hidden"
          accept={acceptedTypes}
        />
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-sm font-medium text-gray-700">
            Selected files ({files.length}):
          </p>
          {files.map((file, index) => (
            <div 
              key={index} 
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                  <Upload className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-900 block">
                    {file.name}
                  </span>
                  <span className="text-xs text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  removeFile(index)
                }}
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}