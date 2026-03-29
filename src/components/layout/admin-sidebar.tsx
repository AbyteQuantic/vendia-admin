"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Store, CreditCard, BarChart3, ArrowLeft, X, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminSidebarProps {
  open: boolean;
  onClose: () => void;
}

const navItems = [
  { href: "/overview", label: "Overview", icon: LayoutDashboard },
  { href: "/tenants", label: "Tenderos", icon: Store },
  { href: "/subscriptions", label: "Suscripciones", icon: CreditCard },
  { href: "/analytics", label: "Analíticas", icon: BarChart3 },
];

function AdminSidebar({ open, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-gray-200 bg-gray-900 transition-transform duration-200 lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center gap-3 border-b border-gray-700 px-6">
          <Shield className="h-6 w-6 text-indigo-400" />
          <span className="truncate text-sm font-semibold text-white">Super Admin</span>
          <button
            onClick={onClose}
            className="ml-auto rounded-lg p-1 text-gray-400 hover:bg-gray-800 lg:hidden"
            aria-label="Cerrar menú"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-indigo-600 text-white"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white",
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-gray-700 px-3 py-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
          >
            <ArrowLeft className="h-5 w-5 shrink-0" />
            Panel Tendero
          </Link>
        </div>
      </aside>
    </>
  );
}

export { AdminSidebar };
