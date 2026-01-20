// web/src/store/displaySettingsStore.ts
// Global display settings store for background gradients, colors, and effects

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface GradientColor {
  color: string;
  alpha: number;
}

export type GradientType = 'radial' | 'linear' | 'solid' | 'none';
export type ThemeMode = 'system' | 'light' | 'dark';

export interface DisplaySettings {
  // Theme
  themeMode: ThemeMode;

  // Background type
  backgroundType: GradientType;

  // Gradient colors (up to 4)
  gradientColors: GradientColor[];

  // Radial gradient settings
  radialPosition: string; // e.g., "50% 0%"
  radialSizeX: number; // percentage 30-120
  radialSizeY: number; // percentage 30-120

  // Linear gradient settings
  linearAngle: number; // degrees 0-360

  // Solid color
  solidColor: string;

  // Image effects
  brightness: number; // 0.5-1.5
  contrast: number; // 0.5-1.5
  saturation: number; // 0.5-2.0
  blur: number; // 0-20px

  // UI settings
  fontSize: number; // em multiplier 0.8-1.5
  uiOpacity: number; // 0.5-1.0
  animations: boolean;
  reducedMotion: boolean;
}

export const defaultDisplaySettings: DisplaySettings = {
  themeMode: 'dark',
  backgroundType: 'radial',
  gradientColors: [
    { color: '#7c3aed', alpha: 0.35 },
    { color: '#06b6d4', alpha: 0.25 },
    { color: '#10b981', alpha: 0.15 },
    { color: '#000000', alpha: 0 },
  ],
  radialPosition: '50% 0%',
  radialSizeX: 85,
  radialSizeY: 70,
  linearAngle: 135,
  solidColor: '#000000',
  brightness: 1,
  contrast: 1,
  saturation: 1,
  blur: 0,
  fontSize: 1,
  uiOpacity: 1,
  animations: true,
  reducedMotion: false,
};

// Preset gradients for quick selection
export const gradientPresets = [
  {
    name: 'Cosmic Purple',
    colors: [
      { color: '#7c3aed', alpha: 0.35 },
      { color: '#06b6d4', alpha: 0.25 },
      { color: '#10b981', alpha: 0.15 },
      { color: '#000000', alpha: 0 },
    ],
  },
  {
    name: 'Ocean Blue',
    colors: [
      { color: '#0ea5e9', alpha: 0.4 },
      { color: '#3b82f6', alpha: 0.3 },
      { color: '#1e3a8a', alpha: 0.2 },
      { color: '#000000', alpha: 0 },
    ],
  },
  {
    name: 'Sunset',
    colors: [
      { color: '#f97316', alpha: 0.35 },
      { color: '#ec4899', alpha: 0.25 },
      { color: '#8b5cf6', alpha: 0.15 },
      { color: '#000000', alpha: 0 },
    ],
  },
  {
    name: 'Forest',
    colors: [
      { color: '#10b981', alpha: 0.35 },
      { color: '#059669', alpha: 0.25 },
      { color: '#065f46', alpha: 0.15 },
      { color: '#000000', alpha: 0 },
    ],
  },
  {
    name: 'Cherry',
    colors: [
      { color: '#e11d48', alpha: 0.35 },
      { color: '#f43f5e', alpha: 0.25 },
      { color: '#881337', alpha: 0.15 },
      { color: '#000000', alpha: 0 },
    ],
  },
  {
    name: 'Midnight',
    colors: [
      { color: '#1e293b', alpha: 0.5 },
      { color: '#334155', alpha: 0.3 },
      { color: '#0f172a', alpha: 0.2 },
      { color: '#000000', alpha: 0 },
    ],
  },
  {
    name: 'Aurora',
    colors: [
      { color: '#22d3ee', alpha: 0.3 },
      { color: '#a855f7', alpha: 0.25 },
      { color: '#ec4899', alpha: 0.2 },
      { color: '#000000', alpha: 0 },
    ],
  },
  {
    name: 'Gold',
    colors: [
      { color: '#f59e0b', alpha: 0.35 },
      { color: '#d97706', alpha: 0.25 },
      { color: '#92400e', alpha: 0.15 },
      { color: '#000000', alpha: 0 },
    ],
  },
];

// Preset solid colors
export const solidColorPresets = [
  '#0a0a0f',
  '#1a1a2e',
  '#16213e',
  '#1f2937',
  '#18181b',
  '#0c4a6e',
  '#134e4a',
  '#1e1b4b',
  '#4a044e',
  '#450a0a',
  '#422006',
  '#052e16',
];

interface DisplaySettingsStore extends DisplaySettings {
  // Preview state (for UI only, not applied to background)
  previewSettings: DisplaySettings | null;
  hasUnsavedChanges: boolean;

