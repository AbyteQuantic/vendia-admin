"use client";

import { useMemo } from "react";
import { CreditCard, Users } from "lucide-react";
import { StatCardAdmin } from "@/components/admin/stat-card-admin";
import { Badge } from "@/components/ui/badge";
import { SkeletonCard, SkeletonTable } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { useApi } from "@/hooks/use-api";
import type { AdminTenant } from "@/types/admin";

const badgeVariant: Record<string, "success" | "warning" | "danger" | "default"> = {
  trial: "default",
  active: "success",
  suspended: "warning",
  cancelled: "danger",
};

export default function SubscriptionsPage() {
  const { data: response, error, isLoading, mutate } = useApi<{ data: AdminTenant[] }>("/api/v1/admin/tenants");
  const tenants = response?.data ?? [];

  const stats = useMemo(() => {
    const counts = { trial: 0, active: 0, suspended: 0, cancelled: 0 };
    for (const t of tenants) {
      if (t.subscription_status in counts) {
        counts[t.subscription_status as keyof typeof counts]++;
      }
    }
    return counts;
  }, [tenants]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Suscripciones</h1>
        <p className="text-sm text-gray-500">Estado de suscripciones de todos los tenderos</p>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : error ? (
        <ErrorState message="No se pudieron cargar las suscripciones." onRetry={() => mutate()} />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCardAdmin icon={<Users className="h-5 w-5" />} label="Trial" value={stats.trial.toString()} />
            <StatCardAdmin icon={<CreditCard className="h-5 w-5" />} label="Activos" value={stats.active.toString()} changeDirection="up" />
            <StatCardAdmin icon={<CreditCard className="h-5 w-5" />} label="Suspendidos" value={stats.suspended.toString()} changeDirection={stats.suspended > 0 ? "down" : "neutral"} />
            <StatCardAdmin icon={<CreditCard className="h-5 w-5" />} label="Cancelados" value={stats.cancelled.toString()} />
          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-4 py-3 font-medium text-gray-600">Negocio</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Dueño</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Suscripción</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Vencimiento</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tenants.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{t.business_name}</td>
                    <td className="px-4 py-3 text-gray-600">{t.owner_name}</td>
                    <td className="px-4 py-3">
                      <Badge variant={badgeVariant[t.subscription_status] ?? "default"}>
                        {t.subscription_status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {t.subscription_ends_at ? new Date(t.subscription_ends_at).toLocaleDateString("es-CO") : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
