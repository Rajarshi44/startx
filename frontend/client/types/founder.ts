export interface User {
  username?: string
  id?: string
  name?: string
  email?: string
}

export interface FounderProfile {
  user?: User
  company_count?: number
  cofounders?: string[]
  bio?: string
  achievements?: any[]
}

export interface Company {
  id: string
  name: string
  description?: string
  industry?: string
  stage?: string
  level?: string
  valuation?: string
  match?: string
  sector?: string
}

export interface Validation {
  id: string
  idea_text: string
  score?: number
  perplexity_response?: string
  validation_result?: string
  company?: Company
  created_at: string
}

export interface CofounderProfile {
  name: string
  avatar: string
  title: string
  skills: string[]
  compatibility: number
  email?: string
  location?: string
  bio?: string
}

export interface Investor {
  id: string
  name: string
  email?: string
  description: string
  minInvestment: number
  maxInvestment: number
  preferredStages: string[]
  preferredIndustries: string[]
  portfolio: number
  location: string
  bio: string
}

export interface JobForm {
  title: string
  description: string
  requirements: string
  skillsRequired: string
  experienceLevel: string
  jobType: string
  workMode: string
  salaryRange: string
  location: string
  companyId: string
}

export interface CompanyForm {
  name: string
  description: string
  industry: string
  stage: string
  level: string
  valuation: string
  match: string
  sector: string
}

export interface FounderDetailsForm {
  name: string
  email: string
  companyCount: string
  cofounders: string
  bio: string
  achievements: any[]
}
