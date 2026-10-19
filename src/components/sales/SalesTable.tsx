import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { formatCurrency } from "@/lib/utils";
import type {
  AvatarColor,
  Sale,
  SalesPagination,
  SalesQuery,
  SalesStatus,
} from "@/types/sales";

import { SalesActionMenu } from "./SalesActionMenu";

interface SalesTableProps {
  sales: Sale[];
  pagination: SalesPagination;
  query: SalesQuery;
}

const avatarStyles: Record<AvatarColor, string> = {
  blue: "bg-[#dceeff] text-[#1879eb]",
  purple: "bg-[#e6d8ff] text-[#7438e9]",
  green: "bg-[#d3f3e9] text-[#009e7a]",
  pink: "bg-[#ffd9e8] text-[#f02e73]",
  cyan: "bg-[#d8f2f8] text-[#0b9ebb]",
};

const statusStyles: Record<SalesStatus, string> = {
  "On Track": "bg-[#dbf5ed] text-[#008d73]",
  "Over Target": "bg-[#dcecff] text-[#0067df]",
  "Below Target": "bg-[#fff0dc] text-[#ee6500]",
};

const progressStyles: Record<SalesStatus, string> = {
  "On Track": "bg-[#08b899]",
  "Over Target": "bg-[#2186f3]",
  "Below Target": "bg-[#ffb20b]",
};

function PaginationButton({
  children,
  href,
  active = false,
  disabled = false,
  label,
}: {
  children: React.ReactNode;
  href: string;
  active?: boolean;
  disabled?: boolean;
  label?: string;
}) {
  const className = `grid size-7 place-items-center rounded-md text-[12px] font-medium transition ${
    active
      ? "bg-[#1884f5] text-white shadow-[0_4px_10px_rgba(24,132,245,0.24)]"
      : disabled
        ? "pointer-events-none text-[#b7c5da]"
        : "text-[#183365] hover:bg-[#eff6ff]"
  }`;

  if (disabled) {
    return <span className={className}>{children}</span>;
  }

  return (
    <Link
      href={href}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      className={className}
    >
      {children}
    </Link>
  );
}

function getPageHref(page: number, query: SalesQuery): string {
  const params = new URLSearchParams();

  params.set("page", String(page));
  if (query.search) params.set("search", query.search);
  if (query.region) params.set("region", query.region);
  if (query.status) params.set("status", query.status);
  if (query.target) params.set("target", query.target);

  return `/sales?${params.toString()}`;
}

function getVisiblePages(currentPage: number, totalPages: number): number[] {
  const visibleCount = Math.min(5, totalPages);
  const start = Math.max(
    1,
    Math.min(currentPage - 2, totalPages - visibleCount + 1),
  );

  return Array.from({ length: visibleCount }, (_, index) => start + index);
}

