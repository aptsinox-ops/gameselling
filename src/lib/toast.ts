import { toast as sonnerToast } from "sonner"

export const showToast = {
  // ১. Success Toast (সবুজ থিম)
  success: (message: string, description?: string) => {
    return sonnerToast.success(message, {
      description,
      duration: 3000,
      className: "border-emerald-500/20 bg-emerald-50 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-100",
    })
  },

  // ২. Error Toast (লাল থিম)
  error: (message: string, description?: string) => {
    return sonnerToast.error(message, {
      description,
      duration: 4000,
      className: "border-rose-500/20 bg-rose-50 dark:bg-rose-950/80 text-rose-900 dark:text-rose-100",
    })
  },

  // ৩. Loading Toast (আপনার কাস্টম স্টাইল সহ)
  loading: (message: string) => {
    return sonnerToast.loading(message, {
      style: {
        background: "#eff6ff",
        border: "1px solid #bfdbfe",
        color: "#1e40af",
        fontWeight: "500",
        fontSize: "13px",
      }
    })
  },

  // ৪. Copy / Info Toast
  copy: (message: string = "Copied to clipboard!") => {
    return sonnerToast.success(message, {
      duration: 2000,
      className: "border-gray-500/20 bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 font-medium",
    })
  },

  // ৫. Toast Dismiss
  dismiss: (toastId?: string | number) => {
    sonnerToast.dismiss(toastId)
  }
}