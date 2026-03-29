"use client";

import { Users, UserCheck, WifiOff, DollarSign } from "lucide-react";
import { StatCardAdmin } from "@/components/admin/stat-card-admin";
import { LineChart } from "@/components/charts/presets/line-chart";
import { PieChart } from "@/components/charts/presets/pie-chart";
import { HeatmapChart } from "@/components/charts/presets/heatmap-chart";
import { GaugeChart } from "@/components/charts/presets/gauge-chart";
import { Card, CardTitle } from "@/components/ui/card";
import { SkeletonCard } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { useApi } from "@/hooks/use-api";
import { formatCOP } from "@/lib/utils";
import type { AdminOverview } from "@/types/admin";

const REFRESH_INTERVAL = 30_000;

const MOCK_HEATMAP = Array.from({ length: 7 }, (_, day) =>
  Array.from({ length: 18 }, (_, h) => ({
    hour: h + 6,
    day,
    count: Math.floor(Math.random() * 50),
  })),
).flat();

export default function OverviewPage() {
  const { data, error, isLoading, mutate } = useApi<AdminOverview>(
    "/api/v1/admin/analytics/overview",
    { refreshInterval: REFRESH_INTERVAL },
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div><h1 className="text-2xl font-bold text-gray-900">Overview</h1></div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorState message="No se pudieron cargar las métricas." onRetry={() => mutate()} />;
  }

  if (!data) return null;

  const pieData = Object.entries(data.tenants_by_type).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Overview</h1>
        <p className="text-sm text-gray-500">Métricas globales de la plataforma</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCardAdmin
          icon={<Users className="h-5 w-5" />}
          label="Tenderos"
          value={data.total_tenants.toLocaleString("es-CO")}
        />
        <StatCardAdmin
          icon={<UserCheck className="h-5 w-5" />}
          label="Activos Hoy"
          value={data.active_today.toLocaleString("es-CO")}
          change={`${Math.round((data.active_today / Math.max(data.total_tenants, 1)) * 100)}% del total`}
          changeDirection="up"
        />
        <StatCardAdmin
          icon={<WifiOff className="h-5 w-5" />}
          label="Offline"
          value={data.offline_now.toLocaleString("es-CO")}
          changeDirection={data.offline_now > 0 ? "down" : "neutral"}
        />
        <StatCardAdmin
          icon={<DollarSign className="h-5 w-5" />}
          label="Ventas Hoy"
          value={formatCOP(data.total_sales_today)}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardTitle>Ventas Últimos 7 Días</CardTitle>
          <LineChart data={data.sales_trend_7d} height="400px" />
        </Card>
        <Card>
          <CardTitle>Tipos de Negocio</CardTitle>
          <PieChart data={pieData} height="300px" />
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardTitle>Actividad por Hora</CardTitle>
          <HeatmapChart data={MOCK_HEATMAP} height="300px" />
        </Card>
        <Card>
          <CardTitle>Sync Queue</CardTitle>
          <div className="flex flex-col items-center">
            <GaugeChart
              value={data.total_tenants - data.offline_now}
              max={data.total_tenants}
              label="Tenderos Online"
              height="250px"
            />
            <p className="mt-2 text-sm text-gray-500">
              <span className="font-semibold text-yellow-600">{data.sync_queue_pending.toLocaleString("es-CO")}</span> operaciones pendientes
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
