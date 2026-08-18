"use client";

import React, { useState, useEffect, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { showToast } from "@/lib/toast";
import { Loader2, Ticket, CheckCircle2, AlertTriangle, XCircle, Info } from "lucide-react";

interface AddAutoRobotDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export type CodeStatusType = "active" | "used" | "expired" | "invalid";

export interface CodeValidationResult {
  code: string;
  status: CodeStatusType;
  message: string;
}

interface VariationItem {
  id: string;
  title: string;
  productName: string;
}

export function AddAutoRobotDialog({ open, onOpenChange }: AddAutoRobotDialogProps) {
  const [variations, setVariations] = useState<VariationItem[]>([]);
  const [selectedVariation, setSelectedVariation] = useState<string>("");
  const [rawCodesText, setRawCodesText] = useState<string>("");
  const [codeResults, setCodeResults] = useState<CodeValidationResult[]>([]);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [loadingSubmit, setLoadingSubmit] = useState<boolean>(false);
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (open) {
      fetchVariations();
    } else {
      resetForm();
    }
  }, [open]);

  const fetchVariations = async () => {
    try {
      const res = await fetch("/api/admin/autorobot/vouchers");
      if (res.ok) {
        const data = await res.json();
        setVariations(data);
      }
    } catch (error) {
      console.error("Failed to fetch variations:", error);
    }
  };

  const resetForm = () => {
    setSelectedVariation("");
    setRawCodesText("");
    setCodeResults([]);
    setIsChecking(false);
    setLoadingSubmit(false);
  };

  // লাইভ ভাউচার কোড ভ্যালিডেশন লজিক
  useEffect(() => {
    const lines = rawCodesText
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (lines.length === 0) {
      setCodeResults([]);
      setIsChecking(false);
      return;
    }

    const timer = setTimeout(() => {
      setIsChecking(true);
      
      const results: CodeValidationResult[] = lines.map((code) => {
        const upperCode = code.toUpperCase();
        
        // ভাউচার চেক সিমুলেশন / ফরম্যাট চেক
        if (code.length < 6) {
          return { code, status: "invalid", message: "Invalid Format" };
        } else if (upperCode.includes("USED")) {
          return { code, status: "used", message: "Already Used" };
        } else if (upperCode.includes("EXP")) {
          return { code, status: "expired", message: "Expired Code" };
        } else {
          return { code, status: "active", message: "Active & Available" };
        }
      });

      startTransition(() => {
        setCodeResults(results);
        setIsChecking(false);
      });
    }, 250);

    return () => clearTimeout(timer);
  }, [rawCodesText]);

  const parsedCodesCount = codeResults.length;
  
  // বাটন এনাবল করার মূল লজিক: ১টিও অকার্যকর কোড থাকলে বা ভ্যারিয়েশন সিলেক্ট না থাকলে ডিজেবল থাকবে
  const isAllActive =
    parsedCodesCount > 0 &&
    codeResults.every((item) => item.status === "active") &&
    Boolean(selectedVariation);

  const activeCount = codeResults.filter((item) => item.status === "active").length;
  const invalidOrIssueCount = parsedCodesCount - activeCount;

  const handleAddVouchers = async () => {
    if (!selectedVariation) {
      showToast.error("Please select a product variation!");
      return;
    }

    if (!isAllActive) {
      showToast.error("All voucher codes must be Active before adding!");
      return;
    }

    setLoadingSubmit(true);
    const toastId = showToast.loading("Adding UniPin Vouchers...");

    try {
      const activeCodes = codeResults.map((item) => item.code);
      const res = await fetch("/api/admin/autorobot/vouchers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          variationId: selectedVariation,
          vouchers: activeCodes,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add vouchers");

      showToast.dismiss(toastId);
      showToast.success(data.message || `${activeCodes.length} Vouchers added successfully!`);
      onOpenChange(false);
      window.location.reload();
    } catch (error: any) {
      showToast.dismiss(toastId);
      showToast.error(error.message || "Something went wrong!");
    } finally {
      setLoadingSubmit(false);
    }
  };

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white dark:bg-[#121212] border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white sm:max-w-[500px] p-6 rounded-2xl shadow-2xl">
        <DialogHeader>
          <DialogTitle className="mt-1 mb-2 text-xl font-bold tracking-tight flex items-center gap-2">
            <Ticket className="h-5 w-5 text-primary" /> Add UniPin Auto Vouchers
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-1">
          {/* Variation Dropdown */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
              Select Product Variation
            </Label>
            <Select value={selectedVariation} onValueChange={setSelectedVariation}>
              <SelectTrigger className="w-full bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 h-11 rounded-xl font-medium">
                <SelectValue placeholder="Choose Auto Topup / Auto Delivery Variation" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-[#121212] border-neutral-200 dark:border-neutral-800">
                {variations.length > 0 ? (
                  variations.map((v) => (
                    <SelectItem key={v.id} value={v.id} className="cursor-pointer font-medium">
                      {v.productName} — {v.title}
                    </SelectItem>
                  ))
                ) : (
                  <div className="p-3 text-xs text-center text-neutral-500">
                    No Auto Topup variations active.
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Code Input Field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
                UniPin Voucher Codes
              </Label>
              <span className="text-xs text-neutral-400">One code per line</span>
            </div>
            <Textarea
              rows={4}
              placeholder={`Paste UniPin voucher codes here...\nExample:\nUPBD-1234-5678-9012\nUPBD-9876-5432-1098`}
              value={rawCodesText}
              onChange={(e) => setRawCodesText(e.target.value)}
              className="bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 rounded-xl font-mono text-xs focus:ring-1 focus:ring-primary p-3"
            />
          </div>

          {/* Live Code Status Highlights Output */}
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

          {/* Dynamic Warning Notice */}
          {parsedCodesCount > 0 && !isAllActive && (
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs flex items-center gap-2 font-medium">
              <Info className="h-4 w-4 shrink-0" />
              <span>All codes must be <strong>Active</strong> to enable the Add button. Remove invalid/used codes.</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-start gap-2 pt-4 items-center border-t border-neutral-200 dark:border-neutral-800 mt-2">
          <Button
            type="button"
            className="font-bold h-11 px-7 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:opacity-90 transition-all disabled:opacity-40"
            onClick={handleAddVouchers}
            disabled={!isAllActive || loadingSubmit || isChecking}
          >
            {loadingSubmit && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Add Vouchers ({activeCount})
          </Button>
          <Button
            variant="outline"
            type="button"
            className="px-6 h-11 rounded-xl ml-auto border-neutral-200 dark:border-neutral-800"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}