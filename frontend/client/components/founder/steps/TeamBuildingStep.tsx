"use client"

import type React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, Briefcase, Clock } from "lucide-react"
import type { JobForm, Company } from "@/types/founder"

interface TeamBuildingStepProps {
  skillsNeeded: string
  setSkillsNeeded: (skills: string) => void
  experienceLevel: string
  setExperienceLevel: (level: string) => void
  isMatching: boolean
  handleFindCofounders: () => void
  jobForm: JobForm
  handleJobFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  handleJobFormSelectChange: (name: string, value: string) => void
  handlePostJob: (e: React.FormEvent) => void
  jobLoading: boolean
  jobError: string | null
  companies: Company[]
}

export function TeamBuildingStep({
  skillsNeeded,
  setSkillsNeeded,
  experienceLevel,
  setExperienceLevel,
  isMatching,
  handleFindCofounders,
  jobForm,
  handleJobFormChange,
  handleJobFormSelectChange,
  handlePostJob,
  jobLoading,
  jobError,
  companies,
}: TeamBuildingStepProps) {
  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Co-founder Matching */}
        <Card className="border border-amber-500/20 rounded-2xl bg-gradient-to-br from-black/90 to-gray-900/90 backdrop-blur-sm hover:border-amber-500/40 transition-all duration-500">
          <CardHeader>
            <CardTitle className="flex items-center text-white font-light text-xl">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-500 flex items-center justify-center mr-4">
                <Users className="h-5 w-5 text-black" />
              </div>
              Find Co-founders
            </CardTitle>
            <CardDescription className="text-gray-400 font-light leading-relaxed ml-14">
              Match with compatible co-founders based on skills and experience
            </CardDescription>
          </CardHeader>
          <CardContent className="ml-14">
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-light mb-3 block text-gray-300 tracking-wide">Skills Needed</label>
                  <Input
                    placeholder="e.g., Technical, Marketing, Sales"
                    value={skillsNeeded}
                    onChange={(e) => setSkillsNeeded(e.target.value)}
                    className="border border-amber-500/20 rounded-xl bg-black/50 text-white placeholder:text-gray-500 focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 transition-all duration-300 font-light"
                  />
                </div>
                <div>
                  <label className="text-sm font-light mb-3 block text-gray-300 tracking-wide">Experience Level</label>
                  <Input
                    placeholder="e.g., 5+ years, Senior level"
                    value={experienceLevel}
                    onChange={(e) => setExperienceLevel(e.target.value)}
                    className="border border-amber-500/20 rounded-xl bg-black/50 text-white placeholder:text-gray-500 focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 transition-all duration-300 font-light"
                  />
                </div>
              </div>
              <Button
                onClick={handleFindCofounders}
                disabled={isMatching || !skillsNeeded.trim() || !experienceLevel.trim()}
                className="font-light px-8 py-3 rounded-xl transition-all duration-300 bg-gradient-to-r from-amber-400 to-amber-500 text-black hover:from-amber-500 hover:to-amber-600 hover:shadow-lg hover:shadow-amber-500/25 hover:scale-105 disabled:opacity-50"
              >
                {isMatching ? (
                  <>
                    <Clock className="mr-2 h-4 w-4 animate-spin" />
                    Matching...
                  </>
                ) : (
                  <>
                    <Users className="mr-2 h-4 w-4" />
                    Find Co-founders
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Job Posting */}
        <Card className="border border-amber-500/20 rounded-2xl bg-gradient-to-br from-black/90 to-gray-900/90 backdrop-blur-sm hover:border-amber-500/40 transition-all duration-500">
          <CardHeader>
            <CardTitle className="flex items-center text-white font-light text-xl">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-500 flex items-center justify-center mr-4">
                <Briefcase className="h-5 w-5 text-black" />
              </div>
              Post Jobs
            </CardTitle>
            <CardDescription className="text-gray-400 font-light leading-relaxed ml-14">
              Find talented individuals to join your team
            </CardDescription>
          </CardHeader>
          <CardContent className="ml-14">
            <form onSubmit={handlePostJob} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-light mb-3 block text-gray-300 tracking-wide">Company *</label>
                  <Select
                    value={jobForm.companyId}
                    onValueChange={(value) => handleJobFormSelectChange("companyId", value)}
                  >
                    <SelectTrigger className="border border-amber-500/20 rounded-xl bg-black/50 text-white focus:border-amber-500/60">
                      <SelectValue placeholder="Select company" />
                    </SelectTrigger>
                    <SelectContent>
                      {companies.map((company) => (
                        <SelectItem key={company.id} value={company.id}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-light mb-3 block text-gray-300 tracking-wide">Job Title *</label>
                  <Input
                    name="title"
                    placeholder="e.g., Frontend Developer"
                    value={jobForm.title}
                    onChange={handleJobFormChange}
                    required
                    className="border border-amber-500/20 rounded-xl bg-black/50 text-white placeholder:text-gray-500 focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 transition-all duration-300 font-light"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-light mb-3 block text-gray-300 tracking-wide">Job Description</label>
                <Textarea
                  name="description"
                  placeholder="Describe the role, responsibilities, and what you're looking for..."
                  value={jobForm.description}
                  onChange={handleJobFormChange}
                  className="min-h-[120px] border border-amber-500/20 rounded-xl p-4 bg-black/50 text-white placeholder:text-gray-500 focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 transition-all duration-300 font-light leading-relaxed"
                />
              </div>

              {jobError && (
                <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                  {jobError}
                </div>
              )}

              <Button
                type="submit"
                disabled={jobLoading || companies.length === 0}
                className="font-light px-8 py-3 rounded-xl transition-all duration-300 bg-gradient-to-r from-amber-400 to-amber-500 text-black hover:from-amber-500 hover:to-amber-600 hover:shadow-lg hover:shadow-amber-500/25 hover:scale-105 disabled:opacity-50"
              >
                {jobLoading ? (
                  <>
                    <Clock className="mr-2 h-4 w-4 animate-spin" />
                    Posting Job...
                  </>
                ) : (
                  <>
                    <Briefcase className="mr-2 h-4 w-4" />
                    Post Job
                  </>
                )}
              </Button>

              {companies.length === 0 && (
                <div className="text-amber-400 text-sm bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
                  You need to create a company first before posting jobs.
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
