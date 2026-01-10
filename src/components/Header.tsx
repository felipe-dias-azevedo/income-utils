import {
  Badge,
  // Box,
  Card,
  // Container,
  Flex,
  Heading,
  Tooltip
} from "@radix-ui/themes";
import type { ReactNode } from "react";

interface HeaderProps {
  children?: ReactNode;
}

export function Header({ children }: HeaderProps) {
  return (
    // <Box
    //   style={{
    //     // position: "fixed",
    //     // top: 0,
    //     // left: 0,
    //     width: "100%",
    //     // zIndex: 1000,
    //     display: "flex",
    //     justifyContent: "center",
    //     pointerEvents: "none",
    //   }}
    // >
    // <Container size="4" py="4" px="2">
    <Card
      style={{
        pointerEvents: "auto",
        width: "100%",
        // backdropFilter: "blur(12px)",
        // WebkitBackdropFilter: "blur(12px)",
        // backgroundColor:
        //   "color-mix(in srgb, var(--gray-2) 70%, transparent)",
        // backgroundColor: "var(--gray-1)",
        // border: "1px solid var(--gray-3)",
        // borderRadius: "var(--radius-6)",
        // padding: "var(--space-3) var(--space-5)",
        // boxShadow: "var(--shadow-5)",
        transition: "all var(--transition-medium)"
      }}
    >
      <Flex justify="between" align="center" gap="4" px="1">
        <Flex align="center" gap="3">
          <Heading size="5">Utilitários de Renda</Heading>
          <Tooltip content="Regras tributárias atualizadas para 2026">
            <Badge
              size="3"
              radius="full"
              variant="soft"
              style={{ userSelect: "none" }}
            >
              2026
            </Badge>
          </Tooltip>
        </Flex>

        <Flex gap="3" align="center">
          {children}
        </Flex>
      </Flex>
    </Card>
    // </Container>
    // </Box>
  );
}
