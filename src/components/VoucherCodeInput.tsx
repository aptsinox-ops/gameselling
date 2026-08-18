// src/components/autorobot/VoucherCodeInput.tsx
"use client";

import React, { useEffect, useState, useTransition } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Info } from "lucide-react";

export type CodeStatusType = "active" | "used" | "expired" | "invalid";

export interface CodeValidationResult {
  code: string;
  status: CodeStatusType;
  message: string;
}

interface VoucherCodeInputProps {
  onResultsChange: (results: CodeValidationResult[], isChecking: boolean) => void;
  placeholder?: string;
}

/**
 * Reusable "paste codes -> live status list" block.
 * Used by both AddAutoRobotDialog and EditAutoRobotDialog so the
 * logic only lives in one place.
 *
 * NOTE: the validation below is only a FORMAT / naming simulation
 * (same as your original code) — it does not call UniPin yet.
 * Swap the logic inside the setTimeout with a real UniPin
 * "check code" API call once you share that endpoint.
 */
export function VoucherCodeInput({ onResultsChange, placeholder }: VoucherCodeInputProps) {
  const [rawCodesText, setRawCodesText] = useState("");
  const [codeResults, setCodeResults] = useState<CodeValidationResult[]>([]);
  const [, startTransition] = useTransition();

  useEffect(() => {
    const lines = rawCodesText
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (lines.length === 0) {
      setCodeResults([]);
      onResultsChange([], false);
      return;
    }

    onResultsChange(codeResults, true);

    const timer = setTimeout(() => {
      const results: CodeValidationResult[] = lines.map((code) => {
        const upperCode = code.toUpperCase();
        if (code.length < 6) return { code, status: "invalid", message: "Invalid Format" };
        if (upperCode.includes("USED")) return { code, status: "used", message: "Already Used" };
        if (upperCode.includes("EXP")) return { code, status: "expired", message: "Expired Code" };
        return { code, status: "active", message: "Active & Available" };
      });

      startTransition(() => {
        setCodeResults(results);
        onResultsChange(results, false);
      });
    }, 250);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawCodesText]);

  const getStatusBadge = (status: CodeStatusType) => {
    switch (status) {
      case "active":
        return (
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold text-xs">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Active
          </div>
        );
      case "used":
        return (
          <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-semibold text-xs">
            <span className="h-2 w-2 rounded-full bg-rose-500" />
            Used
          </div>
        );
      case "expired":
        return (
          <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-semibold text-xs">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            Expired
          </div>
        );
      case "invalid":
      default:
        return (
          <div className="flex items-center gap-1.5 text-neutral-500 dark:text-neutral-400 font-semibold text-xs">
            <span className="h-2 w-2 rounded-full bg-neutral-400 dark:bg-neutral-600" />
            Not Available
          </div>
        );
    }
  };

  const parsedCodesCount = codeResults.length;
  const activeCount = codeResults.filter((c) => c.status === "active").length;
  const invalidOrIssueCount = parsedCodesCount - activeCount;
  const isAllActive = parsedCodesCount > 0 && activeCount === parsedCodesCount;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
          UniPin Voucher Codes
        </Label>
        <span className="text-xs text-neutral-400">One code per line</span>
      </div>
      <Textarea
        rows={4}
        placeholder={
          placeholder ??
          `Paste UniPin voucher codes here...\nExample:\nUPBD-1234-5678-9012\nUPBD-9876-5432-1098`
        }
        value={rawCodesText}
        onChange={(e) => setRawCodesText(e.target.value)}
        className="bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 rounded-xl font-mono text-xs focus:ring-1 focus:ring-primary p-3"
      />

      {codeResults.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-bold uppercase tracking-wider text-neutral-500">
              Live Status Output ({parsedCodesCount} Codes)
            </Label>
            {invalidOrIssueCount > 0 && (
              <span className="text-xs text-rose-500 font-semibold flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" /> {invalidOrIssueCount} issue(s) detected
              </span>
            )}
          </div>

          <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
            {codeResults.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-primary/20 border border-primary/30 font-mono text-xs shadow-sm"
              >
                <span className="truncate max-w-[260px] font-bold text-neutral-900 dark:text-white">
                  {item.code}
                </span>
                {getStatusBadge(item.status)}
              </div>
            ))}
          </div>
        </div>
      )}

      {parsedCodesCount > 0 && !isAllActive && (
        <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs flex items-center gap-2 font-medium">
          <Info className="h-4 w-4 shrink-0" />
          <span>
            All codes must be <strong>Active</strong> to enable the Add button. Remove invalid/used codes.
          </span>
        </div>
      )}
    </div>
  );
}