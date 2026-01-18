// web/src/components/navbar/DisplayMenu.tsx
// Display settings dropdown with gradient, solid color, and effects controls

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPalette, faSun, faMoon, faDesktop, faSliders,
  faPlus, faMinus, faRotateLeft, faCheck, faEye,
  faDroplet, faCircle, faGripLines, faMagicWandSparkles,
  faSave, faUndo, faTrash
} from '@fortawesome/free-solid-svg-icons';
import {
  useDisplaySettingsStore,
  gradientPresets,
  solidColorPresets,
  type GradientType,
  type ThemeMode,
} from '../../store/displaySettingsStore';

const presetSwatchColors = [
  '#7c3aed', '#3b82f6', '#06b6d4', '#10b981',
  '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6',
  '#14b8a6', '#f97316',
];

interface DisplayMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DisplayMenu({ isOpen, onClose }: DisplayMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'background' | 'effects' | 'presets'>('background');
  const [customColorIndex, setCustomColorIndex] = useState<number | null>(null);

  const store = useDisplaySettingsStore();

  // Get current settings (includes preview if active)
  const currentSettings = store.getCurrentSettings();
  const hasUnsavedChanges = store.hasUnsavedChanges;

  // Extract current values for easy access
  const {
    themeMode,
    backgroundType,
    gradientColors,
    radialPosition,
    radialSizeX,
    radialSizeY,
    linearAngle,
    solidColor,
    brightness,
    contrast,
    saturation,
    blur,
    animations,
  } = currentSettings;

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  // Parse radial position for the draggable pad
  const [radialX, radialY] = (radialPosition || '50% 0%').split(/\s+/).map(v => parseFloat(v) || 50);

  const handleRadialPadDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    const pad = e.currentTarget;
    const rect = pad.getBoundingClientRect();

    const updatePosition = (ev: MouseEvent) => {
      const x = Math.max(0, Math.min(100, ((ev.clientX - rect.left) / rect.width) * 100));
      const y = Math.max(0, Math.min(100, ((ev.clientY - rect.top) / rect.height) * 100));
      const newPosition = `${x.toFixed(0)}% ${y.toFixed(0)}%`;
      console.log('Preview radial position:', newPosition);
      store.updatePreview({ radialPosition: newPosition });
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', updatePosition);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', updatePosition);
    document.addEventListener('mouseup', onMouseUp);
    updatePosition(e.nativeEvent);
  };

  const themeModes: { value: ThemeMode; icon: typeof faSun; label: string }[] = [
    { value: 'system', icon: faDesktop, label: 'System' },
    { value: 'light', icon: faSun, label: 'Light' },
    { value: 'dark', icon: faMoon, label: 'Dark' },
  ];

  const backgroundTypes: { value: GradientType; icon: typeof faDroplet; label: string }[] = [
    { value: 'radial', icon: faDroplet, label: 'Radial' },
    { value: 'linear', icon: faGripLines, label: 'Linear' },
    { value: 'solid', icon: faCircle, label: 'Solid' },
    { value: 'none', icon: faEye, label: 'None' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={menuRef}
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className="absolute right-0 top-full mt-2 z-50"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Glow effect */}
          <div className="absolute -inset-[1px] bg-gradient-to-br from-purple-500/30 via-cyan-500/20 to-purple-500/30 rounded-2xl blur-sm" />
          <div className="absolute inset-0 rounded-2xl border border-purple-500/30" />

          <div className="relative w-80 h-[80vh] max-h-[600px] flex flex-col rounded-2xl backdrop-blur-xl bg-black/95 shadow-2xl">
            {/* Header */}
            <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faPalette} className="text-purple-400" />
                <span className="font-semibold text-white">Display Settings</span>
                {hasUnsavedChanges && (
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-500/20 border border-yellow-500/30">
                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
                    <span className="text-xs text-yellow-400 font-medium">Unsaved</span>
                  </div>
                )}
              </div>
              <div className="flex gap-1">
                <button
                  onClick={store.resetToDefaults}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                  title="Reset to defaults (black background)"
                >
                  <FontAwesomeIcon icon={faRotateLeft} className="text-sm" />
                </button>
              </div>
            </div>

            {/* Compact Header with Theme & Tabs */}
            <div className="px-4 py-3 border-b border-white/5 flex-shrink-0">
              {/* Theme Mode Toggle */}
              <div className="mb-3">
                <div className="flex gap-1 p-1 bg-white/5 rounded-lg">
                  {themeModes.map(({ value, icon, label }) => (
                    <button
                      key={value}
                      onClick={() => store.updatePreview({ themeMode: value })}
                      className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-md text-xs font-medium transition-all ${
                        themeMode === value
                          ? 'bg-purple-500/20 text-purple-300'
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <FontAwesomeIcon icon={icon} className="text-xs" />
                      <span className="hidden sm:inline">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-1">
                {[
                  { id: 'background', label: 'Background', icon: faDroplet },
                  { id: 'effects', label: 'Effects', icon: faSliders },
                  { id: 'presets', label: 'Presets', icon: faMagicWandSparkles },
                ].map(({ id, label, icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id as typeof activeTab)}
                    className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md text-xs font-medium transition-all ${
                      activeTab === id
                        ? 'bg-cyan-500/20 text-cyan-300'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <FontAwesomeIcon icon={icon} className="text-[10px]" />
                    <span>{label}</span>
                  </button>
                ))}
              </div>

              {/* Compact Action Buttons - Always visible */}
              <div className="flex gap-1 mt-2">
                <button
                  onClick={store.savePreview}
                  disabled={!hasUnsavedChanges}
                  className={`flex-1 py-1 px-2 rounded text-xs font-medium transition-all flex items-center justify-center gap-1 ${
                    hasUnsavedChanges
                      ? 'bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-400'
                      : 'bg-white/5 border border-white/10 text-gray-500 cursor-not-allowed'
                  }`}
                  title="Save Changes"
                >
                  <FontAwesomeIcon icon={faSave} className="text-xs" />
                  Save
                </button>
                <button
                  onClick={store.revertPreview}
                  disabled={!hasUnsavedChanges}
                  className={`flex-1 py-1 px-2 rounded text-xs font-medium transition-all flex items-center justify-center gap-1 ${
                    hasUnsavedChanges
                      ? 'bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/30 text-yellow-400'
                      : 'bg-white/5 border border-white/10 text-gray-500 cursor-not-allowed'
                  }`}
                  title="Revert Changes"
                >
                  <FontAwesomeIcon icon={faUndo} className="text-xs" />
                  Revert
                </button>
                <button
                  onClick={store.resetToDefaults}
                  className="px-2 py-1 rounded text-xs font-medium transition-all bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 flex items-center justify-center"
                  title="Reset to Black Background"
                >
                  <FontAwesomeIcon icon={faTrash} className="text-xs" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="px-4 pb-4 overflow-y-auto custom-scrollbar flex-1">
              {/* Background Tab */}
              {activeTab === 'background' && (
                <>
                  {/* Background Type */}
                  <div className="space-y-2 mb-2">
                    <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Type</label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {backgroundTypes.map(({ value, icon, label }) => (
                        <button
                          key={value}
                          onClick={() => store.updatePreview({ backgroundType: value })}
                          className={`flex flex-col items-center gap-1 py-2 px-2 rounded-lg text-xs transition-all ${
                            backgroundType === value
                              ? 'bg-cyan-500/20 text-cyan-300 ring-1 ring-cyan-500/50'
                              : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          <FontAwesomeIcon icon={icon} />
                          <span>{label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Gradient Colors */}
                  {(backgroundType === 'radial' || backgroundType === 'linear') && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Colors ({gradientColors.length}/4)
                        </label>
                        <div className="flex gap-1">
                          {gradientColors.length > 1 && (
                            <button
                              onClick={() => {
                                const newColors = gradientColors.slice(0, -1);
                                store.updatePreview({ gradientColors: newColors });
                              }}
                              className="w-6 h-6 rounded-md bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors flex items-center justify-center"
                            >
                              <FontAwesomeIcon icon={faMinus} className="text-xs" />
                            </button>
                          )}
                          {gradientColors.length < 4 && (
                            <button
                              onClick={() => {
                                const newColors = [...gradientColors, { color: '#000000', alpha: 0.2 }];
                                store.updatePreview({ gradientColors: newColors });
                              }}
                              className="w-6 h-6 rounded-md bg-white/5 hover:bg-cyan-500/20 text-gray-400 hover:text-cyan-400 transition-colors flex items-center justify-center"
                            >
                              <FontAwesomeIcon icon={faPlus} className="text-xs" />
                            </button>
                          )}
                        </div>
                      </div>

                      {gradientColors.map((gc, idx) => (
                        <div key={idx} className="space-y-2 p-2.5 rounded-xl bg-white/5">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs text-gray-500">Color {idx + 1}</span>
                            <div
                              className="w-6 h-6 rounded-md border border-white/20 cursor-pointer relative overflow-hidden"
                              style={{ backgroundColor: gc.color }}
                              onClick={() => setCustomColorIndex(customColorIndex === idx ? null : idx)}
                            >
                              {customColorIndex === idx && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                  <FontAwesomeIcon icon={faCheck} className="text-white text-xs" />
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Color swatches */}
                          <div className="flex flex-wrap gap-1.5">
                            {presetSwatchColors.map((color) => (
                              <button
                                key={color}
                                onClick={() => {
                                  const newColors = [...gradientColors];
                                  newColors[idx] = { ...newColors[idx], color };
                                  store.updatePreview({ gradientColors: newColors });
                                }}
                                className={`w-5 h-5 rounded-full border-2 transition-transform hover:scale-110 ${
                                  gc.color === color ? 'border-white scale-110' : 'border-transparent'
                                }`}
                                style={{ backgroundColor: color }}
                              />
                            ))}
                            {/* Custom color input */}
                            <div className="relative">
                              <input
                                type="color"
                                value={gc.color}
                                onChange={(e) => {
                                  const newColors = [...gradientColors];
                                  newColors[idx] = { ...newColors[idx], color: e.target.value };
                                  store.updatePreview({ gradientColors: newColors });
                                }}
                                className="w-5 h-5 rounded-full cursor-pointer opacity-0 absolute inset-0"
                              />
                              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-red-500 via-green-500 to-blue-500 border border-white/20 pointer-events-none" />
                            </div>
                          </div>

                          {/* Alpha slider */}
                          <div className="flex items-center gap-2 box-border">
                            <span className="text-xs text-gray-500 w-12">Alpha</span>
                            <input
                              type="range"
                              min="0"
                              max="1"
                              step="0.01"
                              value={gc.alpha}
                              onChange={(e) => {
                                const newColors = [...gradientColors];
                                newColors[idx] = { ...newColors[idx], alpha: parseFloat(e.target.value) };
                                store.updatePreview({ gradientColors: newColors });
                              }}
                              className="flex-1 h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-400"
                            />
                            <span className="text-xs text-gray-400 w-8 text-right">{gc.alpha.toFixed(2)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Radial Position Pad */}
                  {backgroundType === 'radial' && (
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Position</label>
                      <div
                        className="w-full aspect-[2/1] rounded-xl bg-white/5 border border-white/10 relative cursor-crosshair overflow-hidden"
                        onMouseDown={handleRadialPadDrag}
                        style={{
                          background: `
                            radial-gradient(circle at center, transparent 18%, rgba(255,255,255,0.1) 19%, transparent 20%),
                            radial-gradient(circle at center, transparent 38%, rgba(255,255,255,0.1) 39%, transparent 40%),
                            radial-gradient(circle at center, transparent 58%, rgba(255,255,255,0.1) 59%, transparent 60%),
                            linear-gradient(to right, transparent 49.5%, rgba(255,255,255,0.15) 50%, transparent 50.5%),
                            linear-gradient(to bottom, transparent 49.5%, rgba(255,255,255,0.15) 50%, transparent 50.5%),
                            rgba(255,255,255,0.03)
                          `,
                        }}
                      >
                        <div
                          className="absolute w-4 h-4 rounded-full bg-cyan-400 border-2 border-white shadow-lg transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                          style={{ left: `${radialX}%`, top: `${radialY}%` }}
                        />
                      </div>

                      {/* Radial Size */}
                      <div className="grid grid-cols-2 gap-3 mt-3">
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">Size X <span className="text-xs text-gray-400 w-8">{radialSizeX}%</span></label>
                          <div className="flex items-center gap-2">
                            <input
                              type="range"
                              min="30"
                              max="120"
                              value={radialSizeX}
                              onChange={(e) => store.updatePreview({ radialSizeX: parseFloat(e.target.value) })}
                              className="flex-1 h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-400"
                            />
                            
                          </div>
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">Size Y
                          <span className="text-xs text-gray-400 w-8">{radialSizeY}%</span>

                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="range"
                              min="30"
                              max="120"
                              value={radialSizeY}
                              onChange={(e) => store.updatePreview({ radialSizeY: parseFloat(e.target.value) })}
                              className="flex-1 h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-400"
                            />
                            
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Linear Angle */}
                  {backgroundType === 'linear' && (
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Angle</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="0"
                          max="360"
                          value={linearAngle}
                          onChange={(e) => store.updatePreview({ linearAngle: parseFloat(e.target.value) })}
                          className="flex-1 h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-400"
                        />
                        <span className="text-sm text-gray-400 w-10 text-right">{linearAngle}°</span>
                      </div>
                    </div>
                  )}

                  {/* Solid Color */}
                  {backgroundType === 'solid' && (
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Color</label>
                      <div className="grid grid-cols-6 gap-2">
                        {solidColorPresets.map((color) => (
                          <button
                            key={color}
                            onClick={() => store.updatePreview({ solidColor: color })}
                            className={`aspect-square rounded-lg border-2 transition-all hover:scale-105 ${
                              solidColor === color ? 'border-cyan-400 scale-105' : 'border-transparent'
                            }`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <input
                          type="color"
                          value={solidColor}
                          onChange={(e) => store.updatePreview({ solidColor: e.target.value })}
                          className="w-8 h-8 rounded-lg cursor-pointer border border-white/20"
                        />
                        <input
                          type="text"
                          value={solidColor}
                          onChange={(e) => store.updatePreview({ solidColor: e.target.value })}
                          className="flex-1 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm font-mono focus:outline-none focus:border-cyan-500/50"
                        />
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Effects Tab */}
              {activeTab === 'effects' && (
                <div className="space-y-4">
                  {/* Brightness */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Brightness</label>
                      <span className="text-xs text-gray-500">{brightness.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="1.5"
                      step="0.01"
                      value={brightness}
                      onChange={(e) => store.updatePreview({ brightness: parseFloat(e.target.value) })}
                      className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-yellow-400"
                    />
                  </div>

                  {/* Contrast */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Contrast</label>
                      <span className="text-xs text-gray-500">{contrast.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="1.5"
                      step="0.01"
                      value={contrast}
                      onChange={(e) => store.updatePreview({ contrast: parseFloat(e.target.value) })}
                      className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-orange-400"
                    />
                  </div>

                  {/* Saturation */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Saturation</label>
                      <span className="text-xs text-gray-500">{saturation.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="2.0"
                      step="0.01"
                      value={saturation}
                      onChange={(e) => store.updatePreview({ saturation: parseFloat(e.target.value) })}
                      className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-pink-400"
                    />
                  </div>

                  {/* Blur */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Blur</label>
                      <span className="text-xs text-gray-500">{blur}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="20"
                      step="1"
                      value={blur}
                      onChange={(e) => store.updatePreview({ blur: parseFloat(e.target.value) })}
                      className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-400"
                    />
                  </div>

                  {/* Animations Toggle */}
                  <div className="flex items-center justify-between py-2">
                    <label className="text-sm text-gray-300">Enable Animations</label>
                    <button
                      onClick={() => store.updatePreview({ animations: !animations })}
                      className={`relative w-11 h-6 rounded-full transition-colors ${
                        animations ? 'bg-cyan-500/30' : 'bg-white/10'
                      }`}
                    >
                      <div
                        className={`absolute top-1 w-4 h-4 rounded-full transition-all ${
                          animations ? 'left-6 bg-cyan-400' : 'left-1 bg-gray-400'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              )}

              {/* Presets Tab */}
              {activeTab === 'presets' && (
                <div className="space-y-3">
                  <p className="text-xs text-gray-500 mb-3">Quick apply gradient presets</p>
                  <div className="grid grid-cols-2 gap-2">
                    {gradientPresets.map((preset) => {
                      const previewGradient = `linear-gradient(135deg, ${preset.colors.map((c, i) => `${c.color} ${i * 33}%`).join(', ')})`;
                      return (
                        <button
                          key={preset.name}
                          onClick={() => store.updatePreview({ gradientColors: preset.colors })}
                          className="group relative p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-500/30 transition-all text-left"
                        >
                          <div
                            className="w-full h-8 rounded-lg mb-2"
                            style={{ background: previewGradient }}
                          />
                          <span className="text-xs text-gray-300 group-hover:text-white transition-colors">
                            {preset.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                </div>
              )}

            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
