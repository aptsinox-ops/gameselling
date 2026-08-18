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
    // 🟢 Render.com-এর দেওয়া API URL (env ফাইল বা সরাসরি এখানে বসাতে পারো)
    const RENDER_BOT_URL = process.env.RENDER_BOT_URL || "https://your-bot-name.onrender.com";

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