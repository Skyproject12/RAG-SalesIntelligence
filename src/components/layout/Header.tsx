import { ChevronDown, Sun, UsersRound } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-30 flex h-[65px] items-center justify-between border-b border-[#dce9f8] bg-white px-4 sm:px-6">
      <button
        type="button"
        aria-label="Pilih sales aktif"
        className="flex h-9 items-center gap-3 rounded-xl bg-[#eff6ff] px-3 text-[12px] font-semibold text-[#102752] transition hover:bg-[#e5f0ff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9ac7fb]"
      >
        <UsersRound
          aria-hidden="true"
          className="size-[18px] text-[#087cf0]"
          strokeWidth={2.15}
        />
        <span className="max-w-[145px] truncate">I Kadek Sumendra</span>
      </button>

      <div className="flex h-full items-center">
        <span className="hidden h-8 w-px bg-[#e3ebf6] sm:block" />

        <button
          type="button"
          aria-label="Ubah tema"
          className="mx-3 grid size-9 place-items-center rounded-full text-[#7293c1] transition hover:bg-[#f1f6fd] hover:text-[#147cf2] sm:mx-5"
        >
          <Sun aria-hidden="true" className="size-5" strokeWidth={1.8} />
        </button>

        <span className="hidden h-8 w-px bg-[#e3ebf6] sm:block" />

        <button
          type="button"
          aria-label="Buka menu akun"
          className="ml-3 flex items-center gap-4 rounded-lg px-1 py-1 text-[#2f5e98] transition hover:bg-[#f5f8fd] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9ac7fb] sm:ml-5"
        >
          <span className="grid size-8 place-items-center rounded-full bg-[#7f9ec9] text-[12px] font-medium text-white">
            I
          </span>
          <ChevronDown
            aria-hidden="true"
            className="size-3.5 text-[#2f6aaa]"
            strokeWidth={2}
          />
        </button>
      </div>
    </header>
  );
}
