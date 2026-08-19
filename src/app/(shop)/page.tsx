import HeroSlider from "@/components/HeroSlider";
import CategoryGrid from "@/components/CategoryGrid";
import { prisma } from "@/lib/prisma";

export const revalidate = 60; // ৬০ সেকেন্ড ক্যাশিং (পারফর্মেন্স বহুগুণ বাড়াবে)

export default async function Home() {
  try {
    // 🟢 Promise.all দিয়ে ৩টি কুয়েরি একসাথে (Parallel) রান করা হচ্ছে
    const [siteSettings, categories, sliders] = await Promise.all([
      prisma.siteSettings.findUnique({
        where: { id: "STATIC" },
      }),
      prisma.category.findMany({
        where: { status: true },
        include: { products: true },
        orderBy: { slotNo: 'asc' },
      }),
      prisma.slider.findMany({
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const primaryColor = siteSettings?.primaryColor || "#2563eb";

    return (
      <main className="max-w-7xl mx-auto px-2 sm:px-4 py-3 space-y-6">
        {/* 🟢 sliders প্রপস হিসেবে HeroSlider এ পাঠানো হলো */}
        <HeroSlider 
          noticeText={siteSettings?.noticeText} 
          primaryColor={primaryColor}
          sliders={sliders} 
        />
        
        <CategoryGrid categories={categories as any} />
      </main>
    );
  } catch (error) {
    console.error("Error fetching homepage data:", error);
    return (
      <main className="max-w-7xl mx-auto px-2 sm:px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-red-600">SERVER ERROR</h1>
      </main>
    );
  }
}