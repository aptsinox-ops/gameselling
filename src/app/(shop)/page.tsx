import HeroSlider from "@/components/HeroSlider";
import CategoryGrid from "@/components/CategoryGrid";
import LatestOrders from "@/components/LatestOrders";
import { prisma } from "@/lib/prisma";

export const revalidate = 60;

export default async function Home() {
  try {
    const [siteSettings, categories, rawSliders, rawOrders] = await Promise.all([
      prisma.siteSettings.findFirst(),
      prisma.category.findMany({
        where: { status: true },
        include: { products: true },
        orderBy: { slotNo: 'asc' },
      }),
      prisma.slider.findMany({
        where: { status: "ON" },
        orderBy: { createdAt: "desc" },
      }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: { name: true, image: true },
          },
          product: {
            select: { name: true },
          },
          variation: {
            select: { title: true, bonus: true }, // 🟢 Bonus যোগ করা হয়েছে
          },
        },
      }),
    ]);

    const primaryColor = siteSettings?.primaryColor || "#2563eb";

    const sliders = JSON.parse(JSON.stringify(rawSliders));
    const safeCategories = JSON.parse(JSON.stringify(categories));
    const safeSiteSettings = siteSettings ? JSON.parse(JSON.stringify(siteSettings)) : null;
    const safeOrders = JSON.parse(JSON.stringify(rawOrders));

    return (
      <main className="max-w-7xl mx-auto px-2 sm:px-4 py-3 space-y-6">
        <HeroSlider 
          noticeText={siteSettings?.noticeText} 
          primaryColor={primaryColor}
          sliders={sliders} 
          siteSettings={safeSiteSettings}
        />
        
        <CategoryGrid categories={safeCategories as any} />

        {/* 🟢 primaryColor প্রপস পাস করা হয়েছে */}
        <LatestOrders orders={safeOrders} primaryColor={primaryColor} />
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