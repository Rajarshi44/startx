"use client"

import { useState, useEffect } from "react"
import { useUser } from "@civic/auth/react"
import type { FounderProfile, Company, Validation } from "@/types/founder"

export function useFounderData() {
  const { user, isLoading: authLoading } = useUser()
  const [founderProfile, setFounderProfile] = useState<FounderProfile | null>(null)
  const [companies, setCompanies] = useState<Company[]>([])
  const [validations, setValidations] = useState<Validation[]>([])
  const [profileLoading, setProfileLoading] = useState(true)

  useEffect(() => {
    const loadFounderData = async () => {
      if (authLoading) return
      const userId = user?.username || user?.id
      if (!userId) {
        console.log("No user identifier found:", user)
        return
      }

      setProfileLoading(true)
      try {
        const response = await fetch(`/api/founder/profile?civicId=${userId}`)
        if (response.ok) {
          const data = await response.json()
          setFounderProfile(data.profile)
          setCompanies(data.companies || [])
          setValidations(data.validations || [])
        }
      } catch (error) {
        console.error("Error loading founder data:", error)
      } finally {
        setProfileLoading(false)
      }
    }

    loadFounderData()
  }, [user?.username, user?.id, authLoading, user])

  return {
    founderProfile,
    setFounderProfile,
    companies,
    setCompanies,
    validations,
    setValidations,
    profileLoading,
    user,
    authLoading,
  }
}
