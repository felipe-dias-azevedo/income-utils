import { Text, TextField } from "@radix-ui/themes";
import type { CSSProperties } from "react";

interface NumericInputProps {
  prefix?: string;
  placeholder?: string;
  value: string;
  max?: number;
  required?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  style?: CSSProperties;
}

export default function NumericInput({
  prefix,
  placeholder,
  value,
  max,
  required,
  onChange,
  style
}: NumericInputProps) {
  return (
    <TextField.Root
      type="tel"
      inputMode="numeric"
      //   pattern="[0-9]*"
      placeholder={placeholder}
      value={value}
      max={max}
      required={required}
      radius="large"
      onChange={onChange}
      style={style}
      className="numeric-input"
    >
      {prefix && (
        <TextField.Slot>
          <Text size="2" color="gray">
            {prefix}
          </Text>
        </TextField.Slot>
      )}
    </TextField.Root>
  );
}
