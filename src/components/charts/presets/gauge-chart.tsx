"use client";

import { Chart, VENDIA_CHART_COLORS } from "../chart";
import type { EChartsOption } from "echarts";

interface GaugeChartProps {
  value: number;
  max: number;
  label: string;
  height?: string;
  title?: string;
}

export function GaugeChart({ value, max, label, height = "300px", title }: GaugeChartProps) {
  const percent = max > 0 ? Math.round((value / max) * 100) : 0;

  const option: EChartsOption = {
    title: title ? { text: title, textStyle: { fontSize: 14, fontWeight: 600 } } : undefined,
    series: [{
      type: "gauge",
      startAngle: 220,
      endAngle: -40,
      min: 0,
      max: 100,
      pointer: { show: false },
      progress: {
        show: true,
        width: 18,
        itemStyle: {
          color: percent >= 70 ? VENDIA_CHART_COLORS.success : percent >= 40 ? VENDIA_CHART_COLORS.warning : VENDIA_CHART_COLORS.danger,
        },
      },
      axisLine: { lineStyle: { width: 18, color: [[1, "#E5E7EB"]] } },
      axisTick: { show: false },
      splitLine: { show: false },
      axisLabel: { show: false },
      detail: {
        valueAnimation: true,
        formatter: `${percent}%\n${label}`,
        fontSize: 16,
        offsetCenter: [0, "20%"],
        color: "#374151",
      },
      data: [{ value: percent }],
    }],
  };

  return <Chart option={option} height={height} />;
}
