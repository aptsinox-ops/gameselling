import { 
  IdCardIcon, 
  User, 
  GalleryVerticalEnd,
  Package,        // নতুন আইকন
  CreditCard,     // নতুন আইকন
  Sliders,        // নতুন আইকন
  Settings2,       // নতুন আইকন
  Plus,
  Bell,
  ListOrdered,
  Home,
  Power,
  BoxIcon,
  Ticket,
  ListOrderedIcon,
  Settings,
  CloudLightning,
  Paperclip,
  Lightbulb,
  BellElectric,
  Package2,
  FanIcon,
  BoltIcon,
  SheetIcon,
  BookTextIcon
} from "lucide-react";
import Box from "next-auth/providers/box";

export const sidebarData = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
  ],

  projects: [
    {
      name: "DASHBOARD",
      url: "/admin/dashboard", // /admin/dashboard/page.tsx-এ নিয়ে যাবে
      icon: Home,
    },
    {
      name: "Statement",
      url: "/admin/statement",
      icon: ListOrdered,
    },
    {
      name: "Users",
      url: "/admin/users",
      icon: User,
    },
    {
      name: "Orders",
      url: "/admin/orders",
      icon: BookTextIcon,
    },
  ],
  NavMain: [
    {
      name: "Add Category", // বানানের টাইপো ঠিক করা হয়েছে
      url: "/admin/categories",
      icon: BoltIcon,
    },
    {
      name: "Add Products",
      url: "/admin/products",
      icon: Package2,
    },
    {
      name: "Add Variation",
      url: "/admin/add-item",
      icon: BoxIcon,
    },
    {
      name: "Shell Vouchers",
      url: "/admin/add-sh-voucher",
      icon: Ticket,
    },
    {
      name: "Unipin Vouchers",
      url: "/admin/add-upn-voucher", // url-এ সব ছোট হাতের অক্ষর রাখাই স্ট্যান্ডার্ড
      icon: Ticket,
    },
  ],
  NavPayment: [
    {
      name: "Payment Details",
      url: "/admin/payment-details",
      icon: CreditCard,
    },
    {
      name: "Payment Informations",
      url: "/admin/payment-setting",
      icon: Settings2,
    },
  ],
  NavWeb: [
    {
      name: "Notice",
      url: "/admin/notice",
      icon: Bell,
    },
    {
      name: "Slider",
      url: "/admin/slider-setting",
      icon: Sliders,
    },
    {
      name: "Maintenance", // বানানের টাইপো ঠিক করা হয়েছে
      url: "/admin/maintenance", // ইউনিক ইউআরএল দেওয়া হলো, আগে payment-details ছিল
      icon: Settings,
    },
  ],
  NavFront: [
    {
      name: "Settings",
      url: "/admin/settings",
      icon: Settings2,
    },
  ],
};