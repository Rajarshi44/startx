"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useUser } from "@civic/auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { postsService } from "@/services/postsService";
import { CommunityPost, PostFilters, PostMedia } from "@/types/posts";
import {
  Heart,
  MessageCircle,
  Share2,
  Plus,
  Video,
  Upload,
  X,
  Users,
  TrendingUp,
  Clock,
  Hash,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import NextImage from "next/image";

export default function CommunityPostsPage() {
  const { user } = useUser();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filters, setFilters] = useState<PostFilters>({ sortBy: "latest" });

  // Create post state
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    tags: [] as string[],
    media: [] as PostMedia[],
  });
  const [newTag, setNewTag] = useState("");
  const [uploadingMedia, setUploadingMedia] = useState(false);

  // Comments state
  const [expandedPost, setExpandedPost] = useState<string | null>(null);

  const loadPosts = useCallback(
    async (reset = false) => {
      try {
        if (reset) {
          setLoading(true);
          setCurrentPage(1);
        } else {
          setLoadingMore(true);
        }

        const page = reset ? 1 : currentPage;
        const response = await postsService.getPosts(filters, page, 10);

        if (response.success && response.posts) {
          if (reset) {
            setPosts(response.posts);
          } else {
            setPosts((prev) => [...prev, ...response.posts!]);
          }

          setHasMore(response.pagination?.hasMore || false);
          if (!reset) {
            setCurrentPage((prev) => prev + 1);
          }
        } else {
          toast.error(response.error || "Failed to load posts");
        }
      } catch {
        toast.error("Failed to load posts");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [filters, currentPage]
  );

  useEffect(() => {
    if (user?.id) {
      loadPosts(true);
    }
  }, [user, loadPosts]);

  const handleCreatePost = async () => {
    if (!user?.id || !newPost.title.trim() || !newPost.content.trim()) {
      toast.error("Please fill in title and content");
      return;
    }

    try {
      setUploadingMedia(true);

      const response = await postsService.createPost({
        title: newPost.title,
        content: newPost.content,
        tags: newPost.tags,
        media: newPost.media,
        civicId: user.id,
      });

      if (response.success && response.post) {
        setPosts((prev) => [response.post!, ...prev]);
        setNewPost({ title: "", content: "", tags: [], media: [] });
        setShowCreatePost(false);
        toast.success("Post created successfully!");
      } else {
        toast.error(response.error || "Failed to create post");
      }
    } catch {
      toast.error("Failed to create post");
    } finally {
      setUploadingMedia(false);
    }
  };

  const handleFileUpload = async (files: FileList) => {
    if (!user?.id) return;

    setUploadingMedia(true);
    const uploadedMedia: PostMedia[] = [];

    try {
      for (let i = 0; i < Math.min(files.length, 5); i++) {
        const file = files[i];
        let type: "image" | "video" = "image";

        if (file.type.startsWith("video/")) {
          type = "video";
        }

        const response = await postsService.uploadMedia(file, type, user.id);

        if (response.success && response.data) {
          uploadedMedia.push({
            type,
            url: response.data.secure_url,
            publicId: response.data.public_id,
            width: response.data.width,
            height: response.data.height,
            duration: response.data.duration,
            format: response.data.format,
            bytes: response.data.bytes,
          });
        }
      }

      setNewPost((prev) => ({
        ...prev,
        media: [...prev.media, ...uploadedMedia],
      }));

      toast.success(`Uploaded ${uploadedMedia.length} file(s)`);
    } catch {
      toast.error("Failed to upload files");
    } finally {
      setUploadingMedia(false);
    }
  };

  const handleLikePost = async (postId: string) => {
    if (!user?.id) return;

    try {
      const response = await postsService.toggleLike(postId, user.id);

      if (response.success) {
        setPosts((prev) =>
          prev.map((post) =>
            post._id === postId
              ? {
                  ...post,
                  likes: response.liked
                    ? [...post.likes, user.id]
                    : post.likes.filter((id) => id !== user.id),
                  likesCount: response.likesCount,
                }
              : post
          )
        );
      }
    } catch {
      toast.error("Failed to like post");
    }
  };

  const addTag = () => {
    if (
      newTag.trim() &&
      !newPost.tags.includes(newTag.trim().toLowerCase()) &&
      newPost.tags.length < 10
    ) {
      setNewPost((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim().toLowerCase().replace(/\s+/g, "-")],
      }));
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setNewPost((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const removeMedia = (indexToRemove: number) => {
    setNewPost((prev) => ({
      ...prev,
      media: prev.media.filter((_, index) => index !== indexToRemove),
    }));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 24 * 7) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white overflow-hidden relative">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-black to-gray-900" />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-[#ffcb74] rounded-full filter blur-3xl opacity-10 animate-pulse" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-[#ffd700] rounded-full filter blur-3xl opacity-10 animate-pulse" />

        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6">
          <div
            className="border backdrop-blur-md shadow-2xl rounded-3xl p-12 max-w-md w-full text-center"
            style={{
              borderColor: "rgba(255, 203, 116, 0.2)",
              backgroundColor: "rgba(255, 255, 255, 0.05)",
            }}
          >
            <div className="mb-8">
              <div
                className="w-20 h-20 mx-auto mb-6 rounded-full border-2 flex items-center justify-center"
                style={{
                  borderColor: "#ffcb74",
                  backgroundColor: "rgba(255, 203, 116, 0.1)",
                }}
              >
                <Users className="h-10 w-10" style={{ color: "#ffcb74" }} />
              </div>
              <h2 className="text-3xl font-bold mb-4 text-white">
                Community Posts
              </h2>
              <p className="text-gray-300 leading-relaxed">
                Connect with founders, investors, and innovators. Share insights
                and discover opportunities in our startup ecosystem.
              </p>
            </div>

            <div className="space-y-4">
              <Button
                onClick={() => (window.location.href = "/auth")}
                className="w-full py-4 text-lg font-semibold bg-gradient-to-r from-[#ffcb74] to-[#ffd700] text-black hover:from-[#ffd700] hover:to-[#ffcb74] transition-all duration-300 shadow-lg hover:shadow-xl rounded-xl"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Join Community
              </Button>

              <Link href="/">
                <Button
                  variant="outline"
                  className="w-full py-4 bg-transparent border-2 text-[#ffcb74] hover:bg-[#ffcb74] hover:text-black transition-all duration-300 rounded-xl"
                  style={{ borderColor: "#ffcb74" }}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-black to-gray-900" />
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-[#ffcb74] rounded-full filter blur-3xl opacity-5 animate-pulse" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-[#ffd700] rounded-full filter blur-3xl opacity-5 animate-pulse" />

      <div className="relative z-10 min-h-screen">
        {/* Navigation */}
        <nav className="p-6 flex justify-between items-center">
          <Link
            href="/"
            className="inline-flex items-center space-x-2 hover:opacity-80 transition-opacity"
          >
            <ArrowLeft className="h-5 w-5" style={{ color: "#ffcb74" }} />
            <span style={{ color: "#ffcb74" }}>Back to Home</span>
          </Link>
          <div className="text-2xl font-bold">
            <span className="text-white">Startup</span>
            <span style={{ color: "#ffcb74" }}>Hub</span>
          </div>
        </nav>

        {/* Header */}
        <div className="px-6 pb-6">
          <div className="max-w-7xl mx-auto">
            <div
              className="border backdrop-blur-md shadow-2xl rounded-3xl p-8"
              style={{
                borderColor: "rgba(255, 203, 116, 0.2)",
                backgroundColor: "rgba(255, 255, 255, 0.05)",
              }}
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-12 h-12 rounded-full border-2 flex items-center justify-center"
                      style={{
                        borderColor: "#ffcb74",
                        backgroundColor: "rgba(255, 203, 116, 0.1)",
                      }}
                    >
                      <Users className="h-6 w-6" style={{ color: "#ffcb74" }} />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold text-white">
                        Community Posts
                      </h1>
                      <p className="text-gray-300">
                        Share insights and connect with the ecosystem
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href="/community">
                    <Button
                      variant="outline"
                      className="bg-transparent border-2 text-[#ffcb74] hover:bg-[#ffcb74] hover:text-black transition-all duration-300 rounded-xl"
                      style={{ borderColor: "#ffcb74" }}
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Community Chat
                    </Button>
                  </Link>

                  <Dialog
                    open={showCreatePost}
                    onOpenChange={setShowCreatePost}
                  >
                    <DialogTrigger asChild>
                      <Button className="bg-gradient-to-r from-[#ffcb74] to-[#ffd700] text-black hover:from-[#ffd700] hover:to-[#ffcb74] transition-all duration-300 shadow-lg hover:shadow-xl rounded-xl font-semibold">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Post
                      </Button>
                    </DialogTrigger>
                    <DialogContent
                      className="border backdrop-blur-md shadow-2xl rounded-3xl max-w-2xl max-h-[90vh] overflow-y-auto"
                      style={{
                        borderColor: "rgba(255, 203, 116, 0.2)",
                        backgroundColor: "rgba(0, 0, 0, 0.9)",
                      }}
                    >
                      <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-white">
                          Create New Post
                        </DialogTitle>
                      </DialogHeader>

                      <div className="space-y-6 p-2">
                        <Input
                          placeholder="Post title..."
                          value={newPost.title}
                          onChange={(e) =>
                            setNewPost((prev) => ({
                              ...prev,
                              title: e.target.value,
                            }))
                          }
                          className="bg-black/20 border-2 text-white placeholder-gray-400 rounded-xl py-3 text-lg focus:border-[#ffcb74] transition-colors"
                          style={{ borderColor: "rgba(255, 203, 116, 0.3)" }}
                          maxLength={200}
                        />

                        <Textarea
                          placeholder="What's on your mind? Share your insights, experiences, or ask questions..."
                          value={newPost.content}
                          onChange={(e) =>
                            setNewPost((prev) => ({
                              ...prev,
                              content: e.target.value,
                            }))
                          }
                          className="bg-black/20 border-2 text-white placeholder-gray-400 rounded-xl min-h-[120px] text-lg focus:border-[#ffcb74] transition-colors"
                          style={{ borderColor: "rgba(255, 203, 116, 0.3)" }}
                          maxLength={5000}
                        />

                        {/* Tags */}
                        <div
                          className="border-2 rounded-xl p-4"
                          style={{
                            borderColor: "rgba(255, 203, 116, 0.3)",
                            backgroundColor: "rgba(255, 203, 116, 0.05)",
                          }}
                        >
                          <div className="flex items-center gap-2 mb-3">
                            <Hash
                              className="h-5 w-5"
                              style={{ color: "#ffcb74" }}
                            />
                            <Input
                              placeholder="Add tags (e.g., startup, ai, funding)..."
                              value={newTag}
                              onChange={(e) => setNewTag(e.target.value)}
                              onKeyPress={(e) =>
                                e.key === "Enter" &&
                                (e.preventDefault(), addTag())
                              }
                              className="bg-black/20 border text-white placeholder-gray-400 rounded-lg"
                              style={{
                                borderColor: "rgba(255, 203, 116, 0.3)",
                              }}
                              maxLength={30}
                            />
                            <Button
                              onClick={addTag}
                              size="sm"
                              disabled={
                                !newTag.trim() || newPost.tags.length >= 10
                              }
                              className="bg-[#ffcb74] text-black hover:bg-[#ffd700] transition-colors rounded-lg"
                            >
                              Add
                            </Button>
                          </div>

                          {newPost.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {newPost.tags.map((tag, index) => (
                                <Badge
                                  key={index}
                                  className="bg-gradient-to-r from-[#ffcb74] to-[#ffd700] text-black rounded-lg px-3 py-1 font-medium"
                                >
                                  #{tag}
                                  <button
                                    onClick={() => removeTag(tag)}
                                    className="ml-2 hover:text-red-600 transition-colors"
                                    aria-label={`Remove tag ${tag}`}
                                    title={`Remove tag ${tag}`}
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Media Upload */}
                        <div
                          className="border-2 rounded-xl p-4"
                          style={{
                            borderColor: "rgba(255, 203, 116, 0.3)",
                            backgroundColor: "rgba(255, 203, 116, 0.05)",
                          }}
                        >
                          <div className="flex items-center gap-2 mb-4">
                            <Upload
                              className="h-5 w-5"
                              style={{ color: "#ffcb74" }}
                            />
                            <label
                              className="text-lg font-medium"
                              style={{ color: "#ffcb74" }}
                            >
                              Media (Max 5 files)
                            </label>
                          </div>

                          <input
                            type="file"
                            multiple
                            accept="image/*,video/*"
                            onChange={(e) =>
                              e.target.files && handleFileUpload(e.target.files)
                            }
                            className="w-full text-gray-300 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:bg-gradient-to-r file:from-[#ffcb74] file:to-[#ffd700] file:text-black file:font-medium hover:file:from-[#ffd700] hover:file:to-[#ffcb74] file:transition-all file:duration-300"
                            disabled={
                              uploadingMedia || newPost.media.length >= 5
                            }
                            aria-label="Upload media files"
                            title="Upload media files (images or videos)"
                          />

                          {newPost.media.length > 0 && (
                            <div className="grid grid-cols-2 gap-3 mt-4">
                              {newPost.media.map((media, index) => (
                                <div key={index} className="relative group">
                                  {media.type === "image" ? (
                                    <div
                                      className="relative w-full h-24 rounded-xl overflow-hidden border-2"
                                      style={{
                                        borderColor: "rgba(255, 203, 116, 0.3)",
                                      }}
                                    >
                                      <NextImage
                                        src={media.url}
                                        alt={`Upload ${index + 1}`}
                                        fill={true}
                                        className="object-cover"
                                      />
                                    </div>
                                  ) : (
                                    <div
                                      className="w-full h-24 rounded-xl border-2 flex items-center justify-center"
                                      style={{
                                        borderColor: "rgba(255, 203, 116, 0.3)",
                                        backgroundColor:
                                          "rgba(255, 203, 116, 0.1)",
                                      }}
                                    >
                                      <Video
                                        className="h-8 w-8"
                                        style={{ color: "#ffcb74" }}
                                      />
                                    </div>
                                  )}
                                  <button
                                    onClick={() => removeMedia(index)}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                                    aria-label={`Remove media ${index + 1}`}
                                    title={`Remove media ${index + 1}`}
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                          <Button
                            variant="outline"
                            onClick={() => setShowCreatePost(false)}
                            className="bg-transparent border-2 text-gray-300 hover:bg-gray-800 hover:text-white transition-all duration-300 rounded-xl"
                            style={{ borderColor: "rgba(255, 255, 255, 0.2)" }}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleCreatePost}
                            disabled={
                              !newPost.title.trim() ||
                              !newPost.content.trim() ||
                              uploadingMedia
                            }
                            className="bg-gradient-to-r from-[#ffcb74] to-[#ffd700] text-black hover:from-[#ffd700] hover:to-[#ffcb74] transition-all duration-300 shadow-lg hover:shadow-xl rounded-xl font-semibold px-8"
                          >
                            {uploadingMedia ? "Uploading..." : "Create Post"}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {/* Filter Bar */}
              <div
                className="flex items-center gap-4 mt-6 pt-6 border-t"
                style={{ borderColor: "rgba(255, 203, 116, 0.2)" }}
              >
                <Select
                  value={filters.sortBy}
                  onValueChange={(value: any) =>
                    setFilters((prev) => ({ ...prev, sortBy: value }))
                  }
                >
                  <SelectTrigger
                    className="w-48 bg-black/20 border-2 text-white rounded-xl"
                    style={{ borderColor: "rgba(255, 203, 116, 0.3)" }}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent
                    className="bg-black border-2 rounded-xl"
                    style={{ borderColor: "rgba(255, 203, 116, 0.3)" }}
                  >
                    <SelectItem
                      value="latest"
                      className="text-white hover:bg-[#ffcb74]/10 rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Latest Posts
                      </div>
                    </SelectItem>
                    <SelectItem
                      value="popular"
                      className="text-white hover:bg-[#ffcb74]/10 rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <Heart className="h-4 w-4" />
                        Most Popular
                      </div>
                    </SelectItem>
                    <SelectItem
                      value="trending"
                      className="text-white hover:bg-[#ffcb74]/10 rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Trending
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Posts Feed */}
        <div className="px-6 pb-12">
          <div className="max-w-7xl mx-auto">
            {loading ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="border backdrop-blur-md shadow-2xl rounded-3xl p-8 animate-pulse"
                    style={{
                      borderColor: "rgba(255, 203, 116, 0.2)",
                      backgroundColor: "rgba(255, 255, 255, 0.05)",
                    }}
                  >
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-[#ffcb74]/20 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-[#ffcb74]/20 rounded mb-2"></div>
                        <div className="h-3 bg-[#ffcb74]/20 rounded w-1/3"></div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="h-6 bg-[#ffcb74]/20 rounded"></div>
                      <div className="h-4 bg-[#ffcb74]/20 rounded"></div>
                      <div className="h-4 bg-[#ffcb74]/20 rounded w-2/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : posts.length === 0 ? (
              <div
                className="border backdrop-blur-md shadow-2xl rounded-3xl p-16 text-center"
                style={{
                  borderColor: "rgba(255, 203, 116, 0.2)",
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                }}
              >
                <div
                  className="w-24 h-24 mx-auto mb-8 rounded-full border-2 flex items-center justify-center"
                  style={{
                    borderColor: "#ffcb74",
                    backgroundColor: "rgba(255, 203, 116, 0.1)",
                  }}
                >
                  <Users className="h-12 w-12" style={{ color: "#ffcb74" }} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">
                  No posts yet
                </h3>
                <p className="text-gray-300 mb-8 text-lg">
                  Be the first to share something with the community!
                </p>
                <Button
                  onClick={() => setShowCreatePost(true)}
                  className="bg-gradient-to-r from-[#ffcb74] to-[#ffd700] text-black hover:from-[#ffd700] hover:to-[#ffcb74] transition-all duration-300 shadow-lg hover:shadow-xl rounded-xl font-semibold px-8 py-4 text-lg"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Create First Post
                </Button>
              </div>
            ) : (
              <>
                {/* Bento Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {posts.map((post, index) => (
                    <div
                      key={post._id}
                      className={`border backdrop-blur-md shadow-2xl rounded-3xl p-8 hover:shadow-3xl transition-all duration-300 group ${
                        index % 7 === 0
                          ? "lg:col-span-2"
                          : index % 5 === 0
                          ? "xl:col-span-2"
                          : ""
                      }`}
                      style={{
                        borderColor: "rgba(255, 203, 116, 0.2)",
                        backgroundColor: "rgba(255, 255, 255, 0.05)",
                      }}
                    >
                      {/* Post Header */}
                      <div className="flex items-center gap-4 mb-6">
                        <Avatar
                          className="h-12 w-12 border-2"
                          style={{ borderColor: "#ffcb74" }}
                        >
                          <AvatarFallback className="bg-gradient-to-r from-[#ffcb74] to-[#ffd700] text-black font-bold">
                            {post.user.username.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-white text-lg">
                              {post.user.username}
                            </span>
                            {post.user.verificationStatus === "verified" && (
                              <Badge className="bg-gradient-to-r from-green-400 to-green-500 text-black text-xs font-medium">
                                Verified
                              </Badge>
                            )}
                          </div>
                          <p className="text-gray-400">
                            {formatDate(post.createdAt)}
                          </p>
                        </div>
                      </div>

                      {/* Post Content */}
                      <div className="mb-6">
                        <h3 className="text-2xl font-bold text-white mb-4 leading-tight">
                          {post.title}
                        </h3>
                        <p className="text-gray-300 leading-relaxed text-lg">
                          {post.content}
                        </p>
                      </div>

                      {/* Tags */}
                      {post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-6">
                          {post.tags.map((tag, index) => (
                            <Badge
                              key={index}
                              className="bg-gradient-to-r from-[#ffcb74]/20 to-[#ffd700]/20 border text-[#ffcb74] rounded-lg px-3 py-1"
                              style={{
                                borderColor: "rgba(255, 203, 116, 0.3)",
                              }}
                            >
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Media */}
                      {post.media && post.media.length > 0 && (
                        <div className="mb-6">
                          <div className="grid grid-cols-1 gap-3">
                            {post.media.map((media, index) => (
                              <div
                                key={index}
                                className="relative rounded-2xl overflow-hidden border-2"
                                style={{
                                  borderColor: "rgba(255, 203, 116, 0.3)",
                                }}
                              >
                                {media.type === "image" ? (
                                  <NextImage
                                    src={media.url}
                                    alt={`Post media ${index + 1}`}
                                    width={media.width || 400}
                                    height={media.height || 300}
                                    className="object-cover w-full h-auto"
                                  />
                                ) : (
                                  <video
                                    src={media.url}
                                    controls
                                    className="w-full h-auto"
                                    style={{ maxHeight: "300px" }}
                                  />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <Separator
                        className="mb-6"
                        style={{ backgroundColor: "rgba(255, 203, 116, 0.2)" }}
                      />

                      {/* Post Actions */}
                      <div className="flex items-center gap-8">
                        <button
                          onClick={() => handleLikePost(post._id)}
                          className={`flex items-center gap-3 text-lg transition-all duration-300 ${
                            post.likes.includes(user.id || "")
                              ? "text-red-400 hover:text-red-300"
                              : "text-gray-400 hover:text-[#ffcb74]"
                          }`}
                        >
                          <Heart
                            className={`h-5 w-5 ${
                              post.likes.includes(user.id || "")
                                ? "fill-current"
                                : ""
                            }`}
                          />
                          {post.likes.length || 0}
                        </button>

                        <button
                          onClick={() =>
                            setExpandedPost(
                              expandedPost === post._id ? null : post._id
                            )
                          }
                          className="flex items-center gap-3 text-lg text-gray-400 hover:text-[#ffcb74] transition-all duration-300"
                        >
                          <MessageCircle className="h-5 w-5" />
                          {post.commentsCount || 0}
                        </button>

                        <button className="flex items-center gap-3 text-lg text-gray-400 hover:text-[#ffcb74] transition-all duration-300">
                          <Share2 className="h-5 w-5" />
                          Share
                        </button>
                      </div>

                      {/* Comments Section */}
                      {expandedPost === post._id && (
                        <div
                          className="mt-6 pt-6 border-t"
                          style={{ borderColor: "rgba(255, 203, 116, 0.2)" }}
                        >
                          <div className="text-gray-400 text-center py-8">
                            <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p>Comments coming soon...</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Load More Button */}
                {hasMore && (
                  <div className="text-center mt-12">
                    <Button
                      onClick={() => loadPosts(false)}
                      disabled={loadingMore}
                      className="bg-gradient-to-r from-[#ffcb74] to-[#ffd700] text-black hover:from-[#ffd700] hover:to-[#ffcb74] transition-all duration-300 shadow-lg hover:shadow-xl rounded-xl font-semibold px-8 py-4 text-lg"
                    >
                      {loadingMore ? "Loading..." : "Load More Posts"}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
