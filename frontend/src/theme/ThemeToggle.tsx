import { FaMoon, FaSun } from "react-icons/fa";
import { useTheme } from "./ThemeProvider";

interface ThemeToggleProps {
  compact?: boolean;
}

export default function ThemeToggle({ compact = false }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
      className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-line-strong bg-surface-2 text-ink-dim transition-colors hover:border-accent/50 hover:bg-surface-3 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 ${
        compact ? "h-10 w-10" : "h-10 px-3"
      }`}
    >
      {isDark ? (
        <FaSun className="text-amber-400" />
      ) : (
        <FaMoon className="text-violet-600" />
      )}

      {!compact && (
        <span className="text-xs font-semibold">
          {isDark ? "Light mode" : "Dark mode"}
        </span>
      )}
    </button>
  );
}
