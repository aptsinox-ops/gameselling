import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import BottomNav from "@/components/bottomNavi";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import ProductPurchaseFlow from "@/components/ProductPurchaseFlow";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

// 🎯 ডাইনামিক প্রোডাক্ট SEO মেটাডাটা
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  
  if (!slug) return { title: "Product Not Found" };

  try {
    const product = await prisma.product.findUnique({
      where: { slug },
      select: {
        name: true,
        rulesCondition: true,
        image: true,
        bannerImage: true,
      },
    });

    if (!product) return { title: "Product Not Found" };

    const siteTitle = `${product.name} Top Up | Zebo Topup`;
    const description = product.rulesCondition
      ? product.rulesCondition.slice(0, 160)
      : `Buy ${product.name} instantly at cheap price in Bangladesh via bKash, Nagad. Fast delivery on Zebo Topup.`;
    const ogImage = product.bannerImage || product.image || "/uploads/placeholder.png";

    return {
      title: siteTitle,
      description: description,
      openGraph: {
        title: siteTitle,
        description: description,
        url: `https://zebotopup.store/product/${slug}`,
        siteName: "Zebo Topup",
        images: [{ url: ogImage }],
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: siteTitle,
        description: description,
        images: [ogImage],
      },
    };
  } catch (error) {
    return {
      title: "Buy Game Top Up | Zebo Topup",
    };
  }
}

