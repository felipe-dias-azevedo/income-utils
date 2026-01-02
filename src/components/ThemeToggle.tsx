import { IconButton } from "@radix-ui/themes";
import { MoonIcon, SunIcon } from "@radix-ui/react-icons";

interface ThemeToggleProps {
  isDark: boolean;
  onToggle: () => void;
}

export function ThemeToggle({ isDark, onToggle }: ThemeToggleProps) {
  return (
    <IconButton
      onClick={onToggle}
      variant="ghost"
      size="3"
      ml="2"
      mr="2"
      style={{
        borderRadius: "20px",
      }}
      title={isDark ? "Ativar modo claro" : "Ativar modo escuro"}
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </IconButton>
  );
}
