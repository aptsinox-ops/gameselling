"use client";

import React from "react";
import { TabsContent } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface AdminInfoTabProps {
  adminForm: any;
  setAdminForm: React.Dispatch<React.SetStateAction<any>>;
  onSaveAdmin: () => void;
  adminLoading: boolean;
}

export default function AdminInfoTab({
  adminForm,
  setAdminForm,
  onSaveAdmin,
  adminLoading,
}: AdminInfoTabProps) {
  return (
    <TabsContent
      value="adminInfo"
      className="space-y-8 animate-in fade-in duration-200 bg-transparent p-0 border-none shadow-none"
    >
      <div className="max-w-3xl space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-bold text-neutral-500 dark:text-neutral-400">
              Admin Name
            </Label>
            <Input
              value={adminForm.name}
              onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })}
              placeholder="Enter your full name"
              className="bg-neutral-50 dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 h-10 rounded-xl text-xs placeholder:text-neutral-400/70"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-bold text-neutral-500 dark:text-neutral-400">
              Username
            </Label>
            <Input
              value={adminForm.username}
              onChange={(e) => setAdminForm({ ...adminForm, username: e.target.value })}
              placeholder="Enter unique username"
              className="bg-neutral-50 dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 h-10 rounded-xl text-xs placeholder:text-neutral-400/70"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-bold text-neutral-500 dark:text-neutral-400">
              Company
            </Label>
            <Input
              value={adminForm.company}
              onChange={(e) => setAdminForm({ ...adminForm, company: e.target.value })}
              placeholder="e.g. RRR IT Solution"
              className="bg-neutral-50 dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 h-10 rounded-xl text-xs placeholder:text-neutral-400/70"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-bold text-neutral-500 dark:text-neutral-400">
              Phone Number
            </Label>
            <Input
              value={adminForm.phone}
              onChange={(e) => setAdminForm({ ...adminForm, phone: e.target.value })}
              placeholder="e.g. 017XXXXXXXX"
              className="bg-neutral-50 dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 h-10 rounded-xl text-xs placeholder:text-neutral-400/70"
            />
          </div>
        </div>

        <div className="pt-6 border-t border-neutral-200 dark:border-neutral-800/60 space-y-4">
          <div>
            <h4 className="text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
              Security & Password Gate
            </h4>
            <p className="text-[11px] text-neutral-400">
              Keep it empty if you do not want to alter credentials.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-bold text-neutral-500 dark:text-neutral-400">
                Type Your Older Password
              </Label>
              <Input
                type="password"
                value={adminForm.oldPassword}
                onChange={(e) => setAdminForm({ ...adminForm, oldPassword: e.target.value })}
                placeholder="••••••••"
                className="bg-neutral-50 dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 h-10 rounded-xl text-xs placeholder:text-neutral-400/70"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-bold text-neutral-500 dark:text-neutral-400">
                Type Your New Password
              </Label>
              <Input
                type="password"
                value={adminForm.newPassword}
                onChange={(e) => setAdminForm({ ...adminForm, newPassword: e.target.value })}
                placeholder="Minimum 6 characters"
                className="bg-neutral-50 dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 h-10 rounded-xl text-xs placeholder:text-neutral-400/70"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-bold text-neutral-500 dark:text-neutral-400">
                Retype Your New Password
              </Label>
              <Input
                type="password"
                value={adminForm.confirmPassword}
                onChange={(e) => setAdminForm({ ...adminForm, confirmPassword: e.target.value })}
                placeholder="Confirm new password"
                className="bg-neutral-50 dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 h-10 rounded-xl text-xs placeholder:text-neutral-400/70"
              />
            </div>
          </div>
        </div>

        <div className="pt-2">
          <Button
            onClick={onSaveAdmin}
            disabled={adminLoading}
            className="bg-neutral-900 dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-100 text-white dark:text-neutral-900 px-6 py-5 rounded-lg font-bold flex gap-2 items-center text-xs transition-all"
          >
            {adminLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {adminLoading ? "SAVING ADMIN..." : "SAVE ADMIN INFO"}
          </Button>
        </div>
      </div>
    </TabsContent>
  );
}