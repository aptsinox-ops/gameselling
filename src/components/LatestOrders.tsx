import Image from "next/image";

export interface OrderItem {
  id: string;
  totalPrice: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  user: {
    name: string | null;
    image?: string | null;
  };
  product?: {
    name: string;
  };
  variation?: {
    title: string;
    bonus?: number;
  };
}

interface LatestOrdersProps {
  orders: OrderItem[];
  primaryColor?: string;
}

export default function LatestOrders({
  orders,
  primaryColor = "#00d2ff",
}: LatestOrdersProps) {
  if (!orders || orders.length === 0) return null;

  // তারিখ ফরম্যাট করার হেলপার ফাংশন
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date
      .toLocaleString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
      .replace(",", "");
  };

  // স্ট্যাটাস অনুযায়ী ব্যাজের নাম, ব্যাকগ্রাউন্ড কালার ও টিকচিহ্ন নির্ধারণ
  const getStatusInfo = (status: string) => {
    const s = status?.toUpperCase() || "";

    if (s === "COMPLETED") {
      return {
        label: "Completed",
        bgClass: "bg-emerald-500 text-white",
        showCheckmark: true,
      };
    }
    if (s === "CANCELLED") {
      return {
        label: "Cancelled",
        bgClass: "bg-rose-500 text-white",
        showCheckmark: false,
      };
    }
    if (s === "FAILED") {
      return {
        label: "Failed",
        bgClass: "bg-rose-500 text-white",
        showCheckmark: false,
      };
    }
    // Default: PENDING বা PROCESSING হলে
    return {
      label: "Processing",
      bgClass: "bg-amber-500 text-white",
      showCheckmark: false,
    };
  };

  return (
    <section className="my-8 w-full max-w-7xl mx-auto px-2 sm:px-4">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
          Latest Orders
        </h2>

        {/* Custom HR Divider Line */}
        <div className="flex items-center justify-center gap-2 max-w-xs mx-auto my-2">
          <div
            className="h-[1.5px] flex-1 opacity-70"
            style={{
              background: `linear-gradient(to left, ${primaryColor}, transparent)`,
            }}
          />
          <div
            className="w-10 h-1.5 rounded-full"
            style={{ backgroundColor: primaryColor }}
          />
          <div
            className="h-[1.5px] flex-1 opacity-70"
            style={{
              background: `linear-gradient(to right, ${primaryColor}, transparent)`,
            }}
          />
        </div>

        <p className="text-xs text-slate-500 font-medium">
          Latest 5 orders
        </p>
      </div>

      {/* Orders List */}
      <div className="space-y-3">
        {orders.map((order) => {
          const userName = order.user?.name || "Customer";
          const initial = userName.charAt(0).toUpperCase();
          const itemTitle =
            order.variation?.title || order.product?.name || "Topup";
          const bonus = order.variation?.bonus || 0;
          const statusInfo = getStatusInfo(order.status);

          return (
            <div
              key={order.id}
              className="bg-white rounded-md p-3 sm:p-4 border border-slate-200/90 shadow-none hover:border-slate-300 transition-all flex items-center justify-between gap-3"
            >
              {/* Left Side: Avatar & Info */}
              <div className="flex items-center gap-3 min-w-0">
                {order.user?.image ? (
                  <Image
                    src={order.user.image}
                    alt={userName}
                    width={44}
                    height={44}
                    className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover shrink-0 border border-slate-100"
                  />
                ) : (
                  <div
                    className="w-10 h-10 sm:w-11 sm:h-11 rounded-full text-white font-bold flex items-center justify-center shrink-0 text-base sm:text-lg"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {initial}
                  </div>
                )}

                <div className="min-w-0">
                  <h3 className="font-bold text-slate-800 text-sm sm:text-base truncate leading-snug">
                    {userName}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 font-medium truncate mt-0.5">
                    {itemTitle}
                    
                    {bonus > 0 && (
                      <span className="text-amber-500 font-bold ml-1">
                        + {bonus}
                      </span>
                    )}{" "}

                    <span className="text-slate-400 font-normal">-</span>{" "}
                    <span className="text-emerald-600 font-bold">
                      {order.totalPrice}৳
                    </span>
                  </p>
                  <p className="text-[11px] sm:text-xs text-slate-400 mt-1">
                    Ordered: {formatDate(order.createdAt)}
                  </p>
                </div>
              </div>

              {/* Right Side: Status Badge & Completion Date */}
              <div className="flex flex-col items-end justify-between shrink-0 self-stretch py-0.5">
                <span
                  className={`text-[11px] sm:text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 ${statusInfo.bgClass}`}
                >
                  {statusInfo.showCheckmark && (
                    <svg
                      className="w-3.5 h-3.5 fill-current"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                  {statusInfo.label}
                </span>
                <span className="text-[10px] sm:text-xs text-slate-400 mt-2 sm:mt-0 text-right">
                  Completed: {formatDate(order.updatedAt || order.createdAt)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}