  // Actions
  setThemeMode: (mode: ThemeMode) => void;
  setBackgroundType: (type: GradientType) => void;
  setGradientColors: (colors: GradientColor[]) => void;
  updateGradientColor: (index: number, color: Partial<GradientColor>) => void;
  addGradientColor: () => void;
  removeGradientColor: (index: number) => void;
  setRadialPosition: (position: string) => void;
  setRadialSize: (sizeX: number, sizeY: number) => void;
  setLinearAngle: (angle: number) => void;
  setSolidColor: (color: string) => void;
  setBrightness: (value: number) => void;
  setContrast: (value: number) => void;
  setSaturation: (value: number) => void;
  setBlur: (value: number) => void;
  setFontSize: (value: number) => void;
  setUiOpacity: (value: number) => void;
  setAnimations: (enabled: boolean) => void;
  setReducedMotion: (enabled: boolean) => void;
  applyPreset: (preset: typeof gradientPresets[0]) => void;
  resetToDefaults: () => void;

  // Preview actions
  updatePreview: (updates: Partial<DisplaySettings>) => void;
  savePreview: () => void;
  revertPreview: () => void;

  // Computed
  getBackgroundStyle: () => React.CSSProperties;
  getFilterStyle: () => React.CSSProperties;
  getCurrentSettings: () => DisplaySettings; // Returns preview if available (for menu UI)
  getSavedSettings: () => DisplaySettings; // Returns only saved settings (for background)
}

