"use client";

import { Store, User, Phone } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";

export default function SettingsPage() {
  const { auth } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
        <p className="text-sm text-gray-500">Información de tu cuenta y negocio</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <div className="rounded-lg bg-blue-100 p-2.5 text-blue-600">
              <Store className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Negocio</h2>
          </div>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm text-gray-500">Nombre del negocio</dt>
              <dd className="text-sm font-medium text-gray-900">
                {auth?.business_name ?? "—"}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">ID de Tenant</dt>
              <dd className="font-mono text-sm text-gray-700">
                {auth?.tenant_id ?? "—"}
              </dd>
            </div>
          </dl>
        </Card>

        <Card>
          <div className="flex items-center gap-3 mb-4">
            <div className="rounded-lg bg-green-100 p-2.5 text-green-600">
              <User className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Propietario</h2>
          </div>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm text-gray-500">Nombre</dt>
              <dd className="text-sm font-medium text-gray-900">
                {auth?.owner_name ?? "—"}
              </dd>
            </div>
          </dl>
        </Card>
      </div>

      <Card>
        <div className="flex items-center gap-3 mb-4">
          <div className="rounded-lg bg-gray-100 p-2.5 text-gray-600">
            <Phone className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Soporte</h2>
        </div>
        <p className="text-sm text-gray-500">
          ¿Necesitas ayuda? Próximamente podrás contactar a soporte directamente
          desde aquí. Por ahora, comunícate con nosotros por WhatsApp.
        </p>
      </Card>
    </div>
  );
}
