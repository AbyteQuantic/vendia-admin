"use client";

import { Chart, VENDIA_CHART_COLORS } from "../chart";
import type { EChartsOption } from "echarts";

interface HeatmapChartProps {
  data: { hour: number; day: number; count: number }[];
  height?: string;
  title?: string;
}

const DAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const HOURS = Array.from({ length: 18 }, (_, i) => `${(i + 6).toString().padStart(2, "0")}:00`);

export function HeatmapChart({ data, height = "300px", title }: HeatmapChartProps) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);
  const heatData = data.map((d) => [d.hour - 6, d.day, d.count]);

  const option: EChartsOption = {
    title: title ? { text: title, textStyle: { fontSize: 14, fontWeight: 600 } } : undefined,
    tooltip: {
      position: "top",
      formatter(params: unknown) {
        const p = params as { value: [number, number, number] };
        return `${DAYS[p.value[1]]} ${HOURS[p.value[0]]}: <strong>${p.value[2]} transacciones</strong>`;
      },
    },
    grid: { left: "12%", right: "4%", bottom: "15%", top: title ? "15%" : "6%" },
    xAxis: { type: "category", data: HOURS, splitArea: { show: true }, axisLabel: { fontSize: 10 } },
    yAxis: { type: "category", data: DAYS, splitArea: { show: true }, axisLabel: { fontSize: 11 } },
    visualMap: {
      min: 0,
      max: maxCount,
      calculable: true,
      orient: "horizontal",
      left: "center",
      bottom: 0,
      inRange: {
        color: ["#EFF6FF", VENDIA_CHART_COLORS.primaryLight, VENDIA_CHART_COLORS.primary],
      },
    },
    series: [{
      type: "heatmap",
      data: heatData,
      label: { show: false },
      emphasis: {
        itemStyle: { shadowBlur: 10, shadowColor: "rgba(0,0,0,0.3)" },
      },
    }],
  };

  return <Chart option={option} height={height} />;
}
