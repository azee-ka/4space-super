// web/src/components/navbar/DisplayMenu.tsx
// Comprehensive display settings component
// Supports gradients (radial/linear), solid colors, effects, and UI settings
// Allows customizing backgrounds that don't fill the full screen

import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPalette,
  faSun,
  faMoon,
  faDesktop
} from '@fortawesome/free-solid-svg-icons';
import { HexColorPicker } from 'react-colorful';
import { useDisplaySettingsStore, type GradientColor, solidColorPresets } from '../../store/displaySettingsStore';
import DropdownButton from '../ui/DropdownButton';

const themeOptions = [
  { value: 'system', label: 'System', icon: faDesktop },
  { value: 'light', label: 'Light', icon: faSun },
  { value: 'dark', label: 'Dark', icon: faMoon },
] as const;

const presetColors = [
  '#7c3aed', '#3b82f6', '#06b6d4', '#10b981',
  '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6',
  '#14b8a6', '#f97316', 'picker'
];

const MAX_COLOR_COUNT = 4;

const getSystemTheme = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

const getNextTheme = (current: string) => {
  const idx = themeOptions.findIndex(o => o.value === current);
  return themeOptions[(idx + 1) % themeOptions.length];
};

function GradientDisplayPanel({ onClose }: { onClose: () => void }) {
  const store = useDisplaySettingsStore();
  const containerRef = useRef<HTMLDivElement>(null);

  const [radialCoord, setRadialCoord] = useState({ x: 50, y: 0 });
  const [colorCount, setColorCount] = useState(1);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Local tab state for browsing - doesn't trigger preview until user makes a choice
  const [activeTab, setActiveTab] = useState<'gradient' | 'solid' | 'none'>('gradient');

  const currentSettings = store.getCurrentSettings();
  const {
    themeMode,
    backgroundType,
    gradientColors,
    radialPosition,
    linearAngle,
    solidColor,
    brightness,
    contrast,
    saturation,
    radialSizeX,
    radialSizeY,
    fontSize,
    animations,
  } = currentSettings;

  // Sync activeTab with actual backgroundType on mount and when settings change
  useEffect(() => {
    if (backgroundType === 'radial' || backgroundType === 'linear') {
      setActiveTab('gradient');
    } else if (backgroundType === 'solid') {
      setActiveTab('solid');
    } else {
      setActiveTab('none');
    }
  }, [backgroundType]);

  const { label: themeLabel, icon: ThemeIcon } =
    themeOptions.find(o => o.value === themeMode) || themeOptions[0];
  const effectiveTheme = themeMode === 'system' ? getSystemTheme() : themeMode;
  const isLight = effectiveTheme === 'light';

  useEffect(() => {
    const safeLen = Array.isArray(gradientColors) ? gradientColors.length : 1;
    setColorCount(Math.min(MAX_COLOR_COUNT, Math.max(1, safeLen)));

    const posStr = String(radialPosition || '50% 0%');
    const [px = '50%', py = '0%'] = posStr.split(/\s+/);
    const x = parseFloat(px);
    const y = parseFloat(py);
    if (!Number.isNaN(x) && !Number.isNaN(y)) {
      setRadialCoord({ x, y });
    }
  }, [currentSettings, gradientColors, radialPosition]);

  const update = (key: string, value: any) => {
    store.updatePreview({ [key]: value });
  };

  const updateColor = (i: number, prop: keyof GradientColor, value: any) => {
    const arr = [...gradientColors];
    while (arr.length < colorCount) arr.push({ color: '#000000', alpha: 0.2 });
    arr[i] = { ...arr[i], [prop]: value };
    update('gradientColors', arr);
  };

  const handleCount = (e: React.ChangeEvent<HTMLInputElement>) => {
    let n = Math.min(MAX_COLOR_COUNT, Math.max(1, parseInt(e.target.value, 10) || 1));
    setColorCount(n);
    const arr = gradientColors.slice(0, n);
    while (arr.length < n) arr.push({ color: '#000000', alpha: 0.2 });
    update('gradientColors', arr);
  };

  const reset = () => {
    store.revertPreview();
  };

  const revert = () => {
    setColorCount(gradientColors.length);
    store.resetToDefaults();
  };

  const save = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      store.savePreview();
      onClose();
    } catch (err) {
      setSaveError('Failed to save display settings');
    } finally {
      setSaving(false);
    }
  };

  const hasUnsavedChanges = store.hasUnsavedChanges;

  return (
    <div
      ref={containerRef}
      className="w-80 max-w-full p-4 bg-zinc-900 rounded-2xl shadow-2xl text-white max-h-[80vh] overflow-y-auto box-border"
      onClick={e => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
            <FontAwesomeIcon icon={faPalette} className="text-violet-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Display Settings</h3>
            {/* Saved/Unsaved Status */}
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className={`w-1.5 h-1.5 rounded-full ${hasUnsavedChanges ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
              <span className={`text-[10px] font-medium ${hasUnsavedChanges ? 'text-amber-400' : 'text-emerald-400'}`}>
                {hasUnsavedChanges ? 'Unsaved changes' : 'All changes saved'}
              </span>
            </div>
          </div>
        </div>
        <button
          className="w-8 h-8 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition-colors flex items-center justify-center"
          onClick={() => update('themeMode', getNextTheme(themeMode).value)}
          title={`Theme: ${themeLabel}`}
        >
          <FontAwesomeIcon icon={ThemeIcon} className="text-amber-400 text-sm" />
        </button>
      </div>

      {saveError && (
        <div className="mb-3 p-2 bg-red-500/10 rounded-lg text-red-400 text-xs">
          {saveError}
        </div>
      )}

      {/* Background Settings */}
      {!isLight && (
        <div className="space-y-3 mb-3">
          {/* Background Type Tabs - Just for browsing, doesn't change background */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                <FontAwesomeIcon icon={faPalette} className="text-cyan-400 text-xs" />
              </div>
              <span className="text-xs font-semibold text-white">Background Type</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { value: 'gradient' as const, label: 'Gradient', color: 'violet' },
                { value: 'solid' as const, label: 'Solid', color: 'emerald' },
                { value: 'none' as const, label: 'None', color: 'zinc' },
              ].map(({ value, label, color }) => {
                const isActive = activeTab === value;
                return (
                  <button
                    key={value}
                    onClick={() => setActiveTab(value)}
                    className={`py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? `bg-${color}-500/20 text-${color}-400`
                        : 'bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800 hover:text-white'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Gradient Controls */}
          {activeTab === 'gradient' && (
            <div className="space-y-2">
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <label className="text-xs text-zinc-400 mb-1 block">Style</label>
                  <select
                    value={backgroundType === 'linear' ? 'linear' : 'radial'}
                    onChange={e => update('backgroundType', e.target.value)}
                    className="w-full h-8 px-2 bg-zinc-800/50 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-violet-500/50 box-border"
                  >
                    <option value="radial">Radial</option>
                    <option value="linear">Linear</option>
                  </select>
                </div>
                <div className="w-16">
                  <label className="text-xs text-zinc-400 mb-1 block">Colors</label>
                  <input
                    type="number"
                    min="1"
                    max={MAX_COLOR_COUNT}
                    value={colorCount}
                    onChange={(e) => {
                      handleCount(e);
                      // Also ensure background type is set to gradient when changing colors
                      if (backgroundType !== 'radial' && backgroundType !== 'linear') {
                        update('backgroundType', 'radial');
                      }
                    }}
                    className="w-full h-8 px-2 bg-zinc-800/50 rounded-lg text-xs text-center focus:outline-none focus:ring-1 focus:ring-violet-500/50 box-border"
                  />
                </div>
              </div>

          {/* Radial Position */}
          {(backgroundType === 'radial' || (activeTab === 'gradient' && backgroundType !== 'linear')) && (
            <div>
              <label className="text-sm text-zinc-400 mb-1.5 block">Position</label>
              <div
                className="w-full aspect-[2/1] rounded-lg bg-zinc-800/50 relative cursor-grab overflow-hidden"
                onMouseDown={e => {
                  const pad = e.currentTarget;
                  const move = (ev: MouseEvent) => {
                    const { left, top, width, height } = pad.getBoundingClientRect();
                    const x = Math.max(0, Math.min(100, ((ev.clientX - left) / width) * 100));
                    const y = Math.max(0, Math.min(100, ((ev.clientY - top) / height) * 100));
                    setRadialCoord({ x, y });
                    // Set background type to radial when user adjusts position
                    if (backgroundType !== 'radial') {
                      update('backgroundType', 'radial');
                    }
                    update('radialPosition', `${x.toFixed(0)}% ${y.toFixed(0)}%`);
                  };
                  const up = () => {
                    document.removeEventListener('mousemove', move);
                    document.removeEventListener('mouseup', up);
                  };
                  document.addEventListener('mousemove', move);
                  document.addEventListener('mouseup', up);
                  move(e.nativeEvent);
                }}
                style={{
                  background: `
                    radial-gradient(circle at center,transparent 18%,rgba(255,255,255,0.1) 19%,transparent 20%),
                    radial-gradient(circle at center,transparent 38%,rgba(255,255,255,0.1) 39%,transparent 40%),
                    linear-gradient(to right,transparent 49.5%,rgba(255,255,255,0.15) 50%,transparent 50.5%),
                    linear-gradient(to bottom,transparent 49.5%,rgba(255,255,255,0.15) 50%,transparent 50.5%)
                  `,
                }}
              >
                <div
                  className="absolute w-3 h-3 rounded-full bg-violet-400 border-2 border-white transform -translate-x-1/2 -translate-y-1/2 pointer-events-none shadow-lg"
                  style={{ left: `${radialCoord.x}%`, top: `${radialCoord.y}%` }}
                />
              </div>
            </div>
          )}

          {/* Radial Size */}
          {(backgroundType === 'radial' || (activeTab === 'gradient' && backgroundType !== 'linear')) && (
            <div className="grid grid-cols-2 gap-2">
              <div className="px-2.5 py-2 bg-zinc-800/50 rounded-lg">
                <div className="flex justify-between items-center">
                  <label className="text-sm text-zinc-400">Size X</label>
                  <span className="text-sm text-violet-400 font-medium">{radialSizeX}%</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="120"
                  step="1"
                  value={radialSizeX}
                  onChange={e => {
                    if (backgroundType !== 'radial') update('backgroundType', 'radial');
                    update('radialSizeX', parseFloat(e.target.value));
                  }}
                  className="w-full h-1.5 bg-zinc-700 rounded-full appearance-none cursor-pointer slider-thumb-purple mt-1.5"
                />
              </div>
              <div className="px-2.5 py-2 bg-zinc-800/50 rounded-lg">
                <div className="flex justify-between items-center">
                  <label className="text-sm text-zinc-400">Size Y</label>
                  <span className="text-sm text-violet-400 font-medium">{radialSizeY}%</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="120"
                  step="1"
                  value={radialSizeY}
                  onChange={e => {
                    if (backgroundType !== 'radial') update('backgroundType', 'radial');
                    update('radialSizeY', parseFloat(e.target.value));
                  }}
                  className="w-full h-1.5 bg-zinc-700 rounded-full appearance-none cursor-pointer slider-thumb-purple mt-1.5"
                />
              </div>
            </div>
          )}

          {/* Linear Angle */}
          {backgroundType === 'linear' && (
            <div className="px-2.5 py-2 bg-zinc-800/50 rounded-lg">
              <div className="flex justify-between items-center">
                <label className="text-sm text-zinc-400">Angle</label>
                <span className="text-sm text-cyan-400 font-medium">{linearAngle}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="360"
                step="1"
                value={linearAngle}
                onChange={e => {
                  if (backgroundType !== 'linear') update('backgroundType', 'linear');
                  update('linearAngle', parseFloat(e.target.value));
                }}
                className="w-full h-1.5 bg-zinc-700 rounded-full appearance-none cursor-pointer slider-thumb-purple mt-1.5"
              />
            </div>
          )}

          {/* Colors */}
          {Array.from({ length: colorCount }).map((_, idx) => (
            <div key={idx} className="px-2.5 py-2 bg-zinc-800/50 rounded-lg">
              {/* Color Label */}
              <span className="text-xs text-zinc-500 font-medium block mb-1.5">Color {idx + 1}</span>
              {/* Swatches Row */}
              <div className="flex gap-1.5 mb-2">
                {presetColors.map((c, si) =>
                  c === 'picker' ? (
                    <DropdownButton
                      key={si}
                      placement="bottom-start"
                      boundaryRef={containerRef as React.RefObject<HTMLElement>}
                      toggleContent={
                        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-red-500 via-green-500 to-blue-500 cursor-pointer box-border hover:scale-110 transition-transform" />
                      }
                    >
                      <div className="p-3 bg-zinc-900 rounded-xl" onClick={e => e.stopPropagation()}>
                        <HexColorPicker
                          color={gradientColors[idx]?.color ?? '#000000'}
                          onChange={newColor => {
                            // Set background type to gradient when picking a color
                            if (backgroundType !== 'radial' && backgroundType !== 'linear') {
                              update('backgroundType', 'radial');
                            }
                            updateColor(idx, 'color', newColor);
                          }}
                        />
                      </div>
                    </DropdownButton>
                  ) : (
                    <button
                      key={si}
                      className={`w-5 h-5 rounded-full transition-all hover:scale-110 box-border ${
                        gradientColors[idx]?.color === c ? 'ring-2 ring-white ring-offset-1 ring-offset-zinc-800' : ''
                      }`}
                      style={{ backgroundColor: c }}
                      onClick={() => {
                        // Set background type to gradient when picking a color
                        if (backgroundType !== 'radial' && backgroundType !== 'linear') {
                          update('backgroundType', 'radial');
                        }
                        updateColor(idx, 'color', c);
                      }}
                    />
                  )
                )}
              </div>
              {/* Alpha Slider */}
              <div className="flex items-center gap-2">
                <label className="text-sm text-zinc-500 shrink-0">Alpha</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={gradientColors[idx]?.alpha ?? 0.2}
                  onChange={e => {
                    // Set background type to gradient when adjusting alpha
                    if (backgroundType !== 'radial' && backgroundType !== 'linear') {
                      update('backgroundType', 'radial');
                    }
                    updateColor(idx, 'alpha', parseFloat(e.target.value));
                  }}
                  className="flex-1 h-1.5 bg-zinc-700 rounded-full appearance-none cursor-pointer slider-thumb-cyan box-border"
                />
                <span className="text-sm text-cyan-400 font-medium w-8 text-right">{(gradientColors[idx]?.alpha ?? 0.2).toFixed(2)}</span>
              </div>
            </div>
          ))}
            </div>
          )}

          {/* Solid Color Controls */}
          {activeTab === 'solid' && (
            <div className="px-2.5 py-2 bg-zinc-800/50 rounded-lg">
              <label className="text-sm text-zinc-400 font-medium block mb-2">Solid Color</label>
              <div className="grid grid-cols-6 gap-1.5 mb-2">
                {solidColorPresets.map((color) => (
                  <button
                    key={color}
                    onClick={() => {
                      // Set background type to solid when picking a color
                      if (backgroundType !== 'solid') update('backgroundType', 'solid');
                      update('solidColor', color);
                    }}
                    className={`aspect-square rounded-full transition-all hover:scale-105 box-border ${
                      solidColor === color && backgroundType === 'solid' ? 'ring-2 ring-white ring-offset-1 ring-offset-zinc-800' : ''
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={solidColor}
                  onChange={(e) => {
                    if (backgroundType !== 'solid') update('backgroundType', 'solid');
                    update('solidColor', e.target.value);
                  }}
                  className="w-8 h-8 rounded-lg cursor-pointer box-border"
                />
                <input
                  type="text"
                  value={solidColor}
                  onChange={(e) => {
                    if (backgroundType !== 'solid') update('backgroundType', 'solid');
                    update('solidColor', e.target.value);
                  }}
                  className="flex-1 px-2.5 py-1.5 bg-zinc-700/50 rounded-lg text-sm font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500/50 box-border"
                  placeholder="#000000"
                />
              </div>
            </div>
          )}

          {/* None Background - Apply button */}
          {activeTab === 'none' && (
            <div className="px-2.5 py-3 bg-zinc-800/50 rounded-lg">
              <p className="text-xs text-zinc-400 text-center mb-3">
                Remove background gradient for a clean black look
              </p>
              <button
                onClick={() => update('backgroundType', 'none')}
                className={`w-full py-2 rounded-lg text-sm font-medium transition-all ${
                  backgroundType === 'none'
                    ? 'bg-zinc-600/30 text-zinc-300'
                    : 'bg-zinc-700/50 text-zinc-400 hover:bg-zinc-700 hover:text-white'
                }`}
              >
                {backgroundType === 'none' ? 'Applied' : 'Apply No Background'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Effects */}
      {!isLight && (
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <FontAwesomeIcon icon={faSun} className="text-amber-400 text-xs" />
            </div>
            <span className="text-xs font-semibold text-white">Effects</span>
          </div>

          <div className="space-y-2">
            <div className="px-2.5 py-2 bg-zinc-800/50 rounded-lg">
              <div className="flex justify-between items-center">
                <label className="text-sm text-zinc-400">Brightness</label>
                <span className="text-sm text-yellow-400 font-medium">{brightness.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="1.5"
                step="0.01"
                value={brightness}
                onChange={e => update('brightness', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-zinc-700 rounded-full appearance-none cursor-pointer slider-thumb-yellow mt-1.5"
              />
            </div>

            <div className="px-2.5 py-2 bg-zinc-800/50 rounded-lg">
              <div className="flex justify-between items-center">
                <label className="text-sm text-zinc-400">Contrast</label>
                <span className="text-sm text-orange-400 font-medium">{contrast.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="1.5"
                step="0.01"
                value={contrast}
                onChange={e => update('contrast', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-zinc-700 rounded-full appearance-none cursor-pointer slider-thumb-orange mt-1.5"
              />
            </div>

            <div className="px-2.5 py-2 bg-zinc-800/50 rounded-lg">
              <div className="flex justify-between items-center">
                <label className="text-sm text-zinc-400">Saturation</label>
                <span className="text-sm text-pink-400 font-medium">{saturation.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.01"
                value={saturation}
                onChange={e => update('saturation', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-zinc-700 rounded-full appearance-none cursor-pointer slider-thumb-pink mt-1.5"
              />
            </div>
          </div>
        </div>
      )}

      {/* UI Settings */}
      <div className="mb-3">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <FontAwesomeIcon icon={faDesktop} className="text-blue-400 text-xs" />
          </div>
          <span className="text-xs font-semibold text-white">UI Settings</span>
        </div>

        <div className="space-y-2">
          <div className="px-2.5 py-2 bg-zinc-800/50 rounded-lg">
            <div className="flex justify-between items-center">
              <label className="text-sm text-zinc-400">Font Size</label>
              <span className="text-sm text-blue-400 font-medium">{fontSize.toFixed(2)}em</span>
            </div>
            <input
              type="range"
              min="0.8"
              max="1.5"
              step="0.01"
              value={fontSize}
              onChange={e => update('fontSize', parseFloat(e.target.value))}
              className="w-full h-1.5 bg-zinc-700 rounded-full appearance-none cursor-pointer slider-thumb-blue mt-1.5"
            />
          </div>

          <div className="flex items-center justify-between px-2.5 py-2 bg-zinc-800/50 rounded-lg">
            <label className="text-sm text-white">Animations</label>
            <button
              onClick={() => update('animations', !animations)}
              className={`relative w-10 h-5 rounded-full transition-colors ${
                animations ? 'bg-violet-500/30' : 'bg-zinc-700'
              }`}
            >
              <div
                className={`absolute top-0.5 w-4 h-4 rounded-full transition-all ${
                  animations ? 'left-5 bg-violet-400' : 'left-0.5 bg-zinc-500'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex flex-col gap-2 pt-3 border-t border-zinc-800">
        {/* Unsaved changes warning */}
        {hasUnsavedChanges && (
          <p className="text-[10px] text-amber-400/70 text-center pt-2">
            Changes will be lost on page reload unless saved
          </p>
        )}
        <div className="flex gap-2">
          <button
            onClick={reset}
            disabled={!hasUnsavedChanges}
            className="flex-1 py-2 px-3 text-xs font-medium bg-zinc-800/50 hover:bg-zinc-800 disabled:bg-zinc-800/30 disabled:text-zinc-600 text-zinc-300 rounded-xl transition-colors"
          >
            Reset
          </button>
          <button
            onClick={revert}
            className="flex-1 py-2 px-3 text-xs font-medium bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-colors"
          >
            Default
          </button>
        </div>
        <button
          className={`w-full py-2.5 px-3 text-xs font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
            hasUnsavedChanges
              ? 'bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-400 hover:to-purple-500 text-white shadow-lg shadow-violet-500/20'
              : 'bg-zinc-800/50 text-zinc-500'
          }`}
          onClick={save}
          disabled={saving || !hasUnsavedChanges}
        >
          {saving ? 'Saving...' : hasUnsavedChanges ? 'Save Changes' : 'Saved'}
        </button>
      </div>
    </div>
  );
}

// Export the panel for use with DropdownButton
export function DisplayMenuPanel({ onClose }: { onClose: () => void }) {
  return <GradientDisplayPanel onClose={onClose} />;
}