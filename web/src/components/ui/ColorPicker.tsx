// Modern Comprehensive Color Picker Component
// web/src/components/ui/ColorPicker.tsx

import { useState, useRef, useEffect, useCallback } from 'react';
import { HexColorPicker, HexColorInput } from 'react-colorful';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faPalette } from '@fortawesome/free-solid-svg-icons';
import usePopperDropdown from './usePopperDropdown';

interface RgbaColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  previewColor: string;
  label?: string;
  variant?: 'default' | 'compact';
  disabled?: boolean;
}

export function ColorPicker({
  color,
  onChange,
  previewColor,
  label,
  variant = 'default',
  disabled = false,
}: ColorPickerProps) {
  const [mode, setMode] = useState<'hex' | 'rgb' | 'hsl'>('hex');
  const [hexValue, setHexValue] = useState(color);
  const previewButtonRef = useRef<HTMLDivElement>(null);
  const isCompact = variant === 'compact';
  
  // Use popper for positioning - pass ref as anchor element, positioned at top-left
  const { dropdownRef, showDropdown, setShowDropdown } = usePopperDropdown(
    false,
    'top-start',
    undefined,
    previewButtonRef as React.RefObject<HTMLElement>
  );

  // Sync hex value with color prop
  useEffect(() => {
    setHexValue(color);
  }, [color]);

  // Close picker on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        previewButtonRef.current &&
        !previewButtonRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showDropdown, dropdownRef]);

  // Convert hex to RGB
  const hexToRgb = useCallback((hex: string): RgbaColor => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
          a: 1,
        }
      : { r: 0, g: 0, b: 0, a: 1 };
  }, []);

  // Convert RGB to hex
  const rgbToHex = useCallback((rgb: RgbaColor): string => {
    const toHex = (n: number) => {
      const hex = Math.round(n).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
  }, []);

  // Convert hex to HSL
  const hexToHsl = useCallback((hex: string) => {
    const rgb = hexToRgb(hex);
    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r:
          h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
          break;
        case g:
          h = ((b - r) / d + 2) / 6;
          break;
        case b:
          h = ((r - g) / d + 4) / 6;
          break;
      }
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
    };
  }, [hexToRgb]);

  // Convert HSL to hex
  const hslToHex = useCallback((h: number, s: number, l: number): string => {
    s /= 100;
    l /= 100;

    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l - c / 2;
    let r = 0;
    let g = 0;
    let b = 0;

    if (0 <= h && h < 60) {
      r = c;
      g = x;
      b = 0;
    } else if (60 <= h && h < 120) {
      r = x;
      g = c;
      b = 0;
    } else if (120 <= h && h < 180) {
      r = 0;
      g = c;
      b = x;
    } else if (180 <= h && h < 240) {
      r = 0;
      g = x;
      b = c;
    } else if (240 <= h && h < 300) {
      r = x;
      g = 0;
      b = c;
    } else if (300 <= h && h < 360) {
      r = c;
      g = 0;
      b = x;
    }

    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);

    const toHex = (n: number) => {
      const hex = n.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }, []);

  const [rgbValue, setRgbValue] = useState(() => hexToRgb(color));
  const [hslValue, setHslValue] = useState(() => hexToHsl(color));

  // Update values when color changes
  useEffect(() => {
    setRgbValue(hexToRgb(color));
    setHslValue(hexToHsl(color));
  }, [color, hexToRgb, hexToHsl]);

  const handleHexChange = useCallback((newHex: string) => {
    setHexValue(newHex);
    onChange(newHex);
    setRgbValue(hexToRgb(newHex));
    setHslValue(hexToHsl(newHex));
  }, [onChange, hexToRgb, hexToHsl]);

  const handleRgbChange = useCallback((newRgb: RgbaColor) => {
    setRgbValue(newRgb);
    const newHex = rgbToHex(newRgb);
    setHexValue(newHex);
    onChange(newHex);
    setHslValue(hexToHsl(newHex));
  }, [onChange, rgbToHex, hexToHsl]);

  const handleHslChange = useCallback((h: number, s: number, l: number) => {
    setHslValue({ h, s, l });
    const newHex = hslToHex(h, s, l);
    setHexValue(newHex);
    onChange(newHex);
    setRgbValue(hexToRgb(newHex));
  }, [onChange, hslToHex, hexToRgb]);

  const handleToggle = () => {
    if (!disabled) {
      setShowDropdown(!showDropdown);
    }
  };

  return (
    <>
      {/* Color Preview Button */}
      <div className={`flex items-center gap-3 ${isCompact ? 'flex-col' : ''}`}>
        <div
          ref={previewButtonRef}
          className={`${isCompact ? 'w-9 h-9 rounded-lg border border-zinc-700' : 'w-16 h-16 rounded-xl border-2 border-zinc-700'} flex-shrink-0 cursor-pointer transition-colors shadow-lg ${
            disabled ? 'cursor-not-allowed opacity-50' : 'hover:border-purple-500/50'
          }`}
          style={{ backgroundColor: previewColor }}
          onClick={handleToggle}
          title="Click to open color picker"
        />
        {!isCompact && (
          <button
            onClick={handleToggle}
            disabled={disabled}
            className={`px-4 py-2 rounded-lg border border-zinc-700 text-white text-sm font-medium flex items-center gap-2 transition-colors ${
              disabled ? 'bg-zinc-800/40 opacity-60 cursor-not-allowed' : 'bg-zinc-800/50 hover:bg-zinc-800/70'
            }`}
          >
            <FontAwesomeIcon icon={faPalette} />
            {label || 'Pick Color'}
          </button>
        )}
        {label && !isCompact && (
          <input
            type="text"
            value={hexValue}
            onChange={(e) => {
              if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(e.target.value)) {
                handleHexChange(e.target.value);
              } else {
                setHexValue(e.target.value);
              }
            }}
            onBlur={(e) => {
              if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(e.target.value)) {
                handleHexChange(e.target.value);
              } else {
                setHexValue(color);
              }
            }}
            disabled={disabled}
            className="flex-1 px-3 py-2 rounded-lg bg-zinc-800/50 border border-zinc-700 text-white text-xs font-mono"
            placeholder="#000000"
          />
        )}
      </div>

      {/* Color Picker Popup */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.15 }}
            className="fixed z-[9999] bg-zinc-900 rounded-lg border border-zinc-700 shadow-2xl p-3 w-[280px]"
            onMouseDown={(e) => e.stopPropagation()}
            style={{ pointerEvents: 'auto' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-white">{label || 'Color Picker'}</h4>
              <button
                onClick={() => setShowDropdown(false)}
                className="w-6 h-6 rounded-lg hover:bg-zinc-800 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
              >
                <FontAwesomeIcon icon={faTimes} className="text-xs" />
              </button>
            </div>

            {/* Mode Tabs */}
            <div className="flex gap-2 mb-4">
              {(['hex', 'rgb', 'hsl'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    mode === m
                      ? 'bg-purple-500/20 text-purple-400 ring-1 ring-purple-500/50'
                      : 'bg-zinc-800/50 text-gray-400 hover:bg-zinc-800 hover:text-white'
                  }`}
                >
                  {m.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Color Picker Visual */}
            <div className="mb-4">
              <HexColorPicker
                color={hexValue}
                onChange={handleHexChange}
                style={{ width: '100%', height: '200px' }}
              />
            </div>

            {/* Color Inputs Based on Mode */}
            <div className="space-y-2">
              {mode === 'hex' && (
                <div>
                  <label className="block text-[10px] text-gray-400 mb-1">Hex</label>
                  <HexColorInput
                    color={hexValue}
                    onChange={handleHexChange}
                    prefixed
                    alpha={false}
                    className="w-full px-2 py-1.5 rounded bg-zinc-800/50 border border-zinc-700 text-white text-xs font-mono focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                  />
                </div>
              )}

              {mode === 'rgb' && (
                <div className="space-y-2">
                  <label className="block text-[10px] text-gray-400">RGB</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    <div>
                      <label className="block text-[10px] text-gray-500 mb-0.5">R</label>
                      <input
                        type="number"
                        min="0"
                        max="255"
                        value={rgbValue.r}
                        onChange={(e) => {
                          const val = Math.max(0, Math.min(255, parseInt(e.target.value) || 0));
                          handleRgbChange({ ...rgbValue, r: val });
                        }}
                        className="w-full px-1 py-1 rounded bg-zinc-800/50 border border-zinc-700 text-white text-[10px] text-center focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                      />
                      <input
                        type="range"
                        min="0"
                        max="255"
                        value={rgbValue.r}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          handleRgbChange({ ...rgbValue, r: val });
                        }}
                        className="w-full h-1.5 bg-zinc-700 rounded appearance-none cursor-pointer accent-red-500 mt-0.5"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-500 mb-0.5">G</label>
                      <input
                        type="number"
                        min="0"
                        max="255"
                        value={rgbValue.g}
                        onChange={(e) => {
                          const val = Math.max(0, Math.min(255, parseInt(e.target.value) || 0));
                          handleRgbChange({ ...rgbValue, g: val });
                        }}
                        className="w-full px-1 py-1 rounded bg-zinc-800/50 border border-zinc-700 text-white text-[10px] text-center focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                      />
                      <input
                        type="range"
                        min="0"
                        max="255"
                        value={rgbValue.g}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          handleRgbChange({ ...rgbValue, g: val });
                        }}
                        className="w-full h-1.5 bg-zinc-700 rounded appearance-none cursor-pointer accent-green-500 mt-0.5"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-500 mb-0.5">B</label>
                      <input
                        type="number"
                        min="0"
                        max="255"
                        value={rgbValue.b}
                        onChange={(e) => {
                          const val = Math.max(0, Math.min(255, parseInt(e.target.value) || 0));
                          handleRgbChange({ ...rgbValue, b: val });
                        }}
                        className="w-full px-1 py-1 rounded bg-zinc-800/50 border border-zinc-700 text-white text-[10px] text-center focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                      />
                      <input
                        type="range"
                        min="0"
                        max="255"
                        value={rgbValue.b}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          handleRgbChange({ ...rgbValue, b: val });
                        }}
                        className="w-full h-1.5 bg-zinc-700 rounded appearance-none cursor-pointer accent-blue-500 mt-0.5"
                      />
                    </div>
                  </div>
                </div>
              )}

              {mode === 'hsl' && (
                <div className="space-y-2">
                  <label className="block text-xs text-gray-400">HSL</label>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">H</label>
                      <input
                        type="number"
                        min="0"
                        max="360"
                        value={hslValue.h}
                        onChange={(e) => {
                          const val = Math.max(0, Math.min(360, parseInt(e.target.value) || 0));
                          handleHslChange(val, hslValue.s, hslValue.l);
                        }}
                        className="w-full px-2 py-1.5 rounded-lg bg-zinc-800/50 border border-zinc-700 text-white text-xs text-center focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">S</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={hslValue.s}
                        onChange={(e) => {
                          const val = Math.max(0, Math.min(100, parseInt(e.target.value) || 0));
                          handleHslChange(hslValue.h, val, hslValue.l);
                        }}
                        className="w-full px-2 py-1.5 rounded-lg bg-zinc-800/50 border border-zinc-700 text-white text-xs text-center focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">L</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={hslValue.l}
                        onChange={(e) => {
                          const val = Math.max(0, Math.min(100, parseInt(e.target.value) || 0));
                          handleHslChange(hslValue.h, hslValue.s, val);
                        }}
                        className="w-full px-2 py-1.5 rounded-lg bg-zinc-800/50 border border-zinc-700 text-white text-xs text-center focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    <div>
                      <input
                        type="range"
                        min="0"
                        max="360"
                        value={hslValue.h}
                        onChange={(e) => handleHslChange(Number(e.target.value), hslValue.s, hslValue.l)}
                        className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                      />
                    </div>
                    <div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={hslValue.s}
                        onChange={(e) => handleHslChange(hslValue.h, Number(e.target.value), hslValue.l)}
                        className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                      />
                    </div>
                    <div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={hslValue.l}
                        onChange={(e) => handleHslChange(hslValue.h, hslValue.s, Number(e.target.value))}
                        className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Preset Colors */}
            <div className="mt-3 pt-3 border-t border-zinc-800">
              <label className="block text-[10px] text-gray-400 mb-1.5">Quick Colors</label>
              <div className="grid grid-cols-10 gap-1">
                {[
                  // Grays
                  '#000000', '#1a1a1a', '#404040', '#737373', '#a3a3a3',
                  // Purples & Violets
                  '#7c3aed', '#8b5cf6', '#a855f7', '#c084fc', '#e9d5ff',
                  // Blues
                  '#1e40af', '#3b82f6', '#60a5fa', '#93c5fd', '#dbeafe',
                  // Cyans & Teals
                  '#0e7490', '#06b6d4', '#22d3ee', '#67e8f9', '#cffafe',
                  // Greens
                  '#047857', '#10b981', '#34d399', '#6ee7b7', '#d1fae5',
                  // Yellows & Ambers
                  '#b45309', '#f59e0b', '#fbbf24', '#fcd34d', '#fef3c7',
                  // Oranges & Reds
                  '#c2410c', '#ef4444', '#f87171', '#fca5a5', '#fee2e2',
                  // Pinks & Roses
                  '#be185d', '#ec4899', '#f472b6', '#fbcfe8', '#fce7f3',
                  // Indigos
                  '#4338ca', '#6366f1', '#818cf8', '#a5b4fc', '#e0e7ff',
                  // Emeralds
                  '#059669', '#10b981', '#34d399', '#6ee7b7', '#d1fae5',
                ].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => handleHexChange(preset)}
                    className="w-6 h-6 rounded border border-zinc-700 hover:border-purple-500/50 hover:scale-110 transition-all"
                    style={{ backgroundColor: preset }}
                    title={preset}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
