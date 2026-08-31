"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface SaveButtonProps {
  onClick: () => void;
  loading: boolean;
  label?: string;
  loadingLabel?: string;
}

export default function SaveButton({
  onClick,
  loading,
  label = "UPDATE SETTINGS",
  loadingLabel = "UPDATING...",
}: SaveButtonProps) {
  return (
    <div>
      <hr className="w-full h-[1px] bg-neutral-200 dark:bg-neutral-800/60 border-none my-5" />
      <Button
        onClick={onClick}
        disabled={loading}
        className="bg-neutral-900 dark:bg-white hover:bg-neutral-800 dark:hover:bg-white/90 text-white dark:text-neutral-900 px-6 py-4 rounded-lg font-bold flex gap-2 items-center text-xs shadow transition-all mb-20"
      >
        {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
        {loading ? loadingLabel : label}
      </Button>
    </div>
  );
}