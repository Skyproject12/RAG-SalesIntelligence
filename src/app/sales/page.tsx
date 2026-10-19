import { Suspense } from "react";

import { SalesContent } from "@/components/sales/SalesContent";
import { UsersRound } from "lucide-react";

function SalesLoading() {
  return (
    <div className="mt-5 space-y-3" aria-label="Memuat data sales">
      <div className="h-[68px] animate-pulse rounded-lg bg-[#edf4fc]" />
      <div className="h-[520px] animate-pulse rounded-lg bg-[#edf4fc]" />
    </div>
  );
}

export default function SalesPage() {
  return (
    <section className="mx-auto max-w-[1256px] lg:-mx-6 lg:-mt-[54px] lg:max-w-none">
      <div className="flex items-start gap-4 px-2">
        <UsersRound
          aria-hidden="true"
          className="mt-0.5 size-8 shrink-0 text-[#147df3]"
          strokeWidth={2.25}
        />
        <div>
          <h1 className="text-[28px] font-bold leading-tight tracking-[-0.025em] text-[#07183b]">
            List Sales
          </h1>
          <p className="mt-2 text-[13px] leading-5 text-[#7387b2]">
            Lihat dan pantau performa seluruh sales secara real-time.
          </p>
        </div>
      </div>

      <Suspense fallback={<SalesLoading />}>
        <SalesContent />
      </Suspense>
    </section>
  );
}
