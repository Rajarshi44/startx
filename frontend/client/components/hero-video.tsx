/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useState } from "react"
import { Play, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface HeroVideoDialogProps {
  className?: string
  animationStyle?: "from-center" | "from-top" | "from-bottom"
  videoSrc: string
  thumbnailSrc: string
  thumbnailAlt: string
}

export default function HeroVideoDialog({
  className,
  animationStyle = "from-center",
  videoSrc,
  thumbnailSrc,
  thumbnailAlt,
}: HeroVideoDialogProps) {
  const [isVideoOpen, setIsVideoOpen] = useState(false)

  const openVideo = () => setIsVideoOpen(true)
  const closeVideo = () => setIsVideoOpen(false)

  return (
    <>
      <div className={cn("relative cursor-pointer group", className)} onClick={openVideo}>
        <div className="relative overflow-hidden rounded-2xl border border-[#B0B8C1]/20 bg-black/20 backdrop-blur-sm">
          <img
            src={thumbnailSrc || "/placeholder.svg"}
            alt={thumbnailAlt}
            className="w-full h-auto transition-transform duration-300 group-hover:scale-105"
          />

          {/* Play button overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors duration-300">
            <div className="flex items-center justify-center w-20 h-20 bg-[#637089] hover:bg-[#5a6478] rounded-full transition-colors duration-300 group-hover:scale-110">
              <Play className="w-8 h-8 text-white ml-1" fill="currentColor" />
            </div>
          </div>

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        </div>
      </div>

      {/* Video Modal */}
      {isVideoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-4xl mx-4">
            <button
              onClick={closeVideo}
              className="absolute -top-12 right-0 text-white hover:text-[#637089] transition-colors duration-200"
            >
              <X className="w-8 h-8" />
            </button>

            <div className="relative aspect-video rounded-lg overflow-hidden">
              <iframe
                src={videoSrc}
                title="Hero Video"
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
