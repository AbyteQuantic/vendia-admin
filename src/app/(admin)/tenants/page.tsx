"use client";

import { useState, useMemo } from "react";
import { TenantTable } from "@/components/admin/tenant-table";
import { TenantFilters } from "@/components/admin/tenant-filters";
import { Button } from "@/components/ui/button";
import { SkeletonTable } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { useApi } from "@/hooks/use-api";
import type { AdminTenant } from "@/types/admin";

const PAGE_SIZE = 15;

export default function TenantsPage() {
  const { data: response, error, isLoading, mutate } = useApi<{ data: AdminTenant[] }>("/api/v1/admin/tenants");
  const [search, setSearch] = useState("");
  const [subFilter, setSubFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortKey, setSortKey] = useState("business_name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(0);

  const tenants = useMemo(() => response?.data ?? [], [response]);

  const filtered = useMemo(() => {
    let result = tenants;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) => t.business_name.toLowerCase().includes(q) || t.phone.includes(q),
      );
    }
    if (subFilter) {
      result = result.filter((t) => t.subscription_status === subFilter);
    }
    if (statusFilter === "online") {
      result = result.filter((t) => t.is_online);
    } else if (statusFilter === "offline") {
      result = result.filter((t) => !t.is_online);
    }

    result.sort((a, b) => {
      const aVal = a[sortKey as keyof AdminTenant];
      const bVal = b[sortKey as keyof AdminTenant];
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortDir === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortDir === "asc"
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number);
    });

    return result;
  }, [tenants, search, subFilter, statusFilter, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  function handleSort(key: string) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(0);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tenderos</h1>
        <p className="text-sm text-gray-500">Gestiona todos los tenderos de la plataforma</p>
      </div>

      <TenantFilters
        search={search}
        onSearchChange={(v) => { setSearch(v); setPage(0); }}
        subscriptionFilter={subFilter}
        onSubscriptionFilterChange={(v) => { setSubFilter(v); setPage(0); }}
        statusFilter={statusFilter}
        onStatusFilterChange={(v) => { setStatusFilter(v); setPage(0); }}
      />

      {isLoading ? (
        <SkeletonTable rows={8} />
      ) : error ? (
        <ErrorState message="No se pudieron cargar los tenderos." onRetry={() => mutate()} />
      ) : !tenants.length ? (
        <EmptyState title="Sin tenderos" description="No hay tenderos registrados aún." />
      ) : !filtered.length ? (
        <EmptyState title="Sin resultados" description="No hay tenderos que coincidan con los filtros." />
      ) : (
        <>
          <TenantTable tenants={paginated} sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />

          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)} de {filtered.length}
              </p>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
                  Anterior
                </Button>
                <Button variant="secondary" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
