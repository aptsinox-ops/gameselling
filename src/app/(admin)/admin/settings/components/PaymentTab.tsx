"use client";

import React from "react";
import { TabsContent } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import SaveButton from "./SaveButton";

interface PaymentTabProps {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  onSave: () => void;
  loading: boolean;
}

export default function PaymentTab({
  formData,
  setFormData,
  onSave,
  loading,
}: PaymentTabProps) {
  const isLocalWeb = formData.paymentGateway === "LocalWeb";

  return (
    <TabsContent value="payment" className="space-y-6">
      <div className="space-y-5 transition-colors">
        {/* Payment Gateway Dropdown */}
        <div className="space-y-2">
          <Label className="text-xs uppercase tracking-wider font-semibold text-neutral-700 dark:text-neutral-300">
            Payment Gateway <span className="text-red-500">*</span>
          </Label>
          <select
            value={formData.paymentGateway || "LocalWeb"}
            onChange={(e) =>
              setFormData({
                ...formData,
                paymentGateway: e.target.value as "LocalWeb" | "Uddokotapay" | "Piprapay" | "others",
              })
            }
            className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-3 text-sm text-neutral-900 dark:text-neutral-200 outline-none focus:border-amber-500 transition-colors"
          >
            <option value="LocalWeb" className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-200">
              Local Web
            </option>
            <option value="Uddokotapay" className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-200">
              Uddokotapay
            </option>
            <option value="Piprapay" className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-200">
              Piprapay
            </option>
            <option value="others" className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-200">
              others
            </option>
          </select>
        </div>

        {/* Dynamic Fields Based on Selection */}
        {isLocalWeb ? (
          /* LOCAL WEB FIELDS: SMS Reader Key & Username */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider font-semibold text-neutral-700 dark:text-neutral-300">
                SMS Reader Key <span className="text-red-500">*</span>
              </Label>
              <Input
                type="text"
                placeholder="Enter SMS Reader API Key"
                value={formData.smsReaderKey || ""}
                onChange={(e) => setFormData({ ...formData, smsReaderKey: e.target.value })}
                className="bg-neutral-50 dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800 focus:border-amber-500 text-neutral-900 dark:text-neutral-200 placeholder:text-neutral-400 dark:placeholder:text-neutral-600 text-sm font-mono"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider font-semibold text-neutral-700 dark:text-neutral-300">
                Username <span className="text-red-500">*</span>
              </Label>
              <Input
                type="text"
                placeholder="Enter App Username"
                value={formData.localWebUsername || ""}
                onChange={(e) => setFormData({ ...formData, localWebUsername: e.target.value })}
                className="bg-neutral-50 dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800 focus:border-amber-500 text-neutral-900 dark:text-neutral-200 placeholder:text-neutral-400 dark:placeholder:text-neutral-600 text-sm font-mono"
              />
            </div>
          </div>
        ) : (
          /* EXTERNAL GATEWAY FIELDS: Base URL & API Key */
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider font-semibold text-neutral-700 dark:text-neutral-300">
                  {formData.paymentGateway === "others" ? "API URL" : "Base URL"}{" "}
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="text"
                  placeholder={
                    formData.paymentGateway === "others"
                      ? "https://secure-pay.deshipay.xyz/api"
                      : "https://sinoxbd.paymently.io/api"
                  }
                  value={formData.paymentBaseUrl || ""}
                  onChange={(e) => setFormData({ ...formData, paymentBaseUrl: e.target.value })}
                  className="bg-neutral-50 dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800 focus:border-amber-500 text-neutral-900 dark:text-neutral-200 placeholder:text-neutral-400 dark:placeholder:text-neutral-600 text-sm font-mono"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider font-semibold text-neutral-700 dark:text-neutral-300">
                  {formData.paymentGateway === "others" ? "Brand Key / API Key" : "API Key"}{" "}
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="text"
                  placeholder={
                    formData.paymentGateway === "others"
                      ? "Enter Brand Key / API Key"
                      : "Enter API Key"
                  }
                  value={formData.paymentApiKey || ""}
                  onChange={(e) => setFormData({ ...formData, paymentApiKey: e.target.value })}
                  className="bg-neutral-50 dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800 focus:border-amber-500 text-neutral-900 dark:text-neutral-200 placeholder:text-neutral-400 dark:placeholder:text-neutral-600 text-sm font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* Grid: Min Amount & Max Amount (সব পেমেন্ট মেথডের জন্যই প্রযোজ্য) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider font-semibold text-neutral-700 dark:text-neutral-300">
              Min Amount <span className="text-red-500">*</span>
            </Label>
            <Input
              type="number"
              placeholder="20"
              value={formData.paymentMinAmount || ""}
              onChange={(e) => setFormData({ ...formData, paymentMinAmount: e.target.value })}
              className="bg-neutral-50 dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800 focus:border-amber-500 text-neutral-900 dark:text-neutral-200 placeholder:text-neutral-400 dark:placeholder:text-neutral-600 text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider font-semibold text-neutral-700 dark:text-neutral-300">
              Max Amount <span className="text-red-500">*</span>
            </Label>
            <Input
              type="number"
              placeholder="50000"
              value={formData.paymentMaxAmount || ""}
              onChange={(e) => setFormData({ ...formData, paymentMaxAmount: e.target.value })}
              className="bg-neutral-50 dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800 focus:border-amber-500 text-neutral-900 dark:text-neutral-200 placeholder:text-neutral-400 dark:placeholder:text-neutral-600 text-sm"
            />
          </div>
        </div>
      </div>

      <SaveButton onClick={onSave} loading={loading} />
    </TabsContent>
  );
}