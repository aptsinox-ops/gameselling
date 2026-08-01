import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import BottomNav from "@/components/bottomNavi";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import ProductPurchaseFlow from "@/components/ProductPurchaseFlow";

export const dynamic = "force-dynamic";

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

    const rawVariations = product.variations || [];
    const resellerPercentage = product.resellerPercentage || 0;
    const isListView = product.variationsDesign === "List";
    const displayProductType = product.productType === "UID" ? "FreeFire Service" : product.productType;

    const plainData = JSON.parse(JSON.stringify({ product, variations: rawVariations }));
    const serializedProduct = plainData.product;
    const dbVariations = plainData.variations; 

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

    const brandColor = siteSettings?.primaryColor || "#2563eb";

    return (
      <main className="max-w-5xl mx-auto px-3 py-5 space-y-8 min-h-screen text-slate-800 font-sans">
        
        {/* ব্যানার সেকশন */}
        <div className="block relative w-full [height:clamp(90px,24vw,140px)] rounded-md overflow-hidden bg-slate-950 border border-slate-200/60 transition-all">
          {serializedProduct.bannerImage ? (
            <>
              <img 
                src={serializedProduct.bannerImage} 
                alt="Banner" 
                className="absolute inset-0 w-full h-full object-cover object-center" 
              />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/50 to-transparent backdrop-blur-[0.3px]" />
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-r from-[#090d16] via-[#111e3d] to-[#090d16]" />
          )}

          <div className="absolute inset-x-0 bottom-0 top-0 z-10 flex items-center [padding:clamp(10px,3vw,16px)]">
            <div className="flex items-center [gap:clamp(8px,2.5vw,16px)]">
              <div className="[width:clamp(48px,14vw,100px)] [height:clamp(48px,14vw,100px)] rounded-xl overflow-hidden border border-amber-400 bg-slate-900 flex-shrink-0 shadow-lg">
                <img src={
                  serializedProduct.image === "placeholder.png" || !serializedProduct.image 
                    ? "/uploads/placeholder.png"
                    : serializedProduct.image
                } alt={serializedProduct.name} className="w-full h-full object-cover" />
              </div>
              <div className="[space-y:clamp(4px,1.2vw,8px)] flex flex-col gap-1.5 min-w-0">
                <h1 className="[font-size:clamp(13px,3.8vw,24px)] font-bold text-white uppercase tracking-wide leading-tight truncate">
                  {serializedProduct.name}
                </h1>
                <div className="flex flex-wrap [gap:clamp(4px,1.5vw,8px)] items-center">
                  {displayProductType && (
                    <div className="inline-flex items-center [padding:clamp(3px,1vw,4px)_clamp(6px,2vw,12px)] rounded-[7px] [font-size:clamp(8px,2.2vw,12px)] font-bold bg-black/40 text-white border border-white/20 uppercase">
                      {displayProductType}
                    </div>
                  )}
                  <div className="inline-flex items-center gap-1 [padding:clamp(3px,1vw,4px)_clamp(6px,2vw,12px)] rounded-[7px] bg-black/40 text-white border border-white/20">
                    <span className="[font-size:clamp(8px,2.2vw,12px)] font-bold text-slate-100 whitespace-nowrap">Trusted Secure</span>
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
          siteSettings={siteSettings}
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