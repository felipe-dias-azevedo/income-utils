import { Flex, Separator, Text } from "@radix-ui/themes";
import { formatCurrency } from "../utils/formatting";
import { TextNumeric } from "./Common/TextNumeric";

export interface CompoundInterestResultDetailsProps {
  totalInvested: number;
  totalInterest: number;
  totalFinal: number;
  inflationAdjustedFinal: number;
  inflationImpact?: number;
}

export function CompoundInterestResultDetails({
  totalInvested,
  totalInterest,
  totalFinal,
  inflationAdjustedFinal,
  inflationImpact
}: CompoundInterestResultDetailsProps) {
  const actualInflationImpact =
    inflationImpact ?? Math.max(0, totalFinal - inflationAdjustedFinal);

  return (
    <>
      <Flex align="center" justify="between" gap="4">
        <Text size="3">Valor total investido:</Text>
        <TextNumeric weight="bold" key={totalInvested} animate>
          {formatCurrency(totalInvested)}
        </TextNumeric>
      </Flex>

      <Flex align="center" justify="between" gap="4">
        <Text size="3">Total em juros</Text>
        <TextNumeric key={totalInterest} color="green" weight="bold" animate>
          + {formatCurrency(totalInterest)}
        </TextNumeric>
      </Flex>

      <Separator
        orientation="horizontal"
        style={{ width: "100%", height: "1px" }}
      />

      <Flex align="center" justify="between" gap="4">
        <Text size="3">Valor total final:</Text>
        <TextNumeric weight="bold" key={totalFinal} animate>
          {formatCurrency(totalFinal)}
        </TextNumeric>
      </Flex>

      <Flex align="center" justify="between" gap="4">
        <Text size="3">Inflação:</Text>
        <TextNumeric
          key={actualInflationImpact}
          color={actualInflationImpact > 0 ? "red" : "gray"}
          weight="bold"
          animate
        >
          &minus; {formatCurrency(actualInflationImpact)}
        </TextNumeric>
      </Flex>

      <Separator
        orientation="horizontal"
        style={{ width: "100%", height: "1px" }}
      />

      <Flex align="center" justify="between" gap="4">
        <Text size="3">Ajustado à inflação:</Text>
        <TextNumeric weight="bold" key={inflationAdjustedFinal} animate>
          {formatCurrency(inflationAdjustedFinal)}
        </TextNumeric>
      </Flex>
    </>
  );
}
