import { Box, Container, Flex, Heading } from "@radix-ui/themes";
import type { ReactNode } from "react";

interface HeaderProps {
  isDark: boolean;
  children?: ReactNode;
}

export function Header({ isDark, children }: HeaderProps) {
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
        pointerEvents: "none",
      }}
    >
      <Container size="4" p="4">
        <Box
          style={{
            pointerEvents: "auto",
            width: "100%",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            backgroundColor: isDark
              ? "rgba(35, 35, 35, 0.7)"
              : "rgba(255, 255, 255, 0.7)",
            border: isDark
              ? "1px solid rgba(255, 255, 255, 0.1)"
              : "1px solid rgba(0, 0, 0, 0.1)",
            borderRadius: "50px",
            padding: "12px 24px",
            boxShadow: isDark
              ? "0 8px 32px rgba(0, 0, 0, 0.3)"
              : "0 8px 32px rgba(0, 0, 0, 0.1)",
            transition: "all 0.3s ease",
          }}
        >
          <Flex justify="between" align="center" gap="4">
            <Heading
              size="6"
              style={{
                margin: 0,
                fontWeight: 700,
              }}
            >
              Utilitários de Rendimentos
            </Heading>

            <Flex gap="4" align="center">
              {children}
            </Flex>
          </Flex>
        </Box>
      </Container>
    </Box>
  );
}
