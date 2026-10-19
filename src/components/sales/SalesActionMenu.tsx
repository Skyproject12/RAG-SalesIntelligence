"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Ellipsis, MessageSquareText, UserRound } from "lucide-react";

import type { Sale } from "@/types/sales";

interface SalesActionMenuProps {
  sale: Pick<Sale, "id" | "name">;
}

interface MenuPosition {
  left: number;
  top: number;
}

const MENU_WIDTH = 300;
const MENU_HEIGHT = 140;
const VIEWPORT_GAP = 12;
const TRIGGER_GAP = 9;

export function SalesActionMenu({ sale }: SalesActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<MenuPosition>({ left: 0, top: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  function calculatePosition() {
    const trigger = triggerRef.current;

    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const preferredLeft = rect.right - MENU_WIDTH + 48;
    const left = Math.max(
      VIEWPORT_GAP,
      Math.min(preferredLeft, window.innerWidth - MENU_WIDTH - VIEWPORT_GAP),
    );
    const hasSpaceBelow =
      rect.bottom + TRIGGER_GAP + MENU_HEIGHT <=
      window.innerHeight - VIEWPORT_GAP;
    const top = hasSpaceBelow
      ? rect.bottom + TRIGGER_GAP
      : Math.max(VIEWPORT_GAP, rect.top - MENU_HEIGHT - TRIGGER_GAP);

    setPosition({ left, top });
  }

  function toggleMenu() {
    if (!isOpen) {
      calculatePosition();
    }

    setIsOpen((current) => !current);
  }

  function closeMenu() {
    setIsOpen(false);
  }

  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node;

      if (
        !menuRef.current?.contains(target) &&
        !triggerRef.current?.contains(target)
      ) {
        closeMenu();
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeMenu();
        triggerRef.current?.focus();
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", closeMenu);
    window.addEventListener("scroll", closeMenu, true);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", closeMenu);
      window.removeEventListener("scroll", closeMenu, true);
    };
  }, [isOpen]);

  const menu = isOpen ? (
    <div
      ref={menuRef}
      id={menuId}
      role="menu"
      aria-label={`Aksi untuk ${sale.name}`}
      className="fixed z-[100] w-[300px] overflow-hidden rounded-[11px] border border-[#d9e5f4] bg-white p-2 shadow-[0_12px_30px_rgba(24,55,99,0.16)]"
      style={{ left: position.left, top: position.top }}
    >
      <button
        type="button"
        role="menuitem"
        onClick={closeMenu}
        className="group flex w-full items-center gap-4 rounded-lg px-3 py-2.5 text-left transition hover:bg-[#f3f8ff] focus-visible:bg-[#f3f8ff] focus-visible:outline-none"
      >
        <span className="grid size-9 shrink-0 place-items-center text-[#147df3]">
          <UserRound aria-hidden="true" className="size-6" strokeWidth={1.9} />
        </span>
        <span className="min-w-0">
          <span className="block text-[14px] font-semibold leading-5 text-[#173263]">
            Lihat Detail Sales
          </span>
          <span className="mt-0.5 block text-[11px] leading-4 text-[#7188b6]">
            Profil, wilayah, target, dan pencapaian
          </span>
        </span>
      </button>

      <button
        type="button"
        role="menuitem"
        onClick={closeMenu}
        className="group flex w-full items-center gap-4 rounded-lg px-3 py-2.5 text-left transition hover:bg-[#f3f8ff] focus-visible:bg-[#f3f8ff] focus-visible:outline-none"
      >
        <span className="grid size-9 shrink-0 place-items-center text-[#147df3]">
          <MessageSquareText
            aria-hidden="true"
            className="size-6"
            strokeWidth={1.9}
          />
        </span>
        <span className="min-w-0">
          <span className="block text-[14px] font-semibold leading-5 text-[#173263]">
            Tanyakan ke AI
          </span>
          <span className="mt-0.5 block text-[11px] leading-4 text-[#7188b6]">
            Analisis performa dan dapatkan insight
          </span>
        </span>
      </button>
    </div>
  ) : null;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label={`Buka aksi untuk ${sale.name}`}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={isOpen ? menuId : undefined}
        onClick={toggleMenu}
        className={`inline-grid size-8 place-items-center rounded-md border text-[#2375d8] shadow-[0_2px_6px_rgba(55,100,159,0.04)] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8ec1ff] ${
          isOpen
            ? "border-[#60a3f6] bg-white ring-1 ring-[#b9d8ff]"
            : "border-[#e0eaf7] bg-white hover:border-[#86baf8] hover:bg-[#f3f8ff]"
        }`}
      >
        <Ellipsis aria-hidden="true" className="size-4" />
      </button>

      {menu && typeof document !== "undefined"
        ? createPortal(menu, document.body)
        : null}
    </>
  );
}
