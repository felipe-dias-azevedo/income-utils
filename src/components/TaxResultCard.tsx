import { Flex, Heading } from "@radix-ui/themes";
import { formatPercentage } from "../utils/formatting";
import { PieChart } from "./Charts/PieChart";
import ContentCard from "./Common/ContentCard";
import { TaxResultDetails, type TaxResultValue } from "./TaxResultDetails";

export type { TaxResultValue } from "./TaxResultDetails";

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

      <TaxResultDetails gross={gross} net={net} deductions={deductions} />

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
