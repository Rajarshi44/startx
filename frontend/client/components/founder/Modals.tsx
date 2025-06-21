"use client"

import type React from "react"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"
import type { CompanyForm, FounderDetailsForm, FounderProfile, Company } from "@/types/founder"

interface ModalsProps {
  showCompanyModal: boolean
  setShowCompanyModal: (show: boolean) => void
  showFounderModal: boolean
  setShowFounderModal: (show: boolean) => void
  companyForm: CompanyForm
  setCompanyForm: (form: CompanyForm) => void
  founderDetails: FounderDetailsForm
  setFounderDetails: (details: FounderDetailsForm) => void
  companyLoading: boolean
  setCompanyLoading: (loading: boolean) => void
  companyError: string | null
  setCompanyError: (error: string | null) => void
  founderLoading: boolean
  setFounderLoading: (loading: boolean) => void
  founderError: string | null
  setFounderError: (error: string | null) => void
  formRef: React.RefObject<HTMLFormElement>
  user: any
  setCompanies: (companies: Company[]) => void
  setFounderProfile: (profile: FounderProfile) => void
}

export function Modals({
  showCompanyModal,
  setShowCompanyModal,
  showFounderModal,
  setShowFounderModal,
  companyForm,
  setCompanyForm,
  founderDetails,
  setFounderDetails,
  companyLoading,
  setCompanyLoading,
  companyError,
  setCompanyError,
  founderLoading,
  setFounderLoading,
  founderError,
  setFounderError,
  formRef,
  user,
  setCompanies,
  setFounderProfile,
}: ModalsProps) {
  const handleCompanyChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setCompanyForm({ ...companyForm, [e.target.name]: e.target.value })
  }

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault()
    const userId = user?.username || user?.id
    if (!userId) {
      toast({ title: "Error", description: "Please sign in to create a company", variant: "destructive" })
      return
    }

    setCompanyLoading(true)
    setCompanyError(null)

    try {
      const res = await fetch("/api/company", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...companyForm,
          civicId: userId,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setCompanyError(data.error || "Failed to create company.")
        toast({ title: "Error", description: "Failed to create company", variant: "destructive" })
      } else {
        setShowCompanyModal(false)
        setCompanyForm({
          name: "",
          description: "",
          industry: "",
          stage: "",
          level: "",
          valuation: "",
          match: "",
          sector: "",
        })

        // Reload companies
        const companiesRes = await fetch(`/api/company?civicId=${userId}`)
        if (companiesRes.ok) {
          const companiesData = await companiesRes.json()
          setCompanies(companiesData.companies || [])
        }

        toast({ title: "Success", description: "Company created successfully!" })
      }
    } catch (e: any) {
      setCompanyError(e.message || "Failed to create company.")
      toast({ title: "Error", description: "Failed to create company", variant: "destructive" })
    } finally {
      setCompanyLoading(false)
    }
  }

  const handleFounderDetailsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFounderDetails({ ...founderDetails, [e.target.name]: e.target.value })
  }

  const handleFounderDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const userId = user?.username || user?.id
    if (!userId) {
      toast({ title: "Error", description: "Please sign in to save founder details", variant: "destructive" })
      return
    }

    setFounderLoading(true)
    setFounderError(null)

    try {
      // First update user role
      const roleRes = await fetch("/api/user/update-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          civicId: userId,
          role: "founder",
          email: founderDetails.email,
          name: founderDetails.name,
        }),
      })

      if (!roleRes.ok) {
        const roleData = await roleRes.json()
        setFounderError(roleData.error || "Failed to update role.")
        toast({ title: "Error", description: "Failed to update role", variant: "destructive" })
        return
      }

      // Then create/update founder profile
      const profileRes = await fetch("/api/founder/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          civicId: userId,
          company_count: Number.parseInt(founderDetails.companyCount) || 0,
          cofounders: founderDetails.cofounders.split("\n").filter((c) => c.trim()),
          bio: founderDetails.bio,
          achievements: founderDetails.achievements,
        }),
      })

      if (!profileRes.ok) {
        const profileData = await profileRes.json()
        setFounderError(profileData.error || "Failed to save profile.")
        toast({ title: "Error", description: "Failed to save profile", variant: "destructive" })
      } else {
        const profileData = await profileRes.json()
        setFounderProfile(profileData.profile)
        setShowFounderModal(false)
        toast({ title: "Success", description: "Founder profile created successfully!" })
      }
    } catch (e: any) {
      setFounderError(e.message || "Failed to save details.")
      toast({ title: "Error", description: "Failed to save details", variant: "destructive" })
    } finally {
      setFounderLoading(false)
    }
  }

  return (
    <>
      {/* Company Modal */}
      <Dialog open={showCompanyModal} onOpenChange={setShowCompanyModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Company</DialogTitle>
          </DialogHeader>
          <form ref={formRef} onSubmit={handleCreateCompany} className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input name="name" value={companyForm.name} onChange={handleCompanyChange} required className="mt-1" />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                name="description"
                value={companyForm.description}
                onChange={handleCompanyChange}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="industry">Industry</Label>
              <Input name="industry" value={companyForm.industry} onChange={handleCompanyChange} className="mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="stage">Stage</Label>
                <Input name="stage" value={companyForm.stage} onChange={handleCompanyChange} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="level">Level</Label>
                <Input name="level" value={companyForm.level} onChange={handleCompanyChange} className="mt-1" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="valuation">Valuation</Label>
                <Input
                  name="valuation"
                  value={companyForm.valuation}
                  onChange={handleCompanyChange}
                  type="number"
                  min="0"
                  step="any"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="match">Match</Label>
                <Input
                  name="match"
                  value={companyForm.match}
                  onChange={handleCompanyChange}
                  type="number"
                  min="0"
                  max="100"
                  step="any"
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="sector">Sector</Label>
              <Input name="sector" value={companyForm.sector} onChange={handleCompanyChange} className="mt-1" />
            </div>
            {companyError && <div className="text-red-400 text-sm">{companyError}</div>}
            <DialogFooter>
              <Button type="submit" disabled={companyLoading} className="bg-amber-500 text-black hover:bg-amber-600">
                {companyLoading ? "Creating..." : "Create Company"}
              </Button>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Founder Modal */}
      <Dialog open={showFounderModal} onOpenChange={setShowFounderModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Founder Details</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleFounderDetailsSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                name="name"
                value={founderDetails.name}
                onChange={handleFounderDetailsChange}
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                name="email"
                type="email"
                value={founderDetails.email}
                onChange={handleFounderDetailsChange}
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="companyCount">Number of Companies Founded</Label>
              <Input
                name="companyCount"
                type="number"
                min="0"
                value={founderDetails.companyCount}
                onChange={handleFounderDetailsChange}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="cofounders">Co-founder List (one per line)</Label>
              <Textarea
                name="cofounders"
                value={founderDetails.cofounders}
                onChange={handleFounderDetailsChange}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="bio">Bio/About</Label>
              <Textarea
                name="bio"
                value={founderDetails.bio}
                onChange={handleFounderDetailsChange}
                placeholder="Tell us about yourself and your entrepreneurial journey..."
                className="mt-1"
              />
            </div>
            {founderError && <div className="text-red-400 text-sm">{founderError}</div>}
            <DialogFooter>
              <Button type="submit" disabled={founderLoading} className="bg-amber-500 text-black hover:bg-amber-600">
                {founderLoading ? "Saving..." : "Save Details"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
