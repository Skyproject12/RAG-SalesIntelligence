"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import useSWR from "swr";

import { salesRepository } from "@/repository/salesRepository";
import type { SalesQuery } from "@/types/sales";

import { SalesFilters } from "./SalesFilters";
import { SalesTable } from "./SalesTable";

type SalesSWRKey = readonly ["sales", SalesQuery];

function positiveInteger(value: string | null, fallback: number): number {
  const result = Number.parseInt(value ?? "", 10);
  return Number.isInteger(result) && result > 0 ? result : fallback;
}

function SalesLoading() {
  return (
    <div className="mt-3" aria-label="Memuat data sales">
      <div className="h-[520px] animate-pulse rounded-lg bg-[#edf4fc]" />
    </div>
  );
}

export function SalesContent() {
  const searchParams = useSearchParams();

  const query = useMemo<SalesQuery>(
    () => ({
      page: positiveInteger(searchParams.get("page"), 1),
      limit: 10,
      search: searchParams.get("search")?.trim() ?? "",
      region: searchParams.get("region")?.trim() ?? "",
      status: searchParams.get("status")?.trim() ?? "",
      target: searchParams.get("target")?.trim() ?? "",
    }),
    [searchParams],
  );

  const key = useMemo<SalesSWRKey>(() => ["sales", query], [query]);
  const { data, error, isLoading, isValidating, mutate } = useSWR<
    Awaited<ReturnType<typeof salesRepository.getAll>>,
    Error,
    SalesSWRKey
  >(key, ([, request]) => salesRepository.getAll(request), {
    keepPreviousData: true,
    revalidateOnFocus: true,
  });

  return (
    <>
      <div className="relative mt-5">
        <SalesFilters
          key={`${query.search}-${query.region}-${query.status}-${query.target}`}
          values={query}
        />
        {isValidating && data && (
          <span className="absolute right-4 top-[-24px] text-[11px] text-[#7188b6]">
            Memperbarui data...
          </span>
        )}
      </div>

      {isLoading && !data && <SalesLoading />}

      {error && !data && (
        <div className="mt-3 rounded-lg border border-[#ffd5d5] bg-[#fff8f8] px-5 py-6 text-[13px] text-[#a33939]">
          <p className="font-semibold">Data sales tidak dapat dimuat.</p>
          <p className="mt-1">
            Pastikan backend Go berjalan di http://localhost:8080.
          </p>
          <button
            type="button"
            onClick={() => void mutate()}
            className="mt-4 rounded-md bg-[#147df3] px-4 py-2 font-semibold text-white transition hover:bg-[#086bd7]"
          >
            Coba lagi
          </button>
        </div>
      )}

      {data && (
        <div className="mt-3">
          <SalesTable
            sales={data.sales}
            pagination={data.pagination}
            query={query}
          />
        </div>
      )}
    </>
  );
}
