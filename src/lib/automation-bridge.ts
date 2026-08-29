interface TopupParams {
  playerUid: string;
  diamondAmount: string;
  voucherCode: string;
}

export interface AutoTopupResponse {
  success: boolean;
  message: string;
  reason?: string;
}

export async function processFreeFireAutoTopup({
  playerUid,
  diamondAmount,
  voucherCode,
}: TopupParams): Promise<AutoTopupResponse> {
  // 🟢 Vercel ৬০ সেকেন্ডে ক্র্যাশ করার আগেই ৫০ সেকেন্ডে রিকোয়েস্ট ক্যান্সেল করার কন্ট্রোলার
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 50000);

  try {
    const RENDER_BOT_URL = process.env.RENDER_BOT_URL || "https://garena-topup-bot.onrender.com";

    const response = await fetch(`${RENDER_BOT_URL}/api/topup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        playerUid,
        diamondAmount,
        voucherCode,
      }),
      signal: controller.signal, // সেফটি টাইমআউট সিগন্যাল
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        message: errorData.detail || "Automation server response failed!",
        reason: "API_ERROR",
      };
    }

    const data: AutoTopupResponse = await response.json();
    return data;

  } catch (error: any) {
    clearTimeout(timeoutId);

    // টাইমআউট হলে সুন্দরভাবে হ্যান্ডেল করবে
    if (error.name === "AbortError") {
      console.error("[RENDER TIMEOUT]: Automation took more than 50 seconds.");
      return {
        success: false,
        message: "Automation server timeout! Money refunded to your balance.",
        reason: "TIMEOUT_ERROR",
      };
    }

    console.error("[RENDER API ERROR]:", error.message);
    return {
      success: false,
      message: error.message || "Failed to connect to automation bot",
      reason: "NETWORK_ERROR",
    };
  }
}