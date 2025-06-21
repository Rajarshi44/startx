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
  TrendingUp,
  Target,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

export default function InvestorOnboarding() {
  type InvestorData = {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    city: string;
    country: string;
    dateOfBirth: string;
    profilePicture: File | null;
    firmName: string;
    firmType: string;
    position: string;
    yearsOfExperience: string;
    totalFunds: string;
    investmentFocus: string[];
    preferredStages: string[];
    checkSizeMin: string;
    checkSizeMax: string;
    geographicFocus: string[];
    industriesOfInterest: string[];
    previousInvestments: string;
    notablePortfolio: string[];
    linkedIn: string;
    twitter: string;
    website: string;
    bio: string;
    investmentCriteria: string;
    valueAdd: string;
    networkStrength: string;
    mentorshipAreas: string[];
    boardExperience: boolean;
    leadInvestor: boolean;
    followOnCapacity: boolean;
  };

  const [step, setStep] = useState(1);
  const [data, setData] = useState<InvestorData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    city: "",
    country: "India",
    dateOfBirth: "",
    profilePicture: null,
    firmName: "",
    firmType: "",
    position: "",
    yearsOfExperience: "",
    totalFunds: "",
    investmentFocus: [],
    preferredStages: [],
    checkSizeMin: "",
    checkSizeMax: "",
    geographicFocus: [],
    industriesOfInterest: [],
    previousInvestments: "",
    notablePortfolio: [],
    linkedIn: "",
    twitter: "",
    website: "",
    bio: "",
    investmentCriteria: "",
    valueAdd: "",
    networkStrength: "",
    mentorshipAreas: [],
    boardExperience: false,
    leadInvestor: false,
    followOnCapacity: false,
  });

  const firmTypes = [
    "Venture Capital", "Angel Investor", "Private Equity", "Family Office",
    "Corporate VC", "Accelerator", "Incubator", "Government Fund", "Individual"
  ];

  const investmentStages = [
    "Pre-Seed", "Seed", "Series A", "Series B", "Series C+", "Growth", "Late Stage"
  ];

  const industries = [
    "FinTech", "EdTech", "HealthTech", "E-commerce", "SaaS", "Mobile Apps",
    "Web Development", "AI/ML", "Blockchain", "IoT", "Cybersecurity",
    "Gaming", "Media", "Food & Beverage", "Fashion", "Travel", "Real Estate",
    "Agriculture", "Energy", "Transportation", "Manufacturing", "Retail",
    "Enterprise Software", "Consumer Tech", "DeepTech", "Biotech"
  ];

  const geographicRegions = [
    "India", "Southeast Asia", "North America", "Europe", "Latin America",
    "Middle East", "Africa", "Global"
  ];

  const mentorshipAreas = [
    "Product Development", "Go-to-Market", "Fundraising", "Operations",
    "Technology", "Sales & Marketing", "HR & Talent", "Finance & Accounting",
    "Legal & Compliance", "International Expansion", "Strategic Partnerships"
  ];

  const router = useRouter();
  const { user } = useUser();

  const update = <K extends keyof InvestorData>(
    key: K,
    value: InvestorData[K]
  ) => setData((prev) => ({ ...prev, [key]: value }));

  const toggle = <K extends keyof InvestorData>(key: K, value: string) => {
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
        title: "Investment Firm",
        desc: "Your firm and experience",
        icon: Building2,
      },
      {
        title: "Investment Focus",
        desc: "Your investment preferences",
        icon: Target,
      },
      {
        title: "Value & Network",
        desc: "How you add value",
        icon: TrendingUp,
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
        description="Add a professional photo"
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
        title="Investment Firm Details"
        description="Tell us about your firm and experience"
      >
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#f6f6f6]">
                Firm Name *
              </label>
              <Input
                value={data.firmName}
                onChange={(e) => update("firmName", e.target.value)}
                placeholder="Enter firm name"
                className="h-12 bg-[#111111] border-[#ffcb74]/30 text-[#f6f6f6] placeholder:text-[#f6f6f6]/50 focus:border-[#ffcb74] focus:ring-[#ffcb74]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#f6f6f6]">
                Your Position
              </label>
              <Input
                value={data.position}
                onChange={(e) => update("position", e.target.value)}
                placeholder="e.g., Partner, Principal, Associate"
                className="h-12 bg-[#111111] border-[#ffcb74]/30 text-[#f6f6f6] placeholder:text-[#f6f6f6]/50 focus:border-[#ffcb74] focus:ring-[#ffcb74]"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-semibold text-[#f6f6f6]">
              Firm Type
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {firmTypes.map((type) => (
                <SelectableCard
                  key={type}
                  selected={data.firmType === type}
                  onClick={() => update("firmType", type)}
                  className="text-center"
                >
                  <span className="font-semibold text-sm">{type}</span>
                </SelectableCard>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#f6f6f6]">
                Years of Experience
              </label>
              <Input
                value={data.yearsOfExperience}
                onChange={(e) => update("yearsOfExperience", e.target.value)}
                placeholder="e.g., 5-10 years"
                className="h-12 bg-[#111111] border-[#ffcb74]/30 text-[#f6f6f6] placeholder:text-[#f6f6f6]/50 focus:border-[#ffcb74] focus:ring-[#ffcb74]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#f6f6f6]">
                Total Funds Under Management
              </label>
              <Input
                value={data.totalFunds}
                onChange={(e) => update("totalFunds", e.target.value)}
                placeholder="e.g., $10M - $100M"
                className="h-12 bg-[#111111] border-[#ffcb74]/30 text-[#f6f6f6] placeholder:text-[#f6f6f6]/50 focus:border-[#ffcb74] focus:ring-[#ffcb74]"
              />
            </div>
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
                Firm Website
              </label>
              <Input
                value={data.website}
                onChange={(e) => update("website", e.target.value)}
                placeholder="https://yourfirm.com"
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
        title="Investment Preferences"
        description="Define your investment focus and criteria"
      >
        <div className="space-y-6">
          <div className="space-y-3">
            <label className="text-sm font-semibold text-[#f6f6f6]">
              Preferred Investment Stages
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {investmentStages.map((stage) => (
                <SelectableCard
                  key={stage}
                  selected={data.preferredStages.includes(stage)}
                  onClick={() => toggle("preferredStages", stage)}
                  className="text-center"
                >
                  <span className="font-medium text-sm">{stage}</span>
                </SelectableCard>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#f6f6f6]">
                Check Size Min ($)
              </label>
              <Input
                value={data.checkSizeMin}
                onChange={(e) => update("checkSizeMin", e.target.value)}
                placeholder="e.g., 50000"
                className="h-12 bg-[#111111] border-[#ffcb74]/30 text-[#f6f6f6] placeholder:text-[#f6f6f6]/50 focus:border-[#ffcb74] focus:ring-[#ffcb74]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#f6f6f6]">
                Check Size Max ($)
              </label>
              <Input
                value={data.checkSizeMax}
                onChange={(e) => update("checkSizeMax", e.target.value)}
                placeholder="e.g., 1000000"
                className="h-12 bg-[#111111] border-[#ffcb74]/30 text-[#f6f6f6] placeholder:text-[#f6f6f6]/50 focus:border-[#ffcb74] focus:ring-[#ffcb74]"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-semibold text-[#f6f6f6]">
              Industries of Interest
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {industries.map((industry) => (
                <SelectableCard
                  key={industry}
                  selected={data.industriesOfInterest.includes(industry)}
                  onClick={() => toggle("industriesOfInterest", industry)}
                  className="text-center"
                >
                  <span className="font-medium text-sm">{industry}</span>
                </SelectableCard>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-semibold text-[#f6f6f6]">
              Geographic Focus
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {geographicRegions.map((region) => (
                <SelectableCard
                  key={region}
                  selected={data.geographicFocus.includes(region)}
                  onClick={() => toggle("geographicFocus", region)}
                  className="text-center"
                >
                  <span className="font-medium text-sm">{region}</span>
                </SelectableCard>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#f6f6f6]">
              Investment Criteria
            </label>
            <Textarea
              value={data.investmentCriteria}
              onChange={(e) => update("investmentCriteria", e.target.value)}
              placeholder="Describe your investment criteria, what you look for in startups..."
              className="min-h-[100px] bg-[#111111] border-[#ffcb74]/30 text-[#f6f6f6] placeholder:text-[#f6f6f6]/50 focus:border-[#ffcb74] focus:ring-[#ffcb74]"
            />
          </div>
        </div>
      </FormSection>
    </div>
  );

  const Step4 = () => (
    <div className="space-y-8">
      <FormSection
        title="Value Addition & Network"
        description="How do you help portfolio companies?"
      >
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#f6f6f6]">
              About You
            </label>
            <Textarea
              value={data.bio}
              onChange={(e) => update("bio", e.target.value)}
              placeholder="Tell us about yourself, your background, and investment philosophy..."
              className="min-h-[120px] bg-[#111111] border-[#ffcb74]/30 text-[#f6f6f6] placeholder:text-[#f6f6f6]/50 focus:border-[#ffcb74] focus:ring-[#ffcb74]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#f6f6f6]">
              Value Addition
            </label>
            <Textarea
              value={data.valueAdd}
              onChange={(e) => update("valueAdd", e.target.value)}
              placeholder="How do you add value beyond capital? Network, expertise, resources..."
              className="min-h-[100px] bg-[#111111] border-[#ffcb74]/30 text-[#f6f6f6] placeholder:text-[#f6f6f6]/50 focus:border-[#ffcb74] focus:ring-[#ffcb74]"
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-semibold text-[#f6f6f6]">
              Mentorship Areas
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {mentorshipAreas.map((area) => (
                <SelectableCard
                  key={area}
                  selected={data.mentorshipAreas.includes(area)}
                  onClick={() => toggle("mentorshipAreas", area)}
                  className="text-center"
                >
                  <span className="font-medium text-sm">{area}</span>
                </SelectableCard>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-sm font-semibold text-[#f6f6f6]">
              Investment Capabilities
            </label>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={data.leadInvestor}
                  onChange={(e) => update("leadInvestor", e.target.checked)}
                  className="w-4 h-4 text-[#ffcb74] bg-[#111111] border-[#ffcb74]/30 rounded focus:ring-[#ffcb74]"
                />
                <span className="text-sm text-[#f6f6f6]">Can lead investment rounds</span>
              </div>
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={data.boardExperience}
                  onChange={(e) => update("boardExperience", e.target.checked)}
                  className="w-4 h-4 text-[#ffcb74] bg-[#111111] border-[#ffcb74]/30 rounded focus:ring-[#ffcb74]"
                />
                <span className="text-sm text-[#f6f6f6]">Board experience & willing to join boards</span>
              </div>
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={data.followOnCapacity}
                  onChange={(e) => update("followOnCapacity", e.target.checked)}
                  className="w-4 h-4 text-[#ffcb74] bg-[#111111] border-[#ffcb74]/30 rounded focus:ring-[#ffcb74]"
                />
                <span className="text-sm text-[#f6f6f6]">Have follow-on investment capacity</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#f6f6f6]">
              Notable Portfolio Companies (optional)
            </label>
            <Textarea
              value={data.previousInvestments}
              onChange={(e) => update("previousInvestments", e.target.value)}
              placeholder="List some of your notable investments or portfolio companies..."
              className="min-h-[80px] bg-[#111111] border-[#ffcb74]/30 text-[#f6f6f6] placeholder:text-[#f6f6f6]/50 focus:border-[#ffcb74] focus:ring-[#ffcb74]"
            />
          </div>
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
              <p className="text-[#f6f6f6]/80">{data.firmName}</p>
            </div>
            <div>
              <h4 className="font-semibold text-[#f6f6f6] mb-2">
                Investment Focus
              </h4>
              <p className="text-[#f6f6f6]/80">{data.firmType}</p>
              <p className="text-[#f6f6f6]/80">
                {data.preferredStages.length} stages selected
              </p>
              <p className="text-[#f6f6f6]/80">
                {data.industriesOfInterest.length} industries
              </p>
            </div>
          </div>
        </div>
      </FormSection>
    </div>
  );

  const handleSubmit = async () => {
    // Generate a mock civicId if not signed in
    const civicId = user?.username || `mock_investor_${Date.now()}`;

    try {
      // First update user role
      const roleRes = await fetch("/api/user/update-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          civicId: civicId,
          role: "investor",
          email: data.email,
          name: `${data.firstName} ${data.lastName}`
        }),
      });

      if (!roleRes.ok) {
        const roleData = await roleRes.json();
        alert(roleData.error || "Failed to update role");
        return;
      }

      // Then create investor profile
      const profileRes = await fetch("/api/investor/profile", {
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
          firm_name: data.firmName,
          firm_type: data.firmType,
          position: data.position,
          years_of_experience: data.yearsOfExperience,
          total_funds: data.totalFunds,
          investment_focus: data.investmentFocus,
          preferred_stages: data.preferredStages,
          check_size_min: data.checkSizeMin ? parseFloat(data.checkSizeMin) : null,
          check_size_max: data.checkSizeMax ? parseFloat(data.checkSizeMax) : null,
          geographic_focus: data.geographicFocus,
          industries_of_interest: data.industriesOfInterest,
          previous_investments: data.previousInvestments,
          notable_portfolio: data.notablePortfolio,
          linkedin_url: data.linkedIn,
          twitter_url: data.twitter,
          website_url: data.website,
          bio: data.bio,
          investment_criteria: data.investmentCriteria,
          value_add: data.valueAdd,
          network_strength: data.networkStrength,
          mentorship_areas: data.mentorshipAreas,
          board_experience: data.boardExperience,
          lead_investor: data.leadInvestor,
          follow_on_capacity: data.followOnCapacity,
        }),
      });

      if (!profileRes.ok) {
        const profileData = await profileRes.json();
        alert(profileData.error || "Failed to create profile");
        return;
      }

      console.log("Investor Profile Data:", data);
      alert("🎉 Investor profile created successfully! Welcome to the platform!");
      
      // Save data to localStorage as backup
      localStorage.setItem("investorProfile", JSON.stringify(data));
      localStorage.setItem("mockCivicId", civicId);
      
      // Redirect to dashboard
      router.push("/dashboard/investor");
    } catch (error) {
      console.error("Error creating investor profile:", error);
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
              Investor Onboarding
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
              Create Investor Profile
            </Button>
          )}
        </div>
      </div>
    </div>
  );
} 