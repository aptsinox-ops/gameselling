import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const uid = searchParams.get("uid");

    if (!uid || uid.trim() === "" || uid === "undefined") {
      return NextResponse.json({ error: "Invalid UID" }, { status: 400 });
    }

    const cleanUid = uid.trim();

    // থার্ড-পার্টি এপিআই কল
    try {
      const response = await fetch(`YOUR_THIRD_PARTY_API_ENDPOINT_HERE?uid=${cleanUid}`, {
        method: "GET",
        headers: {
          "Authorization": "Bearer aNaYjX_0Neyu_TAKF4ouz6-NoF-hzI3LxEjk0PphgSE",
          "Content-Type": "application/json"
        },
        signal: AbortSignal.timeout(5000) // ৫ সেকেন্ড টাইমআউট
      });

      if (response.ok) {
        const json = await response.json();
        // আপনার থার্ড-পার্টি এপিআই-এর রেসপন্স অনুযায়ী ফিল্ডগুলো ঠিক করে নিন (যেমন: json.name বা json.nickname)
        if (json && (json.username || json.name)) {
          return NextResponse.json({
            success: true,
            data: { username: json.username || json.name, uid: cleanUid }
          });
        }
      }
    } catch (error) {
      console.log("Third-party API request failed, fallback initiated.");
    }

    // ফলিংব্যাক: এপিআই কাজ না করলেও ইউজারকে আটকে না রেখে ম্যানুয়াল কার্ড দেখানো
    return NextResponse.json({
      success: true,
      data: {
        username: `Player ${cleanUid}`,
        uid: cleanUid
      }
    });

  } catch (error) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}