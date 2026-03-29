import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface StatCardAdminProps {
  icon: ReactNode;
  label: string;
  value: string;
  change?: string;
  changeDirection?: "up" | "down" | "neutral";
  className?: string;
}

export function StatCardAdmin({ icon, label, value, change, changeDirection = "neutral", className }: StatCardAdminProps) {
  return (
    <div className={cn("rounded-xl border border-gray-200 bg-white p-5 shadow-sm", className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="mt-1 text-[32px] font-bold leading-tight text-gray-900">{value}</p>
          {change && (
            <p className={cn(
              "mt-1 text-sm font-medium",
              changeDirection === "up" && "text-green-600",
              changeDirection === "down" && "text-red-600",
              changeDirection === "neutral" && "text-gray-500",
            )}>
              {changeDirection === "up" && "↑ "}
              {changeDirection === "down" && "↓ "}
              {change}
            </p>
          )}
        </div>
        <div className="rounded-lg bg-indigo-100 p-2.5 text-indigo-600">
          {icon}
        </div>
      </div>
    </div>
  );
}
