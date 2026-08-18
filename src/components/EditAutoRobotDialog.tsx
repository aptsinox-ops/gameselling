"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { showToast } from "@/lib/toast";
import { Loader2, Trash2, X, Ticket } from "lucide-react";

interface ExistingVoucher {
  id: string;
  code: string;
  status: "ACTIVE" | "USED" | "EXPIRED";
  createdAt: string;
}

interface EditAutoRobotDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variation: {
    id: string;
    title: string;
    price: number;
    productName: string;
  } | null;
}

export function EditAutoRobotDialog({
  open,
  onOpenChange,
  variation,
}: EditAutoRobotDialogProps) {
  const [existingVouchers, setExistingVouchers] = useState<ExistingVoucher[]>([]);
  const [loadingVouchers, setLoadingVouchers] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // New Vouchers tag-input state
  const [inputValue, setInputValue] = useState("");
  const [newCodes, setNewCodes] = useState<string[]>([]);
  const [addingCodes, setAddingCodes] = useState(false);

  useEffect(() => {
    if (open && variation) {
      fetchVouchers();
    } else {
      setExistingVouchers([]);
      setNewCodes([]);
      setInputValue("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, variation?.id]);

  const fetchVouchers = async () => {
    if (!variation) return;
    setLoadingVouchers(true);
    try {
      const res = await fetch(
        `/api/autorobot/vouchers?variationId=${variation.id}`
      );
      if (res.ok) {
        const data = await res.json();
        setExistingVouchers(data);
      }
    } catch (err) {
      console.error("Failed to fetch vouchers:", err);
    } finally {
      setLoadingVouchers(false);
    }
  };

  const handleDeleteVoucher = async (voucherId: string) => {
    setDeletingId(voucherId);
    try {
      const res = await fetch("/api/autorobot/vouchers", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voucherId }),
      });
      if (!res.ok) throw new Error();
      setExistingVouchers((prev) => prev.filter((v) => v.id !== voucherId));
      showToast.success("Voucher removed");
    } catch {
      showToast.error("Failed to remove voucher");
    } finally {
      setDeletingId(null);
    }
  };

  // প্রতি ২টা আইটেম (Serial + PIN) পর পর স্প্লিট করে ট্যাগ বানানোর ফিক্সড লজিক
  const extractAndAddCodes = (text: string) => {
    if (!text) return;

    const tokens = text.trim().split(/\s+/).filter(Boolean);
    const extracted: string[] = [];

    for (let i = 0; i < tokens.length; i += 2) {
      if (tokens[i + 1]) {
        extracted.push(`${tokens[i]} ${tokens[i + 1]}`);
      } else {
        extracted.push(tokens[i]);
      }
    }

    if (extracted.length > 0) {
      setNewCodes((prev) => Array.from(new Set([...prev, ...extracted])));
      setInputValue("");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      extractAndAddCodes(inputValue);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("text");
    extractAndAddCodes(pastedText);
  };

  const handleRemoveNewCode = (codeToRemove: string) => {
    setNewCodes((prev) => prev.filter((code) => code !== codeToRemove));
  };

  const handleAddMoreCodes = async () => {
    if (!variation || newCodes.length === 0) return;
    setAddingCodes(true);
    const toastId = showToast.loading("Adding UniPin Vouchers...");
    try {
      const res = await fetch("/api/autorobot/vouchers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          variationId: variation.id,
          vouchers: newCodes,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add vouchers");

      showToast.dismiss(toastId);
      showToast.success(data.message || `${newCodes.length} Vouchers added!`);
      setNewCodes([]);
      setInputValue("");
      fetchVouchers();
    } catch (err: any) {
      showToast.dismiss(toastId);
      showToast.error(err.message || "Something went wrong!");
    } finally {
      setAddingCodes(false);
    }
  };

  const statusBadgeClass = (status: string) =>
    status === "ACTIVE"
      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400"
      : status === "USED"
      ? "bg-neutral-200 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
      : "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400";

  if (!variation) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white dark:bg-[#121212] border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white sm:max-w-[520px] p-6 rounded-2xl shadow-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="mt-1 mb-2 text-xl font-bold tracking-tight flex items-center gap-2">
          Add Unipin Vouchers
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-1">
          {/* Disabled Product & Variation Name Field */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
              Product Variation
            </Label>
            <Input
              value={`${variation.productName} — ${variation.title}`}
              disabled
              className="bg-neutral-100 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 h-11 rounded-xl font-semibold opacity-80 cursor-not-allowed text-sm"
            />
          </div>

          {/* New UniPin Voucher Code Input (Pill Tag Box) */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
              Add UniPin Vouchers ({newCodes.length})
            </Label>

            <div className="min-h-[110px] p-3 bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-xl flex flex-col gap-2 items-stretch focus-within:ring-1 focus-within:ring-primary max-h-[220px] overflow-y-auto">
              {/* Added Codes as Full-Width Pill Rows */}
                            <input
                type="text"
                placeholder={
                  newCodes.length === 0
                    ? "Paste codes (Serial + PIN) or press Enter to add..."
                    : "Add more codes..."
                }
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onPaste={handlePaste}
                className="w-full bg-transparent border-none outline-none font-mono text-xs py-2 px-1 text-neutral-900 dark:text-white placeholder:text-neutral-400"
              />
              {newCodes.map((code) => (
                <div
                  key={code}
                  className="w-full flex items-center justify-between px-2 py-1 rounded-md bg-primary/20 text-primary border border-primary/30 font-mono text-sm font-bold animate-in fade-in-50"
                >
                  <span className="truncate pr-2">{code}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveNewCode(code)}
                    className="hover:bg-primary/20 p-1 rounded-full transition-all focus:outline-none shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Existing Vouchers Section */}
          <div className="border-t border-neutral-200 dark:border-neutral-800 pt-4 space-y-1.5">
            <Label className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
              Existing Vouchers ({existingVouchers.length})
            </Label>
            <div className="max-h-40 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {loadingVouchers ? (
                <div className="flex items-center justify-center py-6 text-neutral-400">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              ) : existingVouchers.length === 0 ? (
                <div className="text-xs text-neutral-400 text-center py-4">
                  No vouchers added yet for this variation.
                </div>
              ) : (
                existingVouchers.map((v) => (
                  <div
                    key={v.id}
                    className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 font-mono text-xs"
                  >
                    <span className="truncate max-w-[220px] font-bold text-neutral-900 dark:text-white text-sm">
                      {v.code}
                    </span>
                    <div className="flex items-center gap-2">
                      <Badge
                        className={`text-[10px] font-bold rounded-full px-2.5 py-0.5 ${statusBadgeClass(
                          v.status
                        )}`}
                      >
                        {v.status}
                      </Badge>
                      <button
                        onClick={() => handleDeleteVoucher(v.id)}
                        disabled={deletingId === v.id}
                        className="text-rose-500 hover:text-rose-600 disabled:opacity-40 p-1"
                      >
                        {deletingId === v.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Modal Buttons */}
        <div className="flex justify-start gap-2 pt-4 items-center border-t border-neutral-200 dark:border-neutral-800 mt-2">
          <Button
            type="button"
            className="font-bold h-11 px-7 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:opacity-90 transition-all disabled:opacity-40"
            onClick={handleAddMoreCodes}
            disabled={newCodes.length === 0 || addingCodes}
          >
            {addingCodes && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save & Add Vouchers ({newCodes.length})
          </Button>
          <Button
            variant="outline"
            type="button"
            className="px-6 h-11 rounded-xl ml-auto border-neutral-200 dark:border-neutral-800"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}