import {
  PieChart as PieChartRecharts,
  Pie,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import TooltipChart from "./TooltipChart";
import LegendChart from "./LegendChart";
import { useCallback } from "react";
import { formatPercentage } from "../../utils/formatting";

const RADIAN = Math.PI / 180;

// Radix token colors
/* const COLORS = [
  "var(--accent-11)",
  "var(--accent-10)",
  "var(--accent-9)",
  "var(--accent-8)",
  "var(--accent-7)",
]; */

const COLORS = [
  "var(--indigo-9)",
  "var(--ruby-9)",
  "var(--amber-9)",
  "var(--grass-9)",
  "var(--plum-9)"
];

export interface PieChartProps {
  data: Record<string, number>; // TODO: replace to indexed list
  hideLabel?: boolean;
  formatter?: (value: number, percent: number) => string;
}

export function PieChart({ data, hideLabel, formatter }: PieChartProps) {
  const dataWithColors = Object.entries(data).map(([name, value], index) => ({
    name,
    value,
    percent: value / Object.values(data).reduce((a, b) => a + b, 0),
    fill: COLORS[index % COLORS.length]
  }));

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
    <ResponsiveContainer width="100%" height={300}>
      <PieChartRecharts responsive style={{ flex: 1 }}>
        <Pie
          style={{ outline: "none" }}
          data={dataWithColors}
          dataKey="value"
          innerRadius={0}
          outerRadius={100}
          paddingAngle={0}
          stroke="none"
          animationDuration={350}
          animationBegin={0}
          labelLine={false}
          label={
            hideLabel
              ? undefined
              : ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                  if (!percent || percent <= 0) {
                    return undefined;
                  }

                  const radius =
                    innerRadius + (outerRadius - innerRadius) * 0.6;
                  const x = cx + radius * Math.cos(-midAngle! * RADIAN);
                  const y = cy + radius * Math.sin(-midAngle! * RADIAN);

                  return (
                    <text
                      x={x}
                      y={y}
                      fill="var(--gray-1)"
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontWeight="var(--font-weight-bold)"
                    >
                      {formatPercentage(percent)}
                    </text>
                  );
                }
          }
        />

        <Tooltip
          content={TooltipChart}
          formatter={(value, _name, entry) => {
            const payload = entry?.payload as { percent?: number };
            return valueFormatter(value as number, payload?.percent ?? 0);
          }}
        />

        <Legend
          verticalAlign="bottom"
          align="center"
          layout="vertical"
          width="auto"
          height="auto"
          content={LegendChart}
          formatter={(_, entry) => {
            const payload = entry?.payload as {
              value?: number;
              percent?: number;
            };
            return valueFormatter(payload?.value ?? 0, payload?.percent ?? 0);
          }}
        />
      </PieChartRecharts>
    </ResponsiveContainer>
  );
}
