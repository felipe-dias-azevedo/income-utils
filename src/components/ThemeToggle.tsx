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
      size="2"
      title={isDark ? "Ativar modo claro" : "Ativar modo escuro"}
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </IconButton>
  );
}
