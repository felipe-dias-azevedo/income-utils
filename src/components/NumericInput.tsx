import { TextField } from "@radix-ui/themes";
import type { CSSProperties } from "react";

interface NumericInputProps {
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  style?: CSSProperties;
}

export default function NumericInput({
  placeholder,
  value,
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
      radius="large"
      onChange={onChange}
      style={style}
    />
  );
}