// Helper to convert hex to rgba
const hexToRgba = (hex: string, alpha: number): string => {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
  const n = parseInt(full, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// Compute CSS gradient string
const computeGradient = (settings: DisplaySettings): string => {
  const { backgroundType, gradientColors, radialPosition, radialSizeX, radialSizeY, linearAngle, solidColor } = settings;

  if (backgroundType === 'none') {
    return 'transparent';
  }

  if (backgroundType === 'solid') {
    return solidColor;
  }

  const colors = gradientColors.slice(0, 4).map(gc => hexToRgba(gc.color, gc.alpha));
  const c0 = colors[0] || 'rgba(124, 58, 237, 0.35)';
  const c1 = colors[1] || c0;
  const c2 = colors[2] || c1;
  const c3 = colors[3] || 'rgba(0, 0, 0, 0)';

  if (backgroundType === 'linear') {
    // Linear gradient - fades to transparent, black background is set separately by BackgroundProvider
    return `linear-gradient(${linearAngle}deg, ${c0} 0%, ${c0} 10%, ${c1} 20%, ${c2} 35%, ${c3} 55%)`;
  }

  // Radial gradient - fades to transparent, black background is set separately by BackgroundProvider
  const [px, py] = radialPosition.split(/\s+/);
  const pos = `${px || '50%'} ${py || '0%'}`;
  const sx = `${Math.max(30, Math.min(200, radialSizeX))}%`;
  const sy = `${Math.max(30, Math.min(200, radialSizeY))}%`;

  return `radial-gradient(${sx} ${sy} at ${pos},
    ${c0} 0%,
    ${c0} 10%,
    ${c1} 20%,
    ${c2} 35%,
    ${c3} 55%)`;
};

export const useDisplaySettingsStore = create<DisplaySettingsStore>()(
  persist(
    (set, get) => ({
      ...defaultDisplaySettings,

      // Preview state
      previewSettings: null,
      hasUnsavedChanges: false,

      setThemeMode: (mode) => set({ themeMode: mode }),

      setBackgroundType: (type) => set({ backgroundType: type }),

      setGradientColors: (colors) => set({ gradientColors: colors.slice(0, 4) }),

      updateGradientColor: (index, updates) => {
        const colors = [...get().gradientColors];
        if (index >= 0 && index < colors.length) {
          colors[index] = { ...colors[index], ...updates };
          set({ gradientColors: colors });
        }
      },

      addGradientColor: () => {
        const colors = get().gradientColors;
        if (colors.length < 4) {
          set({
            gradientColors: [...colors, { color: '#000000', alpha: 0.2 }],
          });
        }
      },

      removeGradientColor: (index) => {
        const colors = get().gradientColors;
        if (colors.length > 1 && index >= 0 && index < colors.length) {
          set({
            gradientColors: colors.filter((_, i) => i !== index),
          });
        }
      },

      setRadialPosition: (position) => set({ radialPosition: position }),

      setRadialSize: (sizeX, sizeY) => set({ radialSizeX: sizeX, radialSizeY: sizeY }),

      setLinearAngle: (angle) => set({ linearAngle: angle }),

      setSolidColor: (color) => set({ solidColor: color }),

      setBrightness: (value) => set({ brightness: Math.max(0.5, Math.min(1.5, value)) }),

      setContrast: (value) => set({ contrast: Math.max(0.5, Math.min(1.5, value)) }),

      setSaturation: (value) => set({ saturation: Math.max(0.5, Math.min(2.0, value)) }),

      setBlur: (value) => set({ blur: Math.max(0, Math.min(20, value)) }),

      setFontSize: (value) => set({ fontSize: Math.max(0.8, Math.min(1.5, value)) }),

      setUiOpacity: (value) => set({ uiOpacity: Math.max(0.5, Math.min(1.0, value)) }),

      setAnimations: (enabled) => set({ animations: enabled }),

      setReducedMotion: (enabled) => set({ reducedMotion: enabled }),

      applyPreset: (preset) => set({ gradientColors: preset.colors }),

      resetToDefaults: () => set({
        ...defaultDisplaySettings,
        previewSettings: null,
        hasUnsavedChanges: false
      }),

      // Preview methods
      updatePreview: (updates) => {
        const current = get().previewSettings || get().getCurrentSettings();
        const newPreview = { ...current, ...updates };
        set({
          previewSettings: newPreview,
          hasUnsavedChanges: true
        });
      },

      savePreview: () => {
        const preview = get().previewSettings;
        if (preview) {
          const { previewSettings, hasUnsavedChanges, ...savedSettings } = get();
          set({
            ...preview,
            previewSettings: null,
            hasUnsavedChanges: false
          });
        }
      },

      revertPreview: () => set({
        previewSettings: null,
        hasUnsavedChanges: false
      }),

      getCurrentSettings: () => {
        const state = get();
        // Returns preview settings if available (used by DisplayMenu UI)
        return state.previewSettings || {
          themeMode: state.themeMode,
          backgroundType: state.backgroundType,
          gradientColors: state.gradientColors,
          radialPosition: state.radialPosition,
          radialSizeX: state.radialSizeX,
          radialSizeY: state.radialSizeY,
          linearAngle: state.linearAngle,
          solidColor: state.solidColor,
          brightness: state.brightness,
          contrast: state.contrast,
          saturation: state.saturation,
          blur: state.blur,
          fontSize: state.fontSize,
          uiOpacity: state.uiOpacity,
          animations: state.animations,
          reducedMotion: state.reducedMotion,
        };
      },

      getSavedSettings: () => {
        const state = get();
        // Returns only saved settings (ignores preview - used by BackgroundProvider)
        return {
          themeMode: state.themeMode,
          backgroundType: state.backgroundType,
          gradientColors: state.gradientColors,
          radialPosition: state.radialPosition,
          radialSizeX: state.radialSizeX,
          radialSizeY: state.radialSizeY,
          linearAngle: state.linearAngle,
          solidColor: state.solidColor,
          brightness: state.brightness,
          contrast: state.contrast,
          saturation: state.saturation,
          blur: state.blur,
          fontSize: state.fontSize,
          uiOpacity: state.uiOpacity,
          animations: state.animations,
          reducedMotion: state.reducedMotion,
        };
      },

      getBackgroundStyle: () => {
        // Use current settings (includes preview) for live preview
        const settings = get().getCurrentSettings();
        return {
          background: computeGradient(settings),
        };
      },

      getFilterStyle: () => {
        // Use current settings (includes preview) for live preview
        const settings = get().getCurrentSettings();
        const { brightness, contrast, saturation, blur } = settings;
        const filters = [];
        if (brightness !== 1) filters.push(`brightness(${brightness})`);
        if (contrast !== 1) filters.push(`contrast(${contrast})`);
        if (saturation !== 1) filters.push(`saturate(${saturation})`);
        if (blur > 0) filters.push(`blur(${blur}px)`);

        return filters.length > 0 ? { filter: filters.join(' ') } : {};
      },
    }),
    {
      name: 'display-settings-storage',
      // Only persist saved settings, NOT preview state
      // This ensures unsaved changes are lost on page reload
      partialize: (state) => ({
        themeMode: state.themeMode,
        backgroundType: state.backgroundType,
        gradientColors: state.gradientColors,
        radialPosition: state.radialPosition,
        radialSizeX: state.radialSizeX,
        radialSizeY: state.radialSizeY,
        linearAngle: state.linearAngle,
        solidColor: state.solidColor,
        brightness: state.brightness,
        contrast: state.contrast,
        saturation: state.saturation,
        blur: state.blur,
        fontSize: state.fontSize,
        uiOpacity: state.uiOpacity,
        animations: state.animations,
        reducedMotion: state.reducedMotion,
        // Explicitly NOT including: previewSettings, hasUnsavedChanges
      }),
    }
  )
);

// Hook to get effective theme (resolves 'system' to actual theme)
export function useEffectiveTheme(): 'light' | 'dark' {
  const themeMode = useDisplaySettingsStore((s) => s.themeMode);
  if (themeMode === 'system') {
    return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }
  return themeMode;
}
