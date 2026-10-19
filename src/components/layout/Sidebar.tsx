"use client";

import Link from "next/link";
import { Home, Sparkles, UsersRound } from "lucide-react";
import { usePathname } from "next/navigation";

const navigation = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/sales", label: "List Sales", icon: UsersRound },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="border-b border-[#dce8fa] bg-white px-5 py-5 lg:sticky lg:top-0 lg:h-screen lg:self-start lg:overflow-y-auto lg:border-b-0 lg:border-r">
      <Link
        href="/home"
        className="flex h-11 items-center gap-3 px-1 font-semibold tracking-[-0.01em] text-[#07183c]"
      >
        <Sparkles
          aria-hidden="true"
          className="size-7 fill-[#167cf5] text-[#167cf5]"
          strokeWidth={1.8}
        />
        <span className="text-[16px]">Sky</span>
      </Link>

      <nav className="mt-5 flex gap-2 lg:flex-col" aria-label="Navigasi utama">
        {navigation.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            aria-current={
              pathname === href || (href === "/home" && pathname === "/")
                ? "page"
                : undefined
            }
            className={`flex h-[42px] items-center gap-4 rounded-lg px-3 text-[14px] font-medium outline-none transition ${
              pathname === href || (href === "/home" && pathname === "/")
                ? "bg-[#eaf3ff] text-[#0f78ec]"
                : "text-[#0a1a3f] hover:bg-[#f4f8ff] hover:text-[#0f78ec]"
            }`}
          >
            <Icon aria-hidden="true" className="size-5" strokeWidth={2.1} />
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
