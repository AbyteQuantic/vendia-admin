"use client";

import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Star,
  Banknote,
  Wifi,
  WifiOff,
} from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SkeletonCard, SkeletonTable } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { useApi } from "@/hooks/use-api";
import { formatCOP, formatDateShort, paymentMethodLabel } from "@/lib/utils";
import type { DashboardStats, Sale } from "@/types/models";

const REFRESH_INTERVAL = 30_000;

interface CreditSummary {
  total_pending: number;
  debtor_count: number;
}

interface SyncStatus {
  pending_ops: number;
  last_sync_at: string;
}

export default function DashboardPage() {
  const {
    data: stats,
    error: statsError,
    isLoading: statsLoading,
    mutate: mutateStats,
  } = useApi<DashboardStats>("/api/v1/sales/today", {
    refreshInterval: REFRESH_INTERVAL,
  });

  const {
    data: sales,
    error: salesError,
    isLoading: salesLoading,
    mutate: mutateSales,
  } = useApi<Sale[]>("/api/v1/sales", {
    refreshInterval: REFRESH_INTERVAL,
  });

  const { data: credits } = useApi<CreditSummary>("/api/v1/credits/summary");
  const { data: syncStatus } = useApi<SyncStatus>("/api/v1/sync/status", { refreshInterval: REFRESH_INTERVAL });

  const syncOnline = syncStatus ? (syncStatus.pending_ops === 0) : true;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">Resumen de tu negocio hoy</p>
      </div>

      {statsLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : statsError ? (
        <ErrorState
          message="No se pudieron cargar las estadísticas."
          onRetry={() => mutateStats()}
        />
      ) : stats ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <StatCard icon={<DollarSign className="h-5 w-5" />} label="Ventas hoy" value={formatCOP(stats.total_sales_today)} color="blue" />
          <StatCard icon={<ShoppingCart className="h-5 w-5" />} label="Transacciones" value={stats.transaction_count.toString()} color="green" />
          <StatCard icon={<Star className="h-5 w-5" />} label="Más vendido" value={stats.top_product || "—"} color="yellow" />
          <StatCard icon={<TrendingUp className="h-5 w-5" />} label="Tendencia" value={stats.trend} color="purple" />
          <Link href="/credits" className="block">
            <Card className="h-full transition-shadow hover:shadow-md">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500">Cuentas por cobrar</p>
                  <p className="mt-1 text-2xl font-bold text-gray-900">{credits ? formatCOP(credits.total_pending) : "—"}</p>
                  <p className="mt-0.5 text-xs text-gray-500">{credits ? `${credits.debtor_count} deudores` : ""}</p>
                </div>
                <div className="rounded-lg bg-orange-100 p-2.5 text-orange-600"><Banknote className="h-5 w-5" /></div>
              </div>
            </Card>
          </Link>
          <Card>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">Estado Sync</p>
                <div className="mt-1 flex items-center gap-2">
                  {syncOnline
                    ? <Badge variant="success">Sincronizado</Badge>
                    : <Badge variant="warning">{syncStatus?.pending_ops} pendientes</Badge>}
                </div>
              </div>
              <div className={`rounded-lg p-2.5 ${syncOnline ? "bg-green-100 text-green-600" : "bg-yellow-100 text-yellow-600"}`}>
                {syncOnline ? <Wifi className="h-5 w-5" /> : <WifiOff className="h-5 w-5" />}
              </div>
            </div>
          </Card>
        </div>
      ) : null}

      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Ventas recientes</h2>

        {salesLoading ? (
          <SkeletonTable rows={5} />
        ) : salesError ? (
          <ErrorState message="No se pudieron cargar las ventas." onRetry={() => mutateSales()} />
        ) : !sales?.length ? (
          <EmptyState title="Sin ventas aún" description="Las ventas de hoy aparecerán aquí." />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-4 py-3 font-medium text-gray-600">ID</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Fecha</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Total</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Método</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Items</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sales.map((sale) => (
                  <tr key={sale.ID} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-gray-500">#{sale.ID}</td>
                    <td className="px-4 py-3 text-gray-600">{formatDateShort(sale.CreatedAt)}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{formatCOP(sale.total)}</td>
                    <td className="px-4 py-3"><Badge>{paymentMethodLabel(sale.payment_method)}</Badge></td>
                    <td className="px-4 py-3 text-gray-500">{sale.Items?.length ?? 0} productos</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: "blue" | "green" | "yellow" | "purple" }) {
  const iconBg: Record<string, string> = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    yellow: "bg-yellow-100 text-yellow-600",
    purple: "bg-purple-100 text-purple-600",
  };
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`rounded-lg p-2.5 ${iconBg[color]}`}>{icon}</div>
      </div>
    </Card>
  );
}
