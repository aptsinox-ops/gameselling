"use client";

import React, { useState, useMemo } from "react";

interface Order {
  id: string;
  receiptNo?: string | null;
  status: string;
  totalPrice: number;
  createdAt: Date | string;
  quantity?: number;
  inputValues?: Record<string, any> | null;
  variation?: { title?: string | null; bonus?: number | null } | null;
  product?: { name?: string; productType?: string } | null;
}

interface MyOrdersClientProps {
  orders: Order[];
  primaryColor: string;
}

export default function MyOrdersPageClient({ orders, primaryColor }: MyOrdersClientProps) {
  const [searchOrderId, setSearchOrderId] = useState("");
  const [searchPackage, setSearchPackage] = useState("");
  const [searchStatus, setSearchStatus] = useState("All Status");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const formatDateTimeBD = (dateInput: Date | string) => {
    const date = new Date(dateInput);
    return date.toLocaleString("en-GB", {
      timeZone: "Asia/Dhaka",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getStatusMeta = (status: string) => {
    const s = status?.toLowerCase() || "";
    if (s === "completed" || s === "complete" || s === "compelet") {
      return { text: "Complete", isComplete: true, bg: "bg-emerald-100", textCol: "text-emerald-700" };
    }
    if (s === "cancelled" || s === "cancel" || s === "failed") {
      return { text: "Cancelled", isCancelled: true, bg: "bg-red-100", textCol: "text-red-700" };
    }
    return { text: "Processing", isProcessing: true, bg: "bg-amber-100", textCol: "text-amber-700" };
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const orderIdStr = (order.receiptNo || order.id).toLowerCase();
      if (searchOrderId && !orderIdStr.includes(searchOrderId.toLowerCase())) return false;

      const packageNameStr = (order.variation?.title || order.product?.name || "").toLowerCase();
      if (searchPackage && !packageNameStr.includes(searchPackage.toLowerCase())) return false;

      const statusMeta = getStatusMeta(order.status);
      if (searchStatus !== "All Status") {
        if (searchStatus === "Complete" && !statusMeta.isComplete) return false;
        if (searchStatus === "Processing" && !statusMeta.isProcessing) return false;
        if (searchStatus === "Cancelled" && !statusMeta.isCancelled) return false;
      }

      const orderDate = new Date(order.createdAt);
      if (fromDate) {
        const fDate = new Date(fromDate);
        fDate.setHours(0, 0, 0, 0);
        if (orderDate < fDate) return false;
      }
      if (toDate) {
        const tDate = new Date(toDate);
        tDate.setHours(23, 59, 59, 999);
        if (orderDate > tDate) return false;
      }

      return true;
    });
  }, [orders, searchOrderId, searchPackage, searchStatus, fromDate, toDate]);

  return (
    <div className="w-full min-h-screen bg-slate-50 text-slate-800 p-3 sm:p-6 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* BREADCRUMB */}
        <div className="flex items-center gap-2 text-sm font-medium">
          <span className="text-slate-400">Home</span>
          <span className="text-slate-300">/</span>
          <span className="font-semibold text-lg pb-0.5 border-b-2" style={{ color: primaryColor, borderColor: primaryColor }}>
            Orders
          </span>
        </div>

        {/* FILTER SECTION */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 sm:p-5 shadow-none space-y-3">
          <h2 className="text-sm font-bold text-slate-700 tracking-wide uppercase">Filter Orders</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
            
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Order ID</label>
              <input
                type="text"
                placeholder="Order ID"
                value={searchOrderId}
                onChange={(e) => setSearchOrderId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-slate-400"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Package</label>
              <input
                type="text"
                placeholder="Package"
                value={searchPackage}
                onChange={(e) => setSearchPackage(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-slate-400"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Status</label>
              <select
                value={searchStatus}
                onChange={(e) => setSearchStatus(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-slate-400"
              >
                <option value="All Status">All Status</option>
                <option value="Complete">Complete</option>
                <option value="Processing">Processing</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">From Date</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-slate-400 text-slate-600"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">To Date</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-slate-400 text-slate-600"
              />
            </div>

          </div>
        </div>

        {/* ORDER CARDS LIST */}
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12 bg-white border border-slate-200 rounded-lg text-slate-400 text-sm">
              No orders found.
            </div>
          ) : (
            filteredOrders.map((order) => {
              const statusMeta = getStatusMeta(order.status);
              const orderQuantity = order.quantity || 1;

              return (
                <div
                  key={order.id}
                  className="w-full bg-white border border-slate-200 rounded-lg p-4 sm:p-6 shadow-none transition-all space-y-4"
                >
                  {/* Card Top Line */}
                  <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm sm:text-base">
                        Order ID: #{order.receiptNo || order.id.substring(0, 8)}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5 font-medium">
                        {formatDateTimeBD(order.createdAt)}
                      </p>
                    </div>

                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusMeta.bg} ${statusMeta.textCol}`}>
                      {statusMeta.text}
                    </span>
                  </div>

                  {/* Card Details Grid */}
                  <div className="grid grid-cols-3 gap-2 sm:gap-4 text-xs sm:text-sm">
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 uppercase block mb-0.5">PACKAGE:</span>
                      <span className="font-bold text-slate-700">
                        {order.variation?.title || order.product?.name || "Item Package"}
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] font-bold text-slate-400 uppercase block mb-0.5">QUANTITY:</span>
                      <span className="font-bold text-slate-700">{orderQuantity}</span>
                    </div>

                    <div>
                      <span className="text-[11px] font-bold text-slate-400 uppercase block mb-0.5">PRICE:</span>
                      <span className="font-bold" style={{ color: primaryColor }}>
                        {order.totalPrice} TK
                      </span>
                    </div>
                  </div>

                  {/* Account / Input Details (UID, User Name, etc.) */}
                  {order.inputValues && typeof order.inputValues === "object" && (
                    <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3 space-y-1">
                      {Object.entries(order.inputValues).map(([key, value]) => (
                        <p key={key} className="text-xs font-medium text-slate-600 break-all">
                          <span className="font-bold text-slate-700 uppercase">{key}:</span> {String(value)}
                        </p>
                      ))}
                    </div>
                  )}

                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}