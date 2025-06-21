/*eslint-disable*/
"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@civic/auth/react";
import {
  Camera,
  Upload,
  User,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  FileText,
  Sparkles,
  X,
  Building,
  Target,
  Lightbulb,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

export default function FounderOnboarding() {
  type FounderData = {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    city: string;
    country: string;
    dateOfBirth: string;
    profilePicture: File | null;
    bio: string;
    linkedIn: string;
    twitter: string;
    github: string;
    website: string;
    previousExperience: string;
    education: string;
    skills: string[];
    industries: string[];
    coFounders: string[];
    lookingForCoFounder: boolean;
    lookingForFunding: boolean;
    fundingStage: string;
    previousFunding: string;
    businessModel: string;
    targetMarket: string;
    achievements: string[];
  };

  const [step, setStep] = useState(1);
  const [data, setData] = useState<FounderData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    city: "",
    country: "India",
    dateOfBirth: "",
    profilePicture: null,
    bio: "",
    linkedIn: "",
    twitter: "",
    github: "",
    website: "",
    previousExperience: "",
    education: "",
    skills: [],
    industries: [],
    coFounders: [],
    lookingForCoFounder: false,
    lookingForFunding: false,
    fundingStage: "",
    previousFunding: "",
    businessModel: "",
    targetMarket: "",
    achievements: [],
  });

  const techSkills = [
    "JavaScript", "Python", "Java", "React", "Node.js", "Angular", "Vue.js",
    "TypeScript", "PHP", "C++", "C#", "Ruby", "Go", "Swift", "Kotlin",
    "Flutter", "React Native", "HTML/CSS", "SQL", "MongoDB", "PostgreSQL",
    "AWS", "Docker", "Kubernetes", "Machine Learning", "Data Science",
    "AI", "Blockchain", "DevOps", "UI/UX Design", "Product Management",
    "Digital Marketing", "Sales", "Business Development", "Finance"
  ];

  const industries = [
    "FinTech", "EdTech", "HealthTech", "E-commerce", "SaaS", "Mobile Apps",
    "Web Development", "AI/ML", "Blockchain", "IoT", "Cybersecurity",
    "Gaming", "Media", "Food & Beverage", "Fashion", "Travel", "Real Estate",
    "Agriculture", "Energy", "Transportation", "Manufacturing", "Retail"
  ];

  const fundingStages = [
    "Pre-Seed", "Seed", "Series A", "Series B", "Series C+", "Not seeking funding"
  ];

  const router = useRouter();
  const { user } = useUser();

  const update = <K extends keyof FounderData>(
    key: K,
    value: FounderData[K]
  ) => setData((prev) => ({ ...prev, [key]: value }));

  const toggle = <K extends keyof FounderData>(key: K, value: string) => {
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
        desc: "Your experience and skills",
        icon: Building,
      },
      {
        title: "Founder Profile",
        desc: "Your entrepreneurial journey",
        icon: Lightbulb,
      },
      {
        title: "Goals & Preferences",
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
    </div>
  );

  const Step2 = () => (
    <div className="space-y-8">
      <FormSection
        title="Professional Background"
        description="Tell us about your professional journey"
      >
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#f6f6f6]">
              Education
            </label>
            <Input
              value={data.education}
              onChange={(e) => update("education", e.target.value)}
              placeholder="e.g., MBA from IIM, B.Tech from IIT"
              className="h-12 bg-[#111111] border-[#ffcb74]/30 text-[#f6f6f6] placeholder:text-[#f6f6f6]/50 focus:border-[#ffcb74] focus:ring-[#ffcb74]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#f6f6f6]">
              Previous Experience
            </label>
            <Textarea
              value={data.previousExperience}
              onChange={(e) => update("previousExperience", e.target.value)}
              placeholder="Describe your work experience, previous companies, roles..."
              className="min-h-[100px] bg-[#111111] border-[#ffcb74]/30 text-[#f6f6f6] placeholder:text-[#f6f6f6]/50 focus:border-[#ffcb74] focus:ring-[#ffcb74]"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
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
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#f6f6f6]">
                Website/Portfolio
              </label>
              <Input
                value={data.website}
                onChange={(e) => update("website", e.target.value)}
                placeholder="https://yourwebsite.com"
                className="h-12 bg-[#111111] border-[#ffcb74]/30 text-[#f6f6f6] placeholder:text-[#f6f6f6]/50 focus:border-[#ffcb74] focus:ring-[#ffcb74]"
              />
            </div>
          </div>
        </div>
      </FormSection>

      <FormSection
        title="Skills & Expertise"
        description="What are your core competencies?"
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
    </div>
  );

  const Step3 = () => (
    <div className="space-y-8">
      <FormSection
        title="About You"
        description="Tell us your story as an entrepreneur"
      >
        <div className="space-y-2">
          <label className="text-sm font-semibold text-[#f6f6f6]">
            Bio/About
          </label>
          <Textarea
            value={data.bio}
            onChange={(e) => update("bio", e.target.value)}
            placeholder="Tell us about yourself, your entrepreneurial journey, vision, and what drives you..."
            className="min-h-[120px] bg-[#111111] border-[#ffcb74]/30 text-[#f6f6f6] placeholder:text-[#f6f6f6]/50 focus:border-[#ffcb74] focus:ring-[#ffcb74]"
          />
        </div>
      </FormSection>

      <FormSection
        title="Industry Focus"
        description="Which industries are you passionate about?"
      >
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {industries.map((industry) => (
            <SelectableCard
              key={industry}
              selected={data.industries.includes(industry)}
              onClick={() => toggle("industries", industry)}
              className="text-center"
            >
              <span className="font-medium text-sm">{industry}</span>
            </SelectableCard>
          ))}
        </div>
      </FormSection>

      <FormSection
        title="Business Model & Market"
        description="Tell us about your business approach"
      >
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#f6f6f6]">
              Business Model
            </label>
            <Input
              value={data.businessModel}
              onChange={(e) => update("businessModel", e.target.value)}
              placeholder="e.g., SaaS, Marketplace, E-commerce, Freemium"
              className="h-12 bg-[#111111] border-[#ffcb74]/30 text-[#f6f6f6] placeholder:text-[#f6f6f6]/50 focus:border-[#ffcb74] focus:ring-[#ffcb74]"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#f6f6f6]">
              Target Market
            </label>
            <Input
              value={data.targetMarket}
              onChange={(e) => update("targetMarket", e.target.value)}
              placeholder="e.g., SMBs, Enterprises, B2C, Students"
              className="h-12 bg-[#111111] border-[#ffcb74]/30 text-[#f6f6f6] placeholder:text-[#f6f6f6]/50 focus:border-[#ffcb74] focus:ring-[#ffcb74]"
            />
          </div>
        </div>
      </FormSection>
    </div>
  );

  const Step4 = () => (
    <div className="space-y-8">
      <FormSection
        title="What You're Looking For"
        description="Let us know your current needs"
      >
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={data.lookingForCoFounder}
                onChange={(e) => update("lookingForCoFounder", e.target.checked)}
                className="w-4 h-4 text-[#ffcb74] bg-[#111111] border-[#ffcb74]/30 rounded focus:ring-[#ffcb74]"
              />
              <label className="text-sm font-semibold text-[#f6f6f6]">
                Looking for Co-founders
              </label>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={data.lookingForFunding}
                onChange={(e) => update("lookingForFunding", e.target.checked)}
                className="w-4 h-4 text-[#ffcb74] bg-[#111111] border-[#ffcb74]/30 rounded focus:ring-[#ffcb74]"
              />
              <label className="text-sm font-semibold text-[#f6f6f6]">
                Looking for Funding
              </label>
            </div>
          </div>
        </div>
      </FormSection>

      {data.lookingForFunding && (
        <FormSection
          title="Funding Details"
          description="Tell us about your funding requirements"
        >
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-semibold text-[#f6f6f6]">
                Funding Stage
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {fundingStages.map((stage) => (
                  <SelectableCard
                    key={stage}
                    selected={data.fundingStage === stage}
                    onClick={() => update("fundingStage", stage)}
                    className="text-center"
                  >
                    <span className="font-semibold">{stage}</span>
                  </SelectableCard>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#f6f6f6]">
                Previous Funding (if any)
              </label>
              <Input
                value={data.previousFunding}
                onChange={(e) => update("previousFunding", e.target.value)}
                placeholder="e.g., ₹50L seed round from XYZ Ventures"
                className="h-12 bg-[#111111] border-[#ffcb74]/30 text-[#f6f6f6] placeholder:text-[#f6f6f6]/50 focus:border-[#ffcb74] focus:ring-[#ffcb74]"
              />
            </div>
          </div>
        </FormSection>
      )}

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
                Founder Profile
              </h4>
              <p className="text-[#f6f6f6]/80">
                {data.skills.length} skills selected
              </p>
              <p className="text-[#f6f6f6]/80">
                {data.industries.length} industries
              </p>
              <p className="text-[#f6f6f6]/80">
                {data.lookingForFunding ? "Seeking funding" : "Not seeking funding"}
              </p>
            </div>
          </div>
        </div>
      </FormSection>
    </div>
  );

  const handleSubmit = async () => {
    // Generate a mock civicId if not signed in
    const civicId = user?.username || `mock_founder_${Date.now()}`;

    try {
      // First update user role
      const roleRes = await fetch("/api/user/update-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          civicId: civicId,
          role: "founder",
          email: data.email,
          name: `${data.firstName} ${data.lastName}`
        }),
      });

      if (!roleRes.ok) {
        const roleData = await roleRes.json();
        alert(roleData.error || "Failed to update role");
        return;
      }

      // Then create founder profile
      const profileRes = await fetch("/api/founder/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          civicId: civicId,
          first_name: data.firstName,
          last_name: data.lastName,
          phone: data.phone,
          city: data.city,
          country: data.country,
          date_of_birth: data.dateOfBirth,
          bio: data.bio,
          linkedin_url: data.linkedIn,
          twitter_url: data.twitter,
          github_url: data.github,
          website_url: data.website,
          previous_experience: data.previousExperience,
          education: data.education,
          skills: data.skills,
          industries: data.industries,
          co_founders: data.coFounders,
          looking_for_co_founder: data.lookingForCoFounder,
          looking_for_funding: data.lookingForFunding,
          funding_stage: data.fundingStage,
          previous_funding: data.previousFunding,
          business_model: data.businessModel,
          target_market: data.targetMarket,
          achievements: data.achievements,
        }),
      });

      if (!profileRes.ok) {
        const profileData = await profileRes.json();
        alert(profileData.error || "Failed to create profile");
        return;
      }

      console.log("Founder Profile Data:", data);
      alert("🎉 Founder profile created successfully! Welcome to the platform!");
      
      // Save data to localStorage as backup
      localStorage.setItem("founderProfile", JSON.stringify(data));
      localStorage.setItem("mockCivicId", civicId);
      
      // Redirect to dashboard
      router.push("/dashboard/founder");
    } catch (error) {
      console.error("Error creating founder profile:", error);
      alert("Failed to create profile. Please try again.");
    }
  };

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
              Founder Onboarding
            </h1>
          </div>
          <ProgressBar />
        </div>

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
              Create Founder Profile
            </Button>
          )}
        </div>
      </div>
    </div>
  );
} 