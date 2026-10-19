import { Suspense } from "react";

import { SalesFilters } from "@/components/sales/SalesFilters";
import { SalesTable } from "@/components/sales/SalesTable";
import { getSales } from "@/repository/salesRepository";
import type { SalesQuery } from "@/types/sales";
import { UsersRound } from "lucide-react";

type SalesSearchParams = Promise<
  Record<string, string | string[] | undefined>
>;

function singleValue(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function positiveInteger(value: string, fallback: number): number {
  const result = Number.parseInt(value, 10);
  return Number.isInteger(result) && result > 0 ? result : fallback;
}

async function SalesContent({
  searchParams,
}: {
  searchParams: SalesSearchParams;
}) {
  const params = await searchParams;
  const query: SalesQuery = {
    page: positiveInteger(singleValue(params.page), 1),
    limit: 10,
    search: singleValue(params.search).trim(),
    region: singleValue(params.region).trim(),
    status: singleValue(params.status).trim(),
    target: singleValue(params.target).trim(),
  };

  const result = await getSales(query).catch((error: unknown) => {
    console.error("Gagal mengambil data dari backend:", error);
    return null;
  });

  if (!result) {
    return (
      <div className="mt-5 rounded-lg border border-[#ffd5d5] bg-[#fff8f8] px-5 py-6 text-[13px] text-[#a33939]">
        <p className="font-semibold">Data sales tidak dapat dimuat.</p>
        <p className="mt-1">
          Pastikan backend Go berjalan di http://localhost:8080, kemudian muat
          ulang halaman ini.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="mt-5">
        <SalesFilters
          key={`${query.search}-${query.region}-${query.status}-${query.target}`}
          values={query}
        />
      </div>
      <div className="mt-3">
        <SalesTable
          sales={result.sales}
          pagination={result.pagination}
          query={query}
        />
      </div>
    </>
  );
}

function SalesLoading() {
  return (
    <div className="mt-5 space-y-3" aria-label="Memuat data sales">
      <div className="h-[68px] animate-pulse rounded-lg bg-[#edf4fc]" />
      <div className="h-[520px] animate-pulse rounded-lg bg-[#edf4fc]" />
    </div>
  );
}

export default function SalesPage({
  searchParams,
}: {
  searchParams: SalesSearchParams;
}) {
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
        <SalesContent searchParams={searchParams} />
      </Suspense>
    </section>
  );
}
