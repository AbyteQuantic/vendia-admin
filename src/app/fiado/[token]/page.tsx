"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://vendia-api.onrender.com";

interface TimelineEntry {
  type: "debt" | "payment";
  amount: number;
  note: string;
  created_at: string;
}

interface FiadoData {
  business_name: string;
  business_logo: string;
  customer_name: string;
  customer_phone: string;
  total_amount: number;
  paid_amount: number;
  balance: number;
  description: string;
  fiado_status: string;
  status: string;
  created_at: string;
  accepted_at: string | null;
  timeline: TimelineEntry[];
}

function formatCOP(amount: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("es-CO", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function FiadoPage() {
  const params = useParams();
  const token = params.token as string;

  const [data, setData] = useState<FiadoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [phone, setPhone] = useState("");
  const [termsChecked, setTermsChecked] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = () => {
    if (!token) return;
    fetch(`${API_URL}/api/v1/public/fiado/${token}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.data) {
          setData(json.data);
          if (json.data.customer_phone) setPhone(json.data.customer_phone);
        } else {
          setError("Fiado no encontrado");
        }
      })
      .catch(() => setError("Error al cargar los datos"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [token]);

  const handleAccept = async () => {
    if (!termsChecked || !phone) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/v1/public/fiado/${token}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone_confirm: phone, accept_terms: true }),
      });
      if (res.ok) {
        fetchData();
      } else {
        const json = await res.json();
        setError(json.error || "Error al aceptar");
      }
    } catch {
      setError("Error de conexion");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent" />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-red-600 mb-2">Error</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  // ══════════════════════════════════════════════════════════════════════════
  // ACCEPTED → Account Statement with Timeline
  // ══════════════════════════════════════════════════════════════════════════
  if (data.fiado_status === "accepted") {
    const isClosed = data.status === "closed" || data.balance <= 0;

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 pb-10 text-white">
          <p className="text-sm text-amber-100 opacity-80">Tu cuenta en</p>
          <h1 className="text-2xl font-bold">{data.business_name}</h1>
          <p className="text-amber-100 mt-1">Hola, {data.customer_name}</p>
        </div>

        {/* Balance card */}
        <div className="px-4 -mt-6">
          <div className={`rounded-2xl p-6 shadow-lg text-center ${
            isClosed ? "bg-green-50 border-2 border-green-200" : "bg-white"
          }`}>
            <p className="text-sm text-gray-500 mb-1">
              {isClosed ? "✅ Cuenta saldada" : "Saldo pendiente"}
            </p>
            <p className={`text-5xl font-extrabold ${
              isClosed ? "text-green-600" : "text-amber-700"
            }`}>
              {formatCOP(Math.max(data.balance, 0))}
            </p>
            {!isClosed && data.total_amount > 0 && (
              <div className="mt-4 bg-gray-100 rounded-xl p-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Total fiado</span>
                  <span className="font-semibold text-gray-700">{formatCOP(data.total_amount)}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-500">Total abonado</span>
                  <span className="font-semibold text-green-600">{formatCOP(data.paid_amount)}</span>
                </div>
                {/* Progress bar */}
                <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full transition-all"
                    style={{ width: `${Math.min((data.paid_amount / data.total_amount) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {Math.round((data.paid_amount / data.total_amount) * 100)}% pagado
                </p>
              </div>
            )}
            {isClosed && (
              <div className="mt-4 inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
                Cuenta cerrada — ¡Gracias por pagar!
              </div>
            )}
          </div>
        </div>

        {/* Timeline */}
        <div className="px-4 mt-8 pb-8">
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            📋 Movimientos
          </h2>

          {(!data.timeline || data.timeline.length === 0) ? (
            <div className="bg-white rounded-xl p-6 text-center text-gray-400">
              Sin movimientos aun
            </div>
          ) : (
            <div className="space-y-3">
              {data.timeline.map((entry, i) => (
                <div key={i} className="flex items-start gap-3">
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${
                    entry.type === "debt"
                      ? "bg-red-100"
                      : "bg-green-100"
                  }`}>
                    {entry.type === "debt" ? (
                      <span className="text-red-600 text-lg">🛒</span>
                    ) : (
                      <span className="text-green-600 text-lg">💰</span>
                    )}
                  </div>

                  {/* Card */}
                  <div className="flex-1 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-800 text-base">
                          {entry.type === "debt" ? "Compra fiada" : "Abono recibido"}
                        </p>
                        {entry.note && (
                          <p className="text-sm text-gray-500 mt-0.5">{entry.note}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          {formatDate(entry.created_at)}
                        </p>
                      </div>
                      <p className={`text-xl font-bold ${
                        entry.type === "debt" ? "text-red-600" : "text-green-600"
                      }`}>
                        {entry.type === "debt" ? "+" : "-"}{formatCOP(entry.amount)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-8 text-center">
            <p className="text-xs text-gray-400">
              Aceptado el {data.accepted_at ? formatDate(data.accepted_at) : "—"}
            </p>
            <p className="text-xs text-gray-300 mt-1">
              Este extracto se actualiza en tiempo real
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // PENDING → Acceptance Form
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-amber-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl max-w-md w-full overflow-hidden">
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 text-white text-center">
          <div className="text-4xl mb-2">📋</div>
          <h1 className="text-xl font-bold">Solicitud de Fiado</h1>
          <p className="text-amber-100 text-sm mt-1">{data.business_name}</p>
        </div>

        <div className="p-6 space-y-5">
          <div className="bg-amber-50 rounded-2xl p-5 border border-amber-200 text-center">
            <p className="text-sm text-amber-700 mb-1">Monto a fiar</p>
            <p className="text-4xl font-extrabold text-amber-800">
              {formatCOP(data.total_amount)}
            </p>
          </div>

          <p className="text-center text-gray-600 text-lg">
            <strong>{data.business_name}</strong> le esta fiando productos a{" "}
            <strong>{data.customer_name}</strong>
          </p>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {data.customer_phone
                ? "Confirme su numero de celular"
                : "Ingrese su numero de celular"}
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Ej: 3001234567"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-lg focus:border-amber-500 focus:outline-none"
            />
          </div>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={termsChecked}
              onChange={(e) => setTermsChecked(e.target.checked)}
              className="mt-1 w-5 h-5 rounded border-gray-300 text-amber-600"
            />
            <span className="text-sm text-gray-600">
              Acepto la deuda por {formatCOP(data.total_amount)} y autorizo el
              tratamiento de mis datos personales conforme a la ley de habeas data.
            </span>
          </label>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm text-center">
              {error}
            </div>
          )}

          <button
            onClick={handleAccept}
            disabled={!termsChecked || !phone || submitting}
            className="w-full py-4 rounded-2xl text-xl font-bold text-white
              bg-gradient-to-r from-amber-500 to-orange-500
              disabled:opacity-40 shadow-lg shadow-amber-200"
          >
            {submitting ? "Procesando..." : "Aceptar Deuda"}
          </button>

          <p className="text-xs text-gray-400 text-center">
            Al aceptar, se registra su IP y la fecha como firma digital
          </p>
        </div>
      </div>
    </div>
  );
}
