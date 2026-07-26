'use server'
import { prisma } from "@/lib/prisma";

export async function addCategory(name: string, slotNo: number) {
  await prisma.category.create({
    data: { name, slotNo }
  });
}