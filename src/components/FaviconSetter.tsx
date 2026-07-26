"use client";

import { useEffect } from "react";

export default function FaviconSetter({ url }: { url: string }) {
  useEffect(() => {
    if (!url) return;

    // পুরানো সব লিঙ্ক ট্যাগ খুঁজে রিমুভ করা
    const existingLinks = document.querySelectorAll("link[rel*='icon']");
    existingLinks.forEach((el) => el.remove());

    // নতুন ডায়নামিক ফেভিকন লিঙ্ক যুক্ত করা
    const link = document.createElement("link");
    link.type = "image/x-icon";
    link.rel = "shortcut icon";
    link.href = url;
    document.head.appendChild(link);
  }, [url]);

  return null;
}