export const TakaSvg = ({ className = "h-3.5 w-auto" }: { className?: string }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 270" className={`inline-block select-none pointer-events-none fill-current ${className}`} style={{ verticalAlign: "middle" }}>
      <g transform="translate(-345.19429,-399.56217)">
        <path d="m 392.33418,406.42427 c 10.74527,2.9e-4 19.16243,4.4775 25.2515,13.43164 6.44712,8.59653 10.02889,20.41637 10.74531,35.45955 l 0,56.41291 15.04344,0 25.2515,25.78876 -40.29494,0 0,73.06815 c -7e-5,5.73092 2.14899,10.92448 6.44719,15.5807 4.29805,4.65638 11.2825,6.98453 20.95337,6.98446 12.53609,7e-5 25.78863,-6.98438 39.75767,-20.95337 14.32693,-14.32698 21.84865,-29.01223 22.56516,-44.05579 l -6.44719,0.53726 c -22.92347,1.4e-4 -34.38513,-12.17788 -34.38501,-36.53407 -1.2e-4,-8.2379 2.68621,-15.58053 8.05899,-22.0279 5.37252,-6.44699 14.32694,-9.67058 26.86329,-9.67078 13.25239,2e-4 24.35587,5.73103 33.31048,17.1925 9.31241,11.46184 13.96871,25.43074 13.96891,41.90673 -1.9e-4,24.35617 -10.38733,47.63767 -31.16142,69.84456 -20.41625,22.20704 -44.77227,33.31052 -73.06815,33.31048 -10.38722,4e-5 -21.49071,-4.47717 -33.31048,-13.43165 -11.46172,-9.31254 -18.26708,-18.26696 -20.41609,-26.86329 l 0,-84.88799 -25.78877,0 -24.71422,-25.78876 50.50298,0 0,-51.04025 c -4e-5,-10.38689 -6.26814,-16.4759 -18.8043,-18.26704 -5.73086,2.6e-4 -9.49171,0.8957 -11.28258,2.68633 -3.22361,-5.3724 -6.26811,-11.81958 -9.13352,-19.34157 l 0,-2.68633 c -10e-6,-4.65602 3.58176,-8.59597 10.74531,-11.81985 7.16353,-3.2233 13.61071,-4.8351 19.34157,-4.83539" />
      </g>
    </svg>
  );
};

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  try {
    const { slug } = await params;

    if (!slug) return notFound();

    const [product, session, siteSettings] = await Promise.all([
      prisma.product.findUnique({
        where: { slug },
        include: {
          variations: {
            where: { status: "ON" },
            include: {
              vouchers: {
                where: { status: "ACTIVE" },
                select: { id: true }
              }
            },
            orderBy: { sortOrder: "asc" }
          }
        }
      }),
      getServerSession(authOptions),
      prisma.siteSettings.findUnique({
        where: { id: "STATIC" }
      })
    ]);

    if (!product || product.status === "OFF") return notFound();

    let isLoggedIn = !!session?.user;
    let currentBalance = 0.00;
    let currentUserRole = "User";
    let currentUserId: any = null;

    if (isLoggedIn && session?.user?.email) {
      try {
        const userData = await prisma.user.findUnique({
          where: { email: session.user.email },
          select: { id: true, balance: true, role: true }
        });
        currentBalance = userData?.balance || 0.00;
        currentUserRole = userData?.role || "User";
        currentUserId = userData?.id || (session.user as any)?.id || null;
      } catch (authError) {
        console.error("Database user fetch failed:", authError);
      }
    }

    const isVoucherOrAuto = (product as any).isFreeFireAuto || product.productType?.toUpperCase() === "VOUCHER";

    // 🎯 Dynamic Stock Calculation
    const rawVariations = (product.variations || []).map((v: any) => ({
      ...v,
      stock: isVoucherOrAuto ? (v.vouchers?.length || 0) : (v.stock ?? 0)
    }));

    const resellerPercentage = (product as any).resellerPercentage || 0;
    const isListView = (product as any).variationsDesign === "List";
    const displayProductType = product.productType === "UID" ? "FreeFire Service" : product.productType;

    // 🎯 সব ডাটা প্রোপারলি সেফ সোলাইজ করা হয়েছে
    const plainData = JSON.parse(
      JSON.stringify({
        product,
        variations: rawVariations,
        siteSettings: siteSettings || null,
      })
    );

    const serializedProduct = plainData.product;
    const dbVariations = plainData.variations;
    const serializedSiteSettings = plainData.siteSettings;

    let finalFields: any[] = [];
    if (serializedProduct.dynamicFields) {
      if (Array.isArray(serializedProduct.dynamicFields)) {
        finalFields = serializedProduct.dynamicFields;
      } else if (typeof serializedProduct.dynamicFields === "string") {
        try {
          finalFields = JSON.parse(serializedProduct.dynamicFields);
        } catch (_) {
          finalFields = [serializedProduct.dynamicFields];
        }
      }
    }

    const brandColor = serializedSiteSettings?.primaryColor || "#2563eb";
    const hasBanner = Boolean(serializedProduct.bannerImage);

    return (
      <main className="max-w-5xl mx-auto px-3 py-5 space-y-8 min-h-screen text-slate-800 font-sans">
        
        {/* ব্যানার সেকশন - মোবাইলে মিনিমাম হাইট বাড়িয়ে দেওয়া হয়েছে */}
        <div 
          className={`block relative w-full min-h-[110px] sm:min-h-[120px] md:h-[140px] rounded-xl overflow-hidden transition-all ${
            hasBanner 
              ? "bg-slate-950 border border-slate-200/60" 
              : "bg-transparent border border-slate-300"
          }`}
        >
          {hasBanner && (
            <>
              <img 
                src={serializedProduct.bannerImage} 
                alt="Banner" 
                className="absolute inset-0 w-full h-full object-cover object-center" 
              />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/50 to-transparent backdrop-blur-[0.3px]" />
            </>
          )}

          <div className="absolute inset-x-0 bottom-0 top-0 z-10 flex items-center p-3 md:p-4">
            <div className="flex items-center gap-3.5 md:gap-4">
              
              {/* ⚡ মোবাইলে ছবি সাইজ বড় করা হয়েছে (w-20 h-20 বা 80px), ডেসktop-এ অপরিবর্তিত (100px) */}
              <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-[100px] md:h-[100px] rounded-lg overflow-hidden flex-shrink-0 border border-black/10 shadow-sm">
                <img src={
                  serializedProduct.image === "placeholder.png" || !serializedProduct.image 
                    ? "/uploads/placeholder.png"
                    : serializedProduct.image
                } alt={serializedProduct.name} className="w-full h-full object-cover" />
              </div>

              <div className="flex flex-col gap-1.5 min-w-0">
                <h1 className={`text-base sm:text-xl md:text-2xl font-bold uppercase tracking-wide leading-tight truncate ${
                  hasBanner ? "text-white" : "text-black"
                }`}>
                  {serializedProduct.name}
                </h1>
                <div className="flex flex-wrap gap-1.5 items-center">
                  {displayProductType && (
                    <div className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-bold uppercase ${
                      hasBanner 
                        ? "bg-black/40 text-white border border-white/20" 
                        : "bg-slate-100 text-slate-800 border border-slate-300"
                    }`}>
                      {displayProductType}
                    </div>
                  )}
                  <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md ${
                    hasBanner 
                      ? "bg-black/40 text-white border border-white/20" 
                      : "bg-slate-100 text-slate-800 border border-slate-300"
                  }`}>
                    <span className={`text-[10px] sm:text-xs font-bold whitespace-nowrap ${
                      hasBanner ? "text-slate-100" : "text-slate-700"
                    }`}>
                      Trusted Secure
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ক্লায়েন্ট পারচেজ ফ্লো কম্পোনেন্ট */}
        <ProductPurchaseFlow 
          dbVariations={dbVariations} 
          isListView={isListView}
          product={serializedProduct} 
          currentUserRole={currentUserRole}
          resellerPercentage={resellerPercentage}
          fields={finalFields} 
          isLoggedIn={isLoggedIn}
          currentBalance={currentBalance}
          takaSvg={<TakaSvg className="h-3 w-auto" />}
          primaryColor={brandColor} 
          siteSettings={serializedSiteSettings}
          userId={currentUserId}
        />

        {serializedProduct.rulesCondition && (
          <section className="bg-white border border-slate-200 rounded-xl p-4 text-xs md:text-sm shadow-sm">
            <h2 className="font-bold text-red-500 mb-1 flex items-center gap-1">
              নিয়মাবলী ও শর্তাবলী:
            </h2>
            <p className="text-slate-600 leading-relaxed">{serializedProduct.rulesCondition}</p>
          </section>
        )}
        <BottomNav />
      </main>
    );
  } catch (error) {
    console.error("SERVER 500 ERROR DETAILS:", error);
    return (
      <div className="text-center py-20 font-bold text-red-500 max-w-xl mx-auto px-4">
        <h2 className="text-2xl mb-2">500 SERVER ERROR</h2>
      </div>
    );
  }
}