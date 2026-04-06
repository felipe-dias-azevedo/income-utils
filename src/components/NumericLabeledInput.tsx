import { Box } from "@radix-ui/themes";
import NumericInput from "./NumericInput";
import type { CSSProperties } from "react";

interface NumericLabeledInputProps {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  style?: CSSProperties;
}

export default function NumericLabeledInput({
  label,
  placeholder,
  value,
  onChange,
  style
}: NumericLabeledInputProps) {
  return (
    <Box style={{ flex: 1 }} width="100%">
      <label>
        <div style={{ marginBottom: "8px", fontSize: "14px" }}>{label}</div>
        <NumericInput
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          style={style}
        />
      </label>
    </Box>
  );
}
