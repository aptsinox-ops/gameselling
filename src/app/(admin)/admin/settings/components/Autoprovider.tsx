"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

interface AutoProviderProps {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  onSave?: () => void;
  handleSaveSettings?: () => void;
  loading: boolean;
  renderSaveButton?: (onSave: () => void, isLoading: boolean) => React.ReactNode;
}

export default function AutoProvider({
  formData,
  setFormData,
  onSave,
  handleSaveSettings,
  loading,
  renderSaveButton,
}: AutoProviderProps) {
  const saveAction = onSave || handleSaveSettings || (() => {});

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* 1. AUTO TOPUP CONFIGURATION */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-200 border-b border-neutral-200 dark:border-neutral-800 pb-2">
          1. Auto Topup & Provider Credentials
        </h3>

        {/* Global Auto Topup Enable/Disable */}
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-neutral-100/80 dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-800">
          <div>
            <Label className="text-xs font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-200 block">
              Global Auto Topup System
            </Label>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Turn on to enable automated order processing with provider API.
            </p>
          </div>
          <Switch
            checked={formData.isAutoTopupEnabled || false}
            onCheckedChange={(v) =>
              setFormData({ ...formData, isAutoTopupEnabled: v })
            }
          />
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Provider Name */}
          <div className="flex flex-col gap-2">
            <Label className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
              Provider Name
            </Label>
            <Input
              value={formData.providerName || ""}
              onChange={(e) =>
                setFormData({ ...formData, providerName: e.target.value })
              }
              placeholder="e.g. SmileOne / TopupProvider"
              className="bg-neutral-50 dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 h-11 rounded-xl"
            />
          </div>

          {/* Callback / Webhook URL (Read Only Info) */}
          <div className="flex flex-col gap-2">
            <Label className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
              Callback Webhook URL (Your Site)
            </Label>
            <Input
              value={`${typeof window !== "undefined" ? window.location.origin : ""}/api/webhook/topup`}
              readOnly
              className="bg-neutral-100 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 h-11 rounded-xl cursor-not-allowed text-xs font-mono"
            />
          </div>

          {/* Base API URL */}
          <div className="flex flex-col gap-2 md:col-span-2">
            <Label className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
              Provider API Base URL
            </Label>
            <Input
              value={formData.providerBaseUrl || ""}
              onChange={(e) =>
                setFormData({ ...formData, providerBaseUrl: e.target.value })
              }
              placeholder="e.g. https://api.provider.com"
              className="bg-neutral-50 dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 h-11 rounded-xl font-mono text-sm"
            />
          </div>

          {/* API Secret Key */}
          <div className="flex flex-col gap-2 md:col-span-2">
            <Label className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
              Provider API Secret Key (X-API-KEY)
            </Label>
            <Input
              type="password"
              value={formData.providerApiKey || ""}
              onChange={(e) =>
                setFormData({ ...formData, providerApiKey: e.target.value })
              }
              placeholder="Enter provider API key"
              className="bg-neutral-50 dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 h-11 rounded-xl font-mono text-sm"
            />
          </div>
        </div>
      </div>

      {/* Save Button Section */}
      <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
        {renderSaveButton ? (
          renderSaveButton(saveAction, loading)
        ) : (
          <Button
            onClick={saveAction}
            disabled={loading}
            className="rounded-xl px-6 bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
          >
            {loading ? "Saving..." : "Save Settings"}
          </Button>
        )}
      </div>
    </div>
  );
}