import {
  BarChart as BarChartRecharts,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Bar
} from "recharts";
import LegendChart from "./LegendChart";
import TooltipChart from "./TooltipChart";
import { useCallback } from "react";

export interface BarChartProps {
  // data needs to be an array of objects to support multiple rows (Page A, Page B, etc.)
  data: Record<string, number>;
  colors: Record<string, string>;
  labels?: string[]; // e.g., ['Page A', 'Page B', 'Page C']
  showGrid?: boolean;
  formatter?: (value: number, percent: number) => string;
}

export function BarChart({
  data,
  colors,
  // labels,
  showGrid,
  formatter
}: BarChartProps) {
  const keys = Object.keys(data);
  const chartData = [
    {
      label: "PPP",
      ...data
    }
  ];
  /* console.log(data);
  console.log(keys); */

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
      <BarChartRecharts responsive data={chartData} style={{ flex: 1 }}>
        {showGrid && (
          <CartesianGrid stroke="var(--gray-9)" strokeDasharray="3 3" />
        )}
        {/* <XAxis
          dataKey="label"
          stroke="var(--gray-12)"
          tick={{ fill: "var(--gray-12)", fontSize: 12 }}
        /> */}

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
            width: "100%",
            paddingTop: "var(--space-2)"
          }}
          formatter={undefined}
        />

        <Tooltip
          cursor={false}
          content={TooltipChart}
          formatter={(value, _name, entry) => {
            const payload = entry?.payload as { percent?: number };
            return valueFormatter(value as number, payload?.percent ?? 0);
          }}
        />

        {keys.map((dataKey) => (
          <Bar
            key={dataKey}
            dataKey={dataKey}
            fill={
              colors[dataKey] !== "transparent"
                ? `var(--${colors[dataKey]}-9)`
                : "var(--gray-12)"
            }
            label={{
              position: "top",
              fill: "var(--gray-12)",
              fontWeight: "var(--font-weight-bold)",

              formatter: (value) => valueFormatter(value as number, 0)
            }}
          />
        ))}
      </BarChartRecharts>
    </ResponsiveContainer>
  );
}
