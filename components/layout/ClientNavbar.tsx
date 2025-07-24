"use client";

import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  Building2,
  JapaneseYen,
  MapPin,
  CreditCard,
  LogOutIcon,
} from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";
import { SignOutButton } from "@clerk/nextjs";
import {
  SignInButton,
  SignUpButton,
  useAuth,
  UserButton,
} from "@clerk/clerk-react";

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

function ClientNavbar() {
  const { isSignedIn } = useAuth();
  const [openMenu, setOpenMenu] = useState(false);
  const handleMenuOpen = () => {
    setOpenMenu(!openMenu);
  };

  return (
    <div className="w-full">
      {isSignedIn ? (
        <header className="fixe flex bg-slate-900 items-center justify-between py-4 px-4">
          <div className="flex items-center gap-2 z-50">
            <h1 className="font-bold text-2xl whitespace-nowrap text-white">
              LiftingERM
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-4">
              <SignOutButton>
                <Button
                  variant="outline"
                  className="flex itemscenter justify-start w-full"
                >
                  <LogOutIcon className="w-4 h-4" />
                  ログアウト
                </Button>
              </SignOutButton>
              <UserButton />
              <button
                onClick={handleMenuOpen}
                className="md:hidden space-y-2 z-50"
              >
                <div
                  className={
                    openMenu
                      ? "w-8 h-0.5 bg-neutral-400 translate-y-2.5 rotate-45 transition duration-300 ease-in-out"
                      : "w-8 h-0.5 bg-neutral-400 transition duration-300 ease-in-out"
                  }
                />
                <div
                  className={
                    openMenu
                      ? "opacity-0 transition duration-500 ease-in-out"
                      : "w-8 h-0.5 bg-neutral-400 transition duration-300 ease-in-out"
                  }
                />
                <div
                  className={
                    openMenu
                      ? "w-8 h-0.5 bg-neutral-400 -rotate-45 transition duration-300 ease-in-out"
                      : "w-8 h-0.5 bg-neutral-400 transition duration-300 ease-in-out"
                  }
                />
              </button>
            </div>
          </div>

          <nav
            className={
              openMenu
                ? "fixed text-center bg-white right-0 top-0 w-[100%] lg:w-[25%] h-screen flex flex-col justify-center ease-linear duration-500 z-40"
                : "fixed right-[-100%] top-0 w-[100%] md:w-[25%] h-screen flex flex-col justify-center ease-linear duration-400"
            }
          >
            <ul className="mt-8 space-y-4 flex flex-col items-center">
              {navLinks.map((navLink) => {
                const IconComponent = navLink.icon;
                return (
                  <li
                    key={navLink.label}
                    className="py-4 font-medium flex items-center gap-3"
                  >
                    <Link
                      href={navLink.href}
                      className="flex items-center gap-3 hover:text-blue-500 transition-colors"
                      onClick={() => setOpenMenu(false)}
                    >
                      <div className="w-5 flex justify-center">
                        <IconComponent size={20} />
                      </div>
                      {navLink.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </header>
      ) : (
        <header className="relative flex items-center justify-between py-4 px-5 bg-slate-950">
          <div className="flex items-center gap-2 z-50">
            <h1 className="font-bold text-2xl whitespace-nowrap text-white">
              LiftingERM
            </h1>
          </div>

          <div className="flex flex-1" />

          <div className="flex items-center gap-4">
            <SignInButton mode="modal" forceRedirectUrl="/dashboard">
              <Button variant="outline">ログイン</Button>
            </SignInButton>

            <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
              <Button variant="outline">サインアップ</Button>
            </SignUpButton>

            <button
              onClick={handleMenuOpen}
              className="md:hidden z-10 space-y-2"
            >
              <div
                className={
                  openMenu
                    ? "w-8 h-0.5 bg-slate-400 translate-y-2.5 rotate-45 transition duration-300 ease-in-out"
                    : "w-8 h-0.5 bg-slate-400 transition duration-300 ease-in-out"
                }
              />
              <div
                className={
                  openMenu
                    ? "opacity-0 transition duration-500 ease-in-out"
                    : "w-8 h-0.5 bg-slate-400 transition duration-300 ease-in-out"
                }
              />
              <div
                className={
                  openMenu
                    ? "w-8 h-0.5 bg-slate-400 -rotate-45 transition duration-300 ease-in-out"
                    : "w-8 h-0.5 bg-slate-400 transition duration-300 ease-in-out"
                }
              />
            </button>
          </div>

          <nav
            className={
              openMenu
                ? "fixed text-center bg-slate-500 right-0 top-0 w-[100%] lg:w-[25%] h-screen flex flex-col justify-center ease-linear duration-500"
                : " fixed right-[-100%] top-0 w-[100%] md:w-[25%] h-screen flex flex-col justify-center ease-linear duration-400"
            }
          >
            <ul className="space-y-4 flex flex-col mx-auto items-left">
              {navLinks.map((navLink) => {
                const IconComponent = navLink.icon;
                return (
                  <li
                    key={navLink.label}
                    className="py-2 font-medium flex items-center gap-3"
                  >
                    <Link
                      href={navLink.href}
                      className="flex items-center gap-3 hover:text-blue-500 transition-colors"
                      onClick={() => setOpenMenu(false)}
                    >
                      <div className="w-5 flex justify-center">
                        <IconComponent size={20} />
                      </div>
                      {navLink.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </header>
      )}
    </div>
  );
}

export default ClientNavbar;
