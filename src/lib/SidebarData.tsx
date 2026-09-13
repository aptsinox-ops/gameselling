import { ADMIN_ROUTE } from "@/lib/route"; // আপনার routes ফাইলের সঠিক পাথটি চেক করে নেবেন
import { 
  IdCardIcon, 
  User, 
  GalleryVerticalEnd,
  Package,        
  CreditCard,     
  Sliders,        
  Settings2,       
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
      url: `${ADMIN_ROUTE}/dashboard`,
      icon: Home,
    },
    {
      name: "Statement",
      url: `${ADMIN_ROUTE}/statement`,
      icon: ListOrdered,
    },
    {
      name: "Users",
      url: `${ADMIN_ROUTE}/users`,
      icon: User,
    },
    {
      name: "Orders",
      url: `${ADMIN_ROUTE}/orders`,
      icon: BookTextIcon,
    },
  ],
  NavMain: [
    {
      name: "Add Category",
      url: `${ADMIN_ROUTE}/categories`,
      icon: BoltIcon,
    },
    {
      name: "Add Products",
      url: `${ADMIN_ROUTE}/products`,
      icon: Package2,
    },
    {
      name: "Add Variation",
      url: `${ADMIN_ROUTE}/add-item`,
      icon: BoxIcon,
    },
    {
      name: "Shell Vouchers",
      url: `${ADMIN_ROUTE}/add-sh-voucher`,
      icon: Ticket,
    },
    {
      name: "Unipin Vouchers",
      url: `${ADMIN_ROUTE}/add-upn-voucher`,
      icon: Ticket,
    },
  ],
  NavPayment: [
    {
      name: "Payment Details",
      url: `${ADMIN_ROUTE}/payment-details`,
      icon: CreditCard,
    },
    {
      name: "Payment Informations",
      url: `${ADMIN_ROUTE}/payment-setting`,
      icon: Settings2,
    },
  ],
  NavWeb: [
    {
      name: "Notice",
      url: `${ADMIN_ROUTE}/notice`,
      icon: Bell,
    },
    {
      name: "Slider",
      url: `${ADMIN_ROUTE}/slider-setting`,
      icon: Sliders,
    },
    {
      name: "Maintenance",
      url: `${ADMIN_ROUTE}/maintenance`,
      icon: Settings,
    },
  ],
  NavFront: [
    {
      name: "Settings",
      url: `${ADMIN_ROUTE}/settings`,
      icon: Settings2,
    },
  ],
};