export function SalesTable({ sales, pagination, query }: SalesTableProps) {
  const firstItem =
    pagination.total === 0
      ? 0
      : (pagination.page - 1) * pagination.limit + 1;
  const lastItem = Math.min(
    pagination.page * pagination.limit,
    pagination.total,
  );
  const visiblePages = getVisiblePages(
    pagination.page,
    pagination.totalPages,
  );

  return (
    <div className="overflow-hidden rounded-lg border border-[#e2ebf7] bg-white shadow-[0_3px_14px_rgba(48,91,151,0.04)]">
      <div className="overflow-x-auto px-3 pt-3">
        <table className="w-full min-w-[1120px] table-fixed border-collapse text-left text-[12px] text-[#102a5d]">
          <colgroup>
            <col className="w-[5%]" />
            <col className="w-[17%]" />
            <col className="w-[9%]" />
            <col className="w-[11%]" />
            <col className="w-[12%]" />
            <col className="w-[12%]" />
            <col className="w-[16%]" />
            <col className="w-[12%]" />
            <col className="w-[6%]" />
          </colgroup>
          <thead className="text-[11px] text-[#526c9f]">
            <tr className="border-b border-[#e9eff8]">
              <th className="h-12 px-3 font-semibold">No</th>
              <th className="h-12 px-3 font-semibold">Nama Sales</th>
              <th className="h-12 px-3 font-semibold">ID Sales</th>
              <th className="h-12 px-3 font-semibold">Wilayah</th>
              <th className="h-12 px-3 font-semibold">Total Penjualan</th>
              <th className="h-12 px-3 font-semibold">Target</th>
              <th className="h-12 px-3 font-semibold">Pencapaian</th>
              <th className="h-12 px-3 font-semibold">Status</th>
              <th className="h-12 px-3 text-center font-semibold">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((sale, index) => (
              <tr
                key={sale.id}
                className="h-[55px] border-b border-[#edf2f9] transition hover:bg-[#f8fbff]"
              >
                <td className="px-3">
                  {(pagination.page - 1) * pagination.limit + index + 1}
                </td>
                <td className="px-3">
                  <div className="flex items-center gap-4">
                    <span
                      className={`grid size-8 shrink-0 place-items-center rounded-full text-[12px] font-medium ${avatarStyles[sale.avatarColor]}`}
                    >
                      {sale.initials}
                    </span>
                    <span className="truncate font-medium text-[#102652]">
                      {sale.name}
                    </span>
                  </div>
                </td>
                <td className="px-3">{sale.id}</td>
                <td className="px-3">{sale.region}</td>
                <td className="px-3 whitespace-nowrap">
                  {formatCurrency(sale.totalSales)}
                </td>
                <td className="px-3 whitespace-nowrap">
                  {formatCurrency(sale.target)}
                </td>
                <td className="px-3">
                  <div className="max-w-[142px]">
                    <span className="font-medium">{sale.achievement}%</span>
                    <div className="mt-1.5 h-[5px] overflow-hidden rounded-full bg-[#eaf0fa]">
                      <div
                        className={`h-full rounded-full ${progressStyles[sale.status]}`}
                        style={{ width: `${Math.min(sale.achievement, 100)}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className="px-3">
                  <span
                    className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-[11px] font-medium ${statusStyles[sale.status]}`}
                  >
                    {sale.status}
                  </span>
                </td>
                <td className="px-3 text-center">
                  <SalesActionMenu sale={sale} />
                </td>
              </tr>
            ))}
            {sales.length === 0 && (
              <tr>
                <td
                  colSpan={9}
                  className="h-32 px-4 text-center text-[13px] text-[#7188b6]"
                >
                  Data sales tidak ditemukan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex min-h-[76px] flex-col items-center justify-between gap-4 px-5 py-4 sm:flex-row">
        <p className="text-[12px] text-[#7188b6]">
          Menampilkan {firstItem}–{lastItem} dari {pagination.total} sales
        </p>
        <nav className="flex items-center gap-1" aria-label="Paginasi daftar sales">
          <PaginationButton
            href={getPageHref(Math.max(1, pagination.page - 1), query)}
            disabled={pagination.page <= 1}
            label="Halaman sebelumnya"
          >
            <ChevronLeft aria-hidden="true" className="size-4 text-[#8ca5ca]" />
          </PaginationButton>
          {visiblePages.map((page) => (
            <PaginationButton
              key={page}
              href={getPageHref(page, query)}
              active={page === pagination.page}
            >
              {page}
            </PaginationButton>
          ))}
          <PaginationButton
            href={getPageHref(
              Math.min(pagination.totalPages || 1, pagination.page + 1),
              query,
            )}
            disabled={
              pagination.totalPages === 0 ||
              pagination.page >= pagination.totalPages
            }
            label="Halaman berikutnya"
          >
            <ChevronRight aria-hidden="true" className="size-4 text-[#6e91c4]" />
          </PaginationButton>
        </nav>
      </div>
    </div>
  );
}
