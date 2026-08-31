"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
// আপনার প্রজেক্টের ImageUploader এর সঠিক পাথ ইমপোর্ট করুন
import { ImageUploader } from "@/components/ui/image-uploader";

interface FooterTabProps {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  handleSaveSettings: () => void;
  loading: boolean;
  renderSaveButton?: (onSave: () => void, isLoading: boolean) => React.ReactNode;
}

export default function FooterTab({
  formData,
  setFormData,
  handleSaveSettings,
  loading,
  renderSaveButton,
}: FooterTabProps) {
  // UI Tab Switcher State (লোকাল স্টেট হিসেবে সরিয়ে আনা হয়েছে)
  const [activeCardBar, setActiveCardBar] = useState<"card1" | "card2">("card1");

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-2">
          <Label className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
            Top Gradient Color
          </Label>
          <div className="flex gap-2 items-center bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 p-1.5 rounded-xl">
            <input
              type="color"
              value={formData.footerTopColor || "#00d2ff"}
              onChange={(e) => setFormData({ ...formData, footerTopColor: e.target.value })}
              className="w-10 h-8 rounded-lg cursor-pointer border-none bg-transparent"
            />
            <Input
              value={formData.footerTopColor || ""}
              onChange={(e) => setFormData({ ...formData, footerTopColor: e.target.value })}
              placeholder="#00d2ff"
              className="border-none bg-transparent shadow-none focus-visible:ring-0 font-mono h-8 text-xs text-neutral-900 dark:text-neutral-100"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
            Bottom Gradient Color
          </Label>
          <div className="flex gap-2 items-center bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 p-1.5 rounded-xl">
            <input
              type="color"
              value={formData.footerBottomColor || "#0055ff"}
              onChange={(e) => setFormData({ ...formData, footerBottomColor: e.target.value })}
              className="w-10 h-8 rounded-lg cursor-pointer border-none bg-transparent"
            />
            <Input
              value={formData.footerBottomColor || ""}
              onChange={(e) => setFormData({ ...formData, footerBottomColor: e.target.value })}
              placeholder="#0055ff"
              className="border-none bg-transparent shadow-none focus-visible:ring-0 font-mono h-8 text-xs text-neutral-900 dark:text-neutral-100"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 pt-2">
        <div className="flex bg-neutral-100 dark:bg-neutral-900/60 p-1 rounded-xl w-max border border-neutral-200/60 dark:border-neutral-800/60">
          <button
            type="button"
            onClick={() => setActiveCardBar("card1")}
            className={`px-4 py-2 text-xs rounded-lg transition-all ${
              activeCardBar === "card1"
                ? "bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white font-bold border border-neutral-200 dark:border-neutral-800"
                : "text-neutral-500 dark:text-neutral-400 font-medium"
            }`}
          >
            Card Bar 1
          </button>
          <button
            type="button"
            onClick={() => setActiveCardBar("card2")}
            className={`px-4 py-2 text-xs rounded-lg transition-all ${
              activeCardBar === "card2"
                ? "bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white font-bold border border-neutral-200 dark:border-neutral-800"
                : "text-neutral-500 dark:text-neutral-400 font-medium"
            }`}
          >
            Card Bar 2
          </button>
        </div>

        <div className="flex items-center justify-between max-w-md bg-neutral-50 dark:bg-neutral-900/20 p-3 rounded-xl border border-neutral-200/50 dark:border-neutral-800/50">
          <Label className="text-xs font-bold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
            Enable {activeCardBar === "card1" ? "Card Bar 1" : "Card Bar 2"}
          </Label>
          {activeCardBar === "card1" ? (
            <Switch
              checked={formData.isFooterCard1Visible || false}
              onCheckedChange={(v) => setFormData({ ...formData, isFooterCard1Visible: v })}
            />
          ) : (
            <Switch
              checked={formData.isFooterCard2Visible || false}
              onCheckedChange={(v) => setFormData({ ...formData, isFooterCard2Visible: v })}
            />
          )}
        </div>
      </div>

      {activeCardBar === "card1" && (
        <div className="space-y-6 border-t border-neutral-200 dark:border-neutral-800/60 pt-4 animate-in fade-in duration-150">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <Label className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                Title 1
              </Label>
              <Input
                value={formData.footerCard1Title1 || ""}
                onChange={(e) => setFormData({ ...formData, footerCard1Title1: e.target.value })}
                placeholder="e.g. Fast Delivery"
                className="bg-neutral-50 dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 text-sm h-11 rounded-xl"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                Title 2
              </Label>
              <Input
                value={formData.footerCard1Title2 || ""}
                onChange={(e) => setFormData({ ...formData, footerCard1Title2: e.target.value })}
                placeholder="e.g. Within 5-10 Minutes"
                className="bg-neutral-50 dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 text-sm h-11 rounded-xl"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
            <div className="md:col-span-2 flex flex-col gap-2">
              <Label className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                Redirect Link
              </Label>
              <Input
                value={formData.footerCard1Link || ""}
                onChange={(e) => setFormData({ ...formData, footerCard1Link: e.target.value })}
                placeholder="Hint Link (e.g. /orders or #)"
                className="bg-neutral-50 dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 text-sm h-11 rounded-xl"
              />
            </div>
            <div className="flex flex-col gap-2 max-w-max">
              <Label className="text-xs font-bold text-neutral-500 dark:text-neutral-400 tracking-wider">
                CARD BAR 512x512
              </Label>
              <div className="h-max overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
                <ImageUploader
                  defaultValue={formData.footerCard1ImageUrl}
                  onFileChange={(url) =>
                    setFormData((prev: any) => ({ ...prev, footerCard1ImageUrl: url || "" }))
                  }
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {activeCardBar === "card2" && (
        <div className="space-y-6 border-t border-neutral-200 dark:border-neutral-800/60 pt-4 animate-in fade-in duration-150">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <Label className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                Title 1
              </Label>
              <Input
                value={formData.footerCard2Title1 || ""}
                onChange={(e) => setFormData({ ...formData, footerCard2Title1: e.target.value })}
                placeholder="e.g. Support 24/7"
                className="bg-neutral-50 dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 text-sm h-11 rounded-xl"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                Title 2
              </Label>
              <Input
                value={formData.footerCard2Title2 || ""}
                onChange={(e) => setFormData({ ...formData, footerCard2Title2: e.target.value })}
                placeholder="e.g. Live Chat & WhatsApp"
                className="bg-neutral-50 dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 text-sm h-11 rounded-xl"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
            <div className="md:col-span-2 flex flex-col gap-2">
              <Label className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                Redirect Link
              </Label>
              <Input
                value={formData.footerCard2Link || ""}
                onChange={(e) => setFormData({ ...formData, footerCard2Link: e.target.value })}
                placeholder="Hint Link (e.g. /orders or #)"
                className="bg-neutral-50 dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 text-sm h-11 rounded-xl"
              />
            </div>
            <div className="flex flex-col gap-2 max-w-max">
              <Label className="text-xs font-bold text-neutral-500 dark:text-neutral-400 tracking-wider">
                CARD BAR 512x512
              </Label>
              <div className="h-max overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
                <ImageUploader
                  defaultValue={formData.footerCard2ImageUrl}
                  onFileChange={(url) =>
                    setFormData((prev: any) => ({ ...prev, footerCard2ImageUrl: url || "" }))
                  }
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="pt-2">
        {renderSaveButton ? (
          renderSaveButton(handleSaveSettings, loading)
        ) : (
          <Button onClick={handleSaveSettings} disabled={loading} className="rounded-xl">
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        )}
      </div>
    </div>
  );
}