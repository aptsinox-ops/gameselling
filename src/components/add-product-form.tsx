"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2, ChevronDown, Check, X, Zap } from "lucide-react"; 
import { showToast } from "@/lib/toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { ImageUploader } from "@/components/ui/image-uploader";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import UnderlineExtension from '@tiptap/extension-underline';
import TiptapImage from '@tiptap/extension-image';
import LinkExtension from '@tiptap/extension-link';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCallback } from "react";
import { 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough, 
  Link2, 
  Quote, 
  Code, 
  List, 
  ListOrdered, 
  Image as ImageIcon
} from "lucide-react";

const generateSlug = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
};

interface Category {
  id: string;
  name: string;
}

interface AddProductFormProps { onCancel: () => void; }

export function AddProductForm({ onCancel }: AddProductFormProps) {
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [loadingCreateOthers, setLoadingCreateOthers] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [open, setOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [dynamicFields, setDynamicFields] = useState<{ label: string }[]>([{ label: "" }]);
  const [typeOpen, setTypeOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const productTypeOptions = ["Uid Topup", "In-Game", "Vouchers", "Subcriptions", "Gift Card"];
  
  const [formData, setFormData] = useState<any>({
    name: "", 
    slug: "", 
    categoryId: "", 
    resellerPercentage: 0,
    tutorialLink: "", 
    status: "ON", 
    productType: "",          
    variationsDesign: "Grid", 
    isFreeFireAuto: false,   
    isUidNameChecker: false,  
    isCoinSystem: false,     
    isPremiumUser: false,    
    isBanner: false,          
    productImage: null,      
    variationIcon: null,     
    bannerImage: null,        
    autoDeliveryType: "UNIPIN", 
    description: "",
    isTagEnabled: true,      
    tagType: "AUTO",         
    productTag: "AUTO DELIVERY",          
    tagColor: "#2563eb",     
    tagBgColor: "#1e3a8a",   
    tagIcon: null            
  });

  // লোকাল স্টেটসমূহ
  const [isTagEnabled, setIsTagEnabled] = useState(formData.isTagEnabled);
  const [tagType, setTagType] = useState<"AUTO" | "CUSTOM">(formData.tagType);
  const [customTagValue, setCustomTagValue] = useState("");

  const handleNameChange = (val: string) => {
    setFormData({ ...formData, name: val, slug: generateSlug(val) });
  };

  useEffect(() => {
    fetch("/api/categories")
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to load categories");
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          return res.json();
        }
        throw new Error("Server returned invalid response");
      })
      .then((data) => setCategories(data))
      .catch(() => showToast.error("Failed to load categories"));
  }, []);

  const selectedCategory = categories.find((cat) => cat.id === formData.categoryId);

  // 🟢 সাবমিট ও ইমেজ আপলোড লজিক (লোডিং ও টোস্ট সহ)
  const handleCreate = async (createAnother: boolean) => {
    const toastId = showToast.loading("Creating product...");
    try {
      if (createAnother) setLoadingCreateOthers(true); else setLoadingCreate(true);

      let productImageUrl = "";
      let variationIconUrl = "";
      let bannerImageUrl = "";
      let tagIconUrl = "";

      // ১. মেইন প্রোডাক্ট ইমেজ আপলোড
      if (formData.productImage instanceof File) {
        const data = new FormData();
        data.append("file", formData.productImage); 
        const res = await fetch("/api/upload", { method: "POST", body: data });
        const resData = await res.json();
        if (resData.url) productImageUrl = resData.url;
      } else if (typeof formData.productImage === "string") {
        productImageUrl = formData.productImage;
      }

      // ২. ভ্যারিয়েশন আইকন আপলোড
      if (formData.variationIcon instanceof File) {
        const data = new FormData();
        data.append("file", formData.variationIcon);
        const res = await fetch("/api/upload", { method: "POST", body: data });
        const resData = await res.json();
        if (resData.url) variationIconUrl = resData.url;
      } else if (typeof formData.variationIcon === "string") {
        variationIconUrl = formData.variationIcon;
      }

      // ৩. ব্যানার ইমেজ আপলোড
      if (formData.bannerImage instanceof File) {
        const data = new FormData();
        data.append("file", formData.bannerImage);
        const res = await fetch("/api/upload", { method: "POST", body: data });
        const resData = await res.json();
        if (resData.url) bannerImageUrl = resData.url;
      } else if (typeof formData.bannerImage === "string") {
        bannerImageUrl = formData.bannerImage;
      }

      // ৪. ট্যাগ আইকন আপলোড
      if (isTagEnabled && formData.tagIcon instanceof File) {
        const data = new FormData();
        data.append("file", formData.tagIcon);
        const res = await fetch("/api/upload", { method: "POST", body: data });
        const resData = await res.json();
        if (resData.url) tagIconUrl = resData.url;
      }

      // 🟢 Requirement 5: Create Button Logic (isFreeFireAuto)
      const isUidTopup = formData.productType === "Uid Topup";
      
      // 🟢 ফাইনাল পেলোড জেনারেশন
      const payload = {
        ...formData,
        isFreeFireAuto: isUidTopup ? true : false, // Automatic logic as per req 5
        isBanner: bannerImageUrl ? true : formData.isBanner,
        image: productImageUrl || "/uploads/placeholder.png", 
        productImage: productImageUrl, 
        variationIcon: variationIconUrl,
        bannerImage: bannerImageUrl || null,
        tagIcon: tagIconUrl,
        dynamicFields: dynamicFields,
        description: editor?.getHTML() || formData.description
      };

      const response = await fetch("/api/products/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      
      showToast.dismiss(toastId);

      if (result.success) {
        showToast.success("Product created successfully!");
        if (!createAnother && onCancel) {
          onCancel();
        }
      } else {
        showToast.error(result.error || "Failed to create product");
      }

    } catch (error) {
      showToast.dismiss(toastId);
      console.error(error);
      showToast.error("Something went wrong!");
    } finally {
      setLoadingCreate(false);
      setLoadingCreateOthers(false);
    }
  };

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2] },
      }),
      UnderlineExtension,
      TiptapImage.configure({ inline: true, allowBase64: true }),
      LinkExtension.configure({ openOnClick: false }),
    ],
    content: formData.description,
    immediatelyRender: false, 
    editorProps: {
      attributes: {
        class: 'tiptap-editor w-full flex-1 bg-transparent p-4 text-sm text-white placeholder-neutral-600 focus:outline-none min-h-[300px] max-w-none focus:ring-0',
      },
    },
    onUpdate: ({ editor }) => {
      setFormData((prev: any) => ({ ...prev, description: editor.getHTML() }));
    },
  });

  const addImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = () => {
      if (input.files?.[0]) {
        const reader = new FileReader();
        reader.onload = () => {
          if (editor && reader.result) {
            editor.chain().focus().setImage({ src: reader.result as string }).run();
          }
        };
        reader.readAsDataURL(input.files[0]);
      }
    };
    input.click();
  };

  const handleTagToggle = (checked: boolean) => {
    setIsTagEnabled(checked);
    setFormData((prev: any) => ({
      ...prev,
      isTagEnabled: checked,
      ...(checked 
        ? (tagType === "AUTO" 
          ? { productTag: "AUTO DELIVERY", tagColor: "#2563eb", tagBgColor: "#1e3a8a" } 
          : { productTag: customTagValue })
        : { productTag: "", tagColor: "", tagBgColor: "", tagIcon: null })
    }));
  };

  return (
  <div className="w-full max-w-5xl bg-background border border-border rounded-2xl p-6 shadow-xl text-foreground">
    

    <div className="flex flex-col gap-5 w-full mb-4">
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        <div className="flex flex-col gap-2.5 w-full">
          <Label className="text-sm font-medium text-muted-foreground">Product Name</Label>
          <Input 
            type="text" 
            placeholder="Enter product name" 
            value={formData.name || ""} 
            onChange={(e) => handleNameChange(e.target.value)} 
            className="bg-transparent border-input rounded-xl text-foreground h-11 w-full" 
          />
        </div>
        <div className="flex flex-col gap-2.5 w-full">
          <Label className="text-sm font-medium text-muted-foreground">Product Slug</Label>
          <Input 
            type="text" 
            placeholder="product-slug" 
            value={formData.slug || ""} 
            readOnly 
            className="bg-muted/50 border-input rounded-xl text-muted-foreground h-11 cursor-not-allowed w-full" 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        <div className="flex flex-col gap-2.5 w-full">
          <Label className="text-sm font-medium text-muted-foreground">Product Type</Label>
          <Popover open={typeOpen} onOpenChange={setTypeOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex h-11 w-full items-center justify-between rounded-xl border border-input bg-background px-3 text-sm text-foreground hover:bg-accent hover:text-accent-foreground transition">
                {formData.productType || "Select Type"}
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 border-border bg-popover rounded-xl overflow-hidden z-50">
              <Command className="bg-popover">
                <CommandGroup>
                  {productTypeOptions.map((type: string) => (
                    <CommandItem 
                      key={type} 
                      onSelect={() => { 
                        let newFields = dynamicFields;
                        let nameChecker = false;

                        if (type === "Uid Topup") {
                          newFields = [{ label: "Enter Player UID" }];
                          nameChecker = true;
                        } else if (type === "Vouchers") {
                          newFields = []; 
                          nameChecker = false;
                        } else {
                          if (newFields.length === 0) newFields = [{ label: "" }];
                          nameChecker = false;
                        }

                        setFormData({
                          ...formData, 
                          productType: type,
                          isUidNameChecker: nameChecker,
                          isFreeFireAuto: type === "Uid Topup"
                        });
                        setDynamicFields(newFields);
                        setTypeOpen(false); 
                      }} 
                      className="cursor-pointer text-popover-foreground hover:bg-accent hover:text-accent-foreground flex items-center gap-1"
                    >
                      <Check className={`mr-2 h-4 w-4 ${formData.productType === type ? "opacity-100" : "opacity-0"}`} />
                      {type}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex flex-col gap-2.5 w-full">
          <Label className="text-sm font-medium text-muted-foreground tracking-wide">Category</Label>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex h-11 w-full items-center justify-between rounded-xl border border-input bg-background px-3 text-sm text-foreground hover:bg-accent hover:text-accent-foreground transition">
                {selectedCategory ? selectedCategory.name : "Select a category"}
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0 border-border bg-popover rounded-xl overflow-hidden z-50">
              <Command className="bg-popover">
                <CommandInput placeholder="Search category..." />
                <CommandList>
                  <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">No category found.</CommandEmpty>
                  <CommandGroup>
                    {categories.map((cat: any) => (
                      <CommandItem 
                        key={cat.id} 
                        onSelect={() => { setFormData({...formData, categoryId: cat.id}); setOpen(false); }} 
                        className="cursor-pointer text-popover-foreground hover:bg-accent hover:text-accent-foreground flex items-center gap-1"
                      >
                        <Check className={`mr-2 h-4 w-4 ${formData.categoryId === cat.id ? "opacity-100" : "opacity-0"}`} />
                        {cat.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </div>

    </div>

    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
<div className="flex flex-col gap-2.5">
          <Label className="text-sm font-medium text-muted-foreground tracking-wide">Reseller Percentage</Label>
          <Input 
            type="number" 
            placeholder="e.g. 10" 
            // 🟢 FIXED: 0 কে Falsy না ধরে Nullish Coalescing (??) ব্যবহার করা হলো, যাতে 0 দিলে 0-ই বসে
            value={formData.resellerPercentage ?? ""} 
            // 🟢 SAFE ONCHANGE: ইনপুট পুরো ফাঁকা করলে যেন ফর্মেও ফাঁকা দেখায়, অন্যথায় সংখ্যা বসে
            onChange={(e) => {
              const val = e.target.value;
              setFormData({
                ...formData, 
                resellerPercentage: val === "" ? "" : Number(val)
              });
            }} 
            className="bg-transparent border-input rounded-xl text-foreground h-11 focus:border-ring transition" 
          />
        </div>
      
      <div className="flex flex-col gap-2.5">
        <Label className="text-sm font-medium text-muted-foreground tracking-wide">Tutorial Link</Label>
        <Input type="text" placeholder="https://youtu.be/..." value={formData.tutorialLink || ""} onChange={(e) => setFormData({...formData, tutorialLink: e.target.value})} className="bg-transparent border-input rounded-xl text-foreground h-11" />
      </div>

      <div className="flex flex-col gap-2.5 md:col-span-1">
        <Label className="text-sm font-medium text-muted-foreground">Variations Design</Label>
        <div className="flex items-center h-11 w-full bg-muted/60 p-1 rounded-xl border border-input">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, variationsDesign: "List" })}
            className={`flex flex-1 items-center justify-center gap-2 h-full text-xs font-semibold rounded-lg transition-all ${
              formData.variationsDesign === "List"
                ? "bg-background text-orange-500 shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <List size={14} className={formData.variationsDesign === "List" ? "text-orange-500" : ""} />
            List
          </button>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, variationsDesign: "Grid" })}
            className={`flex flex-1 items-center justify-center gap-2 h-full text-xs font-semibold rounded-lg transition-all ${
              formData.variationsDesign === "Grid"
                ? "bg-background text-emerald-500 shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <ImageIcon size={14} className={formData.variationsDesign === "Grid" ? "text-emerald-500" : ""} />
            Grid
          </button>
        </div>
      </div>
      
      <div className="flex flex-col gap-2.5">
        <Label className="text-sm font-medium text-muted-foreground tracking-wide">Status</Label>
        <Popover open={statusOpen} onOpenChange={setStatusOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="flex h-11 w-full items-center justify-between rounded-xl border border-input bg-background px-3 text-sm text-foreground hover:bg-accent hover:text-accent-foreground transition">
              {formData.status || "Select Status"}
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0 border-border bg-popover rounded-xl overflow-hidden">
            <Command className="bg-popover">
              <CommandGroup>
                {["ON", "OFF"].map((s) => (
                  <CommandItem key={s} onSelect={() => { setFormData({...formData, status: s}); setStatusOpen(false); }} className="cursor-pointer text-popover-foreground hover:bg-accent hover:text-accent-foreground">
                    {s}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      
      {/* Tiptap Rich Text Editor Container */}
      <div className="w-full rounded-xl border border-input bg-background/60 overflow-hidden flex flex-col focus-within:border-ring transition relative">
        
        <div className="flex flex-wrap items-center gap-1.5 bg-muted border-b border-input px-3 py-2">
          <button type="button" onClick={() => editor?.chain().focus().toggleBold().run()} className={`p-1.5 rounded ${editor?.isActive('bold') ? 'text-primary bg-accent' : 'text-muted-foreground hover:text-foreground'}`}><Bold size={16}/></button>
          <button type="button" onClick={() => editor?.chain().focus().toggleItalic().run()} className={`p-1.5 rounded ${editor?.isActive('italic') ? 'text-primary bg-accent' : 'text-muted-foreground hover:text-foreground'}`}><Italic size={16}/></button>
          <button type="button" onClick={() => editor?.chain().focus().toggleUnderline().run()} className={`p-1.5 rounded ${editor?.isActive('underline') ? 'text-primary bg-accent' : 'text-muted-foreground hover:text-foreground'}`}><Underline size={16}/></button>
          <button type="button" onClick={() => editor?.chain().focus().toggleStrike().run()} className={`p-1.5 rounded ${editor?.isActive('strike') ? 'text-primary bg-accent' : 'text-muted-foreground hover:text-foreground'}`}><Strikethrough size={16}/></button>
          <div className="h-4 w-[1px] bg-border mx-1" />
          <button type="button" onClick={() => {const url = window.prompt('URL:'); if(url) editor?.chain().focus().setLink({href: url}).run()}} className="p-1.5 text-muted-foreground hover:text-foreground"><Link2 size={16}/></button>
          <button type="button" onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()} className={`text-xs font-bold px-1.5 rounded py-1 ${editor?.isActive('heading', { level: 1 }) ? 'text-primary bg-accent' : 'text-muted-foreground hover:text-foreground'}`}>Heading</button>
          <button type="button" onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} className={`text-xs font-bold px-1.5 rounded py-1 ${editor?.isActive('heading', { level: 2 }) ? 'text-primary bg-accent' : 'text-muted-foreground hover:text-foreground'}`}>Subheading</button>
          <div className="h-4 w-[1px] bg-border mx-1" />
          <button type="button" onClick={() => editor?.chain().focus().toggleBlockquote().run()} className={`p-1.5 rounded ${editor?.isActive('blockquote') ? 'text-primary bg-accent' : 'text-muted-foreground hover:text-foreground'}`}><Quote size={16}/></button>
          <button type="button" onClick={() => editor?.chain().focus().toggleCode().run()} className={`p-1.5 rounded ${editor?.isActive('code') ? 'text-primary bg-accent' : 'text-muted-foreground hover:text-foreground'}`}><Code size={16}/></button>
          <div className="w-full flex gap-1 mt-1">
            <button type="button" onClick={() => editor?.chain().focus().toggleBulletList().run()} className={`p-1.5 rounded ${editor?.isActive('bulletList') ? 'text-primary bg-accent' : 'text-muted-foreground hover:text-foreground'}`}><List size={16}/></button>
            <button type="button" onClick={() => editor?.chain().focus().toggleOrderedList().run()} className={`p-1.5 rounded ${editor?.isActive('orderedList') ? 'text-primary bg-accent' : 'text-muted-foreground hover:text-foreground'}`}><ListOrdered size={16}/></button>
            <button type="button" onClick={addImage} className="flex items-center gap-1.5 px-3 py-1 bg-background border border-input rounded-md text-emerald-600 dark:text-emerald-500 hover:bg-accent ml-2">
              <ImageIcon size={14} /> <span className="text-[11px] font-semibold text-muted-foreground">Image</span>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto min-h-[150px] p-3 text-foreground bg-background">
          <EditorContent editor={editor} className="tiptap-editor" />
        </div>

        <style dangerouslySetInnerHTML={{__html: `
          .tiptap-editor h1 { font-size: 1.875rem !important; font-weight: 700 !important; margin-top: 1rem !important; margin-bottom: 0.5rem !important; display: block !important; }
          .tiptap-editor h2 { font-size: 1.5rem !important; font-weight: 600 !important; margin-top: 1rem !important; margin-bottom: 0.5rem !important; display: block !important; }
          .tiptap-editor ul { list-style-type: disc !important; padding-left: 1.5rem !important; margin-top: 0.5rem !important; margin-bottom: 0.5rem !important; display: block !important; }
          .tiptap-editor ol { list-style-type: decimal !important; padding-left: 1.5rem !important; margin-top: 0.5rem !important; margin-bottom: 0.5rem !important; display: block !important; }
          .tiptap-editor li { display: list-item !important; list-style: inherit !important; }
          .tiptap-editor blockquote { border-left: 4px solid var(--muted-foreground) !important; padding-left: 1rem !important; font-style: italic !important; color: var(--muted-foreground) !important; margin-top: 0.75rem !important; margin-bottom: 0.75rem !important; }
          .tiptap-editor code { background-color: var(--muted) !important; padding: 0.2rem 0.4rem !important; border-radius: 0.25rem !important; font-family: monospace !important; color: #ef4444 !important; }
          .ProseMirror-focused { outline: none !important; }
        `}} />

      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2.5">
          <Label className="text-sm font-medium text-muted-foreground">Product Image 1920 x 1920</Label>
          <ImageUploader onFileChange={(file: any) => {
            const actualFile = file?.target?.files?.[0] || file;
            setFormData((prev: any) => ({ ...prev, productImage: actualFile }));
          }} />
        </div>

        <div className="flex flex-col gap-2.5">
          <Label className="text-sm font-medium text-muted-foreground">Variation icon 512 x 512</Label>
          <ImageUploader onFileChange={(file: any) => {
            const actualFile = file?.target?.files?.[0] || file;
            setFormData((prev: any) => ({ ...prev, variationIcon: actualFile }));
          }} />
        </div>
      </div>
    </div>

    <div className="flex items-center gap-3 mt-3">
      <Switch 
        checked={formData.isBanner} 
        onCheckedChange={(c) => setFormData({ ...formData, isBanner: c })} 
      />
      <Label className="uppercase tracking-wider text-muted-foreground my-3 cursor-pointer select-none">
        PAGE TOP HEADING BANNER
      </Label>
    </div>

    {formData.isBanner && (
      <div className="flex flex-col gap-2.5 mt-3 animate-in fade-in duration-200">
        <Label className="text-sm font-medium text-muted-foreground">Product Banner (820 x 360)</Label>
        <ImageUploader onFileChange={(file: any) => {
          const actualFile = file?.target?.files?.[0] || file;
          setFormData((prev: any) => ({ ...prev, bannerImage: actualFile }));
        }} />
      </div>
    )}

    {formData.productType !== "Vouchers" && (
      <div className="mt-2 border-t border-border pt-6">
        <div className="flex justify-between items-center mb-4">
          <Label className="text-sm font-medium text-muted-foreground">Product Input Fields</Label>
          {formData.productType !== "Uid Topup" && (
            <Button 
              type="button"
              variant="outline"
              onClick={() => setDynamicFields([...dynamicFields, { label: "" }])}
              className="text-xs h-8 bg-primary text-primary-foreground hover:bg-primary/90 border-none"
            >
              + Add New Input Box
            </Button>
          )}
        </div>

        {dynamicFields.map((field: any, index: number) => (
          <div key={index} className="flex gap-2 mb-2">
            <Input
              value={field.label || ""}
              onChange={(e) => {
                if (formData.productType === "Uid Topup") return; 
                const newFields = [...dynamicFields];
                newFields[index].label = e.target.value;
                setDynamicFields(newFields);
              }}
              placeholder={formData.productType === "Uid Topup" ? "Enter Player UID" : "e.g. Enter info..."} 
              className="bg-background border-input rounded-lg text-foreground"
              readOnly={formData.productType === "Uid Topup"}
            />
            {dynamicFields.length > 1 && formData.productType !== "Uid Topup" && (
              <Button type="button" variant="ghost" onClick={() => setDynamicFields(dynamicFields.filter((_, i) => i !== index))}>
                <X className="h-5 w-5 text-destructive" />
              </Button>
            )}
          </div>
        ))}
      </div>
    )}

    <div className="space-y-4 py-1 mt-4 border-t border-border pt-6">
      <div className="flex flex-wrap items-center gap-8">
        
        <div className="flex items-center gap-3 uppercase">
          <Switch 
            checked={!!formData.isCoinSystem}
            onCheckedChange={(checked) => setFormData({...formData, isCoinSystem: checked})}
            id="coin-system"
          />
          <Label htmlFor="coin-system" className="text-sm font-medium text-foreground cursor-pointer select-none">COIN SYSTEM</Label>
        </div>

        <div className="flex items-center gap-3 uppercase">
          <Switch 
            checked={!!formData.isPremiumUser}
            onCheckedChange={(checked) => setFormData({...formData, isPremiumUser: checked})}
            id="premium-user"
          />
          <Label htmlFor="premium-user" className="text-sm font-medium text-foreground cursor-pointer select-none">Premium user</Label>
        </div>

        {formData.productType === "Uid Topup" && (
          <>
            <div className="flex items-center gap-3 animate-in fade-in duration-200">
              <Switch 
                checked={!!formData.isFreeFireAuto}
                onCheckedChange={(checked) => {
                  setFormData({
                    ...formData, 
                    isFreeFireAuto: checked,
                    autoDeliveryType: checked ? "UNIPIN" : "" 
                  });
                }}
                id="auto-delivery"
              />
              <Label htmlFor="auto-delivery" className="text-sm font-medium text-foreground cursor-pointer select-none uppercase">Auto Delivery System</Label>
            </div>

            <div className="flex items-center gap-3 animate-in fade-in duration-200">
              <Switch 
                checked={!!formData.isUidNameChecker}
                onCheckedChange={(checked) => setFormData({...formData, isUidNameChecker: checked})}
                id="uid-checker"
              />
              <Label htmlFor="uid-checker" className="text-sm font-medium text-foreground cursor-pointer select-none">UID NAME CHECKER</Label>
            </div>
          </>
        )}
      </div>
      
      {formData.productType === "Uid Topup" && formData.isFreeFireAuto && (
        <div className="pl-2 pt-1 animate-in slide-in-from-top-2 duration-200">
          <RadioGroup
            value={formData.autoDeliveryType || "UNIPIN"}
            onValueChange={(value: string) => setFormData({ ...formData, autoDeliveryType: value })}
            className="flex items-center gap-6"
          >
            <div className="flex items-center space-x-2.5 cursor-pointer group">
              <RadioGroupItem 
                value="UNIPIN" 
                id="unipin" 
                className="border-input text-foreground focus:ring-ring bg-transparent" 
              />
              <Label htmlFor="unipin" className="text-sm font-medium text-muted-foreground group-hover:text-foreground cursor-pointer select-none">
                UNIPIN
              </Label>
            </div>
            
            <div className="flex items-center space-x-2.5 cursor-pointer group">
              <RadioGroupItem 
                value="SHELL" 
                id="shell" 
                className="border-input text-foreground focus:ring-ring bg-transparent" 
              />
              <Label htmlFor="shell" className="text-sm font-medium text-muted-foreground group-hover:text-foreground cursor-pointer select-none">
                SHELL
              </Label>
            </div>
          </RadioGroup>
        </div>
      )}

      <div className="border-t border-border pt-4 mt-2">
        <div className="flex items-center gap-3">
          <Switch 
            checked={isTagEnabled}
            onCheckedChange={handleTagToggle}
            id="tag-badge"
          />
          <Label htmlFor="tag-badge" className="text-sm font-medium text-muted-foreground uppercase tracking-wide cursor-pointer select-none">
            Enable Product Tag Badge
          </Label>
        </div>

        {isTagEnabled && (
          <div className="mt-4 pl-2 space-y-4 animate-in slide-in-from-top-2 duration-200">
            <RadioGroup
              value={tagType}
              onValueChange={(value: "AUTO" | "CUSTOM") => {
                setTagType(value);
                setFormData((prev: any) => ({
                  ...prev,
                  tagType: value,
                  ...(value === "AUTO" 
                    ? { productTag: "AUTO DELIVERY", tagColor: "#ffffff", tagBgColor: "#1e3a8a" } 
                    : { productTag: customTagValue, tagColor: prev.tagColor || "#ffffff", tagBgColor: prev.tagBgColor || "#262626" })
                }));
              }}
              className="flex flex-wrap items-center gap-8"
            >
              <div className="flex items-center space-x-3 cursor-pointer group">
                <RadioGroupItem value="AUTO" id="tag-auto" className="border-input text-primary focus:ring-ring bg-transparent" />
                <Label htmlFor="tag-auto" className="flex items-center gap-1.5 text-sm font-medium text-foreground group-hover:text-muted-foreground cursor-pointer select-none uppercase">
                  Auto Delivery
                </Label>
              </div>

              <div className="flex items-center space-x-3 cursor-pointer group">
                <RadioGroupItem value="CUSTOM" id="tag-custom" className="border-input text-primary focus:ring-ring bg-transparent" />
                <Label htmlFor="tag-custom" className="flex items-center gap-1.5 text-sm font-medium text-foreground group-hover:text-muted-foreground cursor-pointer select-none uppercase">
                  Customize Tag
                </Label>
              </div>
            </RadioGroup>

            {tagType === "CUSTOM" && (
              <div className="flex flex-wrap items-end gap-5 mt-2 animate-in fade-in duration-200">
                
                <div className="flex flex-col gap-2 w-full max-w-xs">
                  <Label className="text-xs font-medium text-muted-foreground">Custom Tag Text</Label>
                  <Input 
                    type="text"
                    placeholder="e.g. POPULAR, 10% OFF, NEW"
                    value={customTagValue}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCustomTagValue(val);
                      setFormData({ ...formData, productTag: val });
                    }}
                    className="bg-transparent border-input rounded-xl text-foreground h-11"
                  />
                </div>

                <div className="flex gap-4 items-center">
                  <div className="flex flex-col gap-1.5 items-center">
                    <Label className="text-[11px] font-medium text-muted-foreground">Text Color</Label>
                    <div className="relative w-11 h-11 rounded-xl border border-input overflow-hidden bg-background flex items-center justify-center cursor-pointer hover:border-accent transition">
                      <input 
                        type="color" 
                        value={formData.tagColor || "#ffffff"} 
                        onChange={(e) => setFormData({ ...formData, tagColor: e.target.value })}
                        className="absolute inset-0 w-full h-full p-0 border-0 cursor-pointer opacity-0"
                      />
                      <div className="w-5 h-5 rounded border border-input" style={{ backgroundColor: formData.tagColor || "#ffffff" }} />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 items-center">
                    <Label className="text-[11px] font-medium text-muted-foreground">BG Color</Label>
                    <div className="relative w-11 h-11 rounded-xl border border-input overflow-hidden bg-background flex items-center justify-center cursor-pointer hover:border-accent transition">
                      <input 
                        type="color" 
                        value={formData.tagBgColor || "#262626"} 
                        onChange={(e) => setFormData({ ...formData, tagBgColor: e.target.value })}
                        className="absolute inset-0 w-full h-full p-0 border-0 cursor-pointer opacity-0"
                      />
                      <div className="w-5 h-5 rounded border border-input" style={{ backgroundColor: formData.tagBgColor || "#262626" }} />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Label className="text-xs font-medium text-muted-foreground">Tag Icon (100x100)</Label>
                  <div className="w-[100px] h-[100px] border border-dashed border-input hover:border-accent bg-background rounded-xl overflow-hidden flex items-center justify-center transition-all">
                    <ImageUploader onFileChange={(file: any) => {
                      const actualFile = file?.target?.files?.[0] || file;
                      setFormData({ ...formData, tagIcon: actualFile });
                    }} />
                  </div>
                </div>

              </div>
            )}
          </div>
        )}
      </div>

    </div>

    <div className="flex justify-start gap-3 pt-6 items-center mt-6 border-t border-border">
      <Button 
        className="font-bold h-11 px-8 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 cursor-pointer" 
        onClick={() => handleCreate(false)} 
        disabled={loadingCreate || loadingCreateOthers}
      >
        {loadingCreate ? <Loader2 className="h-4 w-4 animate-spin text-primary-foreground" /> : "Create"}
      </Button>
      
      <Button 
        className="font-medium h-11 px-8 rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-input transition-all duration-200 cursor-pointer" 
        onClick={() => handleCreate(true)} 
        disabled={loadingCreate || loadingCreateOthers}
      >
        {loadingCreateOthers ? <Loader2 className="h-4 w-4 animate-spin text-secondary-foreground" /> : "Create & Others"}
      </Button>
      
      <Button 
        variant="ghost" 
        type="button" 
        className="text-muted-foreground hover:bg-destructive hover:text-destructive-foreground px-8 h-11 rounded-xl ml-auto font-medium transition-all duration-200 cursor-pointer" 
        onClick={onCancel}
      >
        Cancel
      </Button>
    </div>

  </div>
);
}