import {
  Badge,
  // Box,
  Card,
  // Container,
  Flex,
  Heading,
  Tooltip
} from "@radix-ui/themes";
import React from "react";
import type { ReactNode } from "react";

interface HeaderSectionProps {
  children?: ReactNode;
}

function HeaderStart({ children }: HeaderSectionProps) {
  return <>{children}</>;
}

function HeaderCenter({ children }: HeaderSectionProps) {
  return <>{children}</>;
}

function HeaderEnd({ children }: HeaderSectionProps) {
  return <>{children}</>;
}

interface HeaderProps {
  children?: ReactNode;
}

export function Header({ children }: HeaderProps) {
  let start: ReactNode = null;
  let center: ReactNode = null;
  let end: ReactNode = null;

  React.Children.forEach(children, (child) => {
    if (React.isValidElement(child)) {
      if (child.type === HeaderStart) start = child;
      else if (child.type === HeaderCenter) center = child;
      else if (child.type === HeaderEnd) end = child;
    }
  });

  return (
    <Card
      style={{
        pointerEvents: "auto",
        width: "100%",
        transition: "all var(--transition-medium)"
      }}
    >
      <Flex align="center" gap="4" px="1" style={{ width: "100%" }}>
        <Flex align="center" gap="3" style={{ flex: 1 }}>
          <Heading size="5">Utilitários de Renda</Heading>
          <Tooltip content="Regras tributárias atualizadas para 2026">
            <Badge
              size="1"
              radius="full"
              variant="soft"
              style={{ userSelect: "none" }}
            >
              2026
            </Badge>
          </Tooltip>
          {start}
        </Flex>
        {center && (
          <Flex
            gap="3"
            align="center"
            style={{
              flex: "0 0 auto",
              justifyContent: "center",
              alignItems: "center",
              pointerEvents: "auto"
            }}
          >
            {center}
          </Flex>
        )}
        {end && (
          <Flex
            gap="3"
            align="center"
            style={{ flex: 1, justifyContent: "flex-end" }}
          >
            {end}
          </Flex>
        )}
      </Flex>
    </Card>
  );
}

Header.Start = HeaderStart;
Header.Center = HeaderCenter;
Header.End = HeaderEnd;
