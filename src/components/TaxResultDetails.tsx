import { Flex, Separator, Text } from "@radix-ui/themes";
import { formatCurrency } from "../utils/formatting";
import { TextNumeric } from "./Common/TextNumeric";
import { useMemo } from "react";

export interface TaxResultValue {
  label: string;
  value: number;
}

export interface TaxResultDetailsProps {
  gross: number | TaxResultValue;
  net: number | TaxResultValue;
  deductions?: TaxResultValue[];
  postIncrements?: TaxResultValue[];
  postNet?: number | TaxResultValue;
}

function getTaxResultNumber(value: number | TaxResultValue): number {
  return typeof value === "number" ? value : value.value;
}

function getTaxResultLabel(
  value: number | TaxResultValue,
  defaultLabel: string
): string {
  return typeof value === "number" ? defaultLabel : value.label;
}

export function TaxResultDetails({
  gross,
  net,
  deductions = [],
  postIncrements = [],
  postNet
}: TaxResultDetailsProps) {
  const grossValue = useMemo(() => getTaxResultNumber(gross), [gross]);
  const netValue = useMemo(() => getTaxResultNumber(net), [net]);
  const postNetValue = useMemo(
    () => (postNet === undefined ? undefined : getTaxResultNumber(postNet)),
    [postNet]
  );
  const grossLabel = getTaxResultLabel(gross, "Valor Bruto");
  const netLabel = getTaxResultLabel(net, "Total Líquido");
  const postNetLabel =
    postNet === undefined
      ? undefined
      : getTaxResultLabel(postNet, "Total Líquido");

  return (
    <Flex
      direction="column"
      gap="1"
      p="3"
      style={{
        boxShadow: "inset 0 0 0 1px var(--gray-a6)",
        borderRadius: "var(--radius-4)",
        backgroundColor: "var(--color-surface)"
      }}
    >
      <Flex align="center" justify="between" gap="4">
        <Text size="3">{grossLabel}: </Text>
        <TextNumeric weight="bold" key={grossValue} animate>
          {formatCurrency(grossValue)}
        </TextNumeric>
      </Flex>

      {deductions.map((deduction, index) => (
        <Flex key={index} align="center" justify="between" gap="4">
          <Text size="3">{deduction.label}:</Text>
          <TextNumeric
            key={`${deduction.label}-${deduction.value}`}
            color="red"
            weight="bold"
            animate
          >
            &minus; {formatCurrency(deduction.value)}
          </TextNumeric>
        </Flex>
      ))}

      <Separator
        orientation="horizontal"
        style={{ width: "100%", height: "1px" }}
      />

      <Flex align="center" justify="between" gap="4">
        <Text size="3">{netLabel}: </Text>
        <TextNumeric weight="bold" key={netValue} animate>
          {formatCurrency(netValue)}
        </TextNumeric>
      </Flex>

      {postIncrements.length > 0 &&
        postIncrements.map((increment, index) => (
          <Flex key={index} align="center" justify="between" gap="4">
            <Text size="3">{increment.label}:</Text>
            <TextNumeric
              key={`${increment.label}-${increment.value}`}
              color="green"
              weight="bold"
              animate
            >
              + {formatCurrency(increment.value)}
            </TextNumeric>
          </Flex>
        ))}

      {postNetValue !== undefined && (
        <>
          <Separator
            orientation="horizontal"
            style={{ width: "100%", height: "1px" }}
          />

          <Flex align="center" justify="between" gap="4">
            <Text size="3">{postNetLabel}: </Text>
            <TextNumeric weight="bold" key={postNetValue} animate>
              {formatCurrency(postNetValue)}
            </TextNumeric>
          </Flex>
        </>
      )}
    </Flex>
  );
}
