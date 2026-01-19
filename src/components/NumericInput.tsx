import { Box, TextField } from "@radix-ui/themes";

interface NumericInputProps {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function NumericInput({
  label,
  placeholder,
  value,
  onChange
}: NumericInputProps) {
  return (
    <Box style={{ flex: 1 }}>
      <label>
        <div style={{ marginBottom: "8px", fontSize: "14px" }}>{label}</div>
        <TextField.Root
          type="tel"
          inputMode="numeric"
          //   pattern="[0-9]*"
          placeholder={placeholder}
          value={value}
          radius="large"
          onChange={onChange}
        />
      </label>
    </Box>
  );
}
