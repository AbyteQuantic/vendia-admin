"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SkeletonTable } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { useApi } from "@/hooks/use-api";
import { formatCOP, formatDate, paymentMethodLabel } from "@/lib/utils";
import type { Sale } from "@/types/models";

export default function SalesPage() {
  const { data: sales, error, isLoading, mutate } = useApi<Sale[]>("/api/v1/sales");
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  function toggleExpand(id: number) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const paymentBadge: Record<string, "default" | "success" | "warning"> = {
    cash: "success",
    transfer: "warning",
    card: "default",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Ventas</h1>
        <p className="text-sm text-gray-500">Historial de transacciones recientes</p>
      </div>

      {isLoading ? (
        <SkeletonTable rows={8} />
      ) : error ? (
        <ErrorState
          message="No se pudieron cargar las ventas."
          onRetry={() => mutate()}
        />
      ) : !sales?.length ? (
        <EmptyState
          title="Sin ventas registradas"
          description="Cuando se registren ventas desde la app, aparecerán aquí."
        />
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-x-auto rounded-xl border border-gray-200 bg-white md:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="w-10 px-4 py-3" />
                  <th className="px-4 py-3 font-medium text-gray-600">ID</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Fecha</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Total</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Método de Pago</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Items</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sales.map((sale) => {
                  const isExpanded = expanded.has(sale.ID);
                  return (
                    <SaleRow
                      key={sale.ID}
                      sale={sale}
                      isExpanded={isExpanded}
                      onToggle={() => toggleExpand(sale.ID)}
                      paymentBadge={paymentBadge}
                    />
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="space-y-3 md:hidden">
            {sales.map((sale) => {
              const isExpanded = expanded.has(sale.ID);
              return (
                <div
                  key={sale.ID}
                  className="rounded-xl border border-gray-200 bg-white"
                >
                  <button
                    onClick={() => toggleExpand(sale.ID)}
                    className="flex w-full items-center justify-between p-4 text-left"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {formatCOP(sale.total)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(sale.CreatedAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={paymentBadge[sale.payment_method] ?? "default"}>
                        {paymentMethodLabel(sale.payment_method)}
                      </Badge>
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  </button>
                  {isExpanded && sale.Items?.length > 0 && (
                    <div className="border-t border-gray-100 px-4 pb-4 pt-3">
                      <ul className="space-y-2">
                        {sale.Items.map((item) => (
                          <li key={item.ID} className="flex justify-between text-sm">
                            <span className="text-gray-700">
                              {item.name} × {item.quantity}
                            </span>
                            <span className="font-medium text-gray-900">
                              {formatCOP(item.subtotal)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function SaleRow({
  sale,
  isExpanded,
  onToggle,
  paymentBadge,
}: {
  sale: Sale;
  isExpanded: boolean;
  onToggle: () => void;
  paymentBadge: Record<string, "default" | "success" | "warning">;
}) {
  return (
    <>
      <tr className="hover:bg-gray-50">
        <td className="px-4 py-3">
          <button
            onClick={onToggle}
            className="rounded p-0.5 text-gray-400 hover:text-gray-600"
            aria-label={isExpanded ? "Colapsar" : "Expandir"}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        </td>
        <td className="px-4 py-3 font-mono text-gray-500">#{sale.ID}</td>
        <td className="px-4 py-3 text-gray-600">{formatDate(sale.CreatedAt)}</td>
        <td className="px-4 py-3 font-medium text-gray-900">{formatCOP(sale.total)}</td>
        <td className="px-4 py-3">
          <Badge variant={paymentBadge[sale.payment_method] ?? "default"}>
            {paymentMethodLabel(sale.payment_method)}
          </Badge>
        </td>
        <td className="px-4 py-3 text-gray-500">
          {sale.Items?.length ?? 0} productos
        </td>
      </tr>
      {isExpanded && sale.Items?.length > 0 && (
        <tr>
          <td colSpan={6} className="bg-gray-50 px-8 py-3">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-500">
                  <th className="pb-2 text-left font-medium">Producto</th>
                  <th className="pb-2 text-right font-medium">Precio</th>
                  <th className="pb-2 text-right font-medium">Cant.</th>
                  <th className="pb-2 text-right font-medium">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sale.Items.map((item) => (
                  <tr key={item.ID}>
                    <td className="py-1.5 text-gray-700">{item.name}</td>
                    <td className="py-1.5 text-right text-gray-600">
                      {formatCOP(item.price)}
                    </td>
                    <td className="py-1.5 text-right text-gray-600">
                      {item.quantity}
                    </td>
                    <td className="py-1.5 text-right font-medium text-gray-900">
                      {formatCOP(item.subtotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </td>
        </tr>
      )}
    </>
  );
}
