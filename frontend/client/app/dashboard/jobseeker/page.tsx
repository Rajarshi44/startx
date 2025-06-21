/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@civic/auth/react";
import {
  Camera,
  Upload,
  User,
  Heart,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  FileText,
  Sparkles,
  X,
  GraduationCap,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import axios from "axios";

export default function JobSeekerOnboarding() {
  type JobSeekerData = {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    city: string;
    country: string;
    dateOfBirth: string;
    gender: string;
    languages: string[];
    profilePicture: File | null;
    currentStatus: string;
    experience: string;
    education: string;
    university: string;
    graduationYear: string;
    skills: string[];
    resume: File | null;
    portfolio: string;
    linkedIn: string;
    github: string;
    interests: string[];
    careerGoals: string[];
    jobTypes: string[];
    workModes: string[];
    salaryExpectation: string;
    availability: string;
    relocate: string;
    bio: string;
    achievements: string[];
    certifications: string[];
  };

  const [step, setStep] = useState(1);
  const [data, setData] = useState<JobSeekerData>({
    // Personal Information
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    city: "",
    country: "India",
    dateOfBirth: "",
    gender: "",
    languages: ["English"],
    profilePicture: null,

    // Professional Information
    currentStatus: "",
    experience: "",
    education: "",
    university: "",
    graduationYear: "",
    skills: [],
    resume: null,
    portfolio: "",
    linkedIn: "",
    github: "",

    // Preferences
    interests: [],
    careerGoals: [],
    jobTypes: [],
    workModes: [],
    salaryExpectation: "",
    availability: "",
    relocate: "",

    // Additional
    bio: "",
    achievements: [],
    certifications: [],
  });
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState("");
  const [fieldsToFill, setFieldsToFill] = useState<string[]>([]);
  const [autoFilled, setAutoFilled] = useState(false);
  const [pdfStep, setPdfStep] = useState(true);

  const languages = [
    "English",
    "Hindi",
    "Bengali",
    "Telugu",
    "Tamil",
    "Marathi",
    "Gujarati",
    "Kannada",
    "Malayalam",
    "Punjabi",
    "French",
    "German",
    "Spanish",
    "Japanese",
    "Mandarin",
  ];

  const statusOptions = [
    "Student",
    "Recent Graduate",
    "Fresher",
    "Experienced Professional",
    "Career Changer",
    "Returning to Work",
  ];

  const experienceOptions = [
    "0-1 years",
    "1-3 years",
    "3-5 years",
    "5-10 years",
    "10+ years",
  ];

  const educationOptions = [
    "High School",
    "Diploma",
    "Bachelor's Degree",
    "Master's Degree",
    "PhD",
    "Professional Certification",
  ];

  const techSkills = [
    "JavaScript",
    "Python",
    "Java",
    "React",
    "Node.js",
    "Angular",
    "Vue.js",
    "TypeScript",
    "PHP",
    "C++",
    "C#",
    "Ruby",
    "Go",
    "Swift",
    "Kotlin",
    "Flutter",
    "React Native",
    "HTML/CSS",
    "SQL",
    "MongoDB",
    "PostgreSQL",
    "AWS",
    "Docker",
    "Kubernetes",
    "Machine Learning",
    "Data Science",
    "AI",
    "Blockchain",
    "DevOps",
    "UI/UX Design",
  ];

  const careerInterests = [
    "Software Development",
    "Web Development",
    "Mobile App Development",
    "Data Science",
    "Machine Learning",
    "AI/ML Engineering",
    "DevOps",
    "Cloud Computing",
    "Cybersecurity",
    "UI/UX Design",
    "Product Management",
    "Project Management",
    "Digital Marketing",
    "Content Writing",
    "Graphic Design",
    "Sales",
    "Business Development",
    "HR",
    "Finance",
    "Consulting",
    "Research",
    "Teaching",
    "Healthcare",
    "Legal",
  ];

  const jobTypeOptions = [
    "Full-time",
    "Part-time",
    "Contract",
    "Freelance",
    "Internship",
    "Temporary",
  ];

  const workModeOptions = ["Remote", "On-site", "Hybrid"];

  const router = useRouter();
  const { user } = useUser();

  const update = <K extends keyof JobSeekerData>(
    key: K,
    value: JobSeekerData[K]
  ) => setData((prev) => ({ ...prev, [key]: value }));

  const toggle = <K extends keyof JobSeekerData>(key: K, value: string) => {
    setData((prev) => ({
      ...prev,
      [key]: Array.isArray(prev[key])
        ? (prev[key] as string[]).includes(value)
          ? (prev[key] as string[]).filter((item) => item !== value)
          : [...(prev[key] as string[]), value]
        : prev[key],
    }));
  };

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
          : "border-[#111111] bg-[#111111] hover:border-[#ffcb74]/50 hover:shadow-md"
      } ${className}`}
    >
      <CardContent className="p-4 text-[#f6f6f6]">{children}</CardContent>
    </Card>
  );

  const FormSection = ({
    title,
    description,
    children,
  }: {
    title: string;
    description?: string;
    children: React.ReactNode;
  }) => (
    <Card className="bg-[#111111]/80 backdrop-blur-sm border-[#ffcb74]/20 shadow-xl">
      <CardContent className="p-8">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-[#f6f6f6] mb-2">{title}</h3>
          {description && <p className="text-[#f6f6f6]/70">{description}</p>}
        </div>
        {children}
      </CardContent>
    </Card>
  );

  const FileUpload = ({
    file,
    onUpload,
    onRemove,
    accept,
    icon: Icon,
    title,
    description,
  }: {
    file: File | null;
    onUpload: (file: File) => void;
    onRemove: () => void;
    accept: string;
    icon: React.ComponentType<any>;
    title: string;
    description: string;
  }) => (
    <div className="relative group">
      {file ? (
        <div className="flex items-center gap-4 p-4 bg-[#ffcb74]/10 border-2 border-[#ffcb74] rounded-2xl">
          <div className="w-12 h-12 bg-[#ffcb74]/20 rounded-xl flex items-center justify-center">
            <Icon className="w-6 h-6 text-[#ffcb74]" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-[#f6f6f6]">{file.name}</p>
            <p className="text-sm text-[#f6f6f6]/70">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
          <Button
            onClick={onRemove}
            variant="outline"
            className="bg-[#111111] text-[#f6f6f6] border-[#ffcb74] hover:bg-[#ffcb74] hover:text-[#111111]"
          >
            <X className="w-4 h-4 text-rose-600" />
          </Button>
        </div>
      ) : (
        <label className="block cursor-pointer">
          <div className="p-8 border-2 border-dashed border-[#ffcb74]/50 rounded-2xl text-center hover:border-[#ffcb74] hover:bg-[#ffcb74]/5 transition-all duration-300 group-hover:scale-[1.02]">
            <Icon className="w-12 h-12 text-[#ffcb74]/70 mx-auto mb-4 group-hover:text-[#ffcb74] transition-colors" />
            <p className="font-semibold text-[#f6f6f6] mb-2">{title}</p>
            <p className="text-sm text-[#f6f6f6]/70">{description}</p>
          </div>
          <input
            type="file"
            accept={accept}
            onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])}
            className="hidden"
          />
        </label>
      )}
    </div>
  );

  const ProgressBar = () => (
    <div className="relative w-full bg-[#111111] rounded-full h-3 mb-8 overflow-hidden">
      <div
        className="h-full bg-[#ffcb74] rounded-full transition-all duration-700 relative progress-bar"
        style={
          { "--progress-width": `${(step / 4) * 100}%` } as React.CSSProperties
        }
      >
        <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
      </div>
    </div>
  );

  const StepHeader = () => {
    const steps = [
      {
        title: "Personal Information",
        desc: "Tell us about yourself",
        icon: User,
      },
      {
        title: "Professional Background",
        desc: "Your education and experience",
        icon: GraduationCap,
      },
      {
        title: "Skills & Interests",
        desc: "What you're passionate about",
        icon: Heart,
      },
      {
        title: "Job Preferences",
        desc: "What you're looking for",
        icon: Target,
      },
    ];
    const current = steps[step - 1];
    const Icon = current.icon;

    return (
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-3 bg-[#111111] px-6 py-3 rounded-full mb-6">
          <Icon className="w-5 h-5 text-[#ffcb74]" />
          <span className="font-bold text-[#ffcb74]">Step {step} of 4</span>
        </div>
        <h1 className="text-5xl font-black text-[#f6f6f6] mb-4">
          {current.title}
        </h1>
        <p className="text-xl text-[#f6f6f6]/80 font-medium">{current.desc}</p>
      </div>
    );
  };

  const Step1 = () => (
    <div className="space-y-8">
      <FormSection
        title="Basic Information"
        description="Let's start with the essentials"
      >
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#f6f6f6]">
              First Name *
            </label>
            <Input
              value={data.firstName}
              onChange={(e) => update("firstName", e.target.value)}
              placeholder="Enter your first name"
              className="h-12 bg-[#111111] border-[#ffcb74]/30 text-[#f6f6f6] placeholder:text-[#f6f6f6]/50 focus:border-[#ffcb74] focus:ring-[#ffcb74]"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#f6f6f6]">
              Last Name
            </label>
            <Input
              value={data.lastName}
              onChange={(e) => update("lastName", e.target.value)}
              placeholder="Enter your last name"
              className="h-12 bg-[#111111] border-[#ffcb74]/30 text-[#f6f6f6] placeholder:text-[#f6f6f6]/50 focus:border-[#ffcb74] focus:ring-[#ffcb74]"
            />
          </div>
        </div>
      </FormSection>

      <FormSection
        title="Profile Picture"
        description="Add a professional photo to make a great first impression"
      >
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 bg-[#ffcb74]/20 rounded-3xl border-4 border-[#ffcb74] shadow-lg flex items-center justify-center overflow-hidden">
            {data.profilePicture ? (
              <img
                src={
                  URL.createObjectURL(data.profilePicture) || "/placeholder.svg"
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
              <Button className="bg-[#111111] hover:bg-[#111111]/80 text-[#f6f6f6] border-[#ffcb74]">
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
            {data.profilePicture && (
              <Button
                onClick={() => update("profilePicture", null)}
                variant="outline"
                className="bg-[#111111] text-[#f6f6f6] border-[#ffcb74] hover:bg-[#ffcb74] hover:text-[#111111]"
              >
                Remove
              </Button>
            )}
          </div>
        </div>
      </FormSection>

      <FormSection title="Contact Information">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#f6f6f6]">
              Email Address *
            </label>
            <Input
              type="email"
              value={data.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="your@email.com"
              className="h-12 bg-[#111111] border-[#ffcb74]/30 text-[#f6f6f6] placeholder:text-[#f6f6f6]/50 focus:border-[#ffcb74] focus:ring-[#ffcb74]"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#f6f6f6]">
              Phone Number *
            </label>
            <Input
              type="tel"
              value={data.phone}
              onChange={(e) => update("phone", e.target.value)}
              placeholder="+91 98765 43210"
              className="h-12 bg-[#111111] border-[#ffcb74]/30 text-[#f6f6f6] placeholder:text-[#f6f6f6]/50 focus:border-[#ffcb74] focus:ring-[#ffcb74]"
            />
          </div>
        </div>
      </FormSection>

      <FormSection title="Location & Personal Details">
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#f6f6f6]">
                Current City
              </label>
              <Input
                value={data.city}
                onChange={(e) => update("city", e.target.value)}
                placeholder="Enter your city"
                className="h-12 bg-[#111111] border-[#ffcb74]/30 text-[#f6f6f6] placeholder:text-[#f6f6f6]/50 focus:border-[#ffcb74] focus:ring-[#ffcb74]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#f6f6f6]">
                Date of Birth
              </label>
              <Input
                type="date"
                value={data.dateOfBirth}
                onChange={(e) => update("dateOfBirth", e.target.value)}
                className="h-12 bg-[#111111] border-[#ffcb74]/30 text-[#f6f6f6] placeholder:text-[#f6f6f6]/50 focus:border-[#ffcb74] focus:ring-[#ffcb74]"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-semibold text-[#f6f6f6]">
              Gender
            </label>
            <div className="grid grid-cols-3 gap-4">
              {["Male", "Female", "Other"].map((option) => (
                <SelectableCard
                  key={option}
                  selected={data.gender === option}
                  onClick={() => update("gender", option)}
                  className="text-center"
                >
                  <span className="font-semibold">{option}</span>
                </SelectableCard>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-semibold text-[#f6f6f6]">
              Languages You Know
            </label>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
              {languages.map((lang) => (
                <SelectableCard
                  key={lang}
                  selected={data.languages.includes(lang)}
                  onClick={() => toggle("languages", lang)}
                  className="text-center"
                >
                  <span className="font-medium text-sm">{lang}</span>
                </SelectableCard>
              ))}
            </div>
          </div>
        </div>
      </FormSection>
    </div>
  );

  const Step2 = () => (
    <div className="space-y-8">
      <FormSection
        title="Current Status"
        description="Help us understand where you are in your career"
      >
        <div className="grid md:grid-cols-2 gap-4">
          {statusOptions.map((status) => (
            <SelectableCard
              key={status}
              selected={data.currentStatus === status}
              onClick={() => update("currentStatus", status)}
            >
              <span className="font-semibold">{status}</span>
            </SelectableCard>
          ))}
        </div>
      </FormSection>

      <FormSection title="Experience Level">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {experienceOptions.map((exp) => (
            <SelectableCard
              key={exp}
              selected={data.experience === exp}
              onClick={() => update("experience", exp)}
              className="text-center"
            >
              <span className="font-semibold">{exp}</span>
            </SelectableCard>
          ))}
        </div>
      </FormSection>

      <FormSection title="Education">
        <div className="space-y-6">
          <div className="space-y-3">
            <label className="text-sm font-semibold text-[#f6f6f6]">
              Highest Education Level
            </label>
            <div className="grid md:grid-cols-2 gap-4">
              {educationOptions.map((edu) => (
                <SelectableCard
                  key={edu}
                  selected={data.education === edu}
                  onClick={() => update("education", edu)}
                >
                  <span className="font-semibold">{edu}</span>
                </SelectableCard>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#f6f6f6]">
                University/Institution
              </label>
              <Input
                value={data.university}
                onChange={(e) => update("university", e.target.value)}
                placeholder="Enter your university name"
                className="h-12 bg-[#111111] border-[#ffcb74]/30 text-[#f6f6f6] placeholder:text-[#f6f6f6]/50 focus:border-[#ffcb74] focus:ring-[#ffcb74]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#f6f6f6]">
                Graduation Year
              </label>
              <Input
                type="number"
                value={data.graduationYear}
                onChange={(e) => update("graduationYear", e.target.value)}
                placeholder="2024"
                className="h-12 bg-[#111111] border-[#ffcb74]/30 text-[#f6f6f6] placeholder:text-[#f6f6f6]/50 focus:border-[#ffcb74] focus:ring-[#ffcb74]"
              />
            </div>
          </div>
        </div>
      </FormSection>

      <FormSection
        title="Resume & Portfolio"
        description="Upload your documents and showcase your work"
      >
        <div className="space-y-6">
          <div className="space-y-3">
            <label className="text-sm font-semibold text-[#f6f6f6]">
              Resume/CV *
            </label>
            <FileUpload
              file={data.resume}
              onUpload={(file) => {
                update("resume", file);
                setAutoFilled(false);
                setFieldsToFill([]);
              }}
              onRemove={() => {
                update("resume", null);
                setAutoFilled(false);
                setFieldsToFill([]);
              }}
              accept=".pdf,.doc,.docx"
              icon={FileText}
              title="Upload your resume"
              description="PDF, DOC, DOCX • Max 5MB"
            />
            {data.resume && (
              <div className="mt-2 flex gap-2 items-center">
                <Button
                  onClick={handleParseResume}
                  disabled={parsing}
                  className="bg-[#ffcb74] text-[#111111] font-bold"
                >
                  {parsing ? "Parsing..." : "Parse Resume with Gemini"}
                </Button>
                {autoFilled && (
                  <span className="text-green-400 text-sm">
                    Fields auto-filled!
                  </span>
                )}
                {parseError && (
                  <span className="text-red-400 text-sm">{parseError}</span>
                )}
              </div>
            )}
            {fieldsToFill.length > 0 && (
              <div className="mt-2 text-yellow-400 text-sm">
                Missing fields: {fieldsToFill.join(", ")}
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#f6f6f6]">
                Portfolio URL
              </label>
              <Input
                value={data.portfolio}
                onChange={(e) => update("portfolio", e.target.value)}
                placeholder="https://yourportfolio.com"
                className="h-12 bg-[#111111] border-[#ffcb74]/30 text-[#f6f6f6] placeholder:text-[#f6f6f6]/50 focus:border-[#ffcb74] focus:ring-[#ffcb74]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#f6f6f6]">
                LinkedIn Profile
              </label>
              <Input
                value={data.linkedIn}
                onChange={(e) => update("linkedIn", e.target.value)}
                placeholder="https://linkedin.com/in/yourprofile"
                className="h-12 bg-[#111111] border-[#ffcb74]/30 text-[#f6f6f6] placeholder:text-[#f6f6f6]/50 focus:border-[#ffcb74] focus:ring-[#ffcb74]"
              />
            </div>
          </div>
        </div>
      </FormSection>
    </div>
  );

  const Step3 = () => (
    <div className="space-y-8">
      <FormSection
        title="Technical Skills"
        description="Select your technical expertise"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {techSkills.map((skill) => (
            <SelectableCard
              key={skill}
              selected={data.skills.includes(skill)}
              onClick={() => toggle("skills", skill)}
              className="text-center"
            >
              <span className="font-medium text-sm">{skill}</span>
            </SelectableCard>
          ))}
        </div>
      </FormSection>

      <FormSection
        title="Career Interests"
        description="What areas excite you the most?"
      >
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {careerInterests.map((interest) => (
            <SelectableCard
              key={interest}
              selected={data.interests.includes(interest)}
              onClick={() => toggle("interests", interest)}
              className="text-center"
            >
              <span className="font-medium text-sm">{interest}</span>
            </SelectableCard>
          ))}
        </div>
      </FormSection>

      <FormSection title="About You" description="Tell us more about yourself">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-[#f6f6f6]">
            Bio/Summary
          </label>
          <Textarea
            value={data.bio}
            onChange={(e) => update("bio", e.target.value)}
            placeholder="Write a brief summary about yourself, your goals, and what makes you unique..."
            className="min-h-[120px] bg-[#111111] border-[#ffcb74]/30 text-[#f6f6f6] placeholder:text-[#f6f6f6]/50 focus:border-[#ffcb74] focus:ring-[#ffcb74]"
          />
        </div>
      </FormSection>
    </div>
  );

  const Step4 = () => (
    <div className="space-y-8">
      <FormSection
        title="Job Preferences"
        description="What type of opportunities are you looking for?"
      >
        <div className="space-y-6">
          <div className="space-y-3">
            <label className="text-sm font-semibold text-[#f6f6f6]">
              Job Types
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {jobTypeOptions.map((type) => (
                <SelectableCard
                  key={type}
                  selected={data.jobTypes.includes(type)}
                  onClick={() => toggle("jobTypes", type)}
                  className="text-center"
                >
                  <span className="font-semibold">{type}</span>
                </SelectableCard>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-semibold text-[#f6f6f6]">
              Work Mode Preference
            </label>
            <div className="grid grid-cols-3 gap-4">
              {workModeOptions.map((mode) => (
                <SelectableCard
                  key={mode}
                  selected={data.workModes.includes(mode)}
                  onClick={() => toggle("workModes", mode)}
                  className="text-center"
                >
                  <span className="font-semibold">{mode}</span>
                </SelectableCard>
              ))}
            </div>
          </div>
        </div>
      </FormSection>

      <FormSection title="Salary & Availability">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#f6f6f6]">
              Expected Salary (Annual)
            </label>
            <Input
              value={data.salaryExpectation}
              onChange={(e) => update("salaryExpectation", e.target.value)}
              placeholder="e.g., ₹5,00,000 - ₹8,00,000"
              className="h-12 bg-[#111111] border-[#ffcb74]/30 text-[#f6f6f6] placeholder:text-[#f6f6f6]/50 focus:border-[#ffcb74] focus:ring-[#ffcb74]"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#f6f6f6]">
              Availability
            </label>
            <Input
              value={data.availability}
              onChange={(e) => update("availability", e.target.value)}
              placeholder="e.g., Immediate, 2 weeks notice"
              className="h-12 bg-[#111111] border-[#ffcb74]/30 text-[#f6f6f6] placeholder:text-[#f6f6f6]/50 focus:border-[#ffcb74] focus:ring-[#ffcb74]"
            />
          </div>
        </div>
      </FormSection>

      <FormSection
        title="Relocation"
        description="Are you open to relocating for the right opportunity?"
      >
        <div className="grid grid-cols-3 gap-4">
          {["Yes", "No", "Maybe"].map((option) => (
            <SelectableCard
              key={option}
              selected={data.relocate === option}
              onClick={() => update("relocate", option)}
              className="text-center"
            >
              <span className="font-semibold">{option}</span>
            </SelectableCard>
          ))}
        </div>
      </FormSection>

      <FormSection
        title="Final Review"
        description="Review your information before submitting"
      >
        <div className="bg-[#ffcb74]/10 p-6 rounded-2xl border border-[#ffcb74]/30">
          <div className="grid md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-semibold text-[#f6f6f6] mb-2">
                Personal Info
              </h4>
              <p className="text-[#f6f6f6]/80">
                {data.firstName} {data.lastName}
              </p>
              <p className="text-[#f6f6f6]/80">{data.email}</p>
              <p className="text-[#f6f6f6]/80">{data.city}</p>
            </div>
            <div>
              <h4 className="font-semibold text-[#f6f6f6] mb-2">
                Professional
              </h4>
              <p className="text-[#f6f6f6]/80">{data.currentStatus}</p>
              <p className="text-[#f6f6f6]/80">{data.experience} experience</p>
              <p className="text-[#f6f6f6]/80">
                {data.skills.length} skills selected
              </p>
            </div>
          </div>
        </div>
      </FormSection>
    </div>
  );

  // Helper: map Gemini fields to our state keys
  const geminiToStateMap: Record<string, keyof JobSeekerData> = {
    first_name: "firstName",
    last_name: "lastName",
    email: "email",
    phone: "phone",
    city: "city",
    country: "country",
    date_of_birth: "dateOfBirth",
    gender: "gender",
    languages: "languages",
    profile_picture_url: "profilePicture",
    current_status: "currentStatus",
    experience_level: "experience",
    education_level: "education",
    university: "university",
    graduation_year: "graduationYear",
    skills: "skills",
    resume_url: "resume",
    portfolio_url: "portfolio",
    linkedin_url: "linkedIn",
    github_url: "github",
    interests: "interests",
    career_goals: "careerGoals",
    job_types: "jobTypes",
    work_modes: "workModes",
    salary_expectation: "salaryExpectation",
    availability: "availability",
    willing_to_relocate: "relocate",
    bio: "bio",
    achievements: "achievements",
    certifications: "certifications",
  };

  // List of required fields for jobseeker_profiles
  const requiredFields: (keyof JobSeekerData)[] = [
    "firstName",
    "lastName",
    "email",
    "phone",
    "city",
    "country",
    "dateOfBirth",
    "gender",
    "languages",
    "currentStatus",
    "experience",
    "education",
    "university",
    "graduationYear",
    "skills",
    "resume",
    "portfolio",
    "linkedIn",
    "github",
    "interests",
    "careerGoals",
    "jobTypes",
    "workModes",
    "salaryExpectation",
    "availability",
    "relocate",
    "bio",
    "achievements",
    "certifications",
  ];

  // Resume parsing handler
  const handleParseResume = async () => {
    if (!data.resume) return;
    setParsing(true);
    setParseError("");
    try {
      const form = new FormData();
      form.append("file", data.resume);
      const res = await axios.post("/api/gemini-extract", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const extracted = res.data;
      // Map Gemini fields to our state
      let newData = { ...data };
      Object.entries(geminiToStateMap).forEach(([geminiKey, stateKey]) => {
        if (
          extracted[geminiKey] &&
          (!data[stateKey] ||
            data[stateKey] === "" ||
            (Array.isArray(data[stateKey]) &&
              (data[stateKey] as any[]).length === 0))
        ) {
          newData[stateKey] = extracted[geminiKey];
        }
      });
      setData(newData);
      setAutoFilled(true);
      // Find missing fields
      const missing = requiredFields.filter(
        (f) =>
          !newData[f] ||
          (Array.isArray(newData[f]) && (newData[f] as any[]).length === 0)
      );
      setFieldsToFill(missing);
    } catch (e: any) {
      setParseError(
        "Failed to parse resume. Please try again or fill manually."
      );
    } finally {
      setParsing(false);
    }
  };

  const handleSubmit = async () => {
    const civicId = user?.username || `mock_user_${Date.now()}`;
    try {
      // Update user role
      const roleRes = await fetch("/api/user/update-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          civicId: civicId,
          role: "jobseeker",
          email: data.email,
          name: `${data.firstName} ${data.lastName}`,
        }),
      });
      if (!roleRes.ok) {
        const roleData = await roleRes.json();
        alert(roleData.error || "Failed to update role");
        return;
      }
      // Create jobseeker profile in Supabase
      const profileRes = await fetch("/api/jobseeker/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          civicId: civicId,
          ...data,
        }),
      });
      if (!profileRes.ok) {
        const profileData = await profileRes.json();
        alert(profileData.error || "Failed to create profile");
        return;
      }
      // Upload resume to MongoDB
      if (data.resume) {
        const form = new FormData();
        form.append("file", data.resume);
        form.append("civicId", civicId);
        await fetch("/api/upload-mongo", {
          method: "POST",
          body: form,
        });
      }
      alert("🎉 Profile created successfully! Welcome to the platform!");
      localStorage.setItem("jobseekerProfile", JSON.stringify(data));
      localStorage.setItem("mockCivicId", civicId);
      router.push("/dashboard/jobseeker/dashboard");
    } catch (error) {
      console.error("Error creating profile:", error);
      alert("Failed to create profile. Please try again.");
    }
  };

  // PDF Upload Step
  const PdfUploadStep = () => (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <FormSection
        title="Upload Your Resume (PDF)"
        description="Start by uploading your resume in PDF format. We'll extract your details automatically."
      >
        <div className="max-w-md mx-auto">
          <FileUpload
            file={data.resume}
            onUpload={(file) => update("resume", file)}
            onRemove={() => update("resume", null)}
            accept=".pdf"
            icon={FileText}
            title="Upload your resume"
            description="PDF only • Max 5MB"
          />
          {data.resume && (
            <div className="mt-4 flex flex-col items-center gap-2">
              <Button
                onClick={async () => {
                  setParsing(true);
                  setParseError("");
                  try {
                    const form = new FormData();
                    form.append("file", data.resume!);
                    const res = await axios.post("/api/gemini-extract", form, {
                      headers: { "Content-Type": "multipart/form-data" },
                    });
                    const extracted = res.data;
                    let newData = { ...data };
                    Object.entries(geminiToStateMap).forEach(
                      ([geminiKey, stateKey]) => {
                        if (extracted[geminiKey]) {
                          newData[stateKey] = extracted[geminiKey];
                        }
                      }
                    );
                    setData(newData);
                    setAutoFilled(true);
                    setPdfStep(false);
                  } catch (e) {
                    setParseError(
                      "Failed to parse resume. Please try again or fill manually."
                    );
                  } finally {
                    setParsing(false);
                  }
                }}
                disabled={parsing}
                className="bg-[#ffcb74] text-[#111111] font-bold w-full"
              >
                {parsing ? "Parsing..." : "Parse Resume"}
              </Button>
              {parseError && (
                <span className="text-red-400 text-sm">{parseError}</span>
              )}
            </div>
          )}
        </div>
      </FormSection>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#2f2f2f]">
      <div className="max-w-5xl mx-auto p-8">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-[#ffcb74] rounded-2xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6 text-[#111111]" />
            </div>
            <h1 className="text-2xl font-black text-[#f6f6f6]">
              JobSeeker Pro
            </h1>
          </div>
          <ProgressBar />
        </div>

        {pdfStep ? (
          <PdfUploadStep />
        ) : (
          <>
            <StepHeader />
            {/* Step Content */}
            {step === 1 && <Step1 />}
            {step === 2 && <Step2 />}
            {step === 3 && <Step3 />}
            {step === 4 && <Step4 />}
            {/* Navigation */}
            <div className="flex justify-between items-center mt-12 pt-8">
              <Button
                onClick={() => setStep(step - 1)}
                disabled={step === 1}
                variant="outline"
                className="bg-[#111111] text-[#f6f6f6] border-[#ffcb74] hover:bg-[#ffcb74] hover:text-[#111111] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              {step < 4 ? (
                <Button
                  onClick={() => setStep(step + 1)}
                  className="bg-[#111111] hover:bg-[#111111]/80 text-[#f6f6f6] border border-[#ffcb74]"
                >
                  Continue
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  className="bg-[#ffcb74] hover:bg-[#ffcb74]/80 text-[#111111] font-bold"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Create Profile
                </Button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
