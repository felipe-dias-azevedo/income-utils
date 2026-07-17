import { Text, type TextProps } from "@radix-ui/themes";
import type { ReactNode } from "react";

export interface TextNumericProps {
  children: ReactNode;
  animate?: boolean;
}

export function TextNumeric({
  children,
  style,
  animate,
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
      className={animate ? "digit-animated" : undefined}
    >
      {children}
    </Text>
  );
}
