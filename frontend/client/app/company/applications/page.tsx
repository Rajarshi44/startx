/*eslint-disable*/
"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@civic/auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Users, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Calendar, 
  MapPin, 
  Briefcase, 
  Mail, 
  Phone, 
  ExternalLink,
  Download,
  Star,
  Filter
} from "lucide-react";

export default function CompanyApplications() {
  const { user } = useUser();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [applicationDialog, setApplicationDialog] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [jobFilter, setJobFilter] = useState("all");
  const [jobs, setJobs] = useState<any[]>([]);
  const [notes, setNotes] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadApplications();
    loadJobs();
  }, [statusFilter, jobFilter]);

  const loadApplications = async () => {
    try {
      let url = `/api/company/applications`;
      if (statusFilter && statusFilter !== "all") url += `?status=${statusFilter}`;
      if (jobFilter && jobFilter !== "all") url += `${statusFilter && statusFilter !== "all" ? "&" : "?"}jobPostingId=${jobFilter}`;

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setApplications(data.applications || []);
      }
    } catch (error) {
      console.error("Error loading applications:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadJobs = async () => {
    try {
      const response = await fetch(`/api/jobs`);
      if (response.ok) {
        const data = await response.json();
        setJobs(data.jobs || []);
      }
    } catch (error) {
      console.error("Error loading jobs:", error);
    }
  };

  const handleStatusUpdate = async (applicationId: string, newStatus: string) => {
    setUpdating(true);
    try {
      const response = await fetch("/api/company/applications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId,
          status: newStatus,
          notes: notes.trim() || undefined
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setApplications(prev => 
          prev.map(app => 
            app.id === applicationId ? data.application : app
          )
        );
        setApplicationDialog(false);
        setNotes("");
        setSelectedApplication(null);
        alert(`Application ${newStatus} successfully!`);
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Failed to update application");
      }
    } catch (error) {
      console.error("Error updating application:", error);
      alert("Failed to update application");
    } finally {
      setUpdating(false);
    }
  };

  const openApplicationDialog = (application: any) => {
    setSelectedApplication(application);
    setNotes(application.notes || "");
    setApplicationDialog(true);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'applied':
        return "bg-blue-500/20 text-blue-400";
      case 'reviewing':
        return "bg-yellow-500/20 text-yellow-400";
      case 'interview':
        return "bg-purple-500/20 text-purple-400";
      case 'offer':
        return "bg-orange-500/20 text-orange-400";
      case 'hired':
        return "bg-green-500/20 text-green-400";
      case 'rejected':
        return "bg-red-500/20 text-red-400";
      case 'accepted':
        return "bg-green-500/20 text-green-400";
      case 'waitlist':
        return "bg-gray-500/20 text-gray-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  const getStatusCount = (status: string) => {
    return applications.filter(app => app.status === status).length;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#2f2f2f] p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ffcb74] mx-auto"></div>
            <p className="text-[#f6f6f6] mt-4">Loading applications...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#2f2f2f] p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#ffcb74] rounded-2xl flex items-center justify-center">
              <Users className="w-6 h-6 text-[#111111]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#f6f6f6]">Job Applications</h1>
              <p className="text-[#f6f6f6]/70">Manage applications for your job postings</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card className="bg-[#111111]/80 border-[#ffcb74]/20">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-[#ffcb74]">{applications.length}</div>
              <div className="text-sm text-[#f6f6f6]/70">Total</div>
            </CardContent>
          </Card>
          <Card className="bg-[#111111]/80 border-blue-500/20">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-400">{getStatusCount('applied')}</div>
              <div className="text-sm text-[#f6f6f6]/70">Applied</div>
            </CardContent>
          </Card>
          <Card className="bg-[#111111]/80 border-purple-500/20">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-400">{getStatusCount('interview')}</div>
              <div className="text-sm text-[#f6f6f6]/70">Interview</div>
            </CardContent>
          </Card>
          <Card className="bg-[#111111]/80 border-green-500/20">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-400">{getStatusCount('accepted')}</div>
              <div className="text-sm text-[#f6f6f6]/70">Accepted</div>
            </CardContent>
          </Card>
          <Card className="bg-[#111111]/80 border-red-500/20">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-400">{getStatusCount('rejected') + getStatusCount('waitlist')}</div>
              <div className="text-sm text-[#f6f6f6]/70">Rejected/Waitlist</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-[#111111]/80 border-[#ffcb74]/20 mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium text-[#f6f6f6] mb-2 block">Filter by Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="bg-[#2f2f2f] border-[#ffcb74]/30 text-[#f6f6f6]">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="applied">Applied</SelectItem>
                    <SelectItem value="interview">Interview</SelectItem>
                    <SelectItem value="accepted">Accepted</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="waitlist">Waitlist</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium text-[#f6f6f6] mb-2 block">Filter by Job</label>
                <Select value={jobFilter} onValueChange={setJobFilter}>
                  <SelectTrigger className="bg-[#2f2f2f] border-[#ffcb74]/30 text-[#f6f6f6]">
                    <SelectValue placeholder="All jobs" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All jobs</SelectItem>
                    {jobs.map((job) => (
                      <SelectItem key={job.id} value={job.id}>
                        {job.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Applications List */}
        {applications.length === 0 ? (
          <Card className="bg-[#111111]/80 border-[#ffcb74]/20">
            <CardContent className="p-12 text-center">
              <Users className="w-16 h-16 text-[#ffcb74]/50 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-[#f6f6f6] mb-2">No Applications Yet</h3>
              <p className="text-[#f6f6f6]/70">Applications for your job postings will appear here</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {applications.map((application) => (
              <Card key={application.id} className="bg-[#111111]/80 border-[#ffcb74]/20 hover:border-[#ffcb74]/50 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <h3 className="text-lg font-semibold text-[#f6f6f6]">
                          {application.jobseeker?.jobseeker_profile?.first_name} {application.jobseeker?.jobseeker_profile?.last_name}
                        </h3>
                        <Badge className={`${getStatusColor(application.status)} text-xs`}>
                          {application.status.toUpperCase()}
                        </Badge>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <h4 className="font-medium text-[#ffcb74] mb-2">
                            Job Application
                          </h4>
                          <p className="text-sm text-[#f6f6f6]/70 mb-1">
                            Job ID: {application.job_posting_id?.slice(0, 8) || 'N/A'}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-[#f6f6f6]/50">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Applied {new Date(application.applied_at).toLocaleDateString()}
                            </span>
                            {application.jobseeker?.jobseeker_profile?.city && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {application.jobseeker.jobseeker_profile.city}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex items-center gap-2 text-sm text-[#f6f6f6]/70 mb-2">
                            <Mail className="w-4 h-4" />
                            {application.jobseeker?.email}
                          </div>
                          {application.jobseeker?.jobseeker_profile?.phone && (
                            <div className="flex items-center gap-2 text-sm text-[#f6f6f6]/70 mb-2">
                              <Phone className="w-4 h-4" />
                              {application.jobseeker.jobseeker_profile.phone}
                            </div>
                          )}
                          {application.jobseeker?.jobseeker_profile?.experience_level && (
                            <div className="flex items-center gap-2 text-sm text-[#f6f6f6]/70">
                              <Briefcase className="w-4 h-4" />
                              {application.jobseeker.jobseeker_profile.experience_level}
                            </div>
                          )}
                        </div>
                      </div>

                      {application.cover_letter && (
                        <div className="mb-4">
                          <p className="text-sm font-medium text-[#f6f6f6] mb-2">Cover Letter:</p>
                          <p className="text-sm text-[#f6f6f6]/70 line-clamp-3">
                            {application.cover_letter}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openApplicationDialog(application)}
                        className="border-[#ffcb74]/30 text-[#ffcb74] hover:bg-[#ffcb74]/10"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View Details
                      </Button>
                      
                      {application.status === 'applied' && (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            onClick={() => handleStatusUpdate(application.id, 'interview')}
                            className="bg-purple-500 hover:bg-purple-600 text-white text-xs"
                          >
                            Interview
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleStatusUpdate(application.id, 'rejected')}
                            className="bg-red-500 hover:bg-red-600 text-white text-xs"
                          >
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleStatusUpdate(application.id, 'waitlist')}
                            className="bg-gray-500 hover:bg-gray-600 text-white text-xs"
                          >
                            Waitlist
                          </Button>
                        </div>
                      )}
                      
                      {application.status === 'interview' && (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            onClick={() => handleStatusUpdate(application.id, 'accepted')}
                            className="bg-green-500 hover:bg-green-600 text-white text-xs"
                          >
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleStatusUpdate(application.id, 'rejected')}
                            className="bg-red-500 hover:bg-red-600 text-white text-xs"
                          >
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleStatusUpdate(application.id, 'waitlist')}
                            className="bg-gray-500 hover:bg-gray-600 text-white text-xs"
                          >
                            Waitlist
                          </Button>
                        </div>
                      )}
                      
                      {application.status === 'waitlist' && (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            onClick={() => handleStatusUpdate(application.id, 'interview')}
                            className="bg-purple-500 hover:bg-purple-600 text-white text-xs"
                          >
                            Interview
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleStatusUpdate(application.id, 'accepted')}
                            className="bg-green-500 hover:bg-green-600 text-white text-xs"
                          >
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleStatusUpdate(application.id, 'rejected')}
                            className="bg-red-500 hover:bg-red-600 text-white text-xs"
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Application Details Dialog */}
        <Dialog open={applicationDialog} onOpenChange={setApplicationDialog}>
          <DialogContent className="bg-[#111111] border-[#ffcb74]/20 text-[#f6f6f6] max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-[#ffcb74]">
                Application Details
              </DialogTitle>
            </DialogHeader>
            
            {selectedApplication && (
              <div className="space-y-6">
                {/* Applicant Info */}
                <div className="bg-[#ffcb74]/10 p-4 rounded-lg border border-[#ffcb74]/30">
                  <h4 className="font-semibold text-[#f6f6f6] mb-3">Applicant Information</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-[#f6f6f6]/70">Name</p>
                      <p className="text-[#f6f6f6]">
                        {selectedApplication.jobseeker?.jobseeker_profile?.first_name} {selectedApplication.jobseeker?.jobseeker_profile?.last_name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-[#f6f6f6]/70">Email</p>
                      <p className="text-[#f6f6f6]">{selectedApplication.jobseeker?.email}</p>
                    </div>
                    {selectedApplication.jobseeker?.jobseeker_profile?.phone && (
                      <div>
                        <p className="text-sm text-[#f6f6f6]/70">Phone</p>
                        <p className="text-[#f6f6f6]">{selectedApplication.jobseeker.jobseeker_profile.phone}</p>
                      </div>
                    )}
                    {selectedApplication.jobseeker?.jobseeker_profile?.city && (
                      <div>
                        <p className="text-sm text-[#f6f6f6]/70">Location</p>
                        <p className="text-[#f6f6f6]">{selectedApplication.jobseeker.jobseeker_profile.city}</p>
                      </div>
                    )}
                    {selectedApplication.jobseeker?.jobseeker_profile?.experience_level && (
                      <div>
                        <p className="text-sm text-[#f6f6f6]/70">Experience Level</p>
                        <p className="text-[#f6f6f6]">{selectedApplication.jobseeker.jobseeker_profile.experience_level}</p>
                      </div>
                    )}
                    {selectedApplication.jobseeker?.jobseeker_profile?.education_level && (
                      <div>
                        <p className="text-sm text-[#f6f6f6]/70">Education</p>
                        <p className="text-[#f6f6f6]">{selectedApplication.jobseeker.jobseeker_profile.education_level}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Job Details */}
                <div className="bg-[#ffcb74]/10 p-4 rounded-lg border border-[#ffcb74]/30">
                  <h4 className="font-semibold text-[#f6f6f6] mb-3">Job Details</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-[#f6f6f6]/70">Position</p>
                      <p className="text-[#f6f6f6]">{selectedApplication.job_posting?.title}</p>
                    </div>
                    <div>
                      <p className="text-sm text-[#f6f6f6]/70">Company</p>
                      <p className="text-[#f6f6f6]">{selectedApplication.job_posting?.company?.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-[#f6f6f6]/70">Location</p>
                      <p className="text-[#f6f6f6]">{selectedApplication.job_posting?.location}</p>
                    </div>
                    <div>
                      <p className="text-sm text-[#f6f6f6]/70">Job Type</p>
                      <p className="text-[#f6f6f6]">{selectedApplication.job_posting?.job_type}</p>
                    </div>
                    {selectedApplication.job_posting?.salary_range && (
                      <div>
                        <p className="text-sm text-[#f6f6f6]/70">Salary Range</p>
                        <p className="text-[#f6f6f6]">{selectedApplication.job_posting.salary_range}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-[#f6f6f6]/70">Applied Date</p>
                      <p className="text-[#f6f6f6]">
                        {new Date(selectedApplication.applied_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Skills */}
                {selectedApplication.jobseeker?.jobseeker_profile?.skills && selectedApplication.jobseeker.jobseeker_profile.skills.length > 0 && (
                  <div className="bg-[#ffcb74]/10 p-4 rounded-lg border border-[#ffcb74]/30">
                    <h4 className="font-semibold text-[#f6f6f6] mb-3">Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedApplication.jobseeker.jobseeker_profile.skills.slice(0, 5).map((skill: string, index: number) => (
                        <Badge key={index} className="bg-[#2f2f2f] text-[#f6f6f6]">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bio */}
                {selectedApplication.jobseeker?.jobseeker_profile?.bio && (
                  <div className="bg-[#ffcb74]/10 p-4 rounded-lg border border-[#ffcb74]/30">
                    <h4 className="font-semibold text-[#f6f6f6] mb-3">Bio</h4>
                    <p className="text-[#f6f6f6]/80">{selectedApplication.jobseeker.jobseeker_profile.bio}</p>
                  </div>
                )}

                {/* Cover Letter */}
                {selectedApplication.cover_letter && (
                  <div className="bg-[#ffcb74]/10 p-4 rounded-lg border border-[#ffcb74]/30">
                    <h4 className="font-semibold text-[#f6f6f6] mb-3">Cover Letter</h4>
                    <p className="text-[#f6f6f6]/80 whitespace-pre-wrap">{selectedApplication.cover_letter}</p>
                  </div>
                )}

                {/* Links */}
                <div className="bg-[#ffcb74]/10 p-4 rounded-lg border border-[#ffcb74]/30">
                  <h4 className="font-semibold text-[#f6f6f6] mb-3">Links</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedApplication.jobseeker?.jobseeker_profile?.linkedin_url && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(selectedApplication.jobseeker.jobseeker_profile.linkedin_url, '_blank')}
                        className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        LinkedIn
                      </Button>
                    )}
                    {selectedApplication.jobseeker?.jobseeker_profile?.github_url && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(selectedApplication.jobseeker.jobseeker_profile.github_url, '_blank')}
                        className="border-gray-500/30 text-gray-400 hover:bg-gray-500/10"
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        GitHub
                      </Button>
                    )}
                    {selectedApplication.jobseeker?.jobseeker_profile?.portfolio_url && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(selectedApplication.jobseeker.jobseeker_profile.portfolio_url, '_blank')}
                        className="border-green-500/30 text-green-400 hover:bg-green-500/10"
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        Portfolio
                      </Button>
                    )}
                    {selectedApplication.jobseeker?.jobseeker_profile?.resume_url && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(selectedApplication.jobseeker.jobseeker_profile.resume_url, '_blank')}
                        className="border-[#ffcb74]/30 text-[#ffcb74] hover:bg-[#ffcb74]/10"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Resume
                      </Button>
                    )}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="text-sm font-medium text-[#f6f6f6] mb-2 block">Notes</label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add notes about this application..."
                    className="bg-[#2f2f2f] border-[#ffcb74]/30 text-[#f6f6f6] min-h-[100px]"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setApplicationDialog(false)}
                    className="bg-[#2f2f2f] text-[#f6f6f6] border-[#ffcb74]/30"
                  >
                    Close
                  </Button>
                  
                  {selectedApplication.status === 'applied' && (
                    <>
                      <Button
                        onClick={() => handleStatusUpdate(selectedApplication.id, 'interview')}
                        className="bg-purple-500 hover:bg-purple-600 text-white"
                        disabled={updating}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Move to Interview
                      </Button>
                      <Button
                        onClick={() => handleStatusUpdate(selectedApplication.id, 'rejected')}
                        className="bg-red-500 hover:bg-red-600 text-white"
                        disabled={updating}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                    </>
                  )}
                  
                  {selectedApplication.status === 'interview' && (
                    <>
                      <Button
                        onClick={() => handleStatusUpdate(selectedApplication.id, 'accepted')}
                        className="bg-green-500 hover:bg-green-600 text-white"
                        disabled={updating}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Accept
                      </Button>
                      <Button
                        onClick={() => handleStatusUpdate(selectedApplication.id, 'rejected')}
                        className="bg-red-500 hover:bg-red-600 text-white"
                        disabled={updating}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                    </>
                  )}
                  
                  {selectedApplication.status === 'waitlist' && (
                    <>
                      <Button
                        onClick={() => handleStatusUpdate(selectedApplication.id, 'interview')}
                        className="bg-purple-500 hover:bg-purple-600 text-white"
                        disabled={updating}
                      >
                        Interview
                      </Button>
                      <Button
                        onClick={() => handleStatusUpdate(selectedApplication.id, 'accepted')}
                        className="bg-green-500 hover:bg-green-600 text-white"
                        disabled={updating}
                      >
                        Accept
                      </Button>
                      <Button
                        onClick={() => handleStatusUpdate(selectedApplication.id, 'rejected')}
                        className="bg-red-500 hover:bg-red-600 text-white"
                        disabled={updating}
                      >
                        Reject
                      </Button>
                    </>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
} 