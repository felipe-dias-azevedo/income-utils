import { Heading } from "@radix-ui/themes";
import ContentCard from "../components/Common/ContentCard";
import { useIncomeContext } from "../contexts/IncomeContext";
import { IncomeForm } from "../components/IncomeForm";
import { CompareIncomes } from "../components/CompareIncomes";

export default function CompareIncomesPage() {
  const { incomes, isLoading } = useIncomeContext();

  if (isLoading) {
    return;
  }

  if (incomes.length > 0) {
    return <CompareIncomes />;
  }

  if (incomes.length === 0) {
    return (
      <ContentCard p="4" gap="4">
        <Heading size="4">Adicionar Renda</Heading>

        <IncomeForm />
      </ContentCard>
    );
  }
}
