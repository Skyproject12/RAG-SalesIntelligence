import type {
  AvatarColor,
  Sale,
  SalesQuery,
  SalesResult,
  SalesStatus,
} from "@/types/sales";

interface SalesApiItem {
  id: number;
  sales_code: string;
  name: string;
  email: string | null;
  region: string | null;
  region_code: string | null;
  is_active: boolean;
  target_amount: number;
  achieved_amount: number;
  achievement_percent: number;
}

interface SalesApiResponse {
  data: SalesApiItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

const avatarColors: AvatarColor[] = [
  "blue",
  "purple",
  "green",
  "pink",
  "cyan",
];

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
}

function getStatus(achievement: number): SalesStatus {
  if (achievement >= 100) return "Over Target";
  if (achievement >= 75) return "On Track";
  return "Below Target";
}

function toSale(item: SalesApiItem): Sale {
  return {
    id: item.sales_code,
    name: item.name,
    initials: getInitials(item.name),
    avatarColor: avatarColors[(item.id - 1) % avatarColors.length],
    region: item.region ?? "-",
    totalSales: item.achieved_amount,
    target: item.target_amount,
    achievement: Math.round(item.achievement_percent),
    status: getStatus(item.achievement_percent),
  };
}

async function getAll(query: SalesQuery): Promise<SalesResult> {
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
  const url = new URL("/api/v1/sales", apiUrl);

  url.searchParams.set("page", String(query.page));
  url.searchParams.set("limit", String(query.limit));

  if (query.search) url.searchParams.set("search", query.search);
  if (query.region) url.searchParams.set("region", query.region);
  if (query.status) url.searchParams.set("status", query.status);
  if (query.target) url.searchParams.set("target", query.target);

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`API sales merespons dengan status ${response.status}`);
  }

  const result = (await response.json()) as SalesApiResponse;

  if (!Array.isArray(result.data) || !result.pagination) {
    throw new Error("Format respons API sales tidak valid");
  }

  return {
    sales: result.data.map(toSale),
    pagination: {
      page: result.pagination.page,
      limit: result.pagination.limit,
      total: result.pagination.total,
      totalPages: result.pagination.total_pages,
    },
  };
}

export const salesRepository = {
  getAll,
};
