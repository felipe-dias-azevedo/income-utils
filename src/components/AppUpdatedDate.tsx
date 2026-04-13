import { Badge, Tooltip } from "@radix-ui/themes";

export default function AppUpdatedDate() {
  return (
    <Tooltip content="Regras tributárias atualizadas para 2026">
      <Badge
        size="1"
        radius="full"
        variant="soft"
        style={{ userSelect: "none" }}
      >
        2026
      </Badge>
    </Tooltip>
  );
}
