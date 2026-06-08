import { BarChart } from "./Charts/BarChart";
import CustomLineChart from "./Charts/CustomLineChart";
import { TimeLineChart } from "./Charts/LineChart";
import { PieChart } from "./Charts/PieChart";
import ContentCard from "./Common/ContentCard";

export default function Test() {
  return (
    <>
      <ContentCard p="4">
        <CustomLineChart
          data={{
            ABC: Array.from({ length: 6 }).map((_, i) => i * 400),
            XYZ: Array.from({ length: 6 }).map((_, i) => 1_000 + i * 100)
          }}
          colors={{
            ABC: "red",
            XYZ: "green"
          }}
        />
      </ContentCard>
      <ContentCard>
        <TimeLineChart
          data={{
            EGYPT: Array.from({ length: 12 }).map((_, i) => i * 210),
            ETES: Array.from({ length: 12 }).map((_, i) => 1000 + i * 100),
            AIDS: Array.from({ length: 12 }).map((_, i) => 800 + i * 150)
          }}
          colors={{ EGYPT: "blue", ETES: "red", AIDS: "yellow" }}
          formatter={(x, _) => x.toLocaleString()}
        />
      </ContentCard>
      <ContentCard>
        <BarChart
          data={{
            ErsntYoung: 221456,
            BancoBradesco: 198745,
            StoneX: 152222
          }}
          colors={{
            ErsntYoung: "blue",
            BancoBradesco: "red",
            StoneX: "green"
          }}
          formatter={(x, _) => x.toLocaleString()}
        />
      </ContentCard>
      <PieChart data={{ A: 40, B: 25, C: 20, D: 10, E: 5 }} />
    </>
  );
}
