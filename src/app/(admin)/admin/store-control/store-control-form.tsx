"use client";

import React, { useState } from "react";
import { Store, Wrench, Clock, Save, X, Check } from "lucide-react";
import { toast } from "react-hot-toast";
import { updateStoreControl } from "@/app/actions/store-control";

// Reusable Switch Component
interface SwitchProps {
  checked: boolean;
  disabled?: boolean;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
}

function Switch({ checked, disabled, onCheckedChange, className = "" }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
        checked ? "bg-neutral-900 dark:bg-neutral-100" : "bg-neutral-200 dark:bg-neutral-800"
      } ${className}`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white dark:bg-neutral-900 shadow-lg ring-0 transition duration-200 ease-in-out ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

interface StoreControlData {
  isSiteClosed: boolean;
  closeReason: string;
  openTime: string;
  isMaintenance: boolean;
  maintNotice: string;
  maintEndTime: string;
}

export function StoreControlForm({ initialData }: { initialData: StoreControlData | null }) {
  const [isSaving, setIsSaving] = useState(false);

  // 🔴 1. Store Close State
  const [isSiteClosed, setIsSiteClosed] = useState(initialData?.isSiteClosed ?? false);
  const [closeReason, setCloseReason] = useState(initialData?.closeReason ?? "");
  const [openTime, setOpenTime] = useState(initialData?.openTime ?? "08:00 AM");
  const [showOpenTimePicker, setShowOpenTimePicker] = useState(false);

  // 🟡 2. Maintenance Mode State
  const [isMaintenance, setIsMaintenance] = useState(initialData?.isMaintenance ?? false);
  const [maintNotice, setMaintNotice] = useState(initialData?.maintNotice ?? "");
  const [maintEndTime, setMaintEndTime] = useState(initialData?.maintEndTime ?? "06:00 AM");
  const [showMaintTimePicker, setShowMaintTimePicker] = useState(false);

  // 🔄 Mutually Exclusive Switch Handlers
  const handleSiteClosedChange = (checked: boolean) => {
    setIsSiteClosed(checked);
    if (checked) {
      setIsMaintenance(false);
    }
  };

  const handleMaintenanceChange = (checked: boolean) => {
    setIsMaintenance(checked);
    if (checked) {
      setIsSiteClosed(false);
    }
  };

  // 💾 Save Handler
  const handleSaveSettings = async () => {
    setIsSaving(true);
    const res = await updateStoreControl({
      isSiteClosed,
      closeReason,
      openTime,
      isMaintenance,
      maintNotice,
      maintEndTime,
    });

    setIsSaving(false);
    if (res?.success) {
      toast.success("Store operational settings updated!");
    } else {
      toast.error(res?.error || "Failed to update settings");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 flex items-center gap-2">
            <Store className="w-5 h-5 text-neutral-700 dark:text-neutral-300" />
            Store Operational Control
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Manage temporary site closures, schedule opening hours, and configure maintenance mode.
          </p>
        </div>

        <button
          onClick={handleSaveSettings}
          disabled={isSaving}
          className="h-9 px-4 rounded-md bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 font-medium text-sm flex items-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {/* 🔴 CARD 1: CLOSE YOUR SITE */}
      <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-5 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
              <Store className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                Close Your Site
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Temporarily suspend store orders and display a custom closure dialog to visitors.
              </p>
            </div>
          </div>

          <Switch
            checked={isSiteClosed}
            disabled={isSaving}
            onCheckedChange={handleSiteClosedChange}
            className="data-[state=checked]:bg-rose-600"
          />
        </div>

        {isSiteClosed && (
          <div className="space-y-4 pt-4 border-t border-neutral-100 dark:border-neutral-800 animate-in fade-in duration-200">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
                Closure Reason
              </label>
              <textarea
                rows={3}
                value={closeReason}
                onChange={(e) => setCloseReason(e.target.value)}
                placeholder="Enter the reason for closing the site (e.g., Stock update, Holiday, Emergency)..."
                className="w-full p-3 rounded-md border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 text-sm focus:outline-none focus:ring-1 focus:ring-rose-500 transition-all resize-none placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
                Expected Opening Time
              </label>

              <div
                onClick={() => setShowOpenTimePicker(true)}
                className="w-full h-11 px-3.5 rounded-md border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 flex items-center justify-between cursor-pointer hover:border-neutral-300 dark:hover:border-neutral-700 transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                    Reopening at <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{openTime}</span>
                  </span>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                  Set Opening Time
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 🟡 CARD 2: MAINTENANCE MODE */}
      <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-5 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                Maintain Your Website
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Enable system maintenance overlay for technical upgrades or database optimization.
              </p>
            </div>
          </div>

          <Switch
            checked={isMaintenance}
            disabled={isSaving}
            onCheckedChange={handleMaintenanceChange}
            className="data-[state=checked]:bg-amber-500"
          />
        </div>

        {isMaintenance && (
          <div className="space-y-4 pt-4 border-t border-neutral-100 dark:border-neutral-800 animate-in fade-in duration-200">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
                Maintenance Notice
              </label>
              <textarea
                rows={3}
                value={maintNotice}
                onChange={(e) => setMaintNotice(e.target.value)}
                placeholder="Write brief message for your users during maintenance..."
                className="w-full p-3 rounded-md border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all resize-none placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
                Expected Maintenance End Time
              </label>

              <div
                onClick={() => setShowMaintTimePicker(true)}
                className="w-full h-11 px-3.5 rounded-md border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 flex items-center justify-between cursor-pointer hover:border-neutral-300 dark:hover:border-neutral-700 transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-amber-500" />
                  <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                    Expected End: <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{maintEndTime}</span>
                  </span>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                  Set End Time
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 🕒 TIME PICKER DIALOG FOR SITE CLOSURE */}
      {showOpenTimePicker && (
        <SingleTimePickerModal
          title="Set Expected Reopening Time"
          label="Opening Time"
          timeValue={openTime}
          onSave={(selectedTime) => {
            setOpenTime(selectedTime);
            setShowOpenTimePicker(false);
          }}
          onClose={() => setShowOpenTimePicker(false)}
        />
      )}

      {/* 🕒 TIME PICKER DIALOG FOR MAINTENANCE */}
      {showMaintTimePicker && (
        <SingleTimePickerModal
          title="Set Expected Maintenance End Time"
          label="End Time"
          timeValue={maintEndTime}
          onSave={(selectedTime) => {
            setMaintEndTime(selectedTime);
            setShowMaintTimePicker(false);
          }}
          onClose={() => setShowMaintTimePicker(false)}
        />
      )}
    </div>
  );
}

interface SingleTimePickerModalProps {
  title: string;
  label: string;
  timeValue: string;
  onSave: (time: string) => void;
  onClose: () => void;
}

function SingleTimePickerModal({ title, label, timeValue, onSave, onClose }: SingleTimePickerModalProps) {
  const parseTimeString = (timeStr: string) => {
    if (!timeStr) return { hour: "08", minute: "00", period: "AM" };

    const upper = timeStr.trim().toUpperCase();
    let period = "AM";
    let cleanTime = upper;

    if (upper.includes("AM")) {
      period = "AM";
      cleanTime = upper.replace("AM", "").trim();
    } else if (upper.includes("PM")) {
      period = "PM";
      cleanTime = upper.replace("PM", "").trim();
    } else {
      const parts = upper.split(":");
      let h = parseInt(parts[0] || "8", 10);
      if (h >= 12) {
        period = "PM";
        if (h > 12) h -= 12;
      } else {
        period = "AM";
        if (h === 0) h = 12;
      }
      return {
        hour: String(h).padStart(2, "0"),
        minute: (parts[1] || "00").padStart(2, "0"),
        period,
      };
    }

    const [h, m] = cleanTime.split(":");
    return {
      hour: (h || "08").padStart(2, "0"),
      minute: (m || "00").padStart(2, "0"),
      period,
    };
  };

  const initialTime = parseTimeString(timeValue);
  const [hour, setHour] = useState(initialTime.hour);
  const [minute, setMinute] = useState(initialTime.minute);
  const [period, setPeriod] = useState<"AM" | "PM">(initialTime.period as "AM" | "PM");

  const handleApply = () => {
    let numH = parseInt(hour, 10);
    if (isNaN(numH) || numH < 1) numH = 12;
    if (numH > 12) numH = 12;

    let numM = parseInt(minute, 10);
    if (isNaN(numM) || numM < 0) numM = 0;
    if (numM > 59) numM = 59;

    const formattedH = String(numH).padStart(2, "0");
    const formattedM = String(numM).padStart(2, "0");

    onSave(`${formattedH}:${formattedM} ${period}`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-5 w-full max-w-xs space-y-5 shadow-xl">
        <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 p-1 rounded-md cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2 p-3 rounded-md bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
          <span className="text-xs font-semibold uppercase text-emerald-600 dark:text-emerald-400 block tracking-wider text-center">
            {label}
          </span>
          <div className="flex items-center justify-center gap-2">
            <input
              type="text"
              maxLength={2}
              value={hour}
              onChange={(e) => setHour(e.target.value)}
              placeholder="12"
              className="w-14 h-11 text-center rounded border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 text-lg font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <span className="font-bold text-lg text-neutral-900 dark:text-neutral-100">:</span>

            <input
              type="text"
              maxLength={2}
              value={minute}
              onChange={(e) => setMinute(e.target.value)}
              placeholder="00"
              className="w-14 h-11 text-center rounded border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 text-lg font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />

            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as "AM" | "PM")}
              className="h-11 px-2 rounded border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="AM">AM</option>
              <option value="PM">PM</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
          <button
            onClick={onClose}
            className="h-9 px-3.5 rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 font-medium text-xs hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="h-9 px-4 rounded-md bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 font-medium text-xs flex items-center gap-1 hover:opacity-90 transition-all cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            Apply Time
          </button>
        </div>
      </div>
    </div>
  );
}