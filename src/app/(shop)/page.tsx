import HeroSlider from "@/components/HeroSlider";
import CategoryGrid from "@/components/CategoryGrid";
import { prisma } from "@/lib/prisma";

// রিয়েল-টাইম ডাটা পাওয়ার জন্য
export const revalidate = 0; 

async function getSiteSettings() {
  try {
    const settings = await prisma.siteSettings.findUnique({
      where: { id: "STATIC" },
    });
    return settings;
  } catch (error) {
    console.error("Settings fetch error:", error);
    return null;
  }
}

export default async function Home() {
  try {
    // 🟢 এপিআই ফেচ না করে সরাসরি ডাটাবেজ (Prisma) থেকে সেটিংস নিয়ে আসা হচ্ছে
    const siteSettings = await getSiteSettings();
    
    const primaryColor = siteSettings?.primaryColor || "#2563eb";

    // শুধুমাত্র status: true (ON) থাকা ক্যাটাগরিগুলো ফেচ করা হচ্ছে
    const categories = await prisma.category.findMany({
      where: {
        status: true, 
      },
      include: {
        products: true,
      },
      orderBy: {
        slotNo: 'asc'
      }
    }); 

    return (
      <main className="max-w-7xl mx-auto px-2 sm:px-4 py-3 space-y-6">
        
        {/* 🔵 primaryColor টাইপ কাস্টসহ স্লাইডারে পাস করা হলো */}
        <HeroSlider 
          noticeText={siteSettings?.noticeText} 
          {...({ primaryColor } as any)} 
        />
        
        {/* 🟢 categories ডাটা টাইপ কাস্ট করে গ্রিডে পাস করা হলো */}
        <CategoryGrid categories={categories as any} />

      </main>
    );
  } catch (error) {
    console.error("Error fetching categories and products:", error);
    
    return (
      <main className="max-w-7xl mx-auto px-2 sm:px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-red-600">SERVER ERROR</h1>
        <p className="text-gray-600">Failed to load content. Please try again later.</p>
      </main>
    );
  }
}