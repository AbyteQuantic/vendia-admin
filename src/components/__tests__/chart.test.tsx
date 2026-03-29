import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { VENDIA_CHART_COLORS } from "../charts/chart";

vi.mock("next/dynamic", () => ({
  __esModule: true,
  default: (loader: () => Promise<unknown>, opts?: { loading?: () => React.ReactNode }) => {
    const MockChart = (props: Record<string, unknown>) => (
      <div data-testid="echarts-mock" data-option={JSON.stringify(props.option)} />
    );
    if (opts?.loading) {
      MockChart.displayName = "MockChart";
    }
    return MockChart;
  },
}));

import { Chart } from "../charts/chart";

describe("Chart wrapper", () => {
  it("renders without crashing", () => {
    const { getByTestId } = render(
      <Chart option={{ xAxis: { type: "category" }, series: [] }} />,
    );
    expect(getByTestId("echarts-mock")).toBeInTheDocument();
  });

  it("passes option to underlying component", () => {
    const option = { xAxis: { type: "category" as const }, series: [{ type: "line" as const, data: [1, 2, 3] }] };
    const { getByTestId } = render(<Chart option={option} />);
    const el = getByTestId("echarts-mock");
    expect(el.getAttribute("data-option")).toContain('"type":"line"');
  });
});

describe("VENDIA_CHART_COLORS", () => {
  it("has primary color defined", () => {
    expect(VENDIA_CHART_COLORS.primary).toBe("#1D33B1");
  });

  it("has 6 series colors", () => {
    expect(VENDIA_CHART_COLORS.series).toHaveLength(6);
  });
});
