import {
  AreaChart as AreaChartRecharts,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Legend,
  Area
} from "recharts";

export default function CustomLineChart({
  data,
  colors
}: {
  data: Record<string, number[]>;
  colors: Record<string, string>;
}) {
  const keys = Object.keys(data).sort((a, b) => {
    const totalA = data[a].reduce((sum, v) => sum + v, 0);
    const totalB = data[b].reduce((sum, v) => sum + v, 0);

    return totalB - totalA;
  });
  const length = Math.max(
    0,
    ...Object.values(data).map((values) => values.length)
  );
  const chartData = Array.from({ length }, (_, index) => {
    const label = String(index + 1);
    return {
      label,
      ...Object.fromEntries(keys.map((key) => [key, data[key][index] ?? 0]))
    };
  });

  return (
    <ResponsiveContainer width="100%" height={320}>
      <AreaChartRecharts data={chartData}>
        <defs>
          {Object.values(colors).map((color) => (
            <linearGradient id={`${color}Gradient`} x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor={`var(--${color}-9)`}
                stopOpacity={0.5}
              />
              <stop
                offset="100%"
                stopColor={`var(--${color}-9)`}
                stopOpacity={0}
              />
            </linearGradient>
          ))}
          {/* <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7CFFB2" stopOpacity={0.8} />
            <stop offset="100%" stopColor="#7CFFB2" stopOpacity={0} />
          </linearGradient>

          <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#B197FC" stopOpacity={0.8} />
            <stop offset="100%" stopColor="#B197FC" stopOpacity={0} />
          </linearGradient> */}
        </defs>

        <XAxis dataKey="label" />
        <YAxis />

        <Legend />

        <Area
          type="monotone"
          dataKey="ABC"
          stroke={`var(--${colors["ABC"]}-9)`}
          strokeWidth={3}
          fill={`url(#${colors["ABC"]}Gradient)`}
        />

        <Area
          type="monotone"
          dataKey="XYZ"
          stroke={`var(--${colors["XYZ"]}-9)`}
          strokeWidth={3}
          fill={`url(#${colors["XYZ"]}Gradient)`}
        />
      </AreaChartRecharts>
    </ResponsiveContainer>
  );
}
