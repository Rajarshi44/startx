"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@civic/auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Building, Edit, Trash2, Users, Briefcase, Star } from "lucide-react";

export default function CompanyManagement() {
  const { user } = useUser();
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    industry: "",
    stage: "",
    level: "",
    valuation: "",
    match: "",
    sector: "",
  });

  const industries = [
    "FinTech", "EdTech", "HealthTech", "E-commerce", "SaaS", "Mobile Apps",
    "Web Development", "AI/ML", "Blockchain", "IoT", "Cybersecurity",
    "Gaming", "Media", "Food & Beverage", "Fashion", "Travel", "Real Estate",
    "Agriculture", "Energy", "Transportation", "Manufacturing", "Retail"
  ];

  const stages = [
    "Idea", "MVP", "Early Stage", "Growth", "Scale", "Mature"
  ];

  const levels = [
    "Startup", "Small Business", "Medium Enterprise", "Large Enterprise"
  ];

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    const civicId = user?.username || localStorage.getItem("mockCivicId") || `mock_user_${Date.now()}`;
    
    try {
      const response = await fetch(`/api/company?civicId=${civicId}`);
      if (response.ok) {
        const data = await response.json();
        setCompanies(data.companies || []);
      }
    } catch (error) {
      console.error("Error loading companies:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const civicId = user?.username || localStorage.getItem("mockCivicId") || `mock_user_${Date.now()}`;

    try {
      const url = editingCompany ? "/api/company" : "/api/company";
      const method = editingCompany ? "PUT" : "POST";
      const body = editingCompany 
        ? { civicId, companyId: editingCompany.id, ...formData }
        : { civicId, ...formData };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        alert(editingCompany ? "Company updated successfully!" : "Company created successfully!");
        setDialogOpen(false);
        resetForm();
        loadCompanies();
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Failed to save company");
      }
    } catch (error) {
      console.error("Error saving company:", error);
      alert("Failed to save company");
    }
  };

  const handleEdit = (company: any) => {
    setEditingCompany(company);
    setFormData({
      name: company.name || "",
      description: company.description || "",
      industry: company.industry || "",
      stage: company.stage || "",
      level: company.level || "",
      valuation: company.valuation?.toString() || "",
      match: company.match?.toString() || "",
      sector: company.sector || "",
    });
    setDialogOpen(true);
  };

  const handleDelete = async (companyId: string) => {
    if (!confirm("Are you sure you want to delete this company?")) return;

    const civicId = user?.username || localStorage.getItem("mockCivicId") || `mock_user_${Date.now()}`;

    try {
      const response = await fetch("/api/company", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ civicId, companyId }),
      });

      if (response.ok) {
        alert("Company deleted successfully!");
        loadCompanies();
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Failed to delete company");
      }
    } catch (error) {
      console.error("Error deleting company:", error);
      alert("Failed to delete company");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      industry: "",
      stage: "",
      level: "",
      valuation: "",
      match: "",
      sector: "",
    });
    setEditingCompany(null);
  };

  const getStageColor = (stage: string) => {
    const colors: Record<string, string> = {
      "Idea": "bg-gray-500/20 text-gray-400",
      "MVP": "bg-blue-500/20 text-blue-400",
      "Early Stage": "bg-green-500/20 text-green-400",
      "Growth": "bg-yellow-500/20 text-yellow-400",
      "Scale": "bg-orange-500/20 text-orange-400",
      "Mature": "bg-purple-500/20 text-purple-400",
    };
    return colors[stage] || "bg-gray-500/20 text-gray-400";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#2f2f2f] p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ffcb74] mx-auto"></div>
            <p className="text-[#f6f6f6] mt-4">Loading companies...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#2f2f2f] p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#ffcb74] rounded-2xl flex items-center justify-center">
              <Building className="w-6 h-6 text-[#111111]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#f6f6f6]">Company Management</h1>
              <p className="text-[#f6f6f6]/70">Manage your companies and ventures</p>
            </div>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                onClick={resetForm}
                className="bg-[#ffcb74] hover:bg-[#ffcb74]/80 text-[#111111] font-semibold"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Company
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#111111] border-[#ffcb74]/20 text-[#f6f6f6] max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-[#ffcb74]">
                  {editingCompany ? "Edit Company" : "Add New Company"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#f6f6f6]">Company Name *</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Enter company name"
                      className="bg-[#2f2f2f] border-[#ffcb74]/30 text-[#f6f6f6]"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#f6f6f6]">Industry</label>
                    <Select value={formData.industry} onValueChange={(value) => setFormData({...formData, industry: value})}>
                      <SelectTrigger className="bg-[#2f2f2f] border-[#ffcb74]/30 text-[#f6f6f6]">
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#111111] border-[#ffcb74]/30">
                        {industries.map((industry) => (
                          <SelectItem key={industry} value={industry} className="text-[#f6f6f6]">
                            {industry}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#f6f6f6]">Description</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Describe your company..."
                    className="bg-[#2f2f2f] border-[#ffcb74]/30 text-[#f6f6f6] min-h-[100px]"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#f6f6f6]">Stage</label>
                    <Select value={formData.stage} onValueChange={(value) => setFormData({...formData, stage: value})}>
                      <SelectTrigger className="bg-[#2f2f2f] border-[#ffcb74]/30 text-[#f6f6f6]">
                        <SelectValue placeholder="Select stage" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#111111] border-[#ffcb74]/30">
                        {stages.map((stage) => (
                          <SelectItem key={stage} value={stage} className="text-[#f6f6f6]">
                            {stage}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#f6f6f6]">Level</label>
                    <Select value={formData.level} onValueChange={(value) => setFormData({...formData, level: value})}>
                      <SelectTrigger className="bg-[#2f2f2f] border-[#ffcb74]/30 text-[#f6f6f6]">
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#111111] border-[#ffcb74]/30">
                        {levels.map((level) => (
                          <SelectItem key={level} value={level} className="text-[#f6f6f6]">
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#f6f6f6]">Valuation (₹)</label>
                    <Input
                      type="number"
                      value={formData.valuation}
                      onChange={(e) => setFormData({...formData, valuation: e.target.value})}
                      placeholder="Enter valuation"
                      className="bg-[#2f2f2f] border-[#ffcb74]/30 text-[#f6f6f6]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#f6f6f6]">Sector</label>
                    <Input
                      value={formData.sector}
                      onChange={(e) => setFormData({...formData, sector: e.target.value})}
                      placeholder="Enter sector"
                      className="bg-[#2f2f2f] border-[#ffcb74]/30 text-[#f6f6f6]"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                    className="bg-[#2f2f2f] text-[#f6f6f6] border-[#ffcb74]/30"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-[#ffcb74] hover:bg-[#ffcb74]/80 text-[#111111]">
                    {editingCompany ? "Update Company" : "Create Company"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Companies Grid */}
        {companies.length === 0 ? (
          <div className="text-center py-12">
            <Building className="w-16 h-16 text-[#ffcb74]/50 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-[#f6f6f6] mb-2">No Companies Yet</h3>
            <p className="text-[#f6f6f6]/70 mb-6">Create your first company to get started</p>
            <Button 
              onClick={() => setDialogOpen(true)}
              className="bg-[#ffcb74] hover:bg-[#ffcb74]/80 text-[#111111]"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Company
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companies.map((company) => (
              <Card key={company.id} className="bg-[#111111]/80 border-[#ffcb74]/20 hover:border-[#ffcb74]/50 transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-[#f6f6f6] text-lg mb-2">{company.name}</CardTitle>
                      <div className="flex flex-wrap gap-2">
                        {company.industry && (
                          <Badge className="bg-[#ffcb74]/20 text-[#ffcb74] text-xs">
                            {company.industry}
                          </Badge>
                        )}
                        {company.stage && (
                          <Badge className={`${getStageColor(company.stage)} text-xs`}>
                            {company.stage}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(company)}
                        className="h-8 w-8 p-0 text-[#f6f6f6] hover:text-[#ffcb74] hover:bg-[#ffcb74]/10"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(company.id)}
                        className="h-8 w-8 p-0 text-[#f6f6f6] hover:text-red-400 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-[#f6f6f6]/70 text-sm mb-4 line-clamp-3">
                    {company.description || "No description provided"}
                  </p>
                  
                  <div className="space-y-2">
                    {company.valuation && (
                      <div className="flex items-center gap-2 text-sm">
                        <Star className="w-4 h-4 text-[#ffcb74]" />
                        <span className="text-[#f6f6f6]/80">
                          Valuation: ₹{parseInt(company.valuation).toLocaleString()}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 text-sm">
                      <Briefcase className="w-4 h-4 text-[#ffcb74]" />
                      <span className="text-[#f6f6f6]/80">
                        {company.job_postings?.length || 0} Job Postings
                      </span>
                    </div>
                    
                    {company.level && (
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="w-4 h-4 text-[#ffcb74]" />
                        <span className="text-[#f6f6f6]/80">{company.level}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 