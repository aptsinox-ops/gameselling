"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Plus, X } from "lucide-react";

interface GeneralTabProps {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  handleSaveSettings: () => void;
  loading: boolean;
  renderSaveButton?: (onSave: () => void, isLoading: boolean) => React.ReactNode;
}

export default function GeneralTab({
  formData,
  setFormData,
  handleSaveSettings,
  loading,
  renderSaveButton,
}: GeneralTabProps) {
  // Meta Keywords state (শুধুমাত্র এই কম্পোনেন্টেই প্রয়োজন)
  const [keywords, setKeywords] = useState<string[]>([]);
  const [tempKeyword, setTempKeyword] = useState("");

  const addKeyword = (e?: React.KeyboardEvent | React.MouseEvent) => {
    if (e && "key" in e && e.key === "Enter") {
      e.preventDefault();
    }
    if (tempKeyword.trim() && !keywords.includes(tempKeyword.trim())) {
      setKeywords([...keywords, tempKeyword.trim()]);
      setTempKeyword("");
    }
  };

  const removeKeyword = (tagToRemove: string) => {
    setKeywords(keywords.filter((tag) => tag !== tagToRemove));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-2">
          <Label className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
            Site Name
          </Label>
          <Input
            value={formData.siteName || ""}
            onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
            placeholder="e.g. STORE NAME"
            className="bg-neutral-50 dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 focus-visible:ring-neutral-400 dark:focus-visible:ring-neutral-800 text-sm h-11 rounded-xl placeholder:text-neutral-400/70"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
            Login System
          </Label>
          <select
            value={formData.loginSystem || "OAUTH"}
            onChange={(e) => setFormData({ ...formData, loginSystem: e.target.value as any })}
            className="flex h-11 w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 dark:bg-neutral-950 focus:outline-none"
          >
            <option value="OAUTH">1. OAuth</option>
            <option value="MANUAL">2. Manual</option>
            <option value="OAUTH_MANUAL">3. Manual + OAuth</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-2">
          <Label className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
            Google Client ID
          </Label>
          <Input
            value={formData.googleClientId || ""}
            onChange={(e) => setFormData({ ...formData, googleClientId: e.target.value })}
            placeholder="e.g. xxx-xxx.apps.googleusercontent.com"
            className="bg-neutral-50 dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 text-sm h-11 rounded-xl"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
            Google Client Secret
          </Label>
          <Input
            type="password"
            value={formData.googleClientSecret || ""}
            onChange={(e) => setFormData({ ...formData, googleClientSecret: e.target.value })}
            placeholder="e.g. GOCSPX-xxxxxxxxxxxx"
            className="bg-neutral-50 dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 text-sm h-11 rounded-xl"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-2">
          <Label className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
            Site Title
          </Label>
          <Input
            value={formData.siteTitle || ""}
            onChange={(e) => setFormData({ ...formData, siteTitle: e.target.value })}
            placeholder="e.g. DEMO BAZAR | Best Online Topup Store"
            className="bg-neutral-50 dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 text-sm h-11 rounded-xl"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
            Site Description
          </Label>
          <Input
            value={formData.siteDescription || ""}
            onChange={(e) => setFormData({ ...formData, siteDescription: e.target.value })}
            placeholder="e.g. Best game topup store in Bangladesh with instant delivery..."
            className="bg-neutral-50 dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 text-sm h-11 rounded-xl"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        <Label className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
          Meta Keywords
        </Label>
        <div className="flex gap-2">
          <Input
            value={tempKeyword}
            onChange={(e) => setTempKeyword(e.target.value)}
            placeholder="Type tag (e.g. topup) & press Enter"
            className="bg-neutral-50 dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 text-sm h-11 rounded-xl"
            onKeyDown={(e) => e.key === "Enter" && addKeyword(e)}
          />
          <Button
            onClick={addKeyword}
            type="button"
            className="h-11 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 text-neutral-900 dark:text-white px-4 rounded-xl border border-neutral-200 dark:border-neutral-700"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex flex-wrap gap-1.5 p-3 bg-neutral-50 dark:bg-neutral-900/30 border border-neutral-200 dark:border-neutral-800 rounded-xl min-h-[110px] content-start">
          {keywords.length === 0 && (
            <span className="text-xs text-neutral-400/60 italic self-center m-auto">
              No tags added yet.
            </span>
          )}
          {keywords.map((tag) => (
            <div
              key={tag}
              className="bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 font-bold flex items-center gap-1 pl-2.5 pr-1 py-1 text-[11px] rounded-lg"
            >
              <span>{tag}</span>
              <button
                type="button"
                onClick={() => removeKeyword(tag)}
                className="w-4 h-4 flex items-center justify-center rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-400"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
          Notice Text
        </Label>
        <Textarea
          value={formData.noticeText || ""}
          onChange={(e) => setFormData({ ...formData, noticeText: e.target.value })}
          placeholder="Enter global website notice..."
          className="bg-neutral-50 dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 min-h-[100px] rounded-xl"
        />
      </div>

      <div className="w-full border-t border-b border-neutral-200/60 dark:border-neutral-800/60 py-4">
        <div className="grid grid-cols-1 gap-4">
          <div className="flex items-center justify-between w-full">
            <Label className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
              Show Header Menu
            </Label>
            <Switch
              checked={formData.isHeaderVisible || false}
              onCheckedChange={(v) => setFormData({ ...formData, isHeaderVisible: v })}
            />
          </div>
          <div className="flex items-center justify-between w-full">
            <Label className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
              Show Footer Section
            </Label>
            <Switch
              checked={formData.isFooterVisible || false}
              onCheckedChange={(v) => setFormData({ ...formData, isFooterVisible: v })}
            />
          </div>
        </div>
      </div>

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