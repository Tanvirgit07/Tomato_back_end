"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import logo from "@/public/images/haviasFooterLogo.png";
import {
  LayoutDashboard,
  DollarSign,
  LogOut,
  Grip,
  ShoppingBasket,
  Columns3Cog,
  AppWindow,
  User2,
  UserCheck,
  Users,
  Settings,
  // Bell,
} from "lucide-react";
import Image from "next/image";
// import logoImage from "@/public/images/logo.svg";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Categories", href: "/categories", icon: Columns3Cog },
  { name: "Product", href: "/product", icon: Grip },
  { name: "Request Product", href: "/request-product", icon: ShoppingBasket }, 
  { name: "Revenue from Seller ", href: "/revenue  ", icon: DollarSign },
  { name: "Blog management", href: "/blog", icon: AppWindow },
  { name: "Seller Management", href: "/seller-management", icon: User2 },
  { name: "Seller Profile Request ", href: "/seller-profile-request", icon: UserCheck },
  { name: "Buyer Profile ", href: "/buyer-profile", icon: Users },
  { name: "Setting ", href: "/setting", icon: Settings },

];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-screen sticky bottom-0 top-0 w-[350px] flex-col bg-[#1C2228] z-50">
      <div className="h-[80px] flex items-center justify-start shadow-md px-4">
        <Image
          src={logo}
          alt="Company Logo"
          height={60} // Adjust height to fit navbar
          width={150} // Adjust width proportionally
          className="object-contain"
          priority // for faster loading
        />
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-6 flex flex-col items-center justify-start px-3 overflow-y-auto mt-3">
        {navigation.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex w-[90%] mx-auto items-center justify-start gap-2 space-y-1 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-btnPrimary text-white"
                  : "text-white hover:bg-btnPrimary/70 hover:text-white"
              )}
            >
              <item.icon
                className={cn(
                  "h-6 w-6 transition-colors duration-200",
                  isActive ? "text-white" : ""
                )}
              />
              <span
                className={cn(
                  "font-normal text-base leading-[120%] transition-colors duration-200 text-center",
                  isActive ? "text-white font-medium" : ""
                )}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Logout fixed at bottom */}
      <div className="p-3">
        <div className="flex items-center justify-start space-y-1 rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition-all duration-200 hover:bg-slate-600/50 hover:text-white cursor-pointer">
          <LogOut className="h-5 w-5" />
          <span className="font-normal text-base leading-[120%]">Log Out</span>
        </div>
      </div>
    </div>
  );
}
