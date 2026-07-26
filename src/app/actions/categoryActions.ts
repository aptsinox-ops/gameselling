"use server"
import { prisma } from "@/lib/prisma"; // আপনার প্রিজমা ক্লায়েন্ট

export async function getCategories() {
  return await prisma.category.findMany({ orderBy: { slotNo: 'asc' } });
}

export async function addCategory(data: { name: string, slotNo: number }) {
  return await prisma.category.create({ data });
}

export async function deleteCategories(ids: string[]) {
  return await prisma.category.deleteMany({ where: { id: { in: ids } } });
}