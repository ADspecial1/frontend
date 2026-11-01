import { Platform } from 'react-native';

// ─── Brand Palette ─────────────────────────────────────────────────────────────
export const Palette = {
  primary:       '#6C63FF',
  primaryLight:  '#8B85FF',
  primaryDark:   '#4A42DD',
  primaryFade:   '#EEF2FF',

  accent:        '#FF6584',
  accentFade:    '#FFF0F3',

  success:       '#00BFA5',
  successFade:   '#E6FAF7',

  warning:       '#FF9800',
  warningFade:   '#FFF8E1',

  error:         '#FF5252',
  errorFade:     '#FFF5F5',

  dark:          '#1A1A2E',
  darkCard:      '#16213E',

  text:          '#2D3748',
  textSecondary: '#718096',
  textMuted:     '#A0AEC0',

  border:        '#E2E8F0',
  borderLight:   '#F1F5F9',

  card:          '#FFFFFF',
  background:    '#F4F6FF',
};

// ─── Legacy Colors (kept for compatibility) ────────────────────────────────────
const tintColorLight = Palette.primary;
const tintColorDark  = '#fff';

export const Colors = {
  light: {
    text:             Palette.text,
    background:       Palette.background,
    tint:             tintColorLight,
    icon:             Palette.textSecondary,
    tabIconDefault:   Palette.textMuted,
    tabIconSelected:  tintColorLight,
  },
  dark: {
    text:             '#ECEDEE',
    background:       '#151718',
    tint:             tintColorDark,
    icon:             '#9BA1A6',
    tabIconDefault:   '#9BA1A6',
    tabIconSelected:  tintColorDark,
  },
};

// ─── Shadows ───────────────────────────────────────────────────────────────────
export const Shadows = {
  card: {
    shadowColor:   '#6C63FF',
    shadowOffset:  { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius:  12,
    elevation:     6,
  },
  button: {
    shadowColor:   '#6C63FF',
    shadowOffset:  { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius:  14,
    elevation:     10,
  },
  subtle: {
    shadowColor:   '#000',
    shadowOffset:  { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius:  8,
    elevation:     3,
  },
};

// ─── Spacing ───────────────────────────────────────────────────────────────────
export const Spacing = {
  xs:  4,
  sm:  8,
  md:  16,
  lg:  24,
  xl:  32,
  xxl: 48,
};

// ─── Border Radius ─────────────────────────────────────────────────────────────
export const Radius = {
  sm:  8,
  md:  12,
  lg:  20,
  xl:  28,
  full: 9999,
};

// ─── Typography ────────────────────────────────────────────────────────────────
export const Fonts = Platform.select({
  ios: {
    sans:    'system-ui',
    serif:   'ui-serif',
    rounded: 'ui-rounded',
    mono:    'ui-monospace',
  },
  default: {
    sans:    'normal',
    serif:   'serif',
    rounded: 'normal',
    mono:    'monospace',
  },
  web: {
    sans:    "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif:   "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono:    "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
