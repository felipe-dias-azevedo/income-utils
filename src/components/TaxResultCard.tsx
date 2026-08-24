import { Flex, Heading, Text, Separator } from "@radix-ui/themes";
import { formatCurrency, formatPercentage } from "../utils/formatting";
import { PieChart } from "./Charts/PieChart";
import { TextNumeric } from "./Common/TextNumeric";
import ContentCard from "./Common/ContentCard";

export interface TaxResultValue {
  label: string;
  value: number;
}

export interface TaxResultCardProps {
  heading?: string;
  subtitleText?: string;
  gross: number;
  net: number;
  deductions?: TaxResultValue[];
  pieChartData?: Record<string, number>;
  pieFormatter?: (value: number, percent: number) => string;
  minWidth?: string;
}

export function TaxResultCard({
  heading,
  subtitleText,
  gross,
  net,
  deductions = [],
  pieChartData,
  pieFormatter
}: TaxResultCardProps) {
  return (
    <ContentCard p="4" gap="3" direction="column">
      <Flex gap="0" direction="column" align="center" justify="center">
        {heading && <Heading size="5">{heading}</Heading>}
        {subtitleText && <Heading size="2">{subtitleText}</Heading>}
      </Flex>

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
          <Text size="3">Valor Bruto: </Text>
          <TextNumeric weight="bold" key={gross} animate>
            {formatCurrency(gross)}
          </TextNumeric>
        </Flex>

        {deductions.map((deduction, index) => (
          <Flex key={index} align="center" justify="between" gap="4">
            <Text size="3">{deduction.label}:</Text>
            <TextNumeric
              key={deduction.value}
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
          <Text size="3">Total Líquido: </Text>
          <TextNumeric weight="bold" key={net} animate>
            {formatCurrency(net)}
          </TextNumeric>
        </Flex>
      </Flex>

      {pieChartData && (
        <PieChart
          hideLabel
          data={pieChartData}
          formatter={
            pieFormatter || ((_, percent) => formatPercentage(percent))
          }
        />
      )}
    </ContentCard>
  );
}
