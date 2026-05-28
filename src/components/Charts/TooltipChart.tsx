import { useMemo } from "react";
import { Box, Card, Flex, Separator, Text } from "@radix-ui/themes";
import type { TooltipContentProps } from "recharts";
import type {
  NameType,
  ValueType
} from "recharts/types/component/DefaultTooltipContent";
import { TextNumeric } from "../Common/TextNumeric";

export default function TooltipChart({
  active,
  payload,
  label,
  labelFormatter,
  formatter
}: TooltipContentProps<ValueType, NameType>) {
  const sortedPayload = useMemo(
    () =>
      payload?.slice().sort((a, b) => {
        const valueA =
          typeof a.value === "number" ? a.value : Number(a.value) || 0;
        const valueB =
          typeof b.value === "number" ? b.value : Number(b.value) || 0;
        return valueB - valueA;
      }) ?? [],
    [payload]
  );

  if (active && sortedPayload.length) {
    return (
      <Card style={{ backgroundColor: "var(--color-panel-solid)" }}>
        {label !== undefined && (
          <Flex direction="column" mb="2" gap="1">
            <Text size="2" weight="bold">
              {labelFormatter ? labelFormatter(label, payload) : label}
            </Text>
            <Separator orientation="horizontal" style={{ width: "100%" }} />
          </Flex>
        )}

        {sortedPayload.map((entry, i) => (
          <Flex gap="2" justify="between" key={`${entry.name}-${i}`}>
            <Flex align="center" gap="2">
              <Box
                style={{
                  width: "12px",
                  height: "12px",
                  borderRadius: "2px",
                  backgroundColor: entry.color,
                  border: "none"
                }}
              />
              <Text size="2">{entry.name}: </Text>
            </Flex>
            <TextNumeric size="2" weight="bold">
              {formatter
                ? formatter(entry.value, entry.name, entry, 0, sortedPayload)
                : entry.value}
            </TextNumeric>
          </Flex>
        ))}
      </Card>
    );
  }
  return null;
}
