import { AppSidebar } from "@/components/app-sidebar";
import AdminHeader from "@/components/admin/Header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AutoRobotTable } from "./autorobot-table";
import { prisma } from "@/lib/prisma";
import { AutoRobotItem } from "./columns";

export default async function AutoRobotPage() {
  const robotVariations = await getAutoRobotVariations();

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
              <div className="space-y-1">
                <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
                  UniPin Auto Robot Management
                </h1>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Manage FreeFire UniPin auto topup vouchers and live stock status.
                </p>
              </div>

              <AutoRobotTable initialData={robotVariations} />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

async function getAutoRobotVariations(): Promise<AutoRobotItem[]> {
  try {
    const variations = await prisma.variation.findMany({
      where: {
        product: {
          isFreeFireAuto: true,
        },
      },
      include: {
        product: {
          select: {
            name: true,
          },
        },
        _count: {
          select: {
            vouchers: {
              where: { status: "ACTIVE" },
            },
          },
        },
      },
      orderBy: {
        sortOrder: "asc",
      },
    });

    return variations.map((variation) => ({
      id: variation.id,
      productId: variation.productId,
      productName: variation.product?.name ?? "Unknown Product",
      title: variation.title,
      price: Number(variation.price),
      amount: Number(variation.amount ?? 0),
      stock: variation._count?.vouchers ?? 0,
      status: variation.status,
      updatedAt: variation.updatedAt ? new Date(variation.updatedAt).toISOString() : "",
    }));
  } catch (error) {
    console.error("Failed to fetch auto robot variations:", error);
    return [];
  }
}