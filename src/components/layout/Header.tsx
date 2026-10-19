import { CalendarDays, ChevronDown, Sun } from "lucide-react";

export function Header() {
  return (
    <header className="flex h-[65px] items-center justify-end border-b border-[#e2ebf8] bg-white px-5 sm:px-8">
      <div className="flex items-center gap-3 sm:gap-5">
        <button
          type="button"
          className="hidden h-10 items-center gap-3 rounded-lg border border-[#e8eef8] bg-white px-4 text-[12px] font-medium text-[#263c6d] shadow-[0_3px_10px_rgba(56,103,168,0.06)] sm:flex"
        >
          <CalendarDays aria-hidden="true" className="size-4 text-[#173e85]" />
          <span>Apr 21, 2025 – Apr 27, 2025</span>
          <ChevronDown aria-hidden="true" className="size-3.5 text-[#7093c9]" />
        </button>

        <span className="hidden h-7 w-px bg-[#e2eaf6] sm:block" />

        <button
          type="button"
          aria-label="Ubah tema"
          className="grid size-9 place-items-center rounded-full text-[#7890b7] transition hover:bg-[#f1f6fd] hover:text-[#147cf2]"
        >
          <Sun aria-hidden="true" className="size-5" />
        </button>

        <span className="hidden h-7 w-px bg-[#e2eaf6] sm:block" />

        <div className="flex items-center gap-3 text-[#263b69]">
          <span className="grid size-8 place-items-center rounded-full bg-[#8394b3] text-xs font-medium text-white">
            A
          </span>
          <span className="hidden text-[12px] font-medium sm:inline">Admin</span>
          <ChevronDown aria-hidden="true" className="size-3.5 text-[#31558d]" />
        </div>
      </div>
    </header>
  );
}
