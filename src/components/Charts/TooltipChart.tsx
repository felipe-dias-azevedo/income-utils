import { Box, Card, Flex, Strong, Text } from "@radix-ui/themes";
import type { TooltipContentProps } from "recharts";
import type {
  NameType,
  ValueType
} from "recharts/types/component/DefaultTooltipContent";

export default function TooltipChart({
  active,
  payload,
  formatter
}: TooltipContentProps<ValueType, NameType>) {
  if (active && payload && payload.length) {
    return (
      <Card style={{ backgroundColor: "var(--color-panel-solid)" }}>
        <Flex align="center" gap="2">
          <Box
            style={{
              width: "12px",
              height: "12px",
              borderRadius: "2px",
              backgroundColor: payload[0].color,
              border: "none"
            }}
          />
          <Text size="2">
            {payload[0].name}:{" "}
            <Strong>
              {formatter
                ? formatter(
                    payload[0].value,
                    payload[0].name,
                    payload[0],
                    0,
                    payload
                  )
                : payload[0].value}
            </Strong>
          </Text>
        </Flex>
      </Card>
    );
  }
  return null;
}
