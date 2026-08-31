"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SaveButton from "@/app/(admin)/admin/settings/components/SaveButton";

interface AutoProviderProps {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  onSave?: () => void;
  handleSaveSettings?: () => void;
  loading: boolean;
}

export default function AutoProvider({
  formData,
  setFormData,
  onSave,
  handleSaveSettings,
  loading,
}: AutoProviderProps) {
  const saveAction = onSave || handleSaveSettings || (() => {});

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* AUTO TOPUP CONFIGURATION */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-200 border-b border-neutral-200 dark:border-neutral-800 pb-2">
          Provider Credentials
        </h3>

        {/* Form Fields: Only Base URL & API Key */}
        <div className="grid grid-cols-1 gap-6 pt-2">
          {/* Base API URL */}
          <div className="flex flex-col gap-2">
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
          <div className="flex flex-col gap-2">
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

      {/* Reusable Save Button Component */}
      <SaveButton onClick={saveAction} loading={loading} />
    </div>
  );
}