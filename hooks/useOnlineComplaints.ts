import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'

interface OnlineComplaint {
  _id: string
  complaintNumber: string
  company: any
  softwareType: string
  contactPerson: string
  contactPhone: string
  complaintRemarks: string
  status: string
  createdAt: string
}

export function useOnlineComplaints() {
  const [complaints, setComplaints] = useState<OnlineComplaint[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useUser()

  useEffect(() => {
    if (user) {
      fetchComplaints()
    }
  }, [user])

  const fetchComplaints = async () => {
    try {
      const response = await fetch('/api/online-complaints')
      if (response.ok) {
        const data = await response.json()
        setComplaints(data)
      }
    } catch (error) {
      console.error('Error fetching complaints:', error)
    } finally {
      setLoading(false)
    }
  }

  const createComplaint = async (formData: FormData) => {
    const response = await fetch('/api/online-complaints', {
      method: 'POST',
      body: formData,
    })

    if (response.ok) {
      const data = await response.json()
      await fetchComplaints() // Refresh the list
      return data
    } else {
      throw new Error('Failed to create complaint')
    }
  }

  return {
    complaints,
    loading,
    createComplaint,
    refreshComplaints: fetchComplaints,
  }
}