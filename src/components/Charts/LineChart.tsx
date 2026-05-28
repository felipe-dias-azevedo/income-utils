"use client";

import {
  LineChart as LineChartRecharts,
  AreaChart as AreaChartRecharts,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Area
} from "recharts";
import TooltipChart from "./TooltipChart";
import { useCallback } from "react";
import LegendChart from "./LegendChart";

export interface TimeLineChartProps {
  data: Record<string, number[]>;
  colors: Record<string, string>;
  labels?: string[];
  hideLabel?: boolean;
  showGrid?: boolean;
  formatter?: (value: number, percent: number) => string;
  labelFormatter?: (label: string) => string;
}

export function TimeLineChart({
  data,
  colors,
  labels,
  showGrid,
  formatter,
  labelFormatter
}: TimeLineChartProps) {
  const keys = Object.keys(data);
  const length = Math.max(
    0,
    ...Object.values(data).map((values) => values.length)
  );
  const chartData = Array.from({ length }, (_, index) => {
    const label = labels?.[index] ?? String(index + 1);
    return {
      label,
      ...Object.fromEntries(keys.map((key) => [key, data[key][index] ?? 0]))
    };
  });

  const valueFormatter = useCallback(
    (value: number, percent: number) => {
      if (!formatter) {
        return value.toString();
      }
      return formatter(value, percent);
    },
    [formatter]
  );

  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChartRecharts
        responsive
        data={chartData}
        margin={{ top: 20, right: 20, left: 20, bottom: 5 }}
        style={{ flex: 1 }}
      >
        {showGrid && (
          <CartesianGrid stroke="var(--gray-9)" strokeDasharray="3 3" />
        )}

        <XAxis
          dataKey="label"
          stroke="var(--gray-12)"
          tick={{ fill: "var(--gray-12)", fontSize: 12 }}
        />

        <YAxis
          width="auto"
          stroke="var(--gray-12)"
          tick={{ fill: "var(--gray-12)", fontSize: 12 }}
          tickFormatter={(value, _index) => valueFormatter(value as number, 0)}
        />

        <Legend
          verticalAlign="bottom"
          align="center"
          layout="horizontal"
          width="auto"
          height="auto"
          content={LegendChart}
          wrapperStyle={{
            width: "100%"
          }}
          formatter={undefined}
        />

        <Tooltip
          content={TooltipChart}
          labelFormatter={(label, _payload) =>
            labelFormatter ? labelFormatter(label) : label
          }
          formatter={(value, _name, entry) => {
            const payload = entry?.payload as { percent?: number };
            return valueFormatter(value as number, payload?.percent ?? 0);
          }}
        />

        {keys.map((dataKey) => (
          <Line
            key={dataKey}
            type="monotone"
            dataKey={dataKey}
            stroke={
              colors[dataKey] !== "transparent"
                ? `var(--${colors[dataKey]}-9)`
                : "var(--gray-12)"
            }
            strokeWidth={2}
            dot={{
              fill:
                colors[dataKey] !== "transparent"
                  ? `var(--${colors[dataKey]}-9)`
                  : "var(--gray-12)"
            }}
            activeDot={{ r: 5 }}
            animationDuration={350}
            animationBegin={0}
          />
        ))}
      </LineChartRecharts>
    </ResponsiveContainer>
  );
}
