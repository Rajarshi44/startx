"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Users,
  Briefcase,
  MessageSquare,
  MapPin,
  Clock,
  DollarSign,
  CheckCircle,
  Play,
  Sparkles,
  Target,
  TrendingUp,
  Bell,
  Star,
  Camera,
  Upload,
  GraduationCap,
} from "lucide-react";

export default function JobSeekerDashboard() {
  const [isInterviewActive, setIsInterviewActive] = useState(false);
  const [data, setData] = useState({
    // Personal Information
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@email.com",
    phone: "+1 234 567 8900",
    city: "San Francisco",
    country: "USA",
    dateOfBirth: "1995-06-15",
    gender: "Male",
    languages: ["English", "Spanish", "French"],
    profilePicture: null,

    // Professional Information
    currentStatus: "Experienced Professional",
    experience: "3-5 years",
    education: "Bachelor's Degree",
    university: "Stanford University",
    graduationYear: "2020",
    skills: ["React", "Node.js", "Python", "TypeScript", "AWS", "Docker"],
    resume: null,
    portfolio: "https://johndoe.dev",
    linkedIn: "https://linkedin.com/in/johndoe",
    github: "https://github.com/johndoe",

    // Preferences
    interests: ["Software Development", "Web Development", "Machine Learning"],
    careerGoals: ["Senior Developer", "Tech Lead"],
    jobTypes: ["Full-time", "Remote"],
    workModes: ["Remote", "Hybrid"],
    salaryExpectation: "$120,000 - $160,000",
    availability: "2 weeks notice",
    relocate: "Maybe",

    // Additional
    bio: "Passionate full-stack developer with 5 years of experience building scalable web applications. Love working with modern technologies and solving complex problems.",
    achievements: ["AWS Certified", "Led team of 5 developers"],
    certifications: ["AWS Solutions Architect", "Google Cloud Professional"],
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("jobseekerProfile");
      if (stored) {
        setData(JSON.parse(stored));
      }
    }
  }, []);

  const startInterview = () => {
    setIsInterviewActive(true);
  };

  const update = (key: string, value: any) =>
    setData((prev) => ({ ...prev, [key]: value }));

  const SelectableCard = ({
    children,
    selected,
    onClick,
    className = "",
  }: {
    children: React.ReactNode;
    selected: boolean;
    onClick: () => void;
    className?: string;
  }) => (
    <Card
      onClick={onClick}
      className={`cursor-pointer transition-all duration-300 hover:scale-105 ${
        selected
          ? "border-[#ffcb74] bg-[#ffcb74]/10 shadow-lg ring-2 ring-[#ffcb74]/50"
          : "border-[#ffcb74]/20 bg-[#111111] hover:border-[#ffcb74]/50 hover:shadow-md"
      } ${className}`}
    >
      <CardContent className="p-4 text-[#f6f6f6]">{children}</CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-[#2f2f2f]">
      {/* Header */}
      <header className="bg-[#111111] border-b border-[#ffcb74]/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#ffcb74] rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-[#111111]" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#f6f6f6]">
                  JobSeeker Pro Dashboard
                </h1>
                <p className="text-[#f6f6f6]/70">
                  Your gateway to exciting opportunities
                </p>
              </div>
            </div>
            <Badge className="bg-[#ffcb74] text-[#111111] hover:bg-[#ffcb74]/80">
              Active Job Seeker
            </Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="profile" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4 bg-[#111111] border border-[#ffcb74]/20">
                <TabsTrigger
                  value="profile"
                  className="data-[state=active]:bg-[#ffcb74] data-[state=active]:text-[#111111] text-[#f6f6f6]"
                >
                  Profile
                </TabsTrigger>
                <TabsTrigger
                  value="jobs"
                  className="data-[state=active]:bg-[#ffcb74] data-[state=active]:text-[#111111] text-[#f6f6f6]"
                >
                  Jobs
                </TabsTrigger>
                <TabsTrigger
                  value="interview"
                  className="data-[state=active]:bg-[#ffcb74] data-[state=active]:text-[#111111] text-[#f6f6f6]"
                >
                  Interview
                </TabsTrigger>
                <TabsTrigger
                  value="applications"
                  className="data-[state=active]:bg-[#ffcb74] data-[state=active]:text-[#111111] text-[#f6f6f6]"
                >
                  Applications
                </TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="space-y-6">
                {/* Personal Information */}
                <Card className="bg-[#111111]/80 border-[#ffcb74]/20">
                  <CardHeader>
                    <CardTitle className="flex items-center text-[#f6f6f6]">
                      <Users className="mr-2 h-5 w-5 text-[#ffcb74]" />
                      Personal Information
                    </CardTitle>
                    <CardDescription className="text-[#f6f6f6]/70">
                      Your basic personal details
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-6 mb-6">
                      <div className="w-20 h-20 bg-[#ffcb74]/20 rounded-3xl border-4 border-[#ffcb74] shadow-lg flex items-center justify-center overflow-hidden">
                        {data.profilePicture ? (
                          <img
                            src={
                              URL.createObjectURL(data.profilePicture) ||
                              "/placeholder.svg"
                            }
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Camera className="w-8 h-8 text-[#ffcb74]" />
                        )}
                      </div>
                      <div className="flex gap-3">
                        <label className="cursor-pointer">
                          <Button className="bg-[#111111] hover:bg-[#111111]/80 text-[#f6f6f6] border border-[#ffcb74]">
                            <Upload className="w-4 h-4 mr-2" />
                            Upload Photo
                          </Button>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                              e.target.files?.[0] &&
                              update("profilePicture", e.target.files[0])
                            }
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block text-[#f6f6f6]">
                          First Name
                        </label>
                        <Input
                          value={data.firstName}
                          onChange={(e) => update("firstName", e.target.value)}
                          className="bg-[#2f2f2f] border-[#ffcb74]/30 text-[#f6f6f6] placeholder:text-[#f6f6f6]/50 focus:border-[#ffcb74]"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block text-[#f6f6f6]">
                          Last Name
                        </label>
                        <Input
                          value={data.lastName}
                          onChange={(e) => update("lastName", e.target.value)}
                          className="bg-[#2f2f2f] border-[#ffcb74]/30 text-[#f6f6f6] placeholder:text-[#f6f6f6]/50 focus:border-[#ffcb74]"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block text-[#f6f6f6]">
                          Email
                        </label>
                        <Input
                          value={data.email}
                          onChange={(e) => update("email", e.target.value)}
                          className="bg-[#2f2f2f] border-[#ffcb74]/30 text-[#f6f6f6] placeholder:text-[#f6f6f6]/50 focus:border-[#ffcb74]"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block text-[#f6f6f6]">
                          Phone
                        </label>
                        <Input
                          value={data.phone}
                          onChange={(e) => update("phone", e.target.value)}
                          className="bg-[#2f2f2f] border-[#ffcb74]/30 text-[#f6f6f6] placeholder:text-[#f6f6f6]/50 focus:border-[#ffcb74]"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block text-[#f6f6f6]">
                          City
                        </label>
                        <Input
                          value={data.city}
                          onChange={(e) => update("city", e.target.value)}
                          className="bg-[#2f2f2f] border-[#ffcb74]/30 text-[#f6f6f6] placeholder:text-[#f6f6f6]/50 focus:border-[#ffcb74]"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block text-[#f6f6f6]">
                          Date of Birth
                        </label>
                        <Input
                          type="date"
                          value={data.dateOfBirth}
                          onChange={(e) =>
                            update("dateOfBirth", e.target.value)
                          }
                          className="bg-[#2f2f2f] border-[#ffcb74]/30 text-[#f6f6f6] placeholder:text-[#f6f6f6]/50 focus:border-[#ffcb74]"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block text-[#f6f6f6]">
                          Gender
                        </label>
                        <Input
                          value={data.gender}
                          onChange={(e) => update("gender", e.target.value)}
                          className="bg-[#2f2f2f] border-[#ffcb74]/30 text-[#f6f6f6] placeholder:text-[#f6f6f6]/50 focus:border-[#ffcb74]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block text-[#f6f6f6]">
                        Languages
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {data.languages.map((lang, index) => (
                          <Badge
                            key={index}
                            className="bg-[#ffcb74]/20 text-[#ffcb74]"
                          >
                            {lang}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Professional Information */}
                <Card className="bg-[#111111]/80 border-[#ffcb74]/20">
                  <CardHeader>
                    <CardTitle className="flex items-center text-[#f6f6f6]">
                      <GraduationCap className="mr-2 h-5 w-5 text-[#ffcb74]" />
                      Professional Background
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block text-[#f6f6f6]">
                          Current Status
                        </label>
                        <Input
                          value={data.currentStatus}
                          onChange={(e) =>
                            update("currentStatus", e.target.value)
                          }
                          className="bg-[#2f2f2f] border-[#ffcb74]/30 text-[#f6f6f6] placeholder:text-[#f6f6f6]/50 focus:border-[#ffcb74]"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block text-[#f6f6f6]">
                          Experience Level
                        </label>
                        <Input
                          value={data.experience}
                          onChange={(e) => update("experience", e.target.value)}
                          className="bg-[#2f2f2f] border-[#ffcb74]/30 text-[#f6f6f6] placeholder:text-[#f6f6f6]/50 focus:border-[#ffcb74]"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block text-[#f6f6f6]">
                          Education
                        </label>
                        <Input
                          value={data.education}
                          onChange={(e) => update("education", e.target.value)}
                          className="bg-[#2f2f2f] border-[#ffcb74]/30 text-[#f6f6f6] placeholder:text-[#f6f6f6]/50 focus:border-[#ffcb74]"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block text-[#f6f6f6]">
                          University
                        </label>
                        <Input
                          value={data.university}
                          onChange={(e) => update("university", e.target.value)}
                          className="bg-[#2f2f2f] border-[#ffcb74]/30 text-[#f6f6f6] placeholder:text-[#f6f6f6]/50 focus:border-[#ffcb74]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block text-[#f6f6f6]">
                        Skills
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {data.skills.map((skill, index) => (
                          <Badge
                            key={index}
                            className="bg-[#ffcb74]/20 text-[#ffcb74]"
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block text-[#f6f6f6]">
                          Portfolio URL
                        </label>
                        <Input
                          value={data.portfolio}
                          onChange={(e) => update("portfolio", e.target.value)}
                          className="bg-[#2f2f2f] border-[#ffcb74]/30 text-[#f6f6f6] placeholder:text-[#f6f6f6]/50 focus:border-[#ffcb74]"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block text-[#f6f6f6]">
                          LinkedIn
                        </label>
                        <Input
                          value={data.linkedIn}
                          onChange={(e) => update("linkedIn", e.target.value)}
                          className="bg-[#2f2f2f] border-[#ffcb74]/30 text-[#f6f6f6] placeholder:text-[#f6f6f6]/50 focus:border-[#ffcb74]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block text-[#f6f6f6]">
                        Professional Summary
                      </label>
                      <Textarea
                        value={data.bio}
                        onChange={(e) => update("bio", e.target.value)}
                        className="bg-[#2f2f2f] border-[#ffcb74]/30 text-[#f6f6f6] placeholder:text-[#f6f6f6]/50 focus:border-[#ffcb74] min-h-[100px]"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block text-[#f6f6f6]">
                        Salary Expectation
                      </label>
                      <Input
                        value={data.salaryExpectation}
                        onChange={(e) =>
                          update("salaryExpectation", e.target.value)
                        }
                        className="bg-[#2f2f2f] border-[#ffcb74]/30 text-[#f6f6f6] placeholder:text-[#f6f6f6]/50 focus:border-[#ffcb74]"
                      />
                    </div>

                    <Button className="bg-[#111111] hover:bg-[#111111]/80 text-[#f6f6f6] border border-[#ffcb74]">
                      Update Profile
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="jobs" className="space-y-6">
                <Card className="bg-[#111111]/80 border-[#ffcb74]/20">
                  <CardHeader>
                    <CardTitle className="flex items-center text-[#f6f6f6]">
                      <Briefcase className="mr-2 h-5 w-5 text-[#ffcb74]" />
                      Recommended Jobs
                    </CardTitle>
                    <CardDescription className="text-[#f6f6f6]/70">
                      Jobs matched to your skills and preferences
                    </CardDescription>
                  </CardHeader>
                </Card>

                <div className="space-y-4">
                  {[
                    {
                      title: "Senior Frontend Developer",
                      company: "TechFlow AI",
                      location: "San Francisco, CA",
                      salary: "$120K - $160K",
                      match: "95%",
                      type: "Full-time",
                      posted: "2 days ago",
                      skills: ["React", "TypeScript", "Next.js"],
                    },
                    {
                      title: "Full Stack Engineer",
                      company: "DataVision",
                      location: "Remote",
                      salary: "$100K - $140K",
                      match: "88%",
                      type: "Full-time",
                      posted: "1 week ago",
                      skills: ["Node.js", "Python", "AWS"],
                    },
                    {
                      title: "Product Manager",
                      company: "StartupX",
                      location: "New York, NY",
                      salary: "$110K - $150K",
                      match: "82%",
                      type: "Full-time",
                      posted: "3 days ago",
                      skills: ["Product Strategy", "Analytics", "Agile"],
                    },
                  ].map((job, index) => (
                    <Card
                      key={index}
                      className="bg-[#111111]/80 border-[#ffcb74]/20 hover:border-[#ffcb74]/50 transition-all duration-300 hover:shadow-lg"
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold mb-1 text-[#f6f6f6]">
                              {job.title}
                            </h3>
                            <p className="text-[#ffcb74] font-medium mb-2">
                              {job.company}
                            </p>
                            <div className="flex items-center space-x-4 text-sm text-[#f6f6f6]/70 mb-3">
                              <div className="flex items-center">
                                <MapPin className="h-4 w-4 mr-1" />
                                {job.location}
                              </div>
                              <div className="flex items-center">
                                <DollarSign className="h-4 w-4 mr-1" />
                                {job.salary}
                              </div>
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                {job.posted}
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2 mb-3">
                              {job.skills.map((skill, skillIndex) => (
                                <Badge
                                  key={skillIndex}
                                  className="bg-[#ffcb74]/20 text-[#ffcb74] hover:bg-[#ffcb74]/30 text-xs"
                                >
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-[#ffcb74] mb-1">
                              {job.match}
                            </div>
                            <div className="text-xs text-[#f6f6f6]/50 mb-3">
                              Match
                            </div>
                            <Button className="bg-[#ffcb74] hover:bg-[#ffcb74]/80 text-[#111111] font-semibold">
                              Apply Now
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="interview" className="space-y-6">
                <Card className="bg-[#111111]/80 border-[#ffcb74]/20">
                  <CardHeader>
                    <CardTitle className="flex items-center text-[#f6f6f6]">
                      <MessageSquare className="mr-2 h-5 w-5 text-[#ffcb74]" />
                      AI Interview Practice
                    </CardTitle>
                    <CardDescription className="text-[#f6f6f6]/70">
                      Practice with our AI interviewer and get real-time
                      feedback
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {!isInterviewActive ? (
                      <div className="text-center py-8">
                        <div className="w-20 h-20 bg-[#ffcb74]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Play className="h-10 w-10 text-[#ffcb74]" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2 text-[#f6f6f6]">
                          Ready to Practice?
                        </h3>
                        <p className="text-[#f6f6f6]/70 mb-6 max-w-md mx-auto">
                          Our AI interviewer will ask you common interview
                          questions and provide feedback on your responses.
                        </p>
                        <div className="grid md:grid-cols-3 gap-4 mb-6">
                          <div className="text-center p-4 bg-[#2f2f2f] rounded-lg border border-[#ffcb74]/20">
                            <div className="text-2xl font-bold text-[#ffcb74] mb-1">
                              15
                            </div>
                            <div className="text-sm text-[#f6f6f6]/70">
                              Minutes
                            </div>
                          </div>
                          <div className="text-center p-4 bg-[#2f2f2f] rounded-lg border border-[#ffcb74]/20">
                            <div className="text-2xl font-bold text-[#ffcb74] mb-1">
                              8
                            </div>
                            <div className="text-sm text-[#f6f6f6]/70">
                              Questions
                            </div>
                          </div>
                          <div className="text-center p-4 bg-[#2f2f2f] rounded-lg border border-[#ffcb74]/20">
                            <div className="text-2xl font-bold text-[#ffcb74] mb-1">
                              AI
                            </div>
                            <div className="text-sm text-[#f6f6f6]/70">
                              Feedback
                            </div>
                          </div>
                        </div>
                        <Button
                          onClick={startInterview}
                          className="bg-[#ffcb74] hover:bg-[#ffcb74]/80 text-[#111111] font-semibold"
                        >
                          Start Interview Practice
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="bg-[#ffcb74]/10 p-4 rounded-lg border border-[#ffcb74]/30">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-[#ffcb74]">
                              Interview in Progress
                            </span>
                            <span className="text-sm text-[#f6f6f6]/70">
                              Question 1 of 8
                            </span>
                          </div>
                          <Progress
                            value={12.5}
                            className="h-2 mb-4 bg-[#2f2f2f]"
                          />
                          <div className="bg-[#2f2f2f] p-4 rounded-lg mb-4 border border-[#ffcb74]/20">
                            <p className="font-medium mb-2 text-[#f6f6f6]">
                              AI Interviewer:
                            </p>
                            <p className="text-[#f6f6f6]/80">
                              "Tell me about yourself and why you're interested
                              in working at a startup."
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-[#ffcb74] rounded-full animate-pulse"></div>
                            <span className="text-sm text-[#f6f6f6]/70">
                              Recording your response...
                            </span>
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <Button
                            variant="outline"
                            className="bg-[#111111] text-[#f6f6f6] border-[#ffcb74] hover:bg-[#ffcb74] hover:text-[#111111]"
                          >
                            Pause
                          </Button>
                          <Button className="bg-[#ffcb74] hover:bg-[#ffcb74]/80 text-[#111111] font-semibold">
                            Next Question
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Previous Interview Results */}
                <Card className="bg-[#111111]/80 border-[#ffcb74]/20">
                  <CardHeader>
                    <CardTitle className="text-lg text-[#f6f6f6]">
                      Previous Practice Sessions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        {
                          date: "Dec 15, 2024",
                          score: 8.5,
                          feedback: "Great technical answers",
                        },
                        {
                          date: "Dec 10, 2024",
                          score: 7.2,
                          feedback: "Work on behavioral questions",
                        },
                      ].map((session, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-[#2f2f2f] rounded-lg border border-[#ffcb74]/20"
                        >
                          <div>
                            <div className="font-medium text-[#f6f6f6]">
                              {session.date}
                            </div>
                            <div className="text-sm text-[#f6f6f6]/70">
                              {session.feedback}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-[#ffcb74]">
                              {session.score}/10
                            </div>
                            <div className="text-xs text-[#f6f6f6]/50">
                              Score
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="applications" className="space-y-6">
                <Card className="bg-[#111111]/80 border-[#ffcb74]/20">
                  <CardHeader>
                    <CardTitle className="flex items-center text-[#f6f6f6]">
                      <Target className="mr-2 h-5 w-5 text-[#ffcb74]" />
                      Application Status
                    </CardTitle>
                    <CardDescription className="text-[#f6f6f6]/70">
                      Track your job applications and their progress
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        {
                          company: "TechFlow AI",
                          position: "Senior Frontend Developer",
                          status: "Interview Scheduled",
                          date: "Applied 5 days ago",
                          statusColor: "bg-[#ffcb74]/20 text-[#ffcb74]",
                        },
                        {
                          company: "DataVision",
                          position: "Full Stack Engineer",
                          status: "Under Review",
                          date: "Applied 1 week ago",
                          statusColor: "bg-yellow-500/20 text-yellow-400",
                        },
                        {
                          company: "StartupX",
                          position: "Product Manager",
                          status: "Applied",
                          date: "Applied 2 days ago",
                          statusColor: "bg-[#f6f6f6]/20 text-[#f6f6f6]/70",
                        },
                      ].map((app, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-4 border border-[#ffcb74]/20 rounded-lg bg-[#2f2f2f]"
                        >
                          <div>
                            <h4 className="font-semibold text-[#f6f6f6]">
                              {app.position}
                            </h4>
                            <p className="text-sm text-[#ffcb74] mb-1">
                              {app.company}
                            </p>
                            <p className="text-xs text-[#f6f6f6]/50">
                              {app.date}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge className={`${app.statusColor} text-xs`}>
                              {app.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Completion */}
            <Card className="bg-[#111111]/80 border-[#ffcb74]/20">
              <CardHeader>
                <CardTitle className="text-lg text-[#f6f6f6]">
                  Profile Completion
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-[#f6f6f6]">Profile Strength</span>
                    <span className="text-[#ffcb74] font-semibold">85%</span>
                  </div>
                  <Progress value={85} className="h-2 bg-[#2f2f2f]" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-[#ffcb74] mr-2" />
                    <span className="text-[#f6f6f6]">
                      Personal info completed
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-[#ffcb74] mr-2" />
                    <span className="text-[#f6f6f6]">
                      Professional background added
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-[#ffcb74] mr-2" />
                    <span className="text-[#f6f6f6]">
                      Skills & interests listed
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-[#f6f6f6]/50">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>Upload resume</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Job Alerts */}
            <Card className="bg-[#111111]/80 border-[#ffcb74]/20">
              <CardHeader>
                <CardTitle className="text-lg text-[#f6f6f6] flex items-center">
                  <Bell className="w-4 h-4 mr-2 text-[#ffcb74]" />
                  Job Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-[#ffcb74]/10 rounded-lg border border-[#ffcb74]/30">
                    <div className="font-medium text-[#ffcb74] mb-1">
                      5 New Matches
                    </div>
                    <div className="text-sm text-[#f6f6f6]/70">
                      Based on your React & Node.js skills
                    </div>
                  </div>
                  <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/30">
                    <div className="font-medium text-green-400 mb-1">
                      Interview Scheduled
                    </div>
                    <div className="text-sm text-[#f6f6f6]/70">
                      TechFlow AI - Tomorrow 2:00 PM
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="bg-[#111111]/80 border-[#ffcb74]/20">
              <CardHeader>
                <CardTitle className="text-lg text-[#f6f6f6] flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2 text-[#ffcb74]" />
                  Your Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-[#2f2f2f] rounded-lg border border-[#ffcb74]/20">
                    <div className="text-2xl font-bold text-[#ffcb74]">15</div>
                    <div className="text-sm text-[#f6f6f6]/70">
                      Applications
                    </div>
                  </div>
                  <div className="text-center p-3 bg-[#2f2f2f] rounded-lg border border-[#ffcb74]/20">
                    <div className="text-2xl font-bold text-[#ffcb74]">4</div>
                    <div className="text-sm text-[#f6f6f6]/70">Interviews</div>
                  </div>
                  <div className="text-center p-3 bg-[#2f2f2f] rounded-lg border border-[#ffcb74]/20">
                    <div className="text-2xl font-bold text-[#ffcb74]">8.5</div>
                    <div className="text-sm text-[#f6f6f6]/70">Avg Score</div>
                  </div>
                  <div className="text-center p-3 bg-[#2f2f2f] rounded-lg border border-[#ffcb74]/20">
                    <div className="text-2xl font-bold text-[#ffcb74]">95%</div>
                    <div className="text-sm text-[#f6f6f6]/70">Top Match</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Achievement Badge */}
            <Card className="bg-gradient-to-br from-[#ffcb74]/20 to-[#ffcb74]/10 border-[#ffcb74]/30">
              <CardContent className="p-6 text-center">
                <Star className="w-8 h-8 text-[#ffcb74] mx-auto mb-2" />
                <h3 className="font-semibold text-[#f6f6f6] mb-1">
                  Profile Expert
                </h3>
                <p className="text-sm text-[#f6f6f6]/70">
                  Your profile is 85% complete!
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
