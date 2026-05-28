import { Text, type TextProps } from "@radix-ui/themes";
import type { ReactNode } from "react";

export interface TextNumericProps {
  children: ReactNode;
}

export function TextNumeric({
  children,
  style,
  ...props
}: TextNumericProps & TextProps) {
  return (
    <Text
      {...props}
      style={{
        fontVariantNumeric: "tabular-nums",
        fontFeatureSettings: "tnum",
        ...style
      }}
    >
      {children}
    </Text>
  );
}
