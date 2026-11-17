import { useTheme } from '../hooks/useTheme';
import type { ThemePreference } from '../lib/theme';

const ICONS: Record<ThemePreference, string> = {
  system: '🖥️',
  light: '☀️',
  dark: '🌙',
};

const LABELS: Record<ThemePreference, string> = {
  system: 'Theme: System',
  light: 'Theme: Light',
  dark: 'Theme: Dark',
};

export default function ThemeToggle() {
  const { preference, cycle } = useTheme();
  return (
    <button
      type="button"
      onClick={cycle}
      aria-label={LABELS[preference]}
      title={LABELS[preference]}
      className="fixed top-3 left-3 z-50 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-lg text-foreground shadow-lg hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span aria-hidden="true">{ICONS[preference]}</span>
    </button>
  );
}
