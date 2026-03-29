"use client";

import { SkeletonCard } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { useApi } from "@/hooks/use-api";
import { formatCOP } from "@/lib/utils";
import type { TableItem } from "@/types/admin";

export default function TablesPage() {
  const { data: tables, error, isLoading, mutate } = useApi<TableItem[]>("/api/v1/tables");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mesas</h1>
        <p className="text-sm text-gray-500">Estado actual de las mesas de tu negocio</p>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : error ? (
        <ErrorState message="No se pudieron cargar las mesas." onRetry={() => mutate()} />
      ) : !tables?.length ? (
        <EmptyState
          title="Sin mesas configuradas"
          description="Configura las mesas de tu negocio desde la app móvil."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {tables.map((table) => {
            const isOccupied = table.current_tab_status === "open";
            return (
              <div
                key={table.id}
                className={`rounded-xl border-2 p-5 transition-colors ${
                  isOccupied
                    ? "border-yellow-300 bg-yellow-50"
                    : "border-gray-200 bg-white"
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">{table.label}</h3>
                  <Badge variant={isOccupied ? "warning" : "success"}>
                    {isOccupied ? "Ocupada" : "Libre"}
                  </Badge>
                </div>
                {isOccupied && table.current_tab_total != null && (
                  <p className="mt-3 text-2xl font-bold text-gray-900">
                    {formatCOP(table.current_tab_total)}
                  </p>
                )}
                {!isOccupied && (
                  <p className="mt-3 text-sm text-gray-400">Disponible</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
