"use client";

import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface TenantFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  subscriptionFilter: string;
  onSubscriptionFilterChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
}

const subscriptionOptions = [
  { label: "Todos", value: "" },
  { label: "Trial", value: "trial" },
  { label: "Activo", value: "active" },
  { label: "Suspendido", value: "suspended" },
  { label: "Cancelado", value: "cancelled" },
];

const statusOptions = [
  { label: "Todos", value: "" },
  { label: "Online", value: "online" },
  { label: "Offline", value: "offline" },
];

export function TenantFilters({
  search,
  onSearchChange,
  subscriptionFilter,
  onSubscriptionFilterChange,
  statusFilter,
  onStatusFilterChange,
}: TenantFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por negocio o teléfono..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="block w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        />
      </div>

      <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-1">
        {subscriptionOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onSubscriptionFilterChange(opt.value)}
            className={cn(
              "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
              subscriptionFilter === opt.value
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700",
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-1">
        {statusOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onStatusFilterChange(opt.value)}
            className={cn(
              "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
              statusFilter === opt.value
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700",
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
