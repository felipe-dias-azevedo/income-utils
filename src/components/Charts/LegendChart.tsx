import { Box, Flex, Text } from "@radix-ui/themes";
import type { DefaultLegendContentProps } from "recharts";
import { TextNumeric } from "../Common/TextNumeric";
import { useMemo } from "react";
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
  layout,
  formatter
}: DefaultLegendContentProps) {
  const isHorizontal = useMemo(() => layout === "horizontal", [layout]);

  if (payload) {
    return (
      <ul
        className="recharts-default-legend"
        style={{
          padding: "0px",
          margin: "0px",
          textAlign: "left",
          listStyle: "none",
          display: isHorizontal ? "flex" : "block",
          /* flexWrap: isHorizontal ? "wrap" : undefined, */
          alignItems: isHorizontal ? "center" : undefined,
          justifyContent: isHorizontal ? "center" : undefined,
          gap: isHorizontal ? "var(--space-1)" : undefined
        }}
      >
        {payload.map((entry, i) => (
          <li
            key={i}
            className={`recharts-legend-item legend-item-${i}`}
            style={{
              display: isHorizontal ? "inline-flex" : "block"
            }}
          >
            <Flex gap="2" justify="between" align="center">
              <Flex gap="2" align="center">
                <Box
                  style={{
                    width: "12px",
                    height: "12px",
                    borderRadius: "2px",
                    backgroundColor: entry.color,
                    border: "none",
                    flexShrink: 0
                  }}
                />
                <Text size="2">
                  {entry.value}
                  {formatter && ": "}
                </Text>
              </Flex>

              <TextNumeric size="2" weight="bold">
                {formatter && formatter(entry.value, entry, i)}
              </TextNumeric>
            </Flex>
          </li>
        ))}
      </ul>
    );
  }
}
