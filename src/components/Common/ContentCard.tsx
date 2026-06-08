import { Card, Flex, type FlexProps } from "@radix-ui/themes";
import type { ReactNode } from "react";

interface ContentCardProps {
  children: ReactNode;
}

export default function ContentCard({
  children,
  p = "4",
  direction = "column",
  gap = "2",
  ...props
}: ContentCardProps & FlexProps) {
  return (
    /* TODO: add transition */
    <Card style={{ padding: "0" }} className="popup-animated">
      <Flex {...props} p={p} direction={direction} gap={gap}>
        {children}
      </Flex>
    </Card>
  );
}
