"use client";

import { Chart, VENDIA_CHART_COLORS } from "../chart";
import type { EChartsOption } from "echarts";
import { formatCOP } from "@/lib/utils";

interface BarChartProps {
  data: { label: string; value: number }[];
  height?: string;
  horizontal?: boolean;
  formatAsCOP?: boolean;
  title?: string;
}

export function BarChart({ data, height = "350px", horizontal = false, formatAsCOP = false, title }: BarChartProps) {
  const labels = data.map((d) => d.label);
  const values = data.map((d) => d.value);

  const option: EChartsOption = {
    title: title ? { text: title, textStyle: { fontSize: 14, fontWeight: 600 } } : undefined,
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      formatter(params: unknown) {
        const items = params as { name: string; value: number }[];
        const val = formatAsCOP ? formatCOP(items[0].value) : items[0].value.toLocaleString("es-CO");
        return `${items[0].name}: <strong>${val}</strong>`;
      },
    },
    grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },
    xAxis: horizontal
      ? { type: "value", axisLabel: { formatter: (v: number) => formatAsCOP ? formatCOP(v) : v.toString() } }
      : { type: "category", data: labels, axisLabel: { fontSize: 11, rotate: labels.length > 6 ? 30 : 0 } },
    yAxis: horizontal
      ? { type: "category", data: labels, axisLabel: { fontSize: 11 } }
      : { type: "value" },
    series: [{
      type: "bar",
      data: values,
      itemStyle: {
        color(params: { dataIndex: number }) {
          return VENDIA_CHART_COLORS.series[params.dataIndex % VENDIA_CHART_COLORS.series.length];
        },
      },
      barMaxWidth: 40,
    }],
  };

  return <Chart option={option} height={height} />;
}
