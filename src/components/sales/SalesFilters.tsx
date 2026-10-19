"use client";

import { ChevronDown, Search } from "lucide-react";

import { salesRegions, salesStatuses } from "@/types/sales";

interface FilterSelectProps {
  label: string;
  name: string;
  defaultValue: string;
  options: ReadonlyArray<{ label: string; value: string }>;
}

function FilterSelect({
  label,
  name,
  defaultValue,
  options,
}: FilterSelectProps) {
  return (
    <label className="relative block min-w-0">
      <span className="sr-only">{label}</span>
      <select
        name={name}
        defaultValue={defaultValue}
        onChange={(event) => event.currentTarget.form?.requestSubmit()}
        className="h-9 w-full appearance-none rounded-md border border-[#e3ebf7] bg-white px-3 pr-9 text-[12px] font-medium text-[#112750] shadow-[0_2px_7px_rgba(46,91,154,0.04)] outline-none transition focus:border-[#7bb7ff] focus:ring-2 focus:ring-[#dcecff]"
      >
        <option value="">{label}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute right-3 top-1/2 size-3.5 -translate-y-1/2 text-[#7592c2]"
        strokeWidth={2}
      />
    </label>
  );
}

export interface SalesFilterValues {
  search: string;
  region: string;
  status: string;
  target: string;
}

const regionOptions = salesRegions.map((region) => ({
  label: region,
  value:
    {
      Jakarta: "JKT",
      Bandung: "BDG",
      Surabaya: "SBY",
      Denpasar: "DPS",
      Yogyakarta: "YGY",
      Semarang: "SMG",
      Medan: "MDN",
    }[region] ?? region,
}));

const statusOptions = salesStatuses.map((status) => ({
  label: status,
  value: status.toLowerCase().replaceAll(" ", "-"),
}));

export function SalesFilters({ values }: { values: SalesFilterValues }) {
  return (
    <form
      action="/sales"
      method="get"
      className="grid gap-3 rounded-lg border border-[#e2ebf7] bg-white p-[15px] shadow-[0_3px_14px_rgba(48,91,151,0.04)] md:grid-cols-2 xl:grid-cols-[minmax(320px,2.6fr)_repeat(3,minmax(150px,1fr))]"
    >
      <label className="relative min-w-0">
        <span className="sr-only">Cari nama atau ID sales</span>
        <button
          type="submit"
          aria-label="Cari sales"
          className="absolute left-3 top-1/2 z-10 -translate-y-1/2 text-[#7891bd]"
        >
          <Search aria-hidden="true" className="size-3.5" strokeWidth={2.2} />
        </button>
        <input
          type="search"
          name="search"
          defaultValue={values.search}
          placeholder="Cari nama atau ID sales..."
          className="h-9 w-full rounded-md border border-[#e3ebf7] bg-white pl-10 pr-3 text-[12px] text-[#112750] shadow-[0_2px_7px_rgba(46,91,154,0.04)] outline-none transition placeholder:text-[#8295bb] focus:border-[#7bb7ff] focus:ring-2 focus:ring-[#dcecff]"
        />
      </label>

      <FilterSelect
        label="Semua Wilayah"
        name="region"
        defaultValue={values.region}
        options={regionOptions}
      />
      <FilterSelect
        label="Semua Status"
        name="status"
        defaultValue={values.status}
        options={statusOptions}
      />
      <FilterSelect
        label="Semua Target"
        name="target"
        defaultValue={values.target}
        options={[
          { label: "Target tercapai", value: "achieved" },
          { label: "Target belum tercapai", value: "not-achieved" },
        ]}
      />
    </form>
  );
}
