/*eslint-disable*/
"use client";

import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  Clock,
  User,
  Briefcase,
  Building2,
  MapPin,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { useUser } from "@civic/auth/react";
import { useToast } from "@/hooks/use-toast";

interface TavusInterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobPosting: any;
  onInterviewComplete?: (session: any) => void;
}

export default function TavusInterviewModal({
  isOpen,
  onClose,
  jobPosting,
  onInterviewComplete,
}: TavusInterviewModalProps) {
  const { user } = useUser();
  const { toast } = useToast();
  const [step, setStep] = useState<
    "setup" | "creating" | "interview" | "completed"
  >("setup");
  const [persona, setPersona] = useState<any>(null);
  const [conversation, setConversation] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const durationInterval = useRef<NodeJS.Timeout | undefined>(undefined);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
      }
    };
  }, []);

  // Start duration timer when interview begins
  useEffect(() => {
    if (step === "interview") {
      durationInterval.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
      }
    }

    return () => {
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
      }
    };
  }, [step]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const createPersona = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const civicId = user?.username || user?.id;
      if (!civicId) {
        throw new Error("Please sign in to start the interview");
      }

      if (!jobPosting?.id) {
        throw new Error("Job posting information is not available");
      }

      // Use the AI interviewer persona endpoint
      const response = await fetch("/api/tavus/persona/create-interviewer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Failed to create AI interviewer persona"
        );
      }

      const data = await response.json();
      setPersona(data.persona);

      return { persona: data.persona };
    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const startInterview = async () => {
    setStep("creating");
    setIsLoading(true);
    setError(null);

    try {
      if (!jobPosting?.id) {
        throw new Error("Job posting information is not available");
      }

      // Create persona if not exists
      let currentPersona = persona;
      if (!currentPersona) {
        const personaData = await createPersona();
        currentPersona = personaData.persona;
      }

      const civicId = user?.username || user?.id;
      if (!civicId) {
        throw new Error("Please sign in to start the interview");
      }

      // Create conversation
      const response = await fetch("/api/tavus/conversation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personaId: currentPersona.persona_id,
          civicId: civicId,
          jobPostingId: jobPosting.id,
          conversationName: `Interview for ${
            jobPosting?.title || "Position"
          } at ${jobPosting?.company?.name || "Company"}`,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to start interview");
      }

      const data = await response.json();
      setConversation(data.conversation);
      setSession(data.session);
      setStep("interview");
      setDuration(0);

      toast({
        title: "Interview Started",
        description: "Your AI interview has begun. Good luck!",
      });
    } catch (error: any) {
      setError(error.message);
      setStep("setup");
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const endInterview = async () => {
    if (!conversation) return;

    try {
      const civicId = user?.username || user?.id;
      if (!civicId) return;

      await fetch(
        `/api/tavus/conversation?conversationId=${conversation.conversation_id}&civicId=${civicId}`,
        {
          method: "DELETE",
        }
      );

      setStep("completed");

      if (onInterviewComplete && session) {
        onInterviewComplete(session);
      }

      toast({
        title: "Interview Completed",
        description: "Thank you for completing the interview!",
      });
    } catch (error: any) {
      console.error("Error ending interview:", error);
      toast({
        title: "Error",
        description: "Failed to end interview properly",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    if (step === "interview" && conversation) {
      // End the interview before closing
      endInterview();
    }
    setStep("setup");
    setPersona(null);
    setConversation(null);
    setSession(null);
    setDuration(0);
    setError(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        className={
          step === "interview"
            ? "fixed inset-0 z-50 w-full h-full p-0 bg-[#111111] border-none flex items-center justify-center rounded-none"
            : "max-w-4xl h-[80vh] p-0 bg-[#111111] border-[#ffcb74]/20 overflow-y-auto"
        }
        style={step === "interview" ? { maxWidth: '100vw', maxHeight: '100vh', borderRadius: 0 } : {}}
      >
        <DialogHeader className={step === "interview" ? "hidden" : "p-6 pb-0"}>
          <DialogTitle className="flex items-center gap-2 text-[#f6f6f6]">
            <Video className="h-5 w-5 text-[#ffcb74]" />
            AI Video Interview
          </DialogTitle>
        </DialogHeader>

        {(() => {
          if (step === "interview" && conversation) {
            return (
              <div className="fixed inset-0 w-screen h-screen flex items-center justify-center bg-[#111111] z-50" style={{padding:0, marginLeft:750,marginTop:350}}>
                <iframe
                  ref={iframeRef}
                  src={conversation.conversation_url}
                  className="w-full h-full border-0 rounded-none"
                  allow="camera; microphone; fullscreen"
                  title="AI Interview Session"
                  style={{ width: '100vw', height: '100vh', border: 0, borderRadius: 0, display: 'block' }}
                />
              </div>
            );
          } else if (step === "setup") {
            return (
              <div className="flex-1 p-6 pt-0">
                {/* Job Details */}
                <Card className="bg-[#2f2f2f] border-[#ffcb74]/20">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-[#ffcb74]/20 rounded-lg flex items-center justify-center">
                        <Briefcase className="h-6 w-6 text-[#ffcb74]" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-2 text-[#f6f6f6]">
                          {jobPosting?.title || "Job Details"}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-[#f6f6f6]/70 mb-3">
                          <div className="flex items-center gap-1">
                            <Building2 className="h-4 w-4" />
                            {jobPosting?.company?.name || "Company"}
                          </div>
                          {jobPosting?.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {jobPosting?.location}
                            </div>
                          )}
                        </div>
                        {jobPosting?.skills_required && (
                          <div className="flex flex-wrap gap-2">
                            {jobPosting?.skills_required
                              .slice(0, 5)
                              .map((skill: string, index: number) => (
                                <Badge
                                  key={index}
                                  className="bg-[#ffcb74]/20 text-[#ffcb74] text-xs"
                                >
                                  {skill}
                                </Badge>
                              ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Interview Info */}
                <Card className="bg-[#2f2f2f] border-[#ffcb74]/20">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-[#ffcb74]/20 rounded-lg flex items-center justify-center">
                        <User className="h-6 w-6 text-[#ffcb74]" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-2 text-[#f6f6f6]">
                          Meet Your AI Interviewer
                        </h3>

                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div className="p-3 bg-[#111111] rounded-lg border border-[#ffcb74]/20">
                            <div className="text-2xl font-bold text-[#ffcb74] mb-1">
                              25-30
                            </div>
                            <div className="text-sm text-[#f6f6f6]/70">
                              Minutes
                            </div>
                          </div>
                          <div className="p-3 bg-[#111111] rounded-lg border border-[#ffcb74]/20">
                            <div className="text-2xl font-bold text-[#ffcb74] mb-1">
                              Case
                            </div>
                            <div className="text-sm text-[#f6f6f6]/70">
                              Study
                            </div>
                          </div>
                          <div className="p-3 bg-[#111111] rounded-lg border border-[#ffcb74]/20">
                            <div className="text-2xl font-bold text-[#ffcb74] mb-1">
                              AI
                            </div>
                            <div className="text-sm text-[#f6f6f6]/70">
                              Powered
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Pre-interview Checklist */}
                <Card className="bg-[#2f2f2f] border-[#ffcb74]/20">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4 text-[#f6f6f6]">
                      Before You Start
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-[#ffcb74]" />
                        <span className="text-[#f6f6f6]">
                          Ensure you have a stable internet connection
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-[#ffcb74]" />
                        <span className="text-[#f6f6f6]">
                          Test your camera and microphone
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-[#ffcb74]" />
                        <span className="text-[#f6f6f6]">
                          Find a quiet, well-lit space for the interview
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-[#ffcb74]" />
                        <span className="text-[#f6f6f6]">
                          Prepare to discuss your background and experience
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-[#ffcb74]" />
                        <span className="text-[#f6f6f6]">
                          Be ready for a case study discussion
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {error && (
                  <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
                    <AlertCircle className="h-5 w-5" />
                    {error}
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    onClick={handleClose}
                    variant="outline"
                    className="flex-1 bg-[#111111] border-[#ffcb74] text-[#f6f6f6] hover:bg-[#111111]/80"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={startInterview}
                    disabled={isLoading}
                    className="flex-1 bg-[#ffcb74] hover:bg-[#ffcb74]/80 text-[#111111] font-semibold"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Preparing...
                      </>
                    ) : (
                      <>
                        <Video className="mr-2 h-4 w-4" />
                        Start Interview
                      </>
                    )}
                  </Button>
                </div>
              </div>
            );
          } else if (step === "creating") {
            return (
              <div className="flex flex-col items-center justify-center h-full space-y-6">
                <div className="w-16 h-16 bg-[#ffcb74]/20 rounded-full flex items-center justify-center">
                  <Loader2 className="h-8 w-8 text-[#ffcb74] animate-spin" />
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-2 text-[#f6f6f6]">
                    Setting up your interview...
                  </h3>
                  <p className="text-[#f6f6f6]/70">
                    Please wait while we prepare your AI interviewer
                  </p>
                </div>
              </div>
            );
          } else if (step === "completed") {
            return (
              <div className="flex flex-col items-center justify-center h-full space-y-6">
                <div className="w-16 h-16 bg-[#ffcb74]/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-[#ffcb74]" />
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-2 text-[#f6f6f6]">
                    Interview Completed!
                  </h3>
                  <p className="text-[#f6f6f6]/70 mb-4">
                    Thank you for completing the interview. Your responses have
                    been recorded and will be reviewed.
                  </p>
                  <div className="text-sm text-[#f6f6f6]/50">
                    Duration: {formatDuration(duration)}
                  </div>
                </div>
                <Button
                  onClick={handleClose}
                  className="bg-[#ffcb74] hover:bg-[#ffcb74]/80 text-[#111111] font-semibold"
                >
                  Close
                </Button>
              </div>
            );
          }
          return null;
        })()}
      </DialogContent>
    </Dialog>
  );
}
