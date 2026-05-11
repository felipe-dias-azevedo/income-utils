import { Box } from "@radix-ui/themes";
import NumericInput from "./NumericInput";
import type { CSSProperties } from "react";

interface NumericLabeledInputProps {
  prefix?: string;
  label: string;
  placeholder?: string;
  value: string;
  max?: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  style?: CSSProperties;
}

export default function NumericLabeledInput({
  prefix,
  label,
  placeholder,
  value,
  max,
  onChange,
  style
}: NumericLabeledInputProps) {
  return (
    <Box style={{ flex: 1 }} width="100%">
      <label>
        <div style={{ marginBottom: "8px", fontSize: "14px" }}>{label}</div>
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
