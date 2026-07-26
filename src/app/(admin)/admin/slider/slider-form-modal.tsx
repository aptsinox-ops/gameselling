"use client"

import React, { useState, useEffect } from "react"
import { showToast } from "@/lib/toast"
import { ImageUploader } from "@/components/ui/image-uploader"
import { X, Layers, Video, Share2, Upload, Link as LinkIcon, Loader2 } from "lucide-react"

interface SliderFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  editItem?: any
}

export default function SliderFormModal({ isOpen, onClose, onSuccess, editItem }: SliderFormModalProps) {
  const [type, setType] = useState<"BANNER" | "VIDEO" | "SOCIAL">("BANNER")
  const [imageInputType, setImageInputType] = useState<"file" | "url">("file")
  const [imageUrl, setImageUrl] = useState("")
  const [link, setLink] = useState("")
  const [videoUrl, setVideoUrl] = useState("")
  const [title, setTitle] = useState("")
  const [socialUrl, setSocialUrl] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (editItem) {
      setType(editItem.type || "BANNER")
      setImageUrl(editItem.imageUrl || "")
      setLink(editItem.link || "")
      setVideoUrl(editItem.videoUrl || "")
      setTitle(editItem.title || "")
      setSocialUrl(editItem.socialUrl || "")
      setImageInputType(editItem.imageUrl?.startsWith("http") ? "url" : "file")
    } else {
      setType("BANNER")
      setImageUrl("")
      setLink("")
      setVideoUrl("")
      setTitle("")
      setSocialUrl("")
      setImageInputType("file")
    }
  }, [editItem, isOpen])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!imageUrl || !imageUrl.trim()) {
      showToast.error("Please upload an image or enter Image URL!")
      return
    }

    if (type === "VIDEO" && !videoUrl.trim()) {
      showToast.error("Video Link is required for Video Slide!")
      return
    }

    if (type === "SOCIAL") {
      if (!title.trim()) {
        showToast.error("Title is required for Social Slide!")
        return
      }
      if (!socialUrl.trim()) {
        showToast.error("Social URL is required for Social Slide!")
        return
      }
    }

    setLoading(true)
    const toastId = showToast.loading(editItem ? "Updating slider..." : "Adding slider...")

    try {
      const payload = {
        type,
        imageUrl,
        link,
        videoUrl,
        title,
        socialUrl,
      }

      const res = await fetch("/api/sliders", {
        method: editItem ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editItem ? { id: editItem.id, ...payload } : payload),
      })

      showToast.dismiss(toastId)

      if (res.ok) {
        showToast.success(editItem ? "Slider updated successfully!" : "Slider added successfully!")
        onSuccess()
      } else {
        const err = await res.json()
        showToast.error(err.error || "Failed to save slider")
      }
    } catch (err) {
      console.error(err)
      showToast.dismiss(toastId)
      showToast.error("Something went wrong!")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#121215] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 w-full max-w-lg space-y-5 relative text-left shadow-none">
        
        {/* Close Button */}
        <button 
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 p-1 rounded-lg cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div>
          <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-50">
            {editItem ? "Edit Slider Item" : "Add New Slider"}
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Configure banner image, target links and animation types.
          </p>
        </div>

        {/* 📝 HTML Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* 1. Slide Type Switcher Tab */}
          <div className="grid grid-cols-3 gap-2 p-1 bg-neutral-100 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800">
            <button
              type="button"
              onClick={() => setType("BANNER")}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                type === "BANNER"
                  ? "bg-blue-600 text-white"
                  : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
              }`}
            >
              <Layers className="w-3.5 h-3.5" /> Banner
            </button>

            <button
              type="button"
              onClick={() => setType("VIDEO")}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                type === "VIDEO"
                  ? "bg-rose-600 text-white"
                  : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
              }`}
            >
              <Video className="w-3.5 h-3.5" /> Video
            </button>

            <button
              type="button"
              onClick={() => setType("SOCIAL")}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                type === "SOCIAL"
                  ? "bg-emerald-600 text-white"
                  : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
              }`}
            >
              <Share2 className="w-3.5 h-3.5" /> Social
            </button>
          </div>

          {/* 2. Image Upload Mode Switcher (File vs URL) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                Banner Image <span className="text-rose-500">*</span>
              </label>

              <div className="flex items-center gap-1 bg-neutral-900 p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => setImageInputType("file")}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold text-white transition-all cursor-pointer ${
                    imageInputType === "file" ? "bg-blue-600" : "opacity-60 hover:opacity-100"
                  }`}
                >
                  <Upload className="w-3 h-3" /> Image
                </button>
                <button
                  type="button"
                  onClick={() => setImageInputType("url")}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold text-white transition-all cursor-pointer ${
                    imageInputType === "url" ? "bg-blue-600" : "opacity-60 hover:opacity-100"
                  }`}
                >
                  <LinkIcon className="w-3 h-3" /> URL
                </button>
              </div>
            </div>

            {imageInputType === "file" ? (
              <ImageUploader 
                value={imageUrl} 
                onChange={(url) => setImageUrl(url)} 
              />
            ) : (
              <input
                type="text"
                placeholder="https://example.com/banner.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 text-sm focus:outline-none shadow-none"
              />
            )}
          </div>

          {/* 3. Dynamic Inputs */}
          {type === "BANNER" && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                Target Link (Optional)
              </label>
              <input
                type="text"
                placeholder="https://example.com/offer"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 text-sm focus:outline-none shadow-none"
              />
            </div>
          )}

          {type === "VIDEO" && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-rose-500">
                Video URL (Required) *
              </label>
              <input
                type="text"
                placeholder="https://youtube.com/watch?v=xxx"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-rose-300 dark:border-rose-900/50 bg-rose-50/20 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 text-sm focus:outline-none shadow-none"
              />
            </div>
          )}

          {type === "SOCIAL" && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-emerald-500">
                  Badge Title (Required) *
                </label>
                <input
                  type="text"
                  placeholder="Join Official Telegram"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-emerald-300 dark:border-emerald-900/50 bg-emerald-50/20 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 text-sm focus:outline-none shadow-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-emerald-500">
                  Social URL (Required) *
                </label>
                <input
                  type="text"
                  placeholder="https://t.me/yourgroup"
                  value={socialUrl}
                  onChange={(e) => setSocialUrl(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-emerald-300 dark:border-emerald-900/50 bg-emerald-50/20 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 text-sm focus:outline-none shadow-none"
                />
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="h-10 px-5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-bold text-sm shadow-none cursor-pointer"
            >
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={loading}
              className="h-10 px-6 rounded-xl font-bold text-sm bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 flex items-center gap-2 shadow-none cursor-pointer"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {editItem ? "Update Slider" : "Save Slider"}
            </button>
          </div>

        </form>

      </div>
    </div>
  )
}