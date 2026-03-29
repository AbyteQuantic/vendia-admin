"use client";

import dynamic from "next/dynamic";
import type { EChartsOption } from "echarts";
import { Skeleton } from "@/components/ui/skeleton";

const ReactECharts = dynamic(() => import("echarts-for-react"), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full" />,
});

export const VENDIA_CHART_COLORS = {
  primary: "#1D33B1",
  primaryLight: "#3D52CC",
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
  info: "#3B82F6",
  series: ["#1D33B1", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"],
};

interface ChartProps {
  option: EChartsOption;
  height?: string;
  className?: string;
}

export function Chart({ option, height = "400px", className }: ChartProps) {
  return (
    <ReactECharts
      option={option}
      style={{ height }}
      className={className}
      opts={{ renderer: "canvas" }}
    />
  );
}
