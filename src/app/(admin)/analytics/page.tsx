"use client";

import { useState } from "react";
import { DateRangeSelector } from "@/components/admin/date-range-selector";
import { LineChart } from "@/components/charts/presets/line-chart";
import { PieChart } from "@/components/charts/presets/pie-chart";
import { BarChart } from "@/components/charts/presets/bar-chart";
import { GaugeChart } from "@/components/charts/presets/gauge-chart";
import { HeatmapChart } from "@/components/charts/presets/heatmap-chart";
import { Card, CardTitle } from "@/components/ui/card";
import { SkeletonCard } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { useApi } from "@/hooks/use-api";
import type { AnalyticsData } from "@/types/admin";
import { paymentMethodLabel } from "@/lib/utils";

export default function AnalyticsPage() {
  const [days, setDays] = useState<7 | 30 | 90>(7);
  const { data, error, isLoading, mutate } = useApi<AnalyticsData>(
    `/api/v1/admin/analytics?days=${days}`,
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analíticas</h1>
          <p className="text-sm text-gray-500">Métricas avanzadas de la plataforma</p>
        </div>
        <DateRangeSelector value={days} onChange={setDays} />
      </div>

      {isLoading ? (
        <div className="grid gap-6 lg:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : error ? (
        <ErrorState message="No se pudieron cargar las analíticas." onRetry={() => mutate()} />
      ) : data ? (
        <>
          <Card>
            <CardTitle>Tendencia de Ventas Totales</CardTitle>
            <LineChart data={data.sales_trend} height="500px" showTransactions />
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardTitle>Métodos de Pago</CardTitle>
              <PieChart
                data={data.payment_methods.map((pm) => ({
                  name: paymentMethodLabel(pm.method),
                  value: pm.count,
                }))}
                height="300px"
              />
            </Card>
            <Card>
              <CardTitle>Ventas por Tipo de Negocio</CardTitle>
              <BarChart
                data={data.sales_by_business_type.map((s) => ({ label: s.type, value: s.total }))}
                horizontal
                formatAsCOP
                height="350px"
              />
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardTitle>Tenderos Online vs Offline</CardTitle>
              <GaugeChart
                value={data.online_vs_offline.online}
                max={data.online_vs_offline.online + data.online_vs_offline.offline}
                label="Online"
                height="300px"
              />
            </Card>
            <Card>
              <CardTitle>Top 10 Productos</CardTitle>
              <BarChart
                data={data.top_products.map((p) => ({ label: p.name, value: p.quantity }))}
                horizontal
                height="350px"
              />
            </Card>
          </div>

          <Card>
            <CardTitle>Mapa de Calor: Actividad por Hora</CardTitle>
            <HeatmapChart data={data.activity_heatmap} height="300px" />
          </Card>
        </>
      ) : null}
    </div>
  );
}
