"use client";

import React from "react";
import { TabsContent } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ImageUploader } from "@/components/ui/image-uploader";
import SaveButton from "./SaveButton";

interface ThemeTabProps {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  onSave: () => void;
  loading: boolean;
}

export default function ThemeTab({
  formData,
  setFormData,
  onSave,
  loading,
}: ThemeTabProps) {
  return (
    <TabsContent value="theme" className="space-y-6 animate-in fade-in duration-200">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-2">
          <Label className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
            Primary Theme Color
          </Label>
          <div className="flex gap-2 items-center bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 p-1.5 rounded-xl">
            <input
              type="color"
              value={formData.primaryColor}
              onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
              className="w-10 h-8 rounded-lg cursor-pointer border-none bg-transparent"
            />
            <Input
              value={formData.primaryColor}
              onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
              placeholder="#00d2ff"
              className="border-none bg-transparent shadow-none focus-visible:ring-0 font-mono h-8 text-xs text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400/70"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
            Background Color
          </Label>
          <div className="flex gap-2 items-center bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 p-1.5 rounded-xl">
            <input
              type="color"
              value={formData.backgroundColor}
              onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
              className="w-10 h-8 rounded-lg cursor-pointer border-none bg-transparent"
            />
            <Input
              value={formData.backgroundColor}
              onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
              placeholder="#0a0a0c"
              className="border-none bg-transparent shadow-none focus-visible:ring-0 font-mono h-8 text-xs text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400/70"
            />
          </div>
        </div>
      </div>

      {/* LOGO, FAVICON, WALLET PAY & AUTO PAYMENT BANNERS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
        <div className="flex flex-col gap-2">
          <Label className="text-xs font-bold text-neutral-500 dark:text-neutral-400 tracking-wider">
            LOGO 1280x512
          </Label>
          <ImageUploader
            defaultValue={formData.logoUrl}
            onFileChange={(url) => setFormData((prev: any) => ({ ...prev, logoUrl: url || "" }))}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label className="text-xs font-bold text-neutral-500 dark:text-neutral-400 tracking-wider">
            FAVICON 512x512
          </Label>
          <ImageUploader
            defaultValue={formData.faviconUrl}
            onFileChange={(url) => setFormData((prev: any) => ({ ...prev, faviconUrl: url || "" }))}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label className="text-xs font-bold text-neutral-500 dark:text-neutral-400 tracking-wider">
            WALLET PAY BANNER
          </Label>
          <ImageUploader
            defaultValue={formData.walletPayBanner}
            onFileChange={(url) => setFormData((prev: any) => ({ ...prev, walletPayBanner: url || "" }))}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label className="text-xs font-bold text-neutral-500 dark:text-neutral-400 tracking-wider">
            AUTO PAYMENT BANNER
          </Label>
          <ImageUploader
            defaultValue={formData.autoPaymentBanner}
            onFileChange={(url) => setFormData((prev: any) => ({ ...prev, autoPaymentBanner: url || "" }))}
          />
        </div>
      </div>

      <SaveButton onClick={onSave} loading={loading} />
    </TabsContent>
  );
}