"use client";

import { Chart, VENDIA_CHART_COLORS } from "../chart";
import type { EChartsOption } from "echarts";
import { formatCOP } from "@/lib/utils";

interface LineChartProps {
  data: { date: string; total: number; transactions?: number }[];
  height?: string;
  showTransactions?: boolean;
  title?: string;
}

export function LineChart({ data, height = "400px", showTransactions = false, title }: LineChartProps) {
  const option: EChartsOption = {
    title: title ? { text: title, textStyle: { fontSize: 14, fontWeight: 600 } } : undefined,
    tooltip: {
      trigger: "axis",
      formatter(params: unknown) {
        const items = params as { seriesName: string; value: number; axisValue: string; color: string }[];
        let html = `<strong>${items[0].axisValue}</strong><br/>`;
        for (const item of items) {
          const val = item.seriesName === "Ventas" ? formatCOP(item.value) : item.value.toLocaleString("es-CO");
          html += `<span style="color:${item.color}">●</span> ${item.seriesName}: ${val}<br/>`;
        }
        return html;
      },
    },
    legend: { bottom: 0 },
    grid: { left: "3%", right: "4%", bottom: "12%", containLabel: true },
    xAxis: {
      type: "category",
      data: data.map((d) => d.date),
      axisLabel: { fontSize: 11 },
    },
    yAxis: [
      { type: "value", axisLabel: { formatter: (v: number) => formatCOP(v) } },
      ...(showTransactions ? [{ type: "value" as const, splitLine: { show: false } }] : []),
    ],
    series: [
      {
        name: "Ventas",
        type: "line",
        smooth: true,
        data: data.map((d) => d.total),
        itemStyle: { color: VENDIA_CHART_COLORS.primary },
        areaStyle: { color: { type: "linear", x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: "rgba(29,51,177,0.2)" }, { offset: 1, color: "rgba(29,51,177,0.02)" }] } },
      },
      ...(showTransactions
        ? [{
            name: "Transacciones",
            type: "line" as const,
            smooth: true,
            yAxisIndex: 1,
            data: data.map((d) => d.transactions ?? 0),
            itemStyle: { color: VENDIA_CHART_COLORS.success },
          }]
        : []),
    ],
  };

  return <Chart option={option} height={height} />;
}
