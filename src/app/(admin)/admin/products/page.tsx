import { AppSidebar } from "@/components/app-sidebar"
import AdminHeader from "@/components/admin/Header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { ProductTable } from "./product-table"
import EditProductForm from "@/components/edit-product-from" // 🟢 সমাধান: কার্লি ব্র্যাকেট ছাড়া ডিফল্ট ইম্পোর্ট
import { AddProductForm } from "@/components/add-product-form"   // অ্যাড ফর্ম ইম্পোর্ট
import { prisma } from "@/lib/prisma"
import Link from "next/link"

interface PageProps {
  // Next.js 15+ এর নিয়মানুযায়ী searchParams একটি Promise
  searchParams: Promise<{ status?: string; edit?: string; add?: string }>
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const { status, edit: editId, add: isAddMode } = await searchParams
  const activeStatus = status?.toUpperCase() || "ALL"
  
  // প্যারালাল ডাটা ফেচিং (পারফরম্যান্স বুস্টের জন্য)
  const [products, categories, singleProductData] = await Promise.all([
    getDatabaseProducts(activeStatus),
    prisma.category.findMany({ select: { id: true, name: true } }), // ক্যাটাগরি লিস্ট
    editId ? getSingleProductForEdit(editId) : null                 // এডিট করার জন্য নির্দিষ্ট প্রোডাক্ট ডাটা
  ]);

  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      } as React.CSSProperties}
    >
      <AppSidebar variant="inset" />
      
      <SidebarInset>
        <AdminHeader />
        
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
              
              {/* 📝 ডাইনামিক হেডার টাইটেল ও সাবটাইটেল */}
              <div className="space-y-1">
                <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
                  {editId ? "Edit Product" : isAddMode ? "Add New Product" : "Product Management"}
                </h1>
                <p className="text-sm text-neutral-400">
                  {editId 
                    ? "Modify product info and variants layout" 
                    : isAddMode 
                    ? "Fill in details to add a new package" 
                    : "Manage your store products and packages"
                  }
                </p>
              </div>

              {/* 🟢 মোড ১: এডিট মোড (ইউআরএল-এ ?edit=id থাকলে) */}
{editId ? (
  <div className="bg-white dark:bg-neutral-900/50 max-w-5xl">
    {singleProductData ? (
      <EditProductForm 
        initialData={singleProductData} 
        categories={categories}
        onSuccess="/admin/products"
        onCancel="/admin/products" 
      />
    ) : (
      <div className="text-center py-6 text-sm text-destructive font-medium">
        Product not found or failed to load data.
      </div>
    )}
  </div>
)
              
              // 🟢 মোড ২: অ্যাড মোড (ইউআরএল-এ ?add=true থাকলে)
              : isAddMode ? (
                <div className="bg-white dark:bg-neutral-900/50 border border-neutral-200/50 dark:border-neutral-800/50 rounded-2xl p-6 shadow-sm w-full max-w-5xl">
                  <AddProductForm 
                    onCancel="/admin/products" // ফর্মের ভেতর ক্যানসেল করলে এই লিংকে ব্যাক করবে
                  />
                </div>
              ) 
              
              // 🟢 মোড ৩: ডিফল্ট টেবিল ভিউ
              : (
                <>
                  {/* 🔘 ফিল্টার ট্যাব */}
                  <div className="flex items-center gap-2 bg-neutral-100/60 dark:bg-neutral-900/40 p-1 rounded-xl w-fit border border-neutral-200/50 dark:border-neutral-800/50 select-none">
                    <Link
                      href="/admin/products"
                      className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                        activeStatus === "ALL"
                          ? "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-sm border border-neutral-200 dark:border-neutral-800"
                          : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                      }`}
                    >
                      All Products
                    </Link>
                    <Link
                      href="/admin/products?status=active"
                      className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                        activeStatus === "ACTIVE"
                          ? "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-sm border border-neutral-200 dark:border-neutral-800"
                          : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                      }`}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Active
                    </Link>
                    <Link
                      href="/admin/products?status=inactive"
                      className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                        activeStatus === "INACTIVE"
                          ? "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-sm border border-neutral-200 dark:border-neutral-800"
                          : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                      }`}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-neutral-400" />
                      Inactive
                    </Link>
                  </div>

                  {/* টেবিল কম্পোনেন্ট */}
                  <ProductTable initialData={products} />
                </>
              )}

            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

// ১. টেবিলের জন্য সব প্রোডাক্ট ফেচ করার ফাংশন
async function getDatabaseProducts(statusFilter: string) {
  try {
    const whereClause: any = {}
    if (statusFilter === "ACTIVE") whereClause.status = "Active"
    else if (statusFilter === "INACTIVE") whereClause.status = "Inactive"

    const products = await prisma.product.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      include: { category: true }
    })

    return products.map((product) => ({
      id: product.id,
      name: product.name ?? "—",
      image: product.image ?? "",
      productType: product.productType ?? "—",
      status: product.status, 
      variationsDesign: product.variationsDesign ?? "Grid",
      resellerPercentage: product.resellerPercentage ?? 0,
      isFreeFireAuto: Boolean(product.isFreeFireAuto),
      isUidNameChecker: Boolean(product.isUidNameChecker),
      isCoinSystem: Boolean(product.isCoinSystem),
      isPremiumUser: Boolean(product.isPremiumUser),
      isTagEnabled: Boolean(product.isTagEnabled),
      productTag: product.productTag ?? "",
      category: product.category ? {
        id: product.category.id,
        name: product.category.name ?? "—"
      } : undefined,
      createdAt: product.createdAt ? product.createdAt.toISOString() : "",
    }))
  } catch (error) {
    console.error("Failed to fetch database products:", error)
    return []
  }
}

// 🟢 ২. এডিট ফর্মের জন্য নির্দিষ্ট ১টি প্রোডাক্টের সম্পূর্ণ ডাটা ফেচ করার কাস্টম ফাংশন
async function getSingleProductForEdit(id: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) return null;

    // 🟢 STATUS FIX: ডাটাবেজে সরাসরি ON/OFF থাকলে সেটাই যাবে, আর Active/Inactive থাকলে সেটাকে ON/OFF করবে
    let formStatus = "ON"; // ডিফল্ট সেফগার্ড
    if (product.status) {
      const currentStatus = product.status.trim().toUpperCase();
      if (currentStatus === "ACTIVE" || currentStatus === "ON") {
        formStatus = "ON";
      } else if (currentStatus === "INACTIVE" || currentStatus === "OFF") {
        formStatus = "OFF";
      }
    }

    return {
      id: product.id,
      name: product.name ?? "",
      slug: product.slug ?? "",
      productType: product.productType ?? "",
      categoryId: product.categoryId ?? "",
      resellerPercentage: product.resellerPercentage ?? 0,
      tutorialLink: product.tutorialLink ?? "",
      variationsDesign: product.variationsDesign ?? "DESIGN 1",
      
      status: formStatus, // 👈 এখন ডাটাবেজের রিয়েল স্ট্যাটাস ফর্মে পুশ হবে
      
      productImage: product.image ?? "",
      variationIcon: product.variationIcon ?? "",
      isBanner: Boolean(product.isBanner),
      bannerImage: product.bannerImage ?? "",
      isCoinSystem: Boolean(product.isCoinSystem),
      isPremiumUser: Boolean(product.isPremiumUser),
      isFreeFireAuto: Boolean(product.isFreeFireAuto),
      autoDeliveryType: product.autoDeliveryType ?? "",
      isUidNameChecker: Boolean(product.isUidNameChecker),
      productTag: product.productTag ?? "",
      tagColor: product.tagColor ?? "#ffffff",
      tagBgColor: product.tagBgColor ?? "#262626",
      tagIcon: product.tagIcon ?? "",
      tagType: product.tagType ?? "AUTO",
      description: product.description ?? "",
      inputFields: product.inputFields ?? [],
    };
  } catch (error) {
    console.error("Failed to fetch single product for edit:", error);
    return null;
  }
}