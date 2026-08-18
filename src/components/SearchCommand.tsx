"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

interface SearchCommandProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  items: Array<{
    group: string;
    list: Array<{ title: string; url: string; icon: React.ElementType }>;
  }>;
}

export function SearchCommand({ open, setOpen, items }: SearchCommandProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();

  // Filter items based on query
  const filteredGroups = useMemo(() => {
    return items
      .map((group) => ({
        ...group,
        list: group.list.filter((item) =>
          item.title.toLowerCase().includes(query.toLowerCase())
        ),
      }))
      .filter((group) => group.list.length > 0);
  }, [items, query]);

  // Flattened array for keyboard index navigation
  const flatItems = useMemo(() => {
    return filteredGroups.flatMap((group) => group.list);
  }, [filteredGroups]);

  // Reset selected index when search query or dialog state changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query, open]);

  const handleSelect = (url: string) => {
    router.push(url);
    setOpen(false);
    setQuery("");
  };

  // Keyboard navigation logic (Ctrl+K, Esc, ArrowUp, ArrowDown, Enter)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(!open);
        return;
      }

      if (!open) return;

      if (e.key === "Escape") {
        setOpen(false);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          flatItems.length > 0 ? (prev + 1) % flatItems.length : 0
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          flatItems.length > 0 ? (prev - 1 + flatItems.length) % flatItems.length : 0
        );
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (flatItems.length > 0 && flatItems[selectedIndex]) {
          handleSelect(flatItems[selectedIndex].url);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, setOpen, flatItems, selectedIndex]);

  if (!open) return null;

  let globalIndex = 0;

  return (
    /* Backdrop - Clicking outside closes dialog */
    <div 
      onClick={() => setOpen(false)}
      className="fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-20 md:pt-28 bg-black/50 backdrop-blur-xs transition-all duration-200"
    >
      {/* Dialog Container - Adjusted max-width for PC/Mobile responsiveness */}
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-sm sm:max-w-xl md:max-w-2xl mx-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Search Header Input */}
        <div className="flex items-center px-4 py-1 border-b border-neutral-200 dark:border-neutral-800">
          <Search className="h-4 w-4 text-neutral-400 shrink-0 mr-3" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products, pages, and features..."
            className="w-full h-12 bg-transparent text-sm md:text-base text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none pr-2"
          />
          
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="ml-auto shrink-0 flex items-center justify-center rounded border border-neutral-200/80 dark:border-neutral-700 bg-neutral-100/80 dark:bg-neutral-800 px-2 py-0.5 text-xs font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors cursor-pointer shadow-xs"
          >
            Esc
          </button>
        </div>

        {/* Search Results List */}
        <div className="max-h-96 overflow-y-auto p-2 no-scrollbar">
          {filteredGroups.length === 0 ? (
            <div className="py-12 text-center text-xs md:text-sm text-neutral-500">
              No results found for &quot;{query}&quot;
            </div>
          ) : (
            filteredGroups.map((group) => (
              <div key={group.group} className="mb-3 last:mb-0">
                <div className="px-3 py-1.5 text-[11px] font-semibold tracking-wider uppercase text-neutral-400 dark:text-neutral-500">
                  {group.group}
                </div>
                {group.list.map((item) => {
                  const Icon = item.icon;
                  const currentIndex = globalIndex++;
                  const isSelected = currentIndex === selectedIndex;

                  return (
                    <button
                      key={item.url}
                      onClick={() => handleSelect(item.url)}
                      onMouseEnter={() => setSelectedIndex(currentIndex)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs md:text-sm font-medium transition-all duration-150 ${
                        isSelected
                          ? "bg-primary/20 dark:bg-primary/30 text-primary font-semibold"
                          : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/60"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`h-4 w-4 ${isSelected ? "text-primary" : "text-neutral-400"}`} />
                        <span>{item.title}</span>
                      </div>
                      <span className={`text-xs ${isSelected ? "text-primary/80" : "text-neutral-400"}`}>
                        {item.url}
                      </span>
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Cloudflare Style Footer Shortcuts */}
        <div className="flex items-center gap-4 px-4 py-2.5 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-950/80 text-xs text-neutral-500 dark:text-neutral-400">
          <div className="flex items-center gap-1.5">
            <kbd className="inline-flex h-5 w-5 items-center justify-center rounded border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-[10px] text-neutral-600 dark:text-neutral-300 shadow-2xs font-sans">
              ↑
            </kbd>
            <kbd className="inline-flex h-5 w-5 items-center justify-center rounded border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-[10px] text-neutral-600 dark:text-neutral-300 shadow-2xs font-sans">
              ↓
            </kbd>
            <span className="text-[11px] text-neutral-500 dark:text-neutral-400">to navigate</span>
          </div>

          <div className="flex items-center gap-1.5">
            <kbd className="inline-flex h-5 px-1.5 items-center justify-center rounded border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-[10px] text-neutral-600 dark:text-neutral-300 shadow-2xs font-sans">
              ↵
            </kbd>
            <span className="text-[11px] text-neutral-500 dark:text-neutral-400">to select</span>
          </div>
        </div>
      </div>
    </div>
  );
}