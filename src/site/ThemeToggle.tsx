import { useTheme } from '../theme/useTheme';

/**
 * The theme toggle: one button, "Dark theme", pressed when the dark theme is on. The label
 * never changes; `aria-pressed` carries the state, so a screen reader hears "Dark theme,
 * toggle button, pressed" rather than a label that might name either the state or the action.
 */
export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button
      type="button"
      className="btn o sm theme-toggle"
      aria-pressed={theme === 'dark'}
      onClick={toggle}
    >
      <span aria-hidden="true" className="theme-toggle__glyph">
        ☾
      </span>
      Dark theme
    </button>
  );
}
