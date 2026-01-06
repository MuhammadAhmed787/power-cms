'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, AlertCircle, CheckCircle, Clock, XCircle, Loader2 } from 'lucide-react'

interface ComplaintData {
  complaintNumber: string
  status: 'registered' | 'in-progress' | 'resolved' | 'closed'
  company: {
    name: string
    city: string
    address: string
  }
  softwareType: string
  contactPerson: string
  contactPhone: string
  complaintRemarks: string
  createdAt: string
  updatedAt: string
}

const statusConfig = {
  registered: {
    icon: Clock,
    color: 'text-yellow-600 bg-yellow-100',
    label: 'Registered',
    description: 'Your complaint has been registered and is awaiting review.'
  },
  'in-progress': {
    icon: AlertCircle,
    color: 'text-blue-600 bg-blue-100',
    label: 'In Progress',
    description: 'Our team is currently working on your complaint.'
  },
  resolved: {
    icon: CheckCircle,
    color: 'text-green-600 bg-green-100',
    label: 'Resolved',
    description: 'Your complaint has been resolved successfully.'
  },
  closed: {
    icon: XCircle,
    color: 'text-gray-600 bg-gray-100',
    label: 'Closed',
    description: 'This complaint has been closed.'
  }
}

export default function ComplaintStatusPage() {
  const [complaintNumber, setComplaintNumber] = useState('')
  const [complaint, setComplaint] = useState<ComplaintData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!complaintNumber.trim()) {
      setError('Please enter a complaint number')
      return
    }

    setLoading(true)
    setError('')
    setComplaint(null)

    try {
      const response = await fetch(`/api/complaint-status?complaintNumber=${encodeURIComponent(complaintNumber)}`)
      
      if (response.ok) {
        const data = await response.json()
        setComplaint(data)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Complaint not found')
      }
    } catch (err) {
      setError('Failed to fetch complaint status. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const StatusIcon = complaint ? statusConfig[complaint.status].icon : Clock
  const statusColor = complaint ? statusConfig[complaint.status].color : ''
  const statusLabel = complaint ? statusConfig[complaint.status].label : ''
  const statusDescription = complaint ? statusConfig[complaint.status].description : ''

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-lg">
          <CardHeader className="text-center bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-t-lg">
            <CardTitle className="text-3xl font-bold">
              Welcome to Powersoft360
            </CardTitle>
            <p className="text-blue-100 text-lg">
              Complaint Status Check Portal
            </p>
          </CardHeader>
          
          <CardContent className="p-6">
            {/* Search Section */}
            <div className="mb-8">
              <form onSubmit={handleSearch} className="space-y-4">
                <div>
                  <label htmlFor="complaintNumber" className="block text-sm font-medium text-gray-700 mb-2">
                    Enter Your Complaint Number
                  </label>
                  <div className="flex space-x-2">
                    <Input
                      id="complaintNumber"
                      type="text"
                      value={complaintNumber}
                      onChange={(e) => setComplaintNumber(e.target.value.toUpperCase())}
                      placeholder="e.g., COMP-1234567890"
                      className="flex-1 text-lg uppercase"
                      disabled={loading}
                    />
                    <Button 
                      type="submit" 
                      disabled={loading || !complaintNumber.trim()}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Search className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </form>

              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                    <p className="text-red-600 font-medium">{error}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Complaint Status Display */}
            {complaint && (
              <div className="space-y-6 animate-in fade-in duration-500">
                {/* Status Header */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          Complaint: {complaint.complaintNumber}
                        </h3>
                        <p className="text-gray-600">
                          Created: {new Date(complaint.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className={`flex items-center space-x-2 px-4 py-2 rounded-full ${statusColor}`}>
                        <StatusIcon className="w-5 h-5" />
                        <span className="font-semibold">{statusLabel}</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                      <p className="text-blue-800">{statusDescription}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Complaint Details */}
                <Card>
                  <CardContent className="p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Complaint Details</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Company Information */}
                      <div className="space-y-3">
                        <h5 className="font-medium text-gray-700">Company Information</h5>
                        <div className="space-y-2 text-sm">
                          <p><span className="font-medium">Name:</span> {complaint.company.name}</p>
                          <p><span className="font-medium">City:</span> {complaint.company.city}</p>
                          <p><span className="font-medium">Address:</span> {complaint.company.address}</p>
                        </div>
                      </div>

                      {/* Contact Information */}
                      <div className="space-y-3">
                        <h5 className="font-medium text-gray-700">Contact Information</h5>
                        <div className="space-y-2 text-sm">
                          <p><span className="font-medium">Contact Person:</span> {complaint.contactPerson}</p>
                          <p><span className="font-medium">Phone:</span> {complaint.contactPhone}</p>
                          <p><span className="font-medium">Software:</span> {complaint.softwareType}</p>
                        </div>
                      </div>
                    </div>

                    {/* Complaint Remarks */}
                    <div className="mt-6 space-y-3">
                      <h5 className="font-medium text-gray-700">Complaint Description</h5>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-gray-700">{complaint.complaintRemarks}</p>
                      </div>
                    </div>

                    {/* Last Updated */}
                    <div className="mt-6 pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-500">
                        Last updated: {new Date(complaint.updatedAt).toLocaleString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Support Information */}
                <Card className="bg-gradient-to-r from-green-50 to-blue-50">
                  <CardContent className="p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Need Help?</h4>
                    <p className="text-gray-600 mb-4">
                      If you have any questions about your complaint status, please contact our support team.
                    </p>
                    <div className="flex space-x-4 text-sm">
                      <div>
                        <span className="font-medium">Email:</span> support@powersoft360.com
                      </div>
                      <div>
                        <span className="font-medium">Phone:</span> +92 321 6439416
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Empty State */}
            {!complaint && !error && !loading && (
              <div className="text-center py-12">
                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Check Your Complaint Status
                </h3>
                <p className="text-gray-500">
                  Enter your complaint number above to view the current status and details.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}