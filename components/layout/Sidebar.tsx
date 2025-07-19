"use client";

import {
  LayoutDashboard,
  Users,
  Building2,
  JapaneseYen,
  MapPin,
  CreditCard,
} from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

const navLinks = [
  {
    label: "ダッシュボード",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "スタッフ管理",
    href: "/employees",
    icon: Users,
  },
  {
    label: "取引先管理",
    href: "/clients",
    icon: Building2,
  },
  {
    label: "売上管理",
    href: "/sales",
    icon: JapaneseYen,
  },
  {
    label: "現場管理",
    href: "/sites",
    icon: MapPin,
  },
  {
    label: "給与管理",
    href: "/payroll",
    icon: CreditCard,
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden md:flex h-full w-64 flex-col min-h-screen border-2 border-slate-200">
      <nav className="flex-1 space-y-2 p-4">
        {navLinks.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "group flex items-center py-2 px-4 rounded-md transition-colors",
                isActive ? "bg-blue-500 text-white" : "  hover:bg-blue-300"
              )}
            >
              <item.icon
                className={cn(
                  "mr-3 h-5 w-5 flex-shrink-0",
                  isActive ? "text-white" : ""
                )}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
