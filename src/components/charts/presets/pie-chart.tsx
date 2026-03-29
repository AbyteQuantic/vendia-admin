"use client";

import { Chart, VENDIA_CHART_COLORS } from "../chart";
import type { EChartsOption } from "echarts";

interface PieChartProps {
  data: { name: string; value: number }[];
  height?: string;
  title?: string;
}

export function PieChart({ data, height = "300px", title }: PieChartProps) {
  const option: EChartsOption = {
    title: title ? { text: title, textStyle: { fontSize: 14, fontWeight: 600 } } : undefined,
    tooltip: {
      trigger: "item",
      formatter: "{b}: {c} ({d}%)",
    },
    legend: { bottom: 0, type: "scroll" },
    color: VENDIA_CHART_COLORS.series,
    series: [{
      type: "pie",
      radius: ["40%", "70%"],
      avoidLabelOverlap: true,
      itemStyle: { borderRadius: 6, borderColor: "#fff", borderWidth: 2 },
      label: { show: false },
      emphasis: {
        label: { show: true, fontSize: 14, fontWeight: "bold" },
      },
      data: data.map((d) => ({ name: d.name, value: d.value })),
    }],
  };

  return <Chart option={option} height={height} />;
}
