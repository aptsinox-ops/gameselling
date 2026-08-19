import HeroSlider from "@/components/HeroSlider";
import CategoryGrid from "@/components/CategoryGrid";
import { prisma } from "@/lib/prisma";

export const revalidate = 60; // ৬০ সেকেন্ড ক্যাশিং (পারফর্মেন্স বহুগুণ বাড়াবে)

export default async function Home() {
  try {
    // 🟢 Promise.all দিয়ে ৩টি কুয়েরি একসাথে (Parallel) রান করা হচ্ছে
    const [siteSettings, categories, rawSliders] = await Promise.all([
      prisma.siteSettings.findFirst(),
      prisma.category.findMany({
        where: { status: true },
        include: { products: true },
        orderBy: { slotNo: 'asc' },
      }),
      prisma.slider.findMany({
        where: { status: "ON" }, // শুধু একটিভ স্লাইডার আনবে
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const primaryColor = siteSettings?.primaryColor || "#2563eb";

    // ⚡ Prisma Date serialization fix (Client Component-এ ডাটা পাস করার জন্য)
    const sliders = JSON.parse(JSON.stringify(rawSliders));
    const safeCategories = JSON.parse(JSON.stringify(categories));
    const safeSiteSettings = siteSettings ? JSON.parse(JSON.stringify(siteSettings)) : null;

    return (
      <main className="max-w-7xl mx-auto px-2 sm:px-4 py-3 space-y-6">
        {/* 🟢 sliders এবং siteSettings প্রপস হিসেবে HeroSlider-এ পাঠানো হলো */}
        <HeroSlider 
          noticeText={siteSettings?.noticeText} 
          primaryColor={primaryColor}
          sliders={sliders} 
          siteSettings={safeSiteSettings}
        />
        
        <CategoryGrid categories={safeCategories as any} />
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