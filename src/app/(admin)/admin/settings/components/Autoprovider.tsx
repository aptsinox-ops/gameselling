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

        {/* Form Fields: Only Request URL & API Key */}
        <form autoComplete="off" onSubmit={(e) => e.preventDefault()} className="grid grid-cols-1 gap-6 pt-2">
          {/* Request URL */}
          <div className="flex flex-col gap-2">
            <Label className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
              Provider Request URL
            </Label>
            <Input
              type="text"
              name="provider_request_url_no_autofill"
              autoComplete="off"
              value={formData.providerBaseUrl || ""}
              onChange={(e) =>
                setFormData({ ...formData, providerBaseUrl: e.target.value })
              }
              placeholder="e.g. https://api.provider.com/v1/order"
              className="bg-neutral-50 dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 h-11 rounded-xl font-mono text-sm"
            />
          </div>

          {/* API Key */}
          <div className="flex flex-col gap-2">
            <Label className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
              Provider API Key
            </Label>
            <Input
              type="text"
              name="provider_api_key_no_autofill"
              autoComplete="new-password"
              value={formData.providerApiKey || ""}
              onChange={(e) =>
                setFormData({ ...formData, providerApiKey: e.target.value })
              }
              placeholder="Enter provider API key"
              className="bg-neutral-50 dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 h-11 rounded-xl font-mono text-sm"
            />
          </div>
        </form>
      </div>

      {/* Reusable Save Button Component */}
      <SaveButton onClick={saveAction} loading={loading} />
    </div>
  );
}