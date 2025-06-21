"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useUser } from "@civic/auth-web3/react";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Users,
  MessageCircle,
  Send,
  User,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Image as ImageIcon,
  Mic,
  X,
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { VoiceRecorder } from "@/components/community/VoiceRecorder";
import { MediaViewer } from "@/components/community/MediaViewer";
import type { MediaAttachment } from "@/types/community";

interface CommunityUser {
  _id: string;
  username: string;
  civicId: string;
  verificationStatus: string;
  joinedAt: string;
}

interface Message {
  _id: string;
  message: string;
  media?: MediaAttachment;
  createdAt: string;
  user: {
    username: string;
    civicId: string;
    verificationStatus: string;
  };
}

export default function CommunityPage() {
  const { user } = useUser();
  const { address } = useAccount();
  const { toast } = useToast();

  const [currentUser, setCurrentUser] = useState<CommunityUser | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);

  const [username, setUsername] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Media handling states
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadMessages = useCallback(
    async (pageNum = 1, append = false) => {
      setIsLoadingMessages(true);
      try {
        const response = await fetch(
          `/api/community/messages?page=${pageNum}&limit=20`
        );
        const data = await response.json();

        if (data.success) {
          if (append) {
            setMessages((prev) => [...data.messages, ...prev]);
          } else {
            setMessages(data.messages);
          }
          setHasMore(data.pagination.hasMore);
          setPage(pageNum);
        }
      } catch (error) {
        console.error("Error loading messages:", error);
        toast({
          title: "Error",
          description: "Failed to load messages",
          variant: "destructive",
        });
      } finally {
        setIsLoadingMessages(false);
      }
    },
    [toast]
  );

  const checkUserRegistration = useCallback(async () => {
    if (!user?.id) return;

    try {
      const response = await fetch(`/api/community/users?civicId=${user.id}`);
      const data = await response.json();

      if (data.success && data.exists) {
        setCurrentUser(data.user);
        setIsRegistered(true);
        loadMessages();
      } else {
        setIsRegistered(false);
      }
    } catch (error) {
      console.error("Error checking user registration:", error);
      toast({
        title: "Error",
        description: "Failed to check registration status",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, loadMessages, toast]);

  const sendMessage = useCallback(async () => {
    if (!user?.id || !newMessage.trim() || !currentUser) return;

    setIsSending(true);
    try {
      const response = await fetch("/api/community/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: newMessage.trim(),
          civicId: user.id,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessages((prev) => [...prev, data.message]);
        setNewMessage("");
        toast({
          title: "Message sent",
          description: "Your message has been posted successfully",
        });
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to send message",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  }, [user, newMessage, currentUser, toast]);

  // Missing functions
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const clearMediaSelection = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleImageUploadAndSend = async () => {
    if (!selectedImage || !user?.id || !currentUser) return;

    setIsUploadingMedia(true);
    try {
      const formData = new FormData();
      formData.append("image", selectedImage);
      formData.append("civicId", user.id);

      const response = await fetch("/api/community/messages", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setMessages((prev) => [...prev, data.message]);
        clearMediaSelection();
        toast({
          title: "Image sent",
          description: "Your image has been posted successfully",
        });
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to send image",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error sending image:", error);
      toast({
        title: "Error",
        description: "Failed to send image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploadingMedia(false);
    }
  };

  const handleVoiceRecordingComplete = async (audioBlob: Blob) => {
    if (!user?.id || !currentUser) return;

    setIsUploadingMedia(true);
    try {
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.webm");
      formData.append("civicId", user.id);

      const response = await fetch("/api/community/messages", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setMessages((prev) => [...prev, data.message]);
        setShowVoiceRecorder(false);
        toast({
          title: "Voice message sent",
          description: "Your voice message has been posted successfully",
        });
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to send voice message",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error sending voice message:", error);
      toast({
        title: "Error",
        description: "Failed to send voice message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploadingMedia(false);
    }
  };

  // Check if user is authenticated
  useEffect(() => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    checkUserRegistration();
  }, [user, checkUserRegistration]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "Enter" && newMessage.trim() && !isSending) {
        e.preventDefault();
        sendMessage();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [newMessage, isSending, sendMessage]);

  const registerUser = async () => {
    if (!user?.id || !username.trim()) return;

    setIsRegistering(true);
    try {
      const response = await fetch("/api/community/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          civicId: user.id,
          username: username.trim(),
          walletAddress: address,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setCurrentUser(data.user);
        setIsRegistered(true);
        setUsername("");
        toast({
          title: "Success",
          description: data.message || "Username set successfully!",
        });
        loadMessages();
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to set username",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error registering user:", error);
      toast({
        title: "Error",
        description: "Failed to register. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRegistering(false);
    }
  };

  const loadMoreMessages = () => {
    if (hasMore && !isLoadingMessages) {
      loadMessages(page + 1, true);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getInitials = (username: string) => {
    return username.slice(0, 2).toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <RefreshCw
            className="h-8 w-8 animate-spin mx-auto mb-4"
            style={{ color: "#ffcb74" }}
          />
          <p className="text-gray-300">Loading community...</p>
        </div>
      </div>
    );
  }

  if (!user?.id) {
    return (
      <div className="min-h-screen bg-black" style={{ color: "#f6f6f6" }}>
        <nav className="p-6 flex justify-between items-center">
          <Link
            href="/"
            className="inline-flex items-center space-x-2 hover:opacity-80 transition-opacity"
          >
            <ArrowLeft className="h-5 w-5" style={{ color: "#ffcb74" }} />
            <span style={{ color: "#ffcb74" }}>Back to Home</span>
          </Link>
          <div className="text-2xl font-bold">
            <span style={{ color: "#f6f6f6" }}>Startup</span>
            <span style={{ color: "#ffcb74" }}>Hub</span>
          </div>
        </nav>

        <main className="flex-1 flex items-center justify-center px-6">
          <Card
            className="w-full max-w-md border backdrop-blur-sm shadow-2xl"
            style={{
              borderColor: "rgba(255, 203, 116, 0.2)",
              backgroundColor: "rgba(255, 255, 255, 0.05)",
            }}
          >
            <CardHeader className="text-center">
              <AlertCircle
                className="h-12 w-12 mx-auto mb-4"
                style={{ color: "#ffcb74" }}
              />
              <CardTitle style={{ color: "#f6f6f6" }}>
                Authentication Required
              </CardTitle>
              <CardDescription style={{ color: "#d1d1d1" }}>
                Please sign in to access the community forum
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/auth">
                <Button className="w-full bg-gradient-to-r from-[#ffcb74] to-[#ffd700] text-black hover:from-[#ffd700] hover:to-[#ffcb74] font-semibold transition-all duration-300">
                  Sign In
                </Button>
              </Link>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (!isRegistered) {
    return (
      <div className="min-h-screen bg-black" style={{ color: "#f6f6f6" }}>
        <nav className="p-6 flex justify-between items-center">
          <Link
            href="/"
            className="inline-flex items-center space-x-2 hover:opacity-80 transition-opacity"
          >
            <ArrowLeft className="h-5 w-5" style={{ color: "#ffcb74" }} />
            <span style={{ color: "#ffcb74" }}>Back to Home</span>
          </Link>
          <div className="text-2xl font-bold">
            <span style={{ color: "#f6f6f6" }}>Startup</span>
            <span style={{ color: "#ffcb74" }}>Hub</span>
          </div>
        </nav>

        <main className="flex-1 flex items-center justify-center px-6">
          <Card
            className="w-full max-w-md border backdrop-blur-sm shadow-2xl"
            style={{
              borderColor: "rgba(255, 203, 116, 0.2)",
              backgroundColor: "rgba(255, 255, 255, 0.05)",
            }}
          >
            <CardHeader className="text-center">
              <User
                className="h-12 w-12 mx-auto mb-4"
                style={{ color: "#ffcb74" }}
              />
              <CardTitle style={{ color: "#f6f6f6" }}>
                Join the Community
              </CardTitle>
              <CardDescription style={{ color: "#d1d1d1" }}>
                Choose a username to enter the StartupHub mentoring forum
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">
                  Username
                </label>
                <Input
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  maxLength={20}
                  className="bg-black/20 border-gray-600 text-white placeholder-gray-400 focus:border-[#ffcb74]"
                  disabled={isRegistering}
                />
                <p className="text-xs text-gray-400 mt-1">
                  3-20 characters, letters, numbers, and underscores only
                </p>
              </div>

              <Button
                onClick={registerUser}
                disabled={!username.trim() || isRegistering}
                className="w-full bg-gradient-to-r from-[#ffcb74] to-[#ffd700] text-black hover:from-[#ffd700] hover:to-[#ffcb74] font-semibold transition-all duration-300"
              >
                {isRegistering ? "Setting up..." : "Join Community"}
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black" style={{ color: "#f6f6f6" }}>
      {/* Navigation */}
      <nav className="p-6 flex justify-between items-center border-b border-gray-800">
        <Link
          href="/"
          className="inline-flex items-center space-x-2 hover:opacity-80 transition-opacity"
        >
          <ArrowLeft className="h-5 w-5" style={{ color: "#ffcb74" }} />
          <span style={{ color: "#ffcb74" }}>Back to Home</span>
        </Link>

        <div className="flex items-center space-x-4">
          <div className="text-2xl font-bold">
            <span style={{ color: "#f6f6f6" }}>Community</span>
            <span style={{ color: "#ffcb74" }}>Forum</span>
          </div>

          <div className="flex items-center space-x-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-[#ffcb74] text-black text-sm">
                {getInitials(currentUser?.username || "")}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-gray-300">
              {currentUser?.username}
            </span>
            <Badge
              variant="secondary"
              className="bg-green-900/20 text-green-400 border-green-400/20"
            >
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Verified
            </Badge>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-3">
              <Users className="h-6 w-6" style={{ color: "#ffcb74" }} />
              <h1 className="text-2xl font-bold" style={{ color: "#f6f6f6" }}>
                Mentoring Forum
              </h1>
            </div>
            <Link href="/community/posts">
              <Button variant="outline" className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-[#ffcb74]">
                <MessageCircle className="h-4 w-4 mr-2" />
                View Posts
              </Button>
            </Link>
          </div>
          <p className="text-gray-400">
            Connect with fellow entrepreneurs, investors, and mentors in the
            StartupHub community
          </p>
        </div>

        {/* Messages Container */}
        <Card
          className="flex-1 flex flex-col border backdrop-blur-sm"
          style={{
            borderColor: "rgba(255, 203, 116, 0.2)",
            backgroundColor: "rgba(255, 255, 255, 0.02)",
            minHeight: "500px",
          }}
        >
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MessageCircle
                  className="h-5 w-5"
                  style={{ color: "#ffcb74" }}
                />
                <CardTitle className="text-lg" style={{ color: "#f6f6f6" }}>
                  Community Chat
                </CardTitle>
              </div>

              <Button
                onClick={() => loadMessages(1)}
                disabled={isLoadingMessages}
                variant="outline"
                size="sm"
                className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-[#ffcb74]"
              >
                <RefreshCw
                  className={`h-4 w-4 ${
                    isLoadingMessages ? "animate-spin" : ""
                  }`}
                />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col p-0">
            {/* Messages List */}
            <ScrollArea className="flex-1 px-6">
              {hasMore && (
                <div className="text-center py-4">
                  <Button
                    onClick={loadMoreMessages}
                    disabled={isLoadingMessages}
                    variant="ghost"
                    size="sm"
                    className="text-[#ffcb74] hover:bg-[#ffcb74]/10"
                  >
                    {isLoadingMessages ? "Loading..." : "Load more messages"}
                  </Button>
                </div>
              )}

              <div className="space-y-4 pb-4">
                {messages.map((message) => (
                  <div key={message._id} className="flex space-x-3">
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarFallback className="bg-gray-700 text-gray-300 text-sm">
                        {getInitials(message.user.username)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-gray-200">
                          {message.user.username}
                        </span>
                        {message.user.verificationStatus === "verified" && (
                          <Badge
                            variant="secondary"
                            className="bg-green-900/20 text-green-400 border-green-400/20 text-xs"
                          >
                            <CheckCircle2 className="h-2 w-2 mr-1" />
                            Verified
                          </Badge>
                        )}
                        <span className="text-xs text-gray-500">
                          {formatTime(message.createdAt)}
                        </span>
                      </div>

                      {message.message && (
                        <p className="text-gray-300 break-words mb-2">
                          {message.message}
                        </p>
                      )}

                      {message.media && (
                        <MediaViewer media={message.media} className="mt-2" />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div ref={messagesEndRef} />
            </ScrollArea>

            <Separator className="bg-gray-800" />

            {/* Voice Recorder */}
            {showVoiceRecorder && (
              <div className="p-6 pt-0">
                <VoiceRecorder
                  onRecordingComplete={handleVoiceRecordingComplete}
                  onCancel={() => setShowVoiceRecorder(false)}
                  isUploading={isUploadingMedia}
                />
              </div>
            )}

            {/* Image Preview */}
            {selectedImage && imagePreview && (
              <div className="p-6 pt-0">
                <Card
                  className="border backdrop-blur-sm"
                  style={{
                    borderColor: "rgba(255, 203, 116, 0.2)",
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-4">
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Image preview"
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                        <Button
                          onClick={clearMediaSelection}
                          variant="destructive"
                          size="sm"
                          className="absolute -top-2 -right-2 w-6 h-6 p-0 rounded-full"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>

                      <div className="flex-1">
                        <p className="text-sm text-gray-300 mb-1">
                          Ready to send image
                        </p>
                        <p className="text-xs text-gray-500">
                          {selectedImage.name} •{" "}
                          {(selectedImage.size / 1024 / 1024).toFixed(1)}MB
                        </p>
                      </div>

                      <Button
                        onClick={handleImageUploadAndSend}
                        disabled={isUploadingMedia}
                        className="bg-gradient-to-r from-[#ffcb74] to-[#ffd700] text-black hover:from-[#ffd700] hover:to-[#ffcb74] font-semibold transition-all duration-300"
                      >
                        {isUploadingMedia ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Send Image
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Message Input */}
            <div className="p-6">
              <div className="flex space-x-3">
                <div className="flex flex-col space-y-3 flex-1">
                  <Textarea
                    placeholder="Share your thoughts with the community..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    maxLength={1000}
                    className="bg-black/20 border-gray-600 text-white placeholder-gray-400 focus:border-[#ffcb74] resize-none"
                    rows={3}
                    disabled={
                      isSending || showVoiceRecorder || isUploadingMedia
                    }
                  />

                  {/* Media Controls */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        style={{ display: "none" }}
                      />

                      <Button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={
                          isSending ||
                          showVoiceRecorder ||
                          !!selectedImage ||
                          isUploadingMedia
                        }
                        variant="outline"
                        size="sm"
                        className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-[#ffcb74]"
                      >
                        <ImageIcon className="h-4 w-4 mr-2" />
                        Image
                      </Button>

                      <Button
                        onClick={() => setShowVoiceRecorder(true)}
                        disabled={
                          isSending ||
                          showVoiceRecorder ||
                          !!selectedImage ||
                          isUploadingMedia
                        }
                        variant="outline"
                        size="sm"
                        className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-[#ffcb74]"
                      >
                        <Mic className="h-4 w-4 mr-2" />
                        Voice
                      </Button>
                    </div>

                    <div className="text-xs text-gray-500">
                      {newMessage.length}/1000
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => sendMessage()}
                  disabled={
                    (!newMessage.trim() && !selectedImage) ||
                    isSending ||
                    showVoiceRecorder ||
                    isUploadingMedia
                  }
                  className="bg-gradient-to-r from-[#ffcb74] to-[#ffd700] text-black hover:from-[#ffd700] hover:to-[#ffcb74] font-semibold transition-all duration-300 px-6 self-end"
                >
                  {isSending || isUploadingMedia ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>

              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>Press Ctrl+Enter to send quickly</span>
                <span>Share images up to 10MB or record voice messages</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
