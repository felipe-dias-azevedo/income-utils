import {
  Flex,
  Card,
  Heading,
  Text,
  Strong,
  Separator,
  Badge
} from "@radix-ui/themes";
import { formatCurrency, formatPercentage } from "../utils/formatting";
import { PieChart } from "./Charts/PieChart";

export interface TaxResultValue {
  label: string;
  value: number;
}

export interface TaxResultCardProps {
  heading: string;
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
    <Card className="popup-animated">
      <Flex p="2" gap="4" direction="column">
        <Flex gap="4" direction="row" align="center" justify="between">
          <Heading size="5">{heading}</Heading>
          {subtitleText && (
            <Badge
              size="3"
              radius="full"
              variant="outline"
              style={{ userSelect: "none" }}
            >
              {subtitleText}
            </Badge>
          )}
        </Flex>

        <Flex direction="column" gap="1">
          <Flex align="center" justify="between" gap="4">
            <Text size="3">Valor Bruto: </Text>
            <Strong key={gross} className="valuechange-animated">
              {formatCurrency(gross)}
            </Strong>
          </Flex>

          {deductions.map((deduction, index) => (
            <Flex key={index} align="center" justify="between" gap="4">
              <Text size="3">{deduction.label}:</Text>
              <Text
                key={deduction.value}
                color="red"
                weight="bold"
                className="valuechange-animated"
              >
                &minus; {formatCurrency(deduction.value)}
              </Text>
            </Flex>
          ))}

          <Separator orientation="horizontal" style={{ width: "100%" }} />

          <Flex align="center" justify="between" gap="4">
            <Text size="3">Total Líquido: </Text>
            <Strong key={net} className="valuechange-animated">
              {formatCurrency(net)}
            </Strong>
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
      </Flex>
    </Card>
  );
}
