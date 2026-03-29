"use client";

import { useState, type FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { ApiClientError } from "@/lib/api";

function LoginForm() {
  const { login } = useAuth();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!phone.trim() || !password.trim()) {
      setError("Todos los campos son obligatorios.");
      return;
    }

    setLoading(true);
    try {
      await login({ phone: phone.trim(), password });
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(
          err.status === 401
            ? "Teléfono o contraseña incorrectos."
            : err.message,
        );
      } else {
        setError("No se pudo conectar con el servidor. Intenta de nuevo.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <Input
        id="phone"
        label="Teléfono"
        type="tel"
        placeholder="3001234567"
        inputMode="numeric"
        autoComplete="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />

      <Input
        id="password"
        label="Contraseña / PIN"
        type="password"
        placeholder="••••••"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <Button type="submit" className="w-full" size="lg" loading={loading}>
        Iniciar sesión
      </Button>
    </form>
  );
}

export { LoginForm };
