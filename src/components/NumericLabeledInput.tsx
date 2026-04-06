import { Box } from "@radix-ui/themes";
import NumericInput from "./NumericInput";

interface NumericLabeledInputProps {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function NumericLabeledInput({
  label,
  placeholder,
  value,
  onChange
}: NumericLabeledInputProps) {
  return (
    <Box style={{ flex: 1 }}>
      <label>
        <div style={{ marginBottom: "8px", fontSize: "14px" }}>{label}</div>
        <NumericInput
          placeholder={placeholder}
          value={value}
          onChange={onChange}
        />
      </label>
    </Box>
  );
}
