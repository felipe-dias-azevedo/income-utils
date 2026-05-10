import { Box, Flex, Text } from "@radix-ui/themes";
import type { DefaultLegendContentProps } from "recharts";
// import type { LegendPayload } from "recharts";

// type LegendPayloadItem = {
//   value: string;
//   color?: string;
//   payload?: LegendPayload;
// };

// type LegendProps = {
//   payload?: LegendPayloadItem[];
// };

export default function LegendChart({
  payload,
  formatter,
}: DefaultLegendContentProps) {
  if (payload) {
    return (
      <ul
        className="recharts-default-legend"
        style={{
          padding: "0px",
          margin: "0px",
          textAlign: "left",
          listStyle: "none",
        }}
      >
        {payload.map((entry, i) => (
          <li key={i} className={`recharts-legend-item legend-item-${i}`}>
            <Flex gap="2" justify="between">
              <Flex gap="2" align="center" justify="start">
                <Box
                  style={{
                    width: "12px",
                    height: "12px",
                    borderRadius: "2px",
                    backgroundColor: entry.color,
                    border: "none",
                  }}
                />
                <Text size="2">{entry.value}: </Text>
              </Flex>

              <Text size="2" weight="bold">
                {formatter ? formatter(entry.value, entry, i) : entry.value}
              </Text>
            </Flex>
          </li>
        ))}
      </ul>
    );
  }
}
