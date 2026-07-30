// 📁 src/components/rich-editor.tsx

"use client";

interface RichEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
}

export function RichEditor({ value, onChange, placeholder }: RichEditorProps) {
  return (
    <textarea
      value={value || ""}
      onChange={(e) => onChange && onChange(e.target.value)}
      placeholder={placeholder || "বিস্তারিত লিখুন..."}
      className="w-full min-h-[120px] p-3 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
    />
  );
}