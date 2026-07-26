"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, X } from "lucide-react";

interface ImageUploaderProps {
  value?: string | null;
  defaultValue?: string | null;
  onChange?: (url: string | null) => void;
  onFileChange?: (url: string | null) => void;
}

export function ImageUploader({ defaultValue, value, onChange, onFileChange }: ImageUploaderProps) {
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("image.png");
  const [isDragActive, setIsDragActive] = useState(false);

  // value অথবা defaultValue যেকোনো একটি ধরবে
  const activeValue = value !== undefined ? value : defaultValue;

  useEffect(() => {
    if (typeof activeValue === "string" && activeValue.trim() !== "") {
      setPreview(activeValue);
      const parts = activeValue.split("/");
      setFileName(parts[parts.length - 1] || "uploaded-image.png");
    } else if (!activeValue) {
      setPreview(null);
      setProgress(0);
    }
  }, [activeValue]);

  // প্যারেন্ট কম্পোনেন্টকে নতুন URL পাঠানোর কমন ফাংশন
  const triggerChange = (url: string | null) => {
    if (onChange) onChange(url);
    if (onFileChange) onFileChange(url);
  };

  const handleFile = async (selectedFile: File) => {
    if (!selectedFile) return;

    setFileName(selectedFile.name);
    const localReader = new FileReader();
    localReader.onloadend = () => setPreview(localReader.result as string);
    localReader.readAsDataURL(selectedFile);

    setIsUploading(true);
    setProgress(15);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      setProgress(50);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      setProgress(90);
      const result = await response.json();

      if (response.ok && result.url) {
        setProgress(100);
        setTimeout(() => {
          setPreview(result.url);
          triggerChange(result.url); // 🔥 প্যারেন্ট স্টেট আপডেট হবে
        }, 200);
      } else {
        alert(result.error || "Image upload failed.");
        setPreview(activeValue || null);
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong.");
      setPreview(activeValue || null);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full">
      <div
        className={`relative rounded-xl border flex items-center justify-center overflow-hidden transition-all duration-300 select-none backdrop-blur-md
          ${preview && !isUploading 
            ? "w-fit h-auto max-w-[300px] border-neutral-200 dark:border-neutral-800" 
            : "w-full h-36 border-neutral-200 dark:border-neutral-800 bg-white/5 dark:bg-black/10 hover:border-neutral-300 dark:hover:border-neutral-700"
          }
          ${isDragActive ? "border-green-500 bg-green-500/5 scale-[0.99]" : ""}`}
        onDragOver={(e) => { e.preventDefault(); setIsDragActive(true); }}
        onDragLeave={() => setIsDragActive(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragActive(false);
          if (!isUploading && e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
        }}
      >
        <AnimatePresence mode="wait">
          {/* ১. খালি বা ডিফল্ট স্টেট */}
          {!preview && !isUploading ? (
            <motion.label
              key="empty-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-full flex flex-col items-center justify-center cursor-pointer p-4 group"
            >
              <input 
                type="file" 
                className="hidden" 
                accept="image/*" 
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} 
              />
              <UploadCloud className="h-6 w-6 text-neutral-400 dark:text-neutral-500 mb-1.5 transition-transform duration-200 group-hover:-translate-y-0.5" />
              <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                DRAG AND DROP IMAGE
              </p>
              <p className="text-[10px] font-normal text-neutral-400 dark:text-neutral-500 mt-0.5 tracking-wide uppercase font-mono">
                PNG, JPG, WEBP IMAGE UPLOAD
              </p>
            </motion.label>
          ) : isUploading ? (
            /* ২. আপলোডিং স্টেট */
            <motion.div
              key="uploading-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-full flex items-center justify-center px-6 gap-3 bg-white/10 dark:bg-black/20 backdrop-blur-sm"
            >
              <div className="flex-1 h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-green-400" 
                  initial={{ width: "0%" }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.1 }}
                />
              </div>
              <span className="text-xs font-semibold text-emerald-500 dark:text-emerald-400 min-w-[32px] text-right">
                {progress}%
              </span>
            </motion.div>
          ) : (
            /* ৩. পিওর প্রিভিউ স্টেট */
            <motion.div
              key="preview-state"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              className="relative w-full h-full flex flex-col items-center justify-center group"
            >
              {/* ইমেজের ভেতরের টপ ইনফো বার */}
              <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-2.5 py-1.5 bg-gradient-to-b from-black/50 to-transparent pointer-events-none">
                <div className="flex items-center gap-1.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-neutral-400" />
                  <span className="text-[11px] font-medium text-neutral-400">Complete</span>
                </div>
                <span className="text-[11px] text-neutral-400 max-w-[120px] truncate font-mono">
                  {fileName}
                </span>
              </div>

              <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-green-500/80 via-green-500/10 to-transparent pointer-events-none blur-[0.5px]" />

              <img 
                src={preview!} 
                alt="Uploaded product" 
                className="w-full h-auto object-cover max-w-[300px]" 
                onDragStart={(e) => e.preventDefault()} 
              />
              
              {/* হোভার ওভারলে ও ডিলিট বাটন */}
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center backdrop-blur-[1px]">
                <button
                  type="button"
                  className="bg-white/90 text-neutral-900 hover:bg-red-600 hover:text-white p-1.5 rounded-full shadow-lg transition-all duration-200 transform scale-90 group-hover:scale-100 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPreview(null);
                    setProgress(0);
                    triggerChange(null); // 🔥 প্যারেন্ট স্টেট রিমুভ হবে
                  }}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}