export const salesRegions = [
  "Jakarta",
  "Bandung",
  "Surabaya",
  "Denpasar",
  "Yogyakarta",
  "Semarang",
  "Medan",
] as const;

export const salesStatuses = ["On Track", "Over Target", "Below Target"] as const;

export type SalesRegion = (typeof salesRegions)[number];
export type SalesStatus = (typeof salesStatuses)[number];
export type AvatarColor = "blue" | "purple" | "green" | "pink" | "cyan";

export interface Sale {
  id: string;
  name: string;
  initials: string;
  avatarColor: AvatarColor;
  region: string;
  totalSales: number;
  target: number;
  achievement: number;
  status: SalesStatus;
}

export interface SalesQuery {
  page: number;
  limit: number;
  search: string;
  region: string;
  status: string;
  target: string;
}

export interface SalesPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface SalesResult {
  sales: Sale[];
  pagination: SalesPagination;
}
