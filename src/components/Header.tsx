import { Box, Container, Flex, Heading } from "@radix-ui/themes";
import type { ReactNode } from "react";

interface HeaderProps {
  children?: ReactNode;
}

export function Header({ children }: HeaderProps) {
  return (
    <Box
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        zIndex: 1000,
        display: "flex",
        justifyContent: "center",
        pointerEvents: "none"
      }}
    >
      <Container size="4" p="4">
        <Box
          style={{
            pointerEvents: "auto",
            width: "100%",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            backgroundColor:
              "color-mix(in srgb, var(--gray-2) 70%, transparent)",
            border: "1px solid var(--gray-3)",
            borderRadius: "var(--radius-6)",
            padding: "var(--space-3) var(--space-5)",
            boxShadow: "var(--shadow-5)",
            transition: "all var(--transition-medium)"
          }}
        >
          <Flex justify="between" align="center" gap="4">
            <Heading
              size="6"
              style={{
                margin: 0,
                fontWeight: 700
              }}
            >
              Utilitários de Rendimentos
            </Heading>

            <Flex gap="3" align="center">
              {children}
            </Flex>
          </Flex>
        </Box>
      </Container>
    </Box>
  );
}
