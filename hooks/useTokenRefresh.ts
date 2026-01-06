import { useState, useEffect, useCallback } from 'react'
import { useUser, useClerk } from '@clerk/nextjs'

export function useTokenRefresh() {
  const { user, isLoaded } = useUser()
  const { signOut, openSignIn } = useClerk()
  const [token, setToken] = useState<string | null>(null)
  const [isExpired, setIsExpired] = useState<boolean>(false)

  const refreshToken = useCallback(async (): Promise<string | null> => {
    try {
      const response = await fetch('/api/auth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        setToken(data.token)
        setIsExpired(false)
        
        // Store token in localStorage for persistence
        localStorage.setItem('jwt_token', data.token)
        localStorage.setItem('token_timestamp', Date.now().toString())
        
        return data.token
      } else {
        throw new Error('Failed to refresh token')
      }
    } catch (error) {
      console.error('Error refreshing token:', error)
      setIsExpired(true)
      return null
    }
  }, [])

  const getStoredToken = useCallback((): string | null => {
    if (typeof window === 'undefined') return null
    
    const storedToken = localStorage.getItem('jwt_token')
    const tokenTimestamp = localStorage.getItem('token_timestamp')
    
    if (!storedToken || !tokenTimestamp) return null
    
    // Check if token is older than 9 minutes (refresh before expiry)
    const timeElapsed = Date.now() - parseInt(tokenTimestamp)
    if (timeElapsed > 9 * 60 * 1000) { // 9 minutes
      setIsExpired(true)
      return null
    }
    
    return storedToken
  }, [])

  useEffect(() => {
    if (isLoaded && user) {
      const storedToken = getStoredToken()
      if (storedToken) {
        setToken(storedToken)
      } else {
        // Get new token if no valid token exists
        refreshToken()
      }

      // Set up automatic token refresh every 8 minutes
      const refreshInterval = setInterval(refreshToken, 8 * 60 * 1000)
      
      return () => clearInterval(refreshInterval)
    }
  }, [isLoaded, user, refreshToken, getStoredToken])

  return {
    token,
    refreshToken,
    isExpired
  }
}