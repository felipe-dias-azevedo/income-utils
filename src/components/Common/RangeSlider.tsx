import { Box, Flex, IconButton, Slider, Text } from "@radix-ui/themes";
import { useMemo } from "react";
import { TextNumeric } from "./TextNumeric";
import { MinusIcon, PlusIcon } from "@radix-ui/react-icons";

interface RangeSliderProps {
  sameColor?: boolean;
  label?: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  leftLabel?: string;
  rightLabel?: string;
  formatValue?: (value: number) => string;
}

export default function RangeSlider({
  sameColor,
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  leftLabel,
  rightLabel,
  formatValue
}: RangeSliderProps) {
  const is75Percent = useMemo(
    () => (value - min) / (max - min) >= 0.75,
    [value, max, min]
  );
  const is25Percent = useMemo(
    () => (value - min) / (max - min) <= 0.25,
    [value, max, min]
  );

  const sliderColor = useMemo(() => {
    if (sameColor) {
      return undefined;
    }

    if (is25Percent) {
      return "green";
    }

    if (is75Percent) {
      return "red";
    }

    return undefined;
  }, [sameColor, is25Percent, is75Percent]);

  return (
    <Flex direction={"column"} gap="1">
      {label && (
        <Box mb="2">
          <Text size="2" as="label">
            {label}
          </Text>
        </Box>
      )}

      <Flex align="center" gap="4">
        <IconButton
          size="2"
          onClick={() => onChange(value - step)}
          variant="surface"
          disabled={value === min}
        >
          <MinusIcon />
        </IconButton>

        <Slider
          color={sliderColor}
          aria-label={label}
          min={min}
          max={max}
          step={step}
          value={[value]}
          onValueChange={(value) => onChange(Number(value[0]))}
          variant="surface"
          radius="full"
          size="3"
          style={{
            flex: 1
          }}
        />

        <IconButton
          size="2"
          onClick={() => onChange(value + step)}
          variant="surface"
          disabled={value === max}
        >
          <PlusIcon />
        </IconButton>
      </Flex>

      <Flex align="center" justify="between" gap="4">
        <Box style={{ minWidth: 80, textAlign: "left" }}>
          <Text color="gray" size="1">
            {leftLabel}
          </Text>
        </Box>

        <Box style={{ minWidth: 120, textAlign: "center" }}>
          <TextNumeric size="3" key={value} weight="bold" animate>
            {formatValue ? formatValue(value) : String(value)}
          </TextNumeric>
        </Box>

        <Box style={{ minWidth: 80, textAlign: "right" }}>
          <Text color="gray" size="1">
            {rightLabel}
          </Text>
        </Box>
      </Flex>
    </Flex>
  );
}
