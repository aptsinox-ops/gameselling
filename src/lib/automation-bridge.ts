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
  try {
    // 🟢 আসল Render URL ফ্যালব্যাক হিসেবে বসানো হলো
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
    });

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
    console.error("[RENDER API ERROR]:", error.message);
    return {
      success: false,
      message: error.message || "Failed to connect to automation bot",
      reason: "NETWORK_ERROR",
    };
  }
}