import { lazy, type ComponentType } from "react";
import {
  ActivityLogIcon,
  ArrowUpIcon,
  BarChartIcon,
  DrawingPinIcon,
  HomeIcon,
  PieChartIcon
} from "@radix-ui/react-icons";

const HomePage = lazy(() => import("./pages/HomePage"));

const CompareIncomesPage = lazy(() => import("./pages/CompareIncomesPage"));

const CompareIncomesTaxesPage = lazy(
  () => import("./pages/CompareIncomesTaxesPage")
);

const CompareFinancing = lazy(() =>
  import("./components/CompareFinancing").then((module) => ({
    default: module.CompareFinancing
  }))
);

const CompareCompoundInterest = lazy(
  () => import("./components/CompareCompoundInterest")
);

const TimeToGoal = lazy(() => import("./components/TimeToGoal"));

export type Page =
  | "home"
  | "compareIncomes"
  | "compareIncomesTaxes"
  | "compareFinancings"
  | "compareCompoundInterest"
  | "timeToGoal";

type IconComponent = ComponentType<{
  width?: number | string;
  height?: number | string;
}>;

type PageDefinition = {
  label: string;
  path: string;
  description: string;
  icon: IconComponent;
  component: ComponentType<any>;
  componentProps?: Record<string, unknown>;
  group: "rendas" | "financiamentos" | "viver-de-renda";
};

export const PAGE_DEFINITIONS: Record<Page, PageDefinition> = {
  home: {
    label: "Início",
    path: "/",
    description: "Volte para a tela inicial",
    icon: HomeIcon,
    component: HomePage,
    group: "rendas"
  },
  compareIncomes: {
    label: "Comparar Rendas",
    path: "/compare-incomes",
    description:
      "Compare diferentes rendas para ver o impacto no seu planejamento.",
    icon: BarChartIcon,
    component: CompareIncomesPage,
    group: "rendas"
  },
  compareIncomesTaxes: {
    label: "Calcular Líquido",
    path: "/compare-incomes-taxes",
    description: "Entenda quanto resta após impostos e contribuições.",
    icon: PieChartIcon,
    component: CompareIncomesTaxesPage,
    group: "rendas"
  },
  compareFinancings: {
    label: "Financiamentos",
    path: "/compare-financings",
    description: "Explore cenários de financiamento com uma visão mais clara.",
    icon: ActivityLogIcon,
    component: CompareFinancing,
    group: "financiamentos"
  },
  compareCompoundInterest: {
    label: "Viver de Renda",
    path: "/compare-compound-interest",
    description:
      "Simule crescimento com juros compostos para projeções de renda.",
    icon: ArrowUpIcon,
    component: CompareCompoundInterest,
    group: "viver-de-renda"
  },
  timeToGoal: {
    label: "Meta",
    path: "/time-to-goal",
    description:
      "Acompanhe quanto tempo leva para alcançar uma meta financeira.",
    icon: DrawingPinIcon,
    component: TimeToGoal,
    group: "viver-de-renda"
  }
} satisfies Record<Page, PageDefinition>;

export const PAGE_ROUTES: Record<Page, string> = Object.fromEntries(
  Object.entries(PAGE_DEFINITIONS).map(([key, page]) => [key, page.path])
) as Record<Page, string>;

export const HOME_PAGE_GROUPS = [
  {
    title: "Rendas",
    pages: ["compareIncomes", "compareIncomesTaxes"] as const
  },
  {
    title: "Financiamentos",
    pages: ["compareFinancings"] as const
  },
  {
    title: "Viver de Renda",
    pages: ["compareCompoundInterest", "timeToGoal"] as const
  }
];

export const NAVIGATION_ITEMS = [
  {
    type: "item" as const,
    label: PAGE_DEFINITIONS.home.label,
    route: PAGE_DEFINITIONS.home.path,
    icon: PAGE_DEFINITIONS.home.icon
  },
  ...HOME_PAGE_GROUPS.flatMap((group) => [
    { type: "separator" as const, key: `separator-${group.title}` },
    ...group.pages.map((pageKey) => {
      const page = PAGE_DEFINITIONS[pageKey];

      return {
        type: "item" as const,
        label: page.label,
        route: page.path,
        icon: page.icon
      };
    })
  ])
];
