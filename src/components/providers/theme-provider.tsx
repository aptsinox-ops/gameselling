"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  // useEffect ব্যবহার করে ক্লায়েন্ট-সাইডে রেন্ডার নিশ্চিত করা
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <>{children}</> // বা একটি লোডিং স্টেট
  }

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}