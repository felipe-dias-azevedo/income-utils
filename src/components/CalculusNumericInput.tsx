import { LightningBoltIcon } from "@radix-ui/react-icons";
import { Box, IconButton, TextField, Tooltip } from "@radix-ui/themes";
import { useState } from "react";

interface CalculusNumericInputProps {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function CalculusNumericInput({
  label,
  placeholder,
  value,
  onChange
}: CalculusNumericInputProps) {
  const [error, setError] = useState<string | null>(null);

  return (
    <Box style={{ flex: 1 }}>
      <label>
        <div style={{ marginBottom: "8px", fontSize: "14px" }}>{label}</div>
        <Box
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            width: "100%"
          }}
        >
          <TextField.Root
            type="text"
            inputMode="decimal"
            placeholder={placeholder}
            value={value}
            radius="large"
            onChange={onChange}
            style={{
              flex: 1
            }}
          >
            <Tooltip content="Enter a formula like =100*1.3 and click to calculate">
              <TextField.Slot side="right">
                <IconButton
                  onClick={handleCalculate}
                  type="button"
                  variant="ghost"
                >
                  <LightningBoltIcon height="16" width="16" />
                </IconButton>
              </TextField.Slot>
            </Tooltip>
          </TextField.Root>
        </Box>
        {error && (
          <div
            style={{
              color: "var(--red-9, #e5484d)",
              fontSize: "12px",
              marginTop: "4px"
            }}
          >
            {error}
          </div>
        )}
      </label>
    </Box>
  );
}
