"use client"

import React, { useState, useRef, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Play, Pause, Volume2, Download, ZoomIn } from "lucide-react"
import Image from "next/image"
import type { MediaAttachment } from "@/types/community"

interface MediaViewerProps {
  media: MediaAttachment
  className?: string
}

export function MediaViewer({ media, className = "" }: MediaViewerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [showImageModal, setShowImageModal] = useState(false)
  
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => setCurrentTime(audio.currentTime)
    const updateDuration = () => setDuration(audio.duration)
    const handleEnded = () => setIsPlaying(false)

    audio.addEventListener('timeupdate', updateTime)
    audio.addEventListener('loadedmetadata', updateDuration)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('timeupdate', updateTime)
      audio.removeEventListener('loadedmetadata', updateDuration)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [])

  const togglePlayPause = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
    } else {
      audio.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current
    if (!audio) return

    const newTime = parseFloat(e.target.value)
    audio.currentTime = newTime
    setCurrentTime(newTime)
  }

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00'
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const downloadMedia = () => {
    const link = document.createElement('a')
    link.href = media.url
    link.download = `${media.type}_${Date.now()}.${media.format}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (media.type === 'image') {
    return (
      <>
        <div className={`relative group cursor-pointer ${className}`} onClick={() => setShowImageModal(true)}>
          <div className="relative rounded-lg overflow-hidden max-w-sm">
            <Image
              src={media.url}
              alt="Shared image"
              width={media.width || 400}
              height={media.height || 300}
              className="object-cover"
              style={{ maxHeight: '300px', width: 'auto' }}
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
              <ZoomIn className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-all duration-200" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {(media.bytes / 1024 / 1024).toFixed(1)}MB • {media.format.toUpperCase()}
          </p>
        </div>

        {/* Full Size Image Modal */}
        <Dialog open={showImageModal} onOpenChange={setShowImageModal}>
          <DialogContent className="max-w-4xl max-h-[90vh] p-0 bg-black/90 border-gray-700">
            <DialogHeader className="p-4">
              <DialogTitle className="text-white flex items-center justify-between">
                <span>Image Preview</span>
                <Button
                  onClick={downloadMedia}
                  variant="outline"
                  size="sm"
                  className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </DialogTitle>
            </DialogHeader>
            <div className="flex items-center justify-center p-4">
              <Image
                src={media.url}
                alt="Full size image"
                width={media.width || 800}
                height={media.height || 600}
                className="object-contain max-w-full max-h-[70vh]"
              />
            </div>
          </DialogContent>
        </Dialog>
      </>
    )
  }

  if (media.type === 'audio') {
    return (
      <div className={`p-4 rounded-lg border border-gray-700 bg-gray-900/50 max-w-sm ${className}`}>
        <audio ref={audioRef} src={media.url} preload="metadata" />
        
        <div className="flex items-center space-x-3">
          <Button
            onClick={togglePlayPause}
            variant="outline"
            size="sm"
            className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800 w-10 h-10 p-0 rounded-full"
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>

          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <Volume2 className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-300">Voice Message</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500 w-10">
                {formatTime(currentTime)}
              </span>
              
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={handleSeek}
                className="flex-1 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #ffcb74 0%, #ffcb74 ${duration ? (currentTime / duration) * 100 : 0}%, #374151 ${duration ? (currentTime / duration) * 100 : 0}%, #374151 100%)`
                }}
              />
              
              <span className="text-xs text-gray-500 w-10">
                {formatTime(duration)}
              </span>
            </div>
          </div>

          <Button
            onClick={downloadMedia}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-gray-300 w-8 h-8 p-0"
          >
            <Download className="h-3 w-3" />
          </Button>
        </div>

        <p className="text-xs text-gray-500 mt-2">
          {(media.bytes / 1024 / 1024).toFixed(1)}MB • {media.format.toUpperCase()}
          {media.duration && ` • ${formatTime(media.duration)}`}
        </p>
      </div>
    )
  }

  return null
}

// CSS for audio slider
const sliderStyles = `
.slider::-webkit-slider-thumb {
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #ffcb74;
  cursor: pointer;
  border: 2px solid #ffd700;
  box-shadow: 0 0 0 1px rgba(255, 203, 116, 0.2);
}

.slider::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #ffcb74;
  cursor: pointer;
  border: 2px solid #ffd700;
  box-shadow: 0 0 0 1px rgba(255, 203, 116, 0.2);
}
`

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style')
  styleSheet.innerText = sliderStyles
  document.head.appendChild(styleSheet)
} 