import HeroSlider from "@/components/HeroSlider";
import CategoryGrid from "@/components/CategoryGrid";
import { prisma } from "@/lib/prisma";

// 🟢 revalidate = 0 সরিয়ে ৬০ সেকেন্ড বা ৩০০ সেকেন্ড ক্যাশিং রাখুন। 
// সাইট সেটিংস প্রতিনিয়ত পরিবর্তন হয় না, তাই প্রতি রিকোয়েস্টে DB হিট করার প্রয়োজন নেই।
export const revalidate = 60; 

export default async function Home() {
  try {
    // 🟢 Waterfall বাদ দিয়ে সমান্তরালে (Parallel) ডাটা ফেচিং
    const [siteSettings, categories] = await Promise.all([
      prisma.siteSettings.findUnique({
        where: { id: "STATIC" },
      }),
      prisma.category.findMany({
        where: { status: true },
        include: { products: true },
        orderBy: { slotNo: 'asc' },
      }),
    ]);

    const primaryColor = siteSettings?.primaryColor || "#2563eb";

    return (
      <main className="max-w-7xl mx-auto px-2 sm:px-4 py-3 space-y-6">
        <HeroSlider 
          noticeText={siteSettings?.noticeText} 
          {...({ primaryColor } as any)} 
        />
        
        <CategoryGrid categories={categories as any} />
      </main>
    );
  } catch (error) {
    console.error("Error fetching homepage data:", error);
    
    return (
      <main className="max-w-7xl mx-auto px-2 sm:px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-red-600">SERVER ERROR</h1>
        <p className="text-gray-600">Failed to load content. Please try again later.</p>
      </main>
    );
  }
}