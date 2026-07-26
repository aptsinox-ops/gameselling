import { ImageResponse } from "next/og";
import { db } from "@/lib/db"; // ⚠️ আপনার DB Client-এর সঠিক পাথ নিশ্চিত করুন
import { headers } from "next/headers";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

export default async function Icon() {
  let faviconUrl: string | null = null;

  try {
    const settings = await db.siteSettings.findFirst();
    faviconUrl = settings?.faviconUrl || null;
  } catch (error) {
    console.error("Favicon fetch error:", error);
  }

  // ১. ডাটাবেসে faviconUrl থাকলে
  if (faviconUrl) {
    let absoluteUrl = faviconUrl;

    // 🟢 রিলেটিভ পাথ (যেমন: /uploads/abc.png) হলে সেটিকে Absolute URL-এ রূপান্তর করা
    if (faviconUrl.startsWith("/")) {
      const headersList = await headers();
      const host = headersList.get("host") || "localhost:3000";
      const protocol = host.includes("localhost") ? "http" : "https";
      absoluteUrl = `${protocol}://${host}${faviconUrl}`;
    }

    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "transparent",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={absoluteUrl}
            alt="Favicon"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
            }}
          />
        </div>
      ),
      { ...size }
    );
  }

  // ২. ডাটাবেসে ছবি না থাকলে ফলব্যাক ("R" লোগো দেখাবে)
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 18,
          fontWeight: "bold",
          background: "#000",
          color: "#fff",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "6px",
        }}
      >
        R
      </div>
    ),
    { ...size }
  );
}