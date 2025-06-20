"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Briefcase, MessageSquare, MapPin, Clock, DollarSign, CheckCircle, Play } from "lucide-react"

export default function JobSeekerDashboard() {
  const [isInterviewActive, setIsInterviewActive] = useState(false)

  const startInterview = () => {
    setIsInterviewActive(true)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Job Seeker Dashboard</h1>
              <p className="text-gray-600">Find your perfect role in exciting startups</p>
            </div>
            <Badge className="bg-blue-100 text-blue-700">Job Seeker Journey</Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="profile" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="jobs">Jobs</TabsTrigger>
                <TabsTrigger value="interview">Interview</TabsTrigger>
                <TabsTrigger value="applications">Applications</TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Users className="mr-2 h-5 w-5 text-blue-600" />
                      Professional Profile
                    </CardTitle>
                    <CardDescription>Complete your profile to get better job matches</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Full Name</label>
                        <Input placeholder="Your full name" />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Job Title</label>
                        <Input placeholder="e.g., Software Engineer" />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Experience Level</label>
                        <Input placeholder="e.g., 3-5 years" />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Location</label>
                        <Input placeholder="e.g., San Francisco, Remote" />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Skills</label>
                      <Input placeholder="e.g., React, Node.js, Python, Machine Learning" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Salary Expectation</label>
                      <Input placeholder="e.g., $80,000 - $120,000" />
                    </div>
                    <Button className="bg-blue-600 hover:bg-blue-700">Update Profile</Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="jobs" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Briefcase className="mr-2 h-5 w-5 text-green-600" />
                      Recommended Jobs
                    </CardTitle>
                    <CardDescription>Jobs matched to your skills and preferences</CardDescription>
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
                    <Card key={index} className="border-green-200 hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold mb-1">{job.title}</h3>
                            <p className="text-blue-600 font-medium mb-2">{job.company}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
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
                                <Badge key={skillIndex} variant="secondary" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-green-600 mb-1">{job.match}</div>
                            <div className="text-xs text-gray-500 mb-3">Match</div>
                            <Button size="sm" className="bg-green-600 hover:bg-green-700">
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
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <MessageSquare className="mr-2 h-5 w-5 text-purple-600" />
                      AI Interview Practice
                    </CardTitle>
                    <CardDescription>Practice with our AI interviewer and get real-time feedback</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {!isInterviewActive ? (
                      <div className="text-center py-8">
                        <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Play className="h-10 w-10 text-purple-600" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Ready to Practice?</h3>
                        <p className="text-gray-600 mb-6 max-w-md mx-auto">
                          Our AI interviewer will ask you common interview questions and provide feedback on your
                          responses.
                        </p>
                        <div className="grid md:grid-cols-3 gap-4 mb-6">
                          <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <div className="text-2xl font-bold text-purple-600 mb-1">15</div>
                            <div className="text-sm text-gray-600">Minutes</div>
                          </div>
                          <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600 mb-1">8</div>
                            <div className="text-sm text-gray-600">Questions</div>
                          </div>
                          <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <div className="text-2xl font-bold text-green-600 mb-1">AI</div>
                            <div className="text-sm text-gray-600">Feedback</div>
                          </div>
                        </div>
                        <Button onClick={startInterview} className="bg-purple-600 hover:bg-purple-700">
                          Start Interview Practice
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="bg-purple-50 p-4 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-purple-700">Interview in Progress</span>
                            <span className="text-sm text-purple-600">Question 1 of 8</span>
                          </div>
                          <Progress value={12.5} className="h-2 mb-4" />
                          <div className="bg-white p-4 rounded-lg mb-4">
                            <p className="font-medium mb-2">AI Interviewer:</p>
                            <p className="text-gray-700">
                              "Tell me about yourself and why you're interested in working at a startup."
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                            <span className="text-sm text-gray-600">Recording your response...</span>
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <Button variant="outline" className="bg-white text-gray-600">
                            Pause
                          </Button>
                          <Button className="bg-purple-600 hover:bg-purple-700">Next Question</Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Previous Interview Results */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Previous Practice Sessions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { date: "Dec 15, 2024", score: 8.5, feedback: "Great technical answers" },
                        { date: "Dec 10, 2024", score: 7.2, feedback: "Work on behavioral questions" },
                      ].map((session, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <div className="font-medium">{session.date}</div>
                            <div className="text-sm text-gray-600">{session.feedback}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-green-600">{session.score}/10</div>
                            <div className="text-xs text-gray-500">Score</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="applications" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Briefcase className="mr-2 h-5 w-5 text-orange-600" />
                      Application Status
                    </CardTitle>
                    <CardDescription>Track your job applications and their progress</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        {
                          company: "TechFlow AI",
                          position: "Senior Frontend Developer",
                          status: "Interview Scheduled",
                          date: "Applied 5 days ago",
                          statusColor: "text-blue-600 bg-blue-100",
                        },
                        {
                          company: "DataVision",
                          position: "Full Stack Engineer",
                          status: "Under Review",
                          date: "Applied 1 week ago",
                          statusColor: "text-yellow-600 bg-yellow-100",
                        },
                        {
                          company: "StartupX",
                          position: "Product Manager",
                          status: "Applied",
                          date: "Applied 2 days ago",
                          statusColor: "text-gray-600 bg-gray-100",
                        },
                      ].map((app, index) => (
                        <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <h4 className="font-semibold">{app.position}</h4>
                            <p className="text-sm text-gray-600 mb-1">{app.company}</p>
                            <p className="text-xs text-gray-500">{app.date}</p>
                          </div>
                          <div className="text-right">
                            <Badge className={`${app.statusColor} text-xs`}>{app.status}</Badge>
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
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Profile Completion</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Profile Strength</span>
                    <span>75%</span>
                  </div>
                  <Progress value={75} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <span>Basic info added</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <span>Skills listed</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>Add portfolio</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>Upload resume</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Job Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Job Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="font-medium text-blue-800 mb-1">3 New Matches</div>
                    <div className="text-sm text-blue-600">Frontend Developer roles</div>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="font-medium text-green-800 mb-1">Interview Tip</div>
                    <div className="text-sm text-green-600">Practice behavioral questions</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Your Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">12</div>
                    <div className="text-sm text-gray-600">Applications</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">3</div>
                    <div className="text-sm text-gray-600">Interviews</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">8.2</div>
                    <div className="text-sm text-gray-600">Avg Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">95%</div>
                    <div className="text-sm text-gray-600">Top Match</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
