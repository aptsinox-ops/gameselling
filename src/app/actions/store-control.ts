"use server";

import { prisma } from "@/lib/prisma";

export interface StoreControlInput {
  isSiteClosed: boolean;
  closeReason: string;
  openTime: string;
  isMaintenance: boolean;
  maintNotice: string;
  maintEndTime: string;
}

export async function updateStoreControl(data: any) {
  try {
    // Prisma Schema-তে থাকা ফিল্ডগুলো ফিল্টার করা
    const payload: StoreControlInput = {
      isSiteClosed: Boolean(data.isSiteClosed),
      closeReason: data.closeReason ?? "",
      openTime: data.openTime ?? "",
      isMaintenance: Boolean(data.isMaintenance),
      maintNotice: data.maintNotice ?? "",
      maintEndTime: data.maintEndTime ?? "",
    };

    const updatedData = await prisma.storeControl.upsert({
      where: {
        id: "STATIC",
      },
      update: payload,
      create: {
        id: "STATIC",
        ...payload,
      },
    });

    return { success: true, data: updatedData };
  } catch (error: any) {
    console.error("Failed to update store control:", error);
    return { success: false, error: error?.message || "Failed to update store control settings" };
  }
}