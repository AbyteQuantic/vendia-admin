"use client";

import { use, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Store, Wifi, WifiOff, CreditCard } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { LineChart } from "@/components/charts/presets/line-chart";
import { SkeletonCard, SkeletonTable } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { useApi } from "@/hooks/use-api";
import { apiPatch } from "@/lib/api";
import { formatCOP, formatDate } from "@/lib/utils";
import { syncStatusBadge, timeAgo } from "@/components/admin/tenant-table";
import type { AdminTenantDetail } from "@/types/admin";

const subscriptionLabels: Record<string, string> = {
  trial: "Trial",
  active: "Activa",
  suspended: "Suspendida",
  cancelled: "Cancelada",
};
const subscriptionBadge: Record<string, "success" | "warning" | "danger" | "default"> = {
  trial: "default",
  active: "success",
  suspended: "warning",
  cancelled: "danger",
};
const nextStatuses = ["trial", "active", "suspended", "cancelled"] as const;

export default function TenantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: tenant, error, isLoading, mutate } = useApi<AdminTenantDetail>(`/api/v1/admin/tenants/${id}`);
  const [subModal, setSubModal] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleChangeSubscription() {
    if (!newStatus || !tenant) return;
    setSaving(true);
    try {
      await apiPatch(`/api/v1/admin/tenants/${id}/subscription`, { status: newStatus });
      await mutate();
      setSubModal(false);
    } finally {
      setSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <SkeletonCard />
        <SkeletonTable rows={4} />
      </div>
    );
  }

  if (error || !tenant) {
    return <ErrorState message="No se pudo cargar el tendero." onRetry={() => mutate()} />;
  }

  const sync = syncStatusBadge(tenant.last_sync_at);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/tenants" className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{tenant.business_name}</h1>
          <p className="text-sm text-gray-500">{tenant.business_type} — {tenant.owner_name}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <Store className="h-5 w-5 text-blue-600" />
            <CardTitle>Información</CardTitle>
          </div>
          <dl className="space-y-2.5 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">Dueño</dt>
              <dd className="font-medium text-gray-900">{tenant.owner_name}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Teléfono</dt>
              <dd className="font-medium text-gray-900">{tenant.phone}</dd>
            </div>
            {tenant.nit && (
              <div className="flex justify-between">
                <dt className="text-gray-500">NIT</dt>
                <dd className="font-medium text-gray-900">{tenant.nit}</dd>
              </div>
            )}
            {tenant.address && (
              <div className="flex justify-between">
                <dt className="text-gray-500">Dirección</dt>
                <dd className="font-medium text-gray-900">{tenant.address}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-gray-500">Registrado</dt>
              <dd className="text-gray-700">{formatDate(tenant.created_at)}</dd>
            </div>
          </dl>
        </Card>

        <Card>
          <div className="flex items-center gap-3 mb-4">
            {sync.variant === "success" ? <Wifi className="h-5 w-5 text-green-600" /> : <WifiOff className="h-5 w-5 text-yellow-600" />}
            <CardTitle>Sincronización</CardTitle>
          </div>
          <dl className="space-y-2.5 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">Estado</dt>
              <dd><Badge variant={sync.variant}>{sync.label}</Badge></dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Última sync</dt>
              <dd className="text-gray-700">{timeAgo(tenant.last_sync_at)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Ops pendientes</dt>
              <dd className={tenant.pending_sync_ops > 0 ? "font-semibold text-yellow-600" : "text-gray-700"}>
                {tenant.pending_sync_ops}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Ventas del mes</dt>
              <dd className="font-medium text-gray-900">{formatCOP(tenant.total_sales_month)}</dd>
            </div>
          </dl>
        </Card>

        <Card>
          <div className="flex items-center gap-3 mb-4">
            <CreditCard className="h-5 w-5 text-indigo-600" />
            <CardTitle>Suscripción</CardTitle>
          </div>
          <dl className="space-y-2.5 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">Estado</dt>
              <dd>
                <Badge variant={subscriptionBadge[tenant.subscription_status] ?? "default"}>
                  {subscriptionLabels[tenant.subscription_status] ?? tenant.subscription_status}
                </Badge>
              </dd>
            </div>
            {tenant.subscription_ends_at && (
              <div className="flex justify-between">
                <dt className="text-gray-500">Vence</dt>
                <dd className="text-gray-700">{formatDate(tenant.subscription_ends_at)}</dd>
              </div>
            )}
            {tenant.charge_mode && (
              <div className="flex justify-between">
                <dt className="text-gray-500">Modo de cobro</dt>
                <dd className="text-gray-700">{tenant.charge_mode === "post_payment" ? "Post-pago (mesas)" : "Pre-pago"}</dd>
              </div>
            )}
          </dl>
          <Button size="sm" variant="secondary" className="mt-4 w-full" onClick={() => { setNewStatus(tenant.subscription_status); setSubModal(true); }}>
            Cambiar plan
          </Button>
        </Card>
      </div>

      {tenant.sales_30d?.length > 0 && (
        <Card>
          <CardTitle>Ventas — Últimos 30 Días</CardTitle>
          <LineChart data={tenant.sales_30d} height="350px" />
        </Card>
      )}

      <Modal open={subModal} onClose={() => setSubModal(false)} title="Cambiar Suscripción">
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Selecciona el nuevo estado de suscripción para <strong>{tenant.business_name}</strong>.
          </p>
          <select
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            {nextStatuses.map((s) => (
              <option key={s} value={s}>{subscriptionLabels[s]}</option>
            ))}
          </select>
          {(newStatus === "suspended" || newStatus === "cancelled") && (
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
              {newStatus === "suspended"
                ? "El tendero perderá acceso temporal hasta reactivar."
                : "El tendero perderá acceso permanente. Esta acción es difícil de revertir."}
            </div>
          )}
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setSubModal(false)}>Cancelar</Button>
            <Button
              variant={newStatus === "cancelled" ? "danger" : "primary"}
              loading={saving}
              onClick={handleChangeSubscription}
            >
              Confirmar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
