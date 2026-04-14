"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://vendia-api.onrender.com";

interface FiadoData {
  business_name: string;
  business_logo: string;
  customer_name: string;
  customer_phone: string;
  total_amount: number;
  fiado_status: string;
  created_at: string;
}

function formatCOP(amount: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(amount);
}

export default function FiadoPage() {
  const params = useParams();
  const token = params.token as string;

  const [data, setData] = useState<FiadoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [phone, setPhone] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [termsChecked, setTermsChecked] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) return;
    fetch(`${API_URL}/api/v1/public/fiado/${token}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.data) {
          setData(json.data);
          if (json.data.customer_phone) setPhone(json.data.customer_phone);
          if (json.data.fiado_status === "accepted") setAccepted(true);
        } else {
          setError("Fiado no encontrado");
        }
      })
      .catch(() => setError("Error al cargar los datos"))
      .finally(() => setLoading(false));
  }, [token]);

  const handleAccept = async () => {
    if (!termsChecked || !phone) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/v1/public/fiado/${token}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone_confirm: phone, accept_terms: true }),
      });
      const json = await res.json();
      if (res.ok) {
        setAccepted(true);
      } else {
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
          <div className="text-5xl mb-4">&#x26A0;&#xFE0F;</div>
          <h1 className="text-2xl font-bold text-red-600 mb-2">Error</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  if (accepted) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-green-700 mb-2">Deuda Aceptada</h1>
          <p className="text-gray-600 text-lg mb-4">
            Ya puede retirar sus productos en <strong>{data.business_name}</strong>
          </p>
          <div className="bg-green-50 rounded-2xl p-4 border border-green-200">
            <p className="text-sm text-green-700">Total de la deuda</p>
            <p className="text-3xl font-bold text-green-800">{formatCOP(data.total_amount)}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 text-white text-center">
          <div className="text-4xl mb-2">&#x1F4CB;</div>
          <h1 className="text-xl font-bold">Solicitud de Fiado</h1>
          <p className="text-amber-100 text-sm mt-1">{data.business_name}</p>
        </div>

        <div className="p-6 space-y-5">
          {/* Summary */}
          <div className="bg-amber-50 rounded-2xl p-5 border border-amber-200 text-center">
            <p className="text-sm text-amber-700 mb-1">Monto a fiar</p>
            <p className="text-4xl font-extrabold text-amber-800">
              {formatCOP(data.total_amount)}
            </p>
          </div>

          <div className="text-center text-gray-600">
            <p className="text-lg">
              <strong>{data.business_name}</strong> le esta fiando productos a{" "}
              <strong>{data.customer_name}</strong>
            </p>
          </div>

          {/* Phone confirmation */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Confirme su numero de celular
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Ej: 3001234567"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-lg focus:border-amber-500 focus:outline-none transition"
            />
          </div>

          {/* Terms */}
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={termsChecked}
              onChange={(e) => setTermsChecked(e.target.checked)}
              className="mt-1 w-5 h-5 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
            />
            <span className="text-sm text-gray-600 leading-relaxed">
              Acepto la deuda por {formatCOP(data.total_amount)} y autorizo el
              tratamiento de mis datos personales conforme a la ley de habeas data.
            </span>
          </label>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm text-center">
              {error}
            </div>
          )}

          {/* Accept button */}
          <button
            onClick={handleAccept}
            disabled={!termsChecked || !phone || submitting}
            className="w-full py-4 rounded-2xl text-xl font-bold text-white transition-all
              bg-gradient-to-r from-amber-500 to-orange-500
              hover:from-amber-600 hover:to-orange-600
              disabled:opacity-40 disabled:cursor-not-allowed
              shadow-lg shadow-amber-200"
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Procesando...
              </span>
            ) : (
              "Aceptar Deuda"
            )}
          </button>

          <p className="text-xs text-gray-400 text-center">
            Al aceptar, se registra su IP y la fecha como firma digital
          </p>
        </div>
      </div>
    </div>
  );
}
