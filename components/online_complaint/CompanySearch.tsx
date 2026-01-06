'use client'

import { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Search, Loader2 } from 'lucide-react'

interface Company {
  _id: string
  companyName: string
  city: string
  address: string
  companyRepresentative: string
  phoneNumber: string
  support: string
}

interface CompanySearchProps {
  onCompanySelect: (company: Company) => void
  selectedCompany: Company | null
}

export function CompanySearch({ onCompanySelect, selectedCompany }: CompanySearchProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Search companies when search term changes
  useEffect(() => {
    const searchCompanies = async () => {
      if (searchTerm.length < 2) {
        setCompanies([])
        setError('')
        return
      }

      setLoading(true)
      setError('')
      try {
        const response = await fetch(
          `/api/company_information?search=${encodeURIComponent(searchTerm)}`
        )
        
        if (response.ok) {
          const data = await response.json()
          setCompanies(data)
          if (data.length === 0) {
            setError('No companies found matching your search')
          }
        } else {
          setError('Failed to search companies')
          setCompanies([])
        }
      } catch (error) {
        console.error('Error searching companies:', error)
        setError('Error searching companies')
        setCompanies([])
      } finally {
        setLoading(false)
      }
    }

    const debounceTimer = setTimeout(searchCompanies, 500)
    return () => clearTimeout(debounceTimer)
  }, [searchTerm])

  const handleInputFocus = () => {
    setIsDropdownOpen(true)
    // If there's a search term and we have companies, show dropdown
    if (searchTerm.length >= 2 && companies.length > 0) {
      setIsDropdownOpen(true)
    }
  }

  const handleCompanySelect = (company: Company) => {
    onCompanySelect(company)
    setSearchTerm(company.companyName)
    setIsDropdownOpen(false)
    setCompanies([])
    setError('')
  }

  const handleInputChange = (value: string) => {
    setSearchTerm(value)
    // Open dropdown when user starts typing
    if (value.length >= 2) {
      setIsDropdownOpen(true)
    } else {
      setIsDropdownOpen(false)
    }
  }

  return (
    <div className="space-y-2 relative" ref={dropdownRef}>
      <label className="text-sm font-medium text-gray-700">
        Search Company *
      </label>
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={handleInputFocus}
          placeholder="Click here to search companies..."
          className="pl-10 cursor-pointer"
          required
        />
      </div>
      
      {/* Dropdown Content */}
      {isDropdownOpen && (
        <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
          {/* Loading State */}
          {loading && (
            <div className="px-4 py-3 flex items-center justify-center">
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              <span className="text-sm">Searching...</span>
            </div>
          )}
          
          {/* Error State */}
          {error && !loading && (
            <div className="px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}
          
          {/* No Results */}
          {companies.length === 0 && !loading && !error && searchTerm.length >= 2 && (
            <div className="px-4 py-3 text-sm text-gray-500">
              No companies found. Try a different search term.
            </div>
          )}
          
          {/* Search Results */}
          {companies.length > 0 && !loading && (
            <>
              {companies.map((company) => (
                <div
                  key={company._id}
                  className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0 transition-colors"
                  onClick={() => handleCompanySelect(company)}
                >
                  <div className="font-medium text-gray-900">{company.companyName}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    {company.city} • {company.address}
                  </div>
                  {company.companyRepresentative && (
                    <div className="text-xs text-gray-500 mt-1">
                      Contact: {company.companyRepresentative}
                    </div>
                  )}
                </div>
              ))}
            </>
          )}
          
          {/* Initial State - Guide user */}
          {searchTerm.length < 2 && !loading && (
            <div className="px-4 py-3 text-sm text-gray-500">
              Type at least 2 characters to search companies
            </div>
          )}
        </div>
      )}
      
      {/* Selected Company Display */}
      {selectedCompany && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-md">
          <div className="font-medium text-green-900">
            {selectedCompany.companyName}
          </div>
          <div className="text-sm text-green-700 mt-1">
            {selectedCompany.city}, {selectedCompany.address}
          </div>
          {selectedCompany.companyRepresentative && (
            <div className="text-sm text-green-700">
              Contact: {selectedCompany.companyRepresentative}
            </div>
          )}
          {selectedCompany.phoneNumber && (
            <div className="text-sm text-green-700">
              Phone: {selectedCompany.phoneNumber}
            </div>
          )}
        </div>
      )}
    </div>
  )
}