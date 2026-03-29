"use client";

import Link from "next/link";
import { Eye, ChevronUp, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCOP } from "@/lib/utils";
import type { AdminTenant } from "@/types/admin";

interface TenantTableProps {
  tenants: AdminTenant[];
  sortKey: string;
  sortDir: "asc" | "desc";
  onSort: (key: string) => void;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "ahora";
  if (mins < 60) return `hace ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `hace ${hours}h`;
  const days = Math.floor(hours / 24);
  return `hace ${days}d`;
}

function syncStatusBadge(lastSync: string): { variant: "success" | "warning" | "danger"; label: string } {
  const diff = Date.now() - new Date(lastSync).getTime();
  const mins = diff / 60000;
  if (mins < 5) return { variant: "success", label: "Online" };
  if (mins < 1440) return { variant: "warning", label: "Offline" };
  return { variant: "danger", label: "Desconectado" };
}

const subscriptionBadge: Record<string, "success" | "warning" | "danger" | "default"> = {
  trial: "default",
  active: "success",
  suspended: "warning",
  cancelled: "danger",
};

function SortHeader({ label, sortKey: key, currentKey, dir, onSort }: { label: string; sortKey: string; currentKey: string; dir: "asc" | "desc"; onSort: (k: string) => void }) {
  const active = currentKey === key;
  return (
    <th className="px-4 py-3 font-medium text-gray-600">
      <button onClick={() => onSort(key)} className="inline-flex items-center gap-1 hover:text-gray-900">
        {label}
        {active && (dir === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
      </button>
    </th>
  );
}

export function TenantTable({ tenants, sortKey, sortDir, onSort }: TenantTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-gray-200 bg-gray-50">
          <tr>
            <SortHeader label="Negocio" sortKey="business_name" currentKey={sortKey} dir={sortDir} onSort={onSort} />
            <th className="px-4 py-3 font-medium text-gray-600">Dueño</th>
            <th className="px-4 py-3 font-medium text-gray-600">Estado</th>
            <th className="px-4 py-3 font-medium text-gray-600">Última Sync</th>
            <SortHeader label="Ventas del Mes" sortKey="total_sales_month" currentKey={sortKey} dir={sortDir} onSort={onSort} />
            <th className="px-4 py-3 font-medium text-gray-600">Suscripción</th>
            <th className="px-4 py-3 font-medium text-gray-600">Ops Pend.</th>
            <th className="px-4 py-3 font-medium text-gray-600">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {tenants.map((t) => {
            const sync = syncStatusBadge(t.last_sync_at);
            return (
              <tr key={t.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900">{t.business_name}</p>
                  <p className="text-xs text-gray-500">{t.business_type}</p>
                </td>
                <td className="px-4 py-3">
                  <p className="text-gray-700">{t.owner_name}</p>
                  <p className="text-xs text-gray-500">{t.phone}</p>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={sync.variant}>{sync.label}</Badge>
                </td>
                <td className="px-4 py-3 text-gray-500">{timeAgo(t.last_sync_at)}</td>
                <td className="px-4 py-3 font-medium text-gray-900">{formatCOP(t.total_sales_month)}</td>
                <td className="px-4 py-3">
                  <Badge variant={subscriptionBadge[t.subscription_status] ?? "default"}>
                    {t.subscription_status}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <span className={t.pending_sync_ops > 0 ? "font-semibold text-yellow-600" : "text-gray-500"}>
                    {t.pending_sync_ops}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/tenants/${t.id}`}
                    className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm text-blue-600 hover:bg-blue-50"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Ver
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export { syncStatusBadge, timeAgo };
