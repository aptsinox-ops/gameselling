"use client";

import React, { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";

interface VoucherOrder {
  id: string;
  receiptNo?: string | null;
  status: string;
  totalPrice: number;
  voucherCode?: string | null;
  createdAt: Date | string;
  quantity?: number;
  variation?: { title?: string | null } | null;
  product?: { name?: string; productType?: string } | null;
}

interface CodePageClientProps {
  orders: VoucherOrder[];
  primaryColor: string;
}

const ITEMS_PER_PAGE = 3;

export default function CodePageClient({ orders, primaryColor }: CodePageClientProps) {
  const [searchOrderId, setSearchOrderId] = useState("");
  const [searchPackage, setSearchPackage] = useState("");
  const [searchStatus, setSearchStatus] = useState("All Status");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchOrderId, searchPackage, searchStatus, fromDate, toDate]);

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
      if (searchOrderId.trim()) {
        const cleanQuery = searchOrderId.trim().toLowerCase().replace(/^#/, "");
        const rawId = String(order.id || "").toLowerCase();
        const receiptNo = String(order.receiptNo || "").toLowerCase();
        const shortId = rawId.substring(0, 8);

        const matchesId = rawId.includes(cleanQuery) || receiptNo.includes(cleanQuery) || shortId.includes(cleanQuery);
        if (!matchesId) return false;
      }

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

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / ITEMS_PER_PAGE));
  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredOrders.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredOrders, currentPage]);

  const handleCopyCodes = (codes: string[]) => {
    if (!codes || codes.length === 0) return;
    const formattedText = codes.map((c) => c.trim()).filter(Boolean).join(" ") + " ";
    navigator.clipboard.writeText(formattedText);
    toast.success("Voucher code(s) copied to clipboard!");
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 text-slate-800 p-2 sm:p-6 font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* MAIN SINGLE CARD WRAPPER */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-sm space-y-6">
          
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">My Orders</h1>

          {/* FILTER SECTION */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold text-slate-700 tracking-wide uppercase">Filter Orders</h2>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 items-end">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Order ID</label>
                <input
                  type="text"
                  placeholder="Order ID"
                  value={searchOrderId}
                  onChange={(e) => setSearchOrderId(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-slate-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Package</label>
                <input
                  type="text"
                  placeholder="Package"
                  value={searchPackage}
                  onChange={(e) => setSearchPackage(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-slate-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Status</label>
                <select
                  value={searchStatus}
                  onChange={(e) => setSearchStatus(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-slate-400"
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
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-slate-400 text-slate-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">To Date</label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-slate-400 text-slate-600"
                />
              </div>

              <div>
                <button
                  type="button"
                  style={{ backgroundColor: primaryColor }}
                  className="w-full py-2 px-4 text-xs font-semibold text-white rounded-xl transition-opacity hover:opacity-90"
                >
                  Filter
                </button>
              </div>
            </div>
          </div>

          {/* ORDER CARDS LIST */}
          <div className="space-y-4 pt-2">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-slate-200 rounded-xl text-slate-400 text-xs">
                No voucher codes found.
              </div>
            ) : (
              paginatedOrders.map((order) => {
                const statusMeta = getStatusMeta(order.status);
                const orderQuantity = order.quantity || 1;

                const codesArray = order.voucherCode
                  ? order.voucherCode.split(/\r?\n|,/).map((c) => c.trim()).filter(Boolean)
                  : [];

                return (
                  <div
                    key={order.id}
                    className="w-full bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3.5"
                  >
                    {/* Header line inside card */}
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                          Serial NO: #{order.receiptNo || order.id.substring(0, 8)}
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5 font-medium">
                          {formatDateTimeBD(order.createdAt)}
                        </p>
                      </div>

                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusMeta.bg} ${statusMeta.textCol}`}>
                        {statusMeta.text}
                      </span>
                    </div>

                    <hr className="mt-2.5 border-slate-200 w-full" />

                    {/* Details list: PC te Horizontal / Mobile te Vertical */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs sm:text-sm pt-1">
                      <div>
                        <span className="text-[11px] font-bold text-slate-400 uppercase block">PACKAGE:</span>
                        <span className="font-bold text-slate-800">
                          {order.variation?.title || order.product?.name || "Voucher Pack"}
                        </span>
                      </div>

                      <div>
                        <span className="text-[11px] font-bold text-slate-400 uppercase block">QUANTITY:</span>
                        <span className="font-bold text-slate-800">{orderQuantity}</span>
                      </div>

                      <div>
                        <span className="text-[11px] font-bold text-slate-400 uppercase block">PRICE:</span>
                        <span className="font-bold" style={{ color: primaryColor }}>
                          {order.totalPrice} TK
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    {statusMeta.isComplete && codesArray.length > 0 && (
                      <div className="flex items-center gap-2 pt-1">
                        <a
                          href="https://shop.garena.my/?app=100067"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 text-xs font-semibold text-white rounded-xl transition-opacity hover:opacity-90 inline-flex items-center justify-center"
                          style={{ backgroundColor: primaryColor }}
                        >
                          Redeem Code
                        </a>

                        <button
                          onClick={() => handleCopyCodes(codesArray)}
                          className="px-4 py-2 text-xs font-semibold text-white rounded-xl transition-opacity hover:opacity-90 inline-flex items-center justify-center"
                          style={{ backgroundColor: primaryColor }}
                        >
                          {codesArray.length > 1 ? "Copy All" : "Copy Code"}
                        </button>
                      </div>
                    )}

                    {/* Codes Container */}
                    {statusMeta.isComplete && codesArray.length > 0 ? (
                      <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 space-y-2">
                        <p className="text-xs font-bold text-slate-700">{codesArray.length} Code:</p>
                        {codesArray.map((code, idx) => (
                          <div
                            key={idx}
                            className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono font-medium text-slate-800 break-all"
                          >
                            {code}
                          </div>
                        ))}
                      </div>
                    ) : statusMeta.isProcessing ? (
                      <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-xs text-amber-700 font-medium">
                        Processing, please wait for code...
                      </div>
                    ) : null}

                    {/* Red Info Box */}
                    {statusMeta.isComplete && codesArray.length > 0 && (
                      <div className="bg-red-50/80 border border-red-100 rounded-xl p-3 text-xs text-red-600 font-medium break-all leading-relaxed">
                        <span className="font-bold mr-1">Info:</span>
                        {codesArray.join(" ")}
                      </div>
                    )}

                  </div>
                );
              })
            )}
          </div>

          {/* PAGINATION CONTROL */}
          {filteredOrders.length > 0 && (
            <div className="flex items-center justify-between pt-2 text-xs font-medium text-slate-500">
              <div>
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  className="px-3.5 py-1.5 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  className="px-3.5 py-1.5 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}