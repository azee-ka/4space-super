import type { AccentColor } from '../store/themeStore';

const ACCENT_COLOR_MAP: Record<AccentColor, string> = {
  cyan: '#06b6d4',
  pink: '#ec4899',
  green: '#10b981',
  amber: '#f59e0b',
  purple: '#a855f7',
  orange: '#f97316',
  blue: '#3b82f6',
  red: '#ef4444',
  fuchsia: '#d946ef',
};

export const ACCENT_OPTIONS: Array<{ label: string; value: AccentColor; hex: string }> = [
  { label: 'Cyan', value: 'cyan', hex: ACCENT_COLOR_MAP.cyan },
  { label: 'Pink', value: 'pink', hex: ACCENT_COLOR_MAP.pink },
  { label: 'Green', value: 'green', hex: ACCENT_COLOR_MAP.green },
  { label: 'Amber', value: 'amber', hex: ACCENT_COLOR_MAP.amber },
  { label: 'Purple', value: 'purple', hex: ACCENT_COLOR_MAP.purple },
  { label: 'Orange', value: 'orange', hex: ACCENT_COLOR_MAP.orange },
  { label: 'Blue', value: 'blue', hex: ACCENT_COLOR_MAP.blue },
  { label: 'Red', value: 'red', hex: ACCENT_COLOR_MAP.red },
  { label: 'Fuchsia', value: 'fuchsia', hex: ACCENT_COLOR_MAP.fuchsia },
];

export const getAccentColorHex = (accentColor: AccentColor) =>
  ACCENT_COLOR_MAP[accentColor] || ACCENT_COLOR_MAP.cyan;
