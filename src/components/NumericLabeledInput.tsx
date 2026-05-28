import { Box, Text } from "@radix-ui/themes";
import NumericInput from "./NumericInput";
import type { CSSProperties } from "react";

interface NumericLabeledInputProps {
  prefix?: string;
  label: string;
  placeholder?: string;
  value: string;
  max?: number;
  required?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  style?: CSSProperties;
}

export default function NumericLabeledInput({
  prefix,
  label,
  placeholder,
  value,
  max,
  required,
  onChange,
  style
}: NumericLabeledInputProps) {
  return (
    <Box style={{ flex: 1 }} width="100%">
      <label>
        <Box mb="2">
          <Text size="2">
            {label}{" "}
            {required && (
              <Text as="span" color="red" aria-hidden="true">
                *
              </Text>
            )}
          </Text>
        </Box>
        <NumericInput
          prefix={prefix}
          placeholder={placeholder}
          value={value}
          max={max}
          onChange={onChange}
          style={style}
        />
      </label>
    </Box>
  );
}
