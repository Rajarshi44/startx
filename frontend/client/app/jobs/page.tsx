"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@civic/auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { 
  Search, MapPin, DollarSign, Clock, Building, Users, 
  Briefcase, Filter, Calendar, Send, Star 
} from "lucide-react";

export default function JobsPage() {
  const { user } = useUser();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    jobType: "",
    workMode: "",
    location: "",
    skills: "",
  });
  const [applicationDialog, setApplicationDialog] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [coverLetter, setCoverLetter] = useState("");

  const jobTypes = ["Full-time", "Part-time", "Contract", "Freelance", "Internship"];
  const workModes = ["Remote", "On-site", "Hybrid"];

  useEffect(() => {
    loadJobs();
  }, [filters]);

  const loadJobs = async () => {
    try {
      const params = new URLSearchParams();
      params.append("status", "active");
      
      if (filters.jobType) params.append("jobType", filters.jobType);
      if (filters.workMode) params.append("workMode", filters.workMode);
      if (filters.location) params.append("location", filters.location);
      if (filters.skills) params.append("skills", filters.skills);

      const response = await fetch(`/api/jobs?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        let filteredJobs = data.jobs || [];
        
        // Client-side filtering for search term
        if (filters.search) {
          filteredJobs = filteredJobs.filter((job: any) => 
            job.title.toLowerCase().includes(filters.search.toLowerCase()) ||
            job.description?.toLowerCase().includes(filters.search.toLowerCase()) ||
            job.company?.name.toLowerCase().includes(filters.search.toLowerCase())
          );
        }
        
        setJobs(filteredJobs);
      }
    } catch (error) {
      console.error("Error loading jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!selectedJob) return;

    const civicId = user?.username || localStorage.getItem("mockCivicId") || `mock_user_${Date.now()}`;

    try {
      const response = await fetch("/api/jobseeker/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          civicId: civicId,
          jobPostingId: selectedJob.id,
          coverLetter: coverLetter
        }),
      });

      if (response.ok) {
        alert("Application submitted successfully!");
        setApplicationDialog(false);
        setCoverLetter("");
        setSelectedJob(null);
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Failed to submit application");
      }
    } catch (error) {
      console.error("Error applying to job:", error);
      alert("Failed to submit application");
    }
  };

  const openApplicationDialog = (job: any) => {
    setSelectedJob(job);
    setCoverLetter(`Dear ${job.company?.name} Team,

I am writing to express my interest in the ${job.title} position. I believe my skills and experience make me a great fit for this role.

${job.skills_required?.slice(0, 3).map((skill: string) => 
  `I have experience with ${skill}`).join(', ')}.

I am excited about the opportunity to contribute to your team and would love to discuss how my background aligns with your needs.

Best regards`);
    setApplicationDialog(true);
  };

  const getJobTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      "Full-time": "bg-blue-500/20 text-blue-400",
      "Part-time": "bg-green-500/20 text-green-400",
      "Contract": "bg-yellow-500/20 text-yellow-400",
      "Freelance": "bg-purple-500/20 text-purple-400",
      "Internship": "bg-orange-500/20 text-orange-400",
    };
    return colors[type] || "bg-gray-500/20 text-gray-400";
  };

  const getWorkModeColor = (mode: string) => {
    const colors: Record<string, string> = {
      "Remote": "bg-emerald-500/20 text-emerald-400",
      "On-site": "bg-rose-500/20 text-rose-400",
      "Hybrid": "bg-indigo-500/20 text-indigo-400",
    };
    return colors[mode] || "bg-gray-500/20 text-gray-400";
  };

  const calculateMatchScore = (job: any) => {
    // Mock match calculation - in real app, this would be based on user profile
    return Math.floor(Math.random() * 20) + 80;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#2f2f2f] p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ffcb74] mx-auto"></div>
            <p className="text-[#f6f6f6] mt-4">Loading jobs...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#2f2f2f] p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-[#ffcb74] rounded-2xl flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-[#111111]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#f6f6f6]">Job Opportunities</h1>
              <p className="text-[#f6f6f6]/70">Discover your next career opportunity</p>
            </div>
          </div>

          {/* Filters */}
          <Card className="bg-[#111111]/80 border-[#ffcb74]/20">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="lg:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#f6f6f6]/50 w-4 h-4" />
                    <Input
                      placeholder="Search jobs, companies, skills..."
                      value={filters.search}
                      onChange={(e) => setFilters({...filters, search: e.target.value})}
                      className="pl-10 bg-[#2f2f2f] border-[#ffcb74]/30 text-[#f6f6f6]"
                    />
                  </div>
                </div>
                
                <Select value={filters.jobType} onValueChange={(value: string) => setFilters({...filters, jobType: value})}>
                  <SelectTrigger className="bg-[#2f2f2f] border-[#ffcb74]/30 text-[#f6f6f6]">
                    <SelectValue placeholder="Job Type" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#111111] border-[#ffcb74]/30">
                    <SelectItem value="" className="text-[#f6f6f6]">All Types</SelectItem>
                    {jobTypes.map((type) => (
                      <SelectItem key={type} value={type} className="text-[#f6f6f6]">
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filters.workMode} onValueChange={(value: string) => setFilters({...filters, workMode: value})}>
                  <SelectTrigger className="bg-[#2f2f2f] border-[#ffcb74]/30 text-[#f6f6f6]">
                    <SelectValue placeholder="Work Mode" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#111111] border-[#ffcb74]/30">
                    <SelectItem value="" className="text-[#f6f6f6]">All Modes</SelectItem>
                    {workModes.map((mode) => (
                      <SelectItem key={mode} value={mode} className="text-[#f6f6f6]">
                        {mode}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input
                  placeholder="Location"
                  value={filters.location}
                  onChange={(e) => setFilters({...filters, location: e.target.value})}
                  className="bg-[#2f2f2f] border-[#ffcb74]/30 text-[#f6f6f6]"
                />
              </div>
              
              <div className="mt-4">
                <Input
                  placeholder="Skills (comma separated)"
                  value={filters.skills}
                  onChange={(e) => setFilters({...filters, skills: e.target.value})}
                  className="bg-[#2f2f2f] border-[#ffcb74]/30 text-[#f6f6f6]"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results */}
        <div className="mb-6">
          <p className="text-[#f6f6f6]/70">
            {jobs.length} job{jobs.length !== 1 ? 's' : ''} found
          </p>
        </div>

        {/* Jobs List */}
        {jobs.length === 0 ? (
          <div className="text-center py-12">
            <Briefcase className="w-16 h-16 text-[#ffcb74]/50 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-[#f6f6f6] mb-2">No Jobs Found</h3>
            <p className="text-[#f6f6f6]/70 mb-6">Try adjusting your search criteria</p>
            <Button 
              onClick={() => setFilters({search: "", jobType: "", workMode: "", location: "", skills: ""})}
              className="bg-[#ffcb74] hover:bg-[#ffcb74]/80 text-[#111111]"
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {jobs.map((job) => {
              const matchScore = calculateMatchScore(job);
              return (
                <Card key={job.id} className="bg-[#111111]/80 border-[#ffcb74]/20 hover:border-[#ffcb74]/50 transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold text-[#f6f6f6]">
                            {job.title}
                          </h3>
                          <div className="text-2xl font-bold text-[#ffcb74]">
                            {matchScore}%
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 mb-3">
                          <Building className="w-4 h-4 text-[#ffcb74]" />
                          <span className="text-[#ffcb74] font-medium">
                            {job.company?.name}
                          </span>
                          {job.company?.industry && (
                            <Badge className="bg-[#ffcb74]/20 text-[#ffcb74] text-xs">
                              {job.company.industry}
                            </Badge>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-[#f6f6f6]/70 mb-4">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {job.location}
                          </div>
                          {job.salary_range && (
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-4 h-4" />
                              {job.salary_range}
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(job.created_at).toLocaleDateString()}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {job.job_type && (
                            <Badge className={`${getJobTypeColor(job.job_type)} text-xs`}>
                              {job.job_type}
                            </Badge>
                          )}
                          {job.work_mode && (
                            <Badge className={`${getWorkModeColor(job.work_mode)} text-xs`}>
                              {job.work_mode}
                            </Badge>
                          )}
                          {job.experience_level && (
                            <Badge className="bg-gray-500/20 text-gray-400 text-xs">
                              {job.experience_level}
                            </Badge>
                          )}
                        </div>

                        {job.description && (
                          <p className="text-[#f6f6f6]/80 text-sm mb-4 line-clamp-2">
                            {job.description}
                          </p>
                        )}

                        {job.skills_required && job.skills_required.length > 0 && (
                          <div className="mb-4">
                            <p className="text-sm font-medium text-[#f6f6f6] mb-2">Required Skills:</p>
                            <div className="flex flex-wrap gap-2">
                              {job.skills_required.slice(0, 6).map((skill: string, index: number) => (
                                <Badge key={index} className="bg-[#2f2f2f] text-[#f6f6f6] text-xs">
                                  {skill}
                                </Badge>
                              ))}
                              {job.skills_required.length > 6 && (
                                <Badge className="bg-[#2f2f2f] text-[#f6f6f6]/50 text-xs">
                                  +{job.skills_required.length - 6} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="ml-6 text-right">
                        <div className="mb-4">
                          <div className="flex items-center gap-1 text-[#ffcb74] text-sm mb-1">
                            <Star className="w-4 h-4" />
                            <span>Match Score</span>
                          </div>
                        </div>
                        <Button 
                          onClick={() => openApplicationDialog(job)}
                          className="bg-[#ffcb74] hover:bg-[#ffcb74]/80 text-[#111111] font-semibold"
                        >
                          <Send className="w-4 h-4 mr-2" />
                          Apply Now
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Application Dialog */}
        <Dialog open={applicationDialog} onOpenChange={setApplicationDialog}>
          <DialogContent className="bg-[#111111] border-[#ffcb74]/20 text-[#f6f6f6] max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-[#ffcb74]">
                Apply for {selectedJob?.title}
              </DialogTitle>
              <p className="text-[#f6f6f6]/70">
                at {selectedJob?.company?.name}
              </p>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="bg-[#ffcb74]/10 p-4 rounded-lg border border-[#ffcb74]/30">
                <h4 className="font-semibold text-[#f6f6f6] mb-2">Job Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#f6f6f6]/70">Position:</span>
                    <span className="text-[#f6f6f6]">{selectedJob?.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#f6f6f6]/70">Company:</span>
                    <span className="text-[#f6f6f6]">{selectedJob?.company?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#f6f6f6]/70">Location:</span>
                    <span className="text-[#f6f6f6]">{selectedJob?.location}</span>
                  </div>
                  {selectedJob?.salary_range && (
                    <div className="flex justify-between">
                      <span className="text-[#f6f6f6]/70">Salary:</span>
                      <span className="text-[#f6f6f6]">{selectedJob.salary_range}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[#f6f6f6]">Cover Letter</label>
                <Textarea
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Write your cover letter..."
                  className="bg-[#2f2f2f] border-[#ffcb74]/30 text-[#f6f6f6] min-h-[200px]"
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setApplicationDialog(false)}
                  className="bg-[#2f2f2f] text-[#f6f6f6] border-[#ffcb74]/30"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleApply}
                  className="bg-[#ffcb74] hover:bg-[#ffcb74]/80 text-[#111111]"
                  disabled={!coverLetter.trim()}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Submit Application
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
} 