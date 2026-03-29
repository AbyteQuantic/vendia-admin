import { Store } from "lucide-react";
import { LoginForm } from "@/components/forms/login-form";

export const metadata = {
  title: "Iniciar sesión — VendIA Admin",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-600 text-white">
            <Store className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">VendIA Admin</h1>
          <p className="mt-1 text-sm text-gray-500">
            Ingresa a tu panel de administración
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
