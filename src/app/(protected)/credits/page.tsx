"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { SkeletonTable } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { useApi } from "@/hooks/use-api";
import { apiPost } from "@/lib/api";
import { formatCOP, formatDate } from "@/lib/utils";
import type { CreditAccount } from "@/types/admin";

const statusBadge: Record<string, "danger" | "warning" | "success"> = {
  open: "danger",
  partial: "warning",
  paid: "success",
};
const statusLabel: Record<string, string> = {
  open: "Pendiente",
  partial: "Parcial",
  paid: "Pagado",
};

export default function CreditsPage() {
  const { data: credits, error, isLoading, mutate } = useApi<CreditAccount[]>("/api/v1/credits");
  const [paymentModal, setPaymentModal] = useState<CreditAccount | null>(null);
  const [amount, setAmount] = useState("");
  const [saving, setSaving] = useState(false);
  const [payError, setPayError] = useState("");

  async function handlePayment() {
    if (!paymentModal || !amount || Number(amount) <= 0) return;
    setSaving(true);
    setPayError("");
    try {
      await apiPost(`/api/v1/credits/${paymentModal.id}/payments`, {
        amount: Number(amount),
        payment_method: "cash",
      });
      await mutate();
      setPaymentModal(null);
      setAmount("");
    } catch (err) {
      setPayError(err instanceof Error ? err.message : "Error al registrar abono.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Cuentas por Cobrar</h1>
        <p className="text-sm text-gray-500">Gestiona las ventas fiadas de tu tienda</p>
      </div>

      {isLoading ? (
        <SkeletonTable rows={6} />
      ) : error ? (
        <ErrorState message="No se pudieron cargar los créditos." onRetry={() => mutate()} />
      ) : !credits?.length ? (
        <EmptyState
          title="Sin cuentas por cobrar"
          description="Cuando fíes productos desde la app, las cuentas aparecerán aquí."
        />
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-x-auto rounded-xl border border-gray-200 bg-white md:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-4 py-3 font-medium text-gray-600">Cliente</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Monto Total</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Pagado</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Pendiente</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Estado</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Fecha</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {credits.map((c) => {
                  const pending = c.total_amount - c.paid_amount;
                  return (
                    <tr key={c.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{c.customer_name}</p>
                        <p className="text-xs text-gray-500">{c.customer_phone}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-700">{formatCOP(c.total_amount)}</td>
                      <td className="px-4 py-3 text-gray-700">{formatCOP(c.paid_amount)}</td>
                      <td className="px-4 py-3">
                        <span className={pending > 0 ? "font-semibold text-red-600" : "text-gray-700"}>
                          {formatCOP(pending)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={statusBadge[c.status]}>{statusLabel[c.status]}</Badge>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{formatDate(c.created_at)}</td>
                      <td className="px-4 py-3">
                        {c.status !== "paid" && (
                          <Button size="sm" variant="secondary" onClick={() => { setPaymentModal(c); setAmount(""); setPayError(""); }}>
                            Abonar
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="space-y-3 md:hidden">
            {credits.map((c) => {
              const pending = c.total_amount - c.paid_amount;
              return (
                <div key={c.id} className="rounded-xl border border-gray-200 bg-white p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{c.customer_name}</p>
                      <p className="text-xs text-gray-500">{c.customer_phone}</p>
                    </div>
                    <Badge variant={statusBadge[c.status]}>{statusLabel[c.status]}</Badge>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="text-gray-500">Pendiente:</span>
                    <span className={pending > 0 ? "font-semibold text-red-600" : "text-gray-700"}>
                      {formatCOP(pending)}
                    </span>
                  </div>
                  {c.status !== "paid" && (
                    <Button size="sm" variant="secondary" className="mt-3 w-full" onClick={() => { setPaymentModal(c); setAmount(""); setPayError(""); }}>
                      Registrar abono
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      <Modal open={!!paymentModal} onClose={() => setPaymentModal(null)} title="Registrar Abono">
        {paymentModal && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              Abono para <strong>{paymentModal.customer_name}</strong>.
              Pendiente: <strong className="text-red-600">{formatCOP(paymentModal.total_amount - paymentModal.paid_amount)}</strong>
            </p>
            {payError && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{payError}</div>
            )}
            <Input
              id="payment-amount"
              label="Monto del abono (COP)"
              type="number"
              min="1"
              max={paymentModal.total_amount - paymentModal.paid_amount}
              placeholder="10000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setPaymentModal(null)}>Cancelar</Button>
              <Button loading={saving} onClick={handlePayment}>Registrar</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
