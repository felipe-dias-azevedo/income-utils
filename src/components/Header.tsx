import { Card, Flex, Heading, Separator } from "@radix-ui/themes";
import React from "react";
import type { ReactNode } from "react";
import AppUpdatedDate from "./AppUpdatedDate";

interface HeaderSectionProps {
  children?: ReactNode;
}

function HeaderStart() {
  return (
    <Flex
      display={{ initial: "none", sm: "flex" }}
      align="center"
      gap="3"
      style={{ flex: 1 }}
    >
      <Heading size="5">Simulador Financeiro</Heading>
      <AppUpdatedDate />
    </Flex>
  );
}

function HeaderCenter({ children }: HeaderSectionProps) {
  return <>{children}</>;
}

function HeaderEnd({ children }: HeaderSectionProps) {
  return <>{children}</>;
}

function HeaderSubheader({ children }: HeaderSectionProps) {
  return <>{children}</>;
}

interface HeaderProps {
  children?: ReactNode;
}

export function Header({ children }: HeaderProps) {
  let start: ReactNode = null;
  let center: ReactNode = null;
  let end: ReactNode = null;
  let subheader: ReactNode = null;

  React.Children.forEach(children, (child) => {
    if (React.isValidElement(child)) {
      if (child.type === HeaderStart) start = child;
      else if (child.type === HeaderCenter) center = child;
      else if (child.type === HeaderEnd) end = child;
      else if (child.type === HeaderSubheader) subheader = child;
    }
  });

  return (
    <>
      <Card
        style={{
          pointerEvents: "auto",
          width: "100%",
          transition: "all var(--transition-medium)"
        }}
      >
        <Flex gap="2" direction="column" justify="center" px="1">
          <Flex align="center" gap="4" style={{ width: "100%" }}>
            {start}
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

          {subheader && (
            <>
              <Separator orientation="horizontal" style={{ width: "100%" }} />

              <Flex
                align="center"
                gap="4"
                style={{
                  width: "100%",
                  justifyContent: "center"
                }}
              >
                {subheader}
              </Flex>
            </>
          )}
        </Flex>
      </Card>
    </>
  );
}

Header.Start = HeaderStart;
Header.Center = HeaderCenter;
Header.End = HeaderEnd;
Header.Subheader = HeaderSubheader;
