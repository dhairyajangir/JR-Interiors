import {
  LayoutDashboard,
  Package,
  FolderTree,
  Layers,
  Users,
  FileText,
  ShoppingCart,
  Warehouse,
  Truck,
  Layout,
  Image,
  MessageSquare,
  BarChart3,
  Globe,
  UserCog,
  Shield,
  Settings,
  History,
  type LucideIcon,
} from "lucide-react";
import { Permission } from "@jr/validation/permissions";

export interface NavigationChild {
  title: string;
  href: string;
  permission?: Permission;
}

export interface NavigationItem {
  title: string;
  icon: LucideIcon;
  href?: string;
  permission?: Permission;
  children?: NavigationChild[];
}

export interface NavigationGroup {
  groupName: string;
  items: NavigationItem[];
}

export const NAVIGATION_CONFIG: NavigationGroup[] = [
  {
    groupName: "Dashboard",
    items: [
      {
        title: "Overview",
        icon: LayoutDashboard,
        href: "/dashboard",
      },
    ],
  },
  {
    groupName: "Catalog",
    items: [
      {
        title: "Products",
        icon: Package,
        href: "/dashboard/products",
        permission: "INVENTORY_READ",
      },
      {
        title: "Categories",
        icon: FolderTree,
        href: "/dashboard/categories",
        permission: "INVENTORY_READ",
      },
      {
        title: "Collections",
        icon: Layers,
        href: "/dashboard/collections",
        permission: "INVENTORY_READ",
      },
    ],
  },
  {
    groupName: "Sales",
    items: [
      {
        title: "CRM",
        icon: Users,
        href: "/dashboard/crm",
        permission: "CRM_EDIT",
      },
      {
        title: "Quotations",
        icon: FileText,
        href: "/dashboard/quotations",
        permission: "QUOTATION_DRAFT",
      },
      {
        title: "Orders",
        icon: ShoppingCart,
        href: "/dashboard/orders",
        permission: "CLIENT_ADDRESS_SPECS_READ",
      },
    ],
  },
  {
    groupName: "Operations",
    items: [
      {
        title: "Inventory",
        icon: Warehouse,
        href: "/dashboard/inventory",
        permission: "INVENTORY_READ",
      },
      {
        title: "Suppliers",
        icon: Truck,
        href: "/dashboard/suppliers",
        permission: "INVENTORY_READ",
      },
    ],
  },
  {
    groupName: "Content",
    items: [
      {
        title: "Homepage",
        icon: Layout,
        href: "/dashboard/homepage",
        permission: "CATALOG_APPROVE",
      },
      {
        title: "Media",
        icon: Image,
        href: "/dashboard/media",
        permission: "INVENTORY_READ",
      },
      {
        title: "Testimonials",
        icon: MessageSquare,
        href: "/dashboard/testimonials",
        permission: "CRM_EDIT",
      },
    ],
  },
  {
    groupName: "Analytics",
    items: [
      {
        title: "Reports",
        icon: BarChart3,
        href: "/dashboard/reports",
        permission: "FINANCIAL_VIEW",
      },
      {
        title: "SEO",
        icon: Globe,
        href: "/dashboard/seo",
        permission: "SETTINGS_EDIT",
      },
    ],
  },
  {
    groupName: "Administration",
    items: [
      {
        title: "Users",
        icon: UserCog,
        href: "/dashboard/users",
        permission: "USERS_MANAGE",
      },
      {
        title: "Roles",
        icon: Shield,
        href: "/dashboard/roles",
        permission: "USERS_MANAGE",
      },
      {
        title: "Settings",
        icon: Settings,
        href: "/dashboard/settings",
        permission: "SETTINGS_EDIT",
      },
      {
        title: "Audit Logs",
        icon: History,
        href: "/dashboard/audit-logs",
        permission: "AUDIT_LOGS_VIEW",
      },
    ],
  },
];
