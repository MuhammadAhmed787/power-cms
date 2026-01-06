'use client'

import { useState, useEffect } from 'react'
import { useUser, useClerk } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import { useTokenRefresh } from '@/hooks/useTokenRefresh'
import { CompanySearch } from '@/components/online_complaint/CompanySearch'
import { FileUpload } from '@/components/online_complaint/FileUpload'
import { SuccessMessage } from '@/components/online_complaint/SuccessMessage'
import { SessionStatus } from '@/components/online_complaint/SessionStatus'

interface Company {
  _id: string
  companyName: string
  city: string
  address: string
  companyRepresentative: string
  phoneNumber: string
  support: string
}

interface FormData {
  selectedCompany: Company | null
  softwareType: string
  contactPerson: string
  contactPhone: string
  complaintRemarks: string
  attachments: File[]
}

export default function OnlineComplaintForm() {
  const { isSignedIn, user, isLoaded } = useUser()
  const { signOut, openSignIn } = useClerk()
  const { token, isExpired, refreshToken } = useTokenRefresh()
  const router = useRouter()
  
  const [formData, setFormData] = useState<FormData>({
    selectedCompany: null,
    softwareType: '',
    contactPerson: '',
    contactPhone: '',
    complaintRemarks: '',
    attachments: [],
  })
  
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [complaintNumber, setComplaintNumber] = useState('')

  // Handle session expiration - redirect to sign in
  useEffect(() => {
    if (isExpired && isSignedIn) {
      console.log('Session expired, redirecting to sign in...')
      // Sign out and redirect to sign in
      signOut(() => {
        openSignIn({
          afterSignInUrl: window.location.href,
          afterSignUpUrl: window.location.href,
        })
      })
    }
  }, [isExpired, isSignedIn, signOut, openSignIn])

  // Debug logging
  useEffect(() => {
    console.log('Form state:', {
      isLoaded,
      isSignedIn,
      isExpired,
      hasToken: !!token,
      success,
      submitting
    })
  }, [isLoaded, isSignedIn, isExpired, token, success, submitting])

  // Prepare session props with proper boolean conversion
  const sessionProps = {
    isLoaded: !!isLoaded,
    isSignedIn: !!isSignedIn,
    token: token,
    isExpired: !!isExpired
  }

  // Check if we should show session status
  const shouldShowSessionStatus = !sessionProps.isLoaded || !sessionProps.isSignedIn || sessionProps.isExpired

  if (shouldShowSessionStatus) {
    return <SessionStatus {...sessionProps} />
  }

  const handleCompanySelect = (company: Company) => {
    setFormData(prev => ({
      ...prev,
      selectedCompany: company,
      contactPerson: company.companyRepresentative || '',
      contactPhone: company.phoneNumber || '',
    }))
  }

  const handleFilesChange = (files: File[]) => {
    setFormData(prev => ({ ...prev, attachments: files }))
  }

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  
  // Validate form
  if (!formData.selectedCompany) {
    alert('Please select a company')
    return
  }
  
  if (!formData.softwareType) {
    alert('Please select software type')
    return
  }

  if (!formData.contactPerson || !formData.contactPhone || !formData.complaintRemarks) {
    alert('Please fill all required fields')
    return
  }

  // Refresh token before submission to ensure it's valid
  const freshToken = await refreshToken()
  if (!freshToken) {
    alert('Session expired. Please sign in again.')
    return
  }

  setSubmitting(true)

  try {
    const submitData = new FormData()
    submitData.append('company', JSON.stringify(formData.selectedCompany))
    submitData.append('softwareType', formData.softwareType)
    submitData.append('contactPerson', formData.contactPerson)
    submitData.append('contactPhone', formData.contactPhone)
    submitData.append('complaintRemarks', formData.complaintRemarks)
    submitData.append('authorization', freshToken)
    
    // Add user data for user creation/update
    if (user) {
      submitData.append('email', user.primaryEmailAddress?.emailAddress || '')
      submitData.append('firstName', user.firstName || '')
      submitData.append('lastName', user.lastName || '')
    }
    
    formData.attachments.forEach(file => {
      submitData.append('attachments', file)
    })

    console.log('Submitting complaint with data:', {
      company: formData.selectedCompany.companyName,
      softwareType: formData.softwareType,
      contactPerson: formData.contactPerson,
      contactPhone: formData.contactPhone,
      attachments: formData.attachments.length
    })

    const response = await fetch('/api/online-complaints', {
      method: 'POST',
      body: submitData,
        headers: {
    'Accept': 'application/json',
  },
    })

    if (response.ok) {
      const data = await response.json()
      setComplaintNumber(data.complaintNumber)
      setSuccess(true)
      
      // Clear form
      setFormData({
        selectedCompany: null,
        softwareType: '',
        contactPerson: '',
        contactPhone: '',
        complaintRemarks: '',
        attachments: [],
      })
    } else {
      const errorData = await response.json()
      console.error('API Error response:', errorData)
      throw new Error(errorData.error || `Failed to submit complaint: ${response.status}`)
    }
  } catch (error: any) {
    console.error('Error submitting complaint:', error)
    alert(error.message || 'Failed to submit complaint. Please try again.')
  } finally {
    setSubmitting(false)
  }
}

  if (success) {
    return (
      <SuccessMessage
        complaintNumber={complaintNumber}
        onNewComplaint={() => setSuccess(false)}
        onReturnToDashboard={() => router.push('/complaint_status')} // Changed from /dashboard
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-gray-900">
                Register Online Complaint
              </CardTitle>
              <p className="text-gray-600">
                Please fill out the form below to register your complaint
              </p>
              {user && (
                <p className="text-sm text-green-600">
                  Welcome, {user.firstName || user.username}! 
                  {token && ' Your session is active.'}
                </p>
              )}
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Company Search Component */}
                <CompanySearch
                  onCompanySelect={handleCompanySelect}
                  selectedCompany={formData.selectedCompany}
                />

                {/* Software Type */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Software Type *
                  </label>
                  <select
                    value={formData.softwareType}
                    onChange={(e) => setFormData(prev => ({ ...prev, softwareType: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    required
                  >
                    <option value="">Select Software Type</option>
                    <option value="Finance Manager">Finance Manager</option>
                    <option value="Finance Controller">Finance Controller</option>
                    <option value="Power Accounting">Power Accounting</option>
                    <option value="Finance Manager Urdu">Finance Manager Urdu</option>
                    <option value="Power-Pos">Power-Pos</option>
                  </select>
                </div>

                {/* Contact Person */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Contact Person Name *
                  </label>
                  <Input
                    type="text"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData(prev => ({ ...prev, contactPerson: e.target.value }))}
                    placeholder="Enter contact person name"
                    required
                  />
                </div>

                {/* Contact Phone */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Contact Phone Number *
                  </label>
                  <Input
                    type="tel"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData(prev => ({ ...prev, contactPhone: e.target.value }))}
                    placeholder="Enter phone number"
                    required
                  />
                </div>

                {/* Complaint Remarks */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Complaint Remarks *
                  </label>
                  <Textarea
                    value={formData.complaintRemarks}
                    onChange={(e) => setFormData(prev => ({ ...prev, complaintRemarks: e.target.value }))}
                    placeholder="Describe your complaint in detail..."
                    rows={4}
                    className="resize-none"
                    required
                  />
                </div>

                {/* File Upload Component */}
                <FileUpload onFilesChange={handleFilesChange} />

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 text-lg font-medium"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Submitting Complaint...
                    </>
                  ) : (
                    'Submit Complaint'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}