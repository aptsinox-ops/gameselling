"use client";

import React from "react";
import { TabsContent } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import SaveButton from "./SaveButton";

interface InformationsTabProps {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  onSave: () => void;
  loading: boolean;
}

export default function InformationsTab({
  formData,
  setFormData,
  onSave,
  loading,
}: InformationsTabProps) {
  return (
    <TabsContent value="informations" className="space-y-6 animate-in fade-in duration-200">
      <div className="max-w-md flex flex-col gap-2">
        <Label className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
          User Facing Support Email
        </Label>
        <Input
          type="email"
          value={formData.adminEmail}
          onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
          className="bg-neutral-50 dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 h-11 rounded-xl placeholder:text-neutral-400/70"
          placeholder="support@yourstore.com"
        />
        <p className="text-[11px] text-neutral-400 italic">
          This email will be publicly displayed to your app users.
        </p>
      </div>

      <SaveButton onClick={onSave} loading={loading} />
    </TabsContent>
  );
}