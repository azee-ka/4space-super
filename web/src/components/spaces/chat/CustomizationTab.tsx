// Comprehensive Customization Tab Component - FIXED VERSION
// web/src/components/spaces/chat/CustomizationTab.tsx

import { useRef, useCallback, memo } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPalette, faTrash, faUpload, faTimes, faImages,
  faShapes, faSlidersH, faCheck, faStar, faCircle
} from '@fortawesome/free-solid-svg-icons';
import { useChatSettingsStore, type BackgroundType, type BubbleShapePreset, type ChatTheme } from '../../../store/chatSettingsStore';
import { themePresets, getThemesByCategory } from '../../../utils/themePresets';
import { ColorPicker } from '../../ui/ColorPicker';

// Toggle Switch Component with smooth animation
const ToggleSwitch = memo(({ enabled, onToggle }: { enabled: boolean; onToggle: (value: boolean) => void }) => (
  <motion.button
    onClick={() => onToggle(!enabled)}
    className={`w-12 h-6 rounded-full transition-colors flex items-center ${
      enabled ? 'bg-purple-500' : 'bg-zinc-700'
    }`}
    whileTap={{ scale: 0.95 }}
  >
    <motion.div
      className="w-5 h-5 rounded-full bg-white"
      animate={{ x: enabled ? 24 : 2 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
    />
  </motion.button>
));

// Helper function to adjust color brightness
function adjustColor(color: string, brightness: number): string {
  // Convert hex to RGB
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Adjust brightness
  const newR = Math.max(0, Math.min(255, r + brightness));
  const newG = Math.max(0, Math.min(255, g + brightness));
  const newB = Math.max(0, Math.min(255, b + brightness));
  
  // Convert back to hex
  return `#${[newR, newG, newB].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('')}`;
}

interface CustomizationTabProps {
  theme: ChatTheme;
  onThemeChange: (theme: ChatTheme) => void;
}

export function CustomizationTab({ theme, onThemeChange }: CustomizationTabProps) {
  const {
    fontSize, setFontSize,
    messageDensity, setMessageDensity,
    setTheme: setStoreTheme,
    ambientLighting,
    setAmbientLighting,
    ambientIntensity,
    setAmbientIntensity,
    applyToAllRooms,
    setApplyToAllRooms,
  } = useChatSettingsStore();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleThemeUpdate = useCallback((updates: Partial<ChatTheme>) => {
    const newTheme = { ...theme, ...updates };
    setStoreTheme(newTheme);
    onThemeChange(newTheme);
  }, [theme, setStoreTheme, onThemeChange]);

  // Handle image upload
  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleThemeUpdate({
          backgroundType: 'image',
          backgroundImage: reader.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [handleThemeUpdate]);

  // Bubble shape presets
  const bubbleShapePresets: Array<{ value: BubbleShapePreset; label: string; radius: number }> = [
    { value: 'square', label: 'Square', radius: 0 },
    { value: 'rounded', label: 'Rounded', radius: 8 },
    { value: 'pill', label: 'Pill', radius: 12 },
    { value: 'extra-rounded', label: 'Extra', radius: 20 },
    { value: 'custom', label: 'Custom', radius: theme.bubbleBorderRadius },
  ];

  // Accent colors
  const accentColors = [
    { value: 'cyan', label: 'Cyan', color: '#06b6d4' },
    { value: 'purple', label: 'Purple', color: '#a855f7' },
    { value: 'pink', label: 'Pink', color: '#ec4899' },
    { value: 'green', label: 'Green', color: '#10b981' },
    { value: 'yellow', label: 'Yellow', color: '#eab308' },
    { value: 'blue', label: 'Blue', color: '#3b82f6' },
    { value: 'orange', label: 'Orange', color: '#f97316' },
    { value: 'red', label: 'Red', color: '#ef4444' },
  ];

  const handleReset = useCallback(() => {
    const defaultTheme: ChatTheme = {
      backgroundType: 'solid',
      backgroundColor: '#000000',
      sentBubbleColor: '#7c3aed', // Purple - original default
      receivedBubbleColor: '#27272a',
      bubbleShapePreset: 'pill',
      bubbleBorderRadius: 12,
      accentColor: 'purple',
      sentTextColor: '#ffffff',
      receivedTextColor: '#ffffff',
    };
    setStoreTheme(defaultTheme);
    onThemeChange(defaultTheme);
    setFontSize(14);
    setMessageDensity('comfortable');
  }, [setStoreTheme, onThemeChange, setFontSize, setMessageDensity]);

  const applyPreset = useCallback((presetId: string) => {
    const preset = themePresets.find(p => p.id === presetId);
    if (preset) {
      setStoreTheme(preset.theme);
      onThemeChange(preset.theme);
    }
  }, [setStoreTheme, onThemeChange]);

  return (
    <div className="p-6 space-y-8 overflow-y-auto h-full">

      {/* Global Settings Toggles */}
      <div className="space-y-4 p-4 rounded-xl bg-zinc-800/30 border border-zinc-700/50">
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-white cursor-pointer">Ambient Lighting</label>
            <p className="text-xs text-gray-400 mt-0.5">RGB-style lighting effect for sidebars</p>
          </div>
          <ToggleSwitch
            enabled={ambientLighting}
            onToggle={setAmbientLighting}
          />
        </div>
        
        {/* Ambient Intensity Slider */}
        {ambientLighting && (
          <div className="space-y-2 pt-2 border-t border-zinc-700/50">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-gray-300">Ambient Intensity</label>
              <span className="text-xs text-purple-400 font-medium">{ambientIntensity}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={ambientIntensity}
              onChange={(e) => setAmbientIntensity(Number(e.target.value))}
              className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
              style={{
                background: `linear-gradient(to right, #a855f7 0%, #a855f7 ${ambientIntensity}%, #3f3f46 ${ambientIntensity}%, #3f3f46 100%)`
              }}
            />
          </div>
        )}
        
        <div className="flex items-center justify-between pt-3 border-t border-zinc-700/50">
          <div>
            <label className="text-sm font-medium text-white cursor-pointer">Apply to All Rooms</label>
            <p className="text-xs text-gray-400 mt-0.5">Use these settings for all chat rooms</p>
          </div>
          <ToggleSwitch
            enabled={applyToAllRooms}
            onToggle={setApplyToAllRooms}
          />
        </div>
      </div>

      {/* Theme Presets (Background Type renamed) */}
      <div>
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <FontAwesomeIcon icon={faPalette} className="text-purple-400" />
          Theme Presets
        </h3>
        {/* Tabs that can wrap to multiple rows */}
        <div className="flex flex-wrap gap-2 mb-4">
          {[
            { value: 'featured' as const, label: 'Featured', icon: faStar },
            { value: 'solid' as const, label: 'Solid', icon: faCircle },
            { value: 'gradient' as const, label: 'Gradient', icon: faSlidersH },
            { value: 'pattern' as const, label: 'Pattern', icon: faShapes },
            { value: 'artistic' as const, label: 'Artistic', icon: faImages },
            { value: 'image' as const, label: 'Image', icon: faUpload },
          ].map((type) => (
            <button
              key={type.value}
              onClick={() => handleThemeUpdate({ backgroundType: type.value as BackgroundType })}
              className={`px-3 py-2.5 rounded-xl transition-all flex flex-col items-center gap-1 min-w-[70px] ${
                theme.backgroundType === type.value
                  ? 'bg-purple-500/20 ring-2 ring-purple-500/50 text-purple-400'
                  : 'bg-zinc-800/50 hover:bg-zinc-800/70 text-gray-400 hover:text-white'
              }`}
            >
              <FontAwesomeIcon icon={type.icon} className="text-base" />
              <span className="text-[10px] font-medium leading-tight text-center">{type.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Featured Premium Themes */}
      {theme.backgroundType === 'featured' && (
        <div>
          <h3 className="text-sm font-bold text-white mb-2">Featured Premium Themes</h3>
          <p className="text-xs text-gray-400 mb-3">Standalone premium themes with custom backgrounds & gradient bubbles</p>
          <div className="grid grid-cols-3 gap-3">
            {getThemesByCategory('featured').map((preset) => (
              <button
                key={preset.id}
                onClick={() => applyPreset(preset.id)}
                className={`relative h-24 rounded-xl overflow-hidden transition-all ${
                  JSON.stringify(theme) === JSON.stringify(preset.theme)
                    ? 'ring-2 ring-purple-500/50 scale-105'
                    : 'hover:scale-105'
                }`}
                style={{
                  backgroundColor: preset.theme.backgroundColor,
                  backgroundImage: preset.theme.backgroundImage 
                    ? `linear-gradient(to bottom, rgba(0, 0, 0, 0.15), rgba(0, 0, 0, 0.15)), url(${preset.theme.backgroundImage}), url(${preset.theme.backgroundImage.replace('.png', '-mirror.png')})`
                    : 'none',
                  backgroundSize: preset.theme.backgroundImage ? 'cover, auto 100%, auto 100%' : 'cover',
                  backgroundPosition: preset.theme.backgroundImage ? 'center, center center, center center' : 'center',
                  backgroundRepeat: preset.theme.backgroundImage ? 'no-repeat, repeat-x, repeat-x' : 'no-repeat',
                }}
              >
                {/* Bubble Preview */}
                <div className="absolute bottom-2 right-2 flex gap-1">
                  <div 
                    className="w-6 h-8 rounded-lg opacity-90 shadow-md"
                    style={{ 
                      background: preset.theme.sentBubbleGradient || preset.theme.sentBubbleColor,
                      borderRadius: '12px',
                    }}
                  />
                  <div 
                    className="w-6 h-8 rounded-lg opacity-90 shadow-md"
                    style={{ 
                      background: preset.theme.receivedBubbleGradient || preset.theme.receivedBubbleColor,
                      borderRadius: '12px',
                    }}
                  />
                </div>
                
                {/* Preset Name - Top Left Corner */}
                <div className="absolute top-1.5 left-1.5 right-1.5">
                  <p className="text-[9px] font-bold text-white/90 drop-shadow-lg leading-tight truncate">{preset.name}</p>
                </div>
                
                {/* Active Indicator */}
                {JSON.stringify(theme) === JSON.stringify(preset.theme) && (
                  <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center shadow-lg">
                    <FontAwesomeIcon icon={faCheck} className="text-white text-[10px]" />
                  </div>
                )}
              </button>
            ))}
          </div>
          <div className="mt-4 p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
            <p className="text-xs text-purple-400">✨ Standalone premium themes with unique backgrounds and gradient bubbles</p>
          </div>
        </div>
      )}

      {/* Solid Color Background */}
      {theme.backgroundType === 'solid' && (
        <div>
          <h3 className="text-sm font-bold text-white mb-4">Solid Color Themes</h3>
          
          {/* Preset Themes */}
          <div className="mb-6">
            <label className="block text-xs text-gray-400 mb-3">Quick Presets</label>
            <div className="grid grid-cols-2 gap-3">
              {getThemesByCategory('solid').map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => applyPreset(preset.id)}
                  className={`relative h-20 rounded-xl overflow-hidden transition-all ${
                    JSON.stringify(theme) === JSON.stringify(preset.theme)
                      ? 'ring-2 ring-purple-500/50 scale-105'
                      : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: preset.theme.backgroundColor }}
                >
                  {/* Bubble Preview */}
                  <div className="absolute bottom-2 right-2 flex gap-1">
                    <div 
                      className="w-5 h-7 rounded-lg opacity-90 shadow-md"
                      style={{ 
                        background: preset.theme.sentBubbleColor,
                        borderRadius: '10px',
                      }}
                    />
                    <div 
                      className="w-5 h-7 rounded-lg opacity-90 shadow-md"
                      style={{ 
                        background: preset.theme.receivedBubbleColor,
                        borderRadius: '10px',
                      }}
                    />
                  </div>
                  
                  {/* Preset Name - Top Left Corner */}
                  <div className="absolute top-1.5 left-1.5 right-1.5">
                    <p className="text-[9px] font-bold text-white/90 drop-shadow-lg leading-tight truncate">{preset.name}</p>
                  </div>
                  
                  {/* Active Indicator */}
                  {JSON.stringify(theme) === JSON.stringify(preset.theme) && (
                    <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center shadow-lg">
                      <FontAwesomeIcon icon={faCheck} className="text-white text-[10px]" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Color Picker */}
          <div className="space-y-3 pt-4 border-t border-zinc-800">
            <label className="block text-xs text-gray-400 font-medium">Custom Background Color</label>
              <ColorPicker
                color={theme.backgroundColor}
                onChange={(color) => handleThemeUpdate({ backgroundColor: color })}
                previewColor={theme.backgroundColor}
                label=""
              />
          </div>
        </div>
      )}

      {/* Gradient Background */}
      {theme.backgroundType === 'gradient' && (
        <div>
          <h3 className="text-sm font-bold text-white mb-4">Gradient Background Themes</h3>
          
            {/* Preset Gradients */}
          <div className="mb-6">
            <label className="block text-xs text-gray-400 mb-3">Quick Presets</label>
            <div className="grid grid-cols-2 gap-3">
              {getThemesByCategory('gradient').map((preset) => (
                  <button
                  key={preset.id}
                  onClick={() => applyPreset(preset.id)}
                  className={`relative h-20 rounded-xl overflow-hidden transition-all ${
                    JSON.stringify(theme) === JSON.stringify(preset.theme)
                        ? 'ring-2 ring-purple-500/50 scale-105'
                        : 'hover:scale-105'
                    }`}
                    style={{
                    background: `linear-gradient(135deg, ${preset.theme.backgroundColor} 0%, ${preset.theme.backgroundColor2 || preset.theme.backgroundColor} 100%)`,
                    }}
                  >
                    {/* Bubble Preview */}
                    <div className="absolute bottom-2 right-2 flex gap-1">
                      <div 
                      className="w-5 h-7 rounded-lg opacity-90 shadow-md"
                        style={{ 
                        background: preset.theme.sentBubbleGradient || preset.theme.sentBubbleColor,
                        borderRadius: '10px',
                        }}
                      />
                      <div 
                      className="w-5 h-7 rounded-lg opacity-90 shadow-md"
                        style={{ 
                        background: preset.theme.receivedBubbleGradient || preset.theme.receivedBubbleColor,
                        borderRadius: '10px',
                        }}
                      />
                    </div>
                  
                  {/* Preset Name - Top Left Corner */}
                  <div className="absolute top-1.5 left-1.5 right-1.5">
                    <p className="text-[9px] font-bold text-white/90 drop-shadow-lg leading-tight truncate">{preset.name}</p>
                  </div>
                  
                  {/* Active Indicator */}
                  {JSON.stringify(theme) === JSON.stringify(preset.theme) && (
                      <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center shadow-lg">
                      <FontAwesomeIcon icon={faCheck} className="text-white text-[10px]" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Custom Gradient Colors */}
          <div className="space-y-4 pt-4 border-t border-zinc-800">
            <label className="block text-xs text-gray-400 font-medium mb-3">Custom Gradient</label>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-2">Color 1</label>
                  <ColorPicker
                    color={theme.backgroundColor}
                    onChange={(color) => handleThemeUpdate({ backgroundColor: color })}
                    previewColor={theme.backgroundColor}
                    label=""
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-2">Color 2</label>
                  <ColorPicker
                    color={theme.backgroundColor2 || theme.backgroundColor}
                    onChange={(color) => handleThemeUpdate({ backgroundColor2: color })}
                    previewColor={theme.backgroundColor2 || theme.backgroundColor}
                    label=""
                  />
                </div>
                {/* Preview */}
                <div>
                  <label className="block text-xs text-gray-400 mb-2">Preview</label>
                  <div
                  className="h-20 rounded-xl border-2 border-zinc-700"
                    style={{
                      background: `linear-gradient(135deg, ${theme.backgroundColor} 0%, ${theme.backgroundColor2 || theme.backgroundColor} 100%)`,
                    }}
                  />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CSS Pattern Backgrounds */}
      {theme.backgroundType === 'pattern' && (
        <div>
          <h3 className="text-sm font-bold text-white mb-4">Pattern Background Themes</h3>
          <p className="text-xs text-gray-400 mb-3">Geometric patterns with coordinated bubble colors</p>
          <div className="grid grid-cols-3 gap-3">
            {getThemesByCategory('pattern').map((preset) => (
              <button
                key={preset.id}
                onClick={() => applyPreset(preset.id)}
                className={`relative h-20 rounded-xl overflow-hidden transition-all ${
                  JSON.stringify(theme) === JSON.stringify(preset.theme)
                    ? 'ring-2 ring-purple-500/50 scale-105'
                    : 'hover:scale-105'
                }`}
                style={{ backgroundColor: preset.theme.backgroundColor }}
              >
                {/* Bubble Preview */}
                <div className="absolute bottom-2 right-2 flex gap-1">
                  <div 
                    className="w-5 h-7 rounded-lg opacity-90 shadow-md"
                    style={{ 
                      background: preset.theme.sentBubbleColor,
                      borderRadius: '10px',
                    }}
                  />
                  <div 
                    className="w-5 h-7 rounded-lg opacity-90 shadow-md"
                    style={{ 
                      background: preset.theme.receivedBubbleColor,
                      borderRadius: '10px',
                    }}
                  />
                </div>
                
                {/* Preset Name - Top Left Corner */}
                <div className="absolute top-1.5 left-1.5 right-1.5">
                  <p className="text-[9px] font-bold text-white/90 drop-shadow-lg leading-tight truncate">{preset.name}</p>
                </div>
                
                {/* Active Indicator */}
                {JSON.stringify(theme) === JSON.stringify(preset.theme) && (
                  <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center shadow-lg">
                    <FontAwesomeIcon icon={faCheck} className="text-white text-[10px]" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Artistic Themes */}
      {theme.backgroundType === 'artistic' && (
        <div>
          <h3 className="text-sm font-bold text-white mb-4">Artistic Background Themes</h3>
          <p className="text-xs text-gray-400 mb-3">Dense repeating patterns inspired by Telegram</p>
          <div className="grid grid-cols-3 gap-3">
            {getThemesByCategory('artistic').map((preset) => (
                <button
                key={preset.id}
                onClick={() => applyPreset(preset.id)}
                className={`relative h-24 rounded-xl overflow-hidden transition-all ${
                  JSON.stringify(theme) === JSON.stringify(preset.theme)
                    ? 'ring-2 ring-purple-500/50 scale-105'
                    : 'hover:scale-105'
                }`}
                style={{ backgroundColor: preset.theme.backgroundColor }}
              >
                {/* Bubble Preview */}
                <div className="absolute bottom-2 right-2 flex gap-1">
                  <div 
                    className="w-6 h-8 rounded-lg opacity-90 shadow-md"
                    style={{ 
                      background: preset.theme.sentBubbleGradient || preset.theme.sentBubbleColor,
                      borderRadius: '12px',
                    }}
                  />
                  <div 
                    className="w-6 h-8 rounded-lg opacity-90 shadow-md"
                    style={{ 
                      background: preset.theme.receivedBubbleGradient || preset.theme.receivedBubbleColor,
                      borderRadius: '12px',
                    }}
                  />
                </div>
                
                {/* Preset Name - Top Left Corner */}
                <div className="absolute top-1.5 left-1.5 right-1.5">
                  <p className="text-[9px] font-bold text-white/90 drop-shadow-lg leading-tight truncate">{preset.name}</p>
                </div>
                
                {/* Active Indicator */}
                {JSON.stringify(theme) === JSON.stringify(preset.theme) && (
                  <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center shadow-lg">
                      <FontAwesomeIcon icon={faCheck} className="text-white text-[10px]" />
                    </div>
                  )}
                </button>
            ))}
          </div>
        </div>
      )}

      {/* Image Background */}
      {theme.backgroundType === 'image' && (
        <div>
          <h3 className="text-sm font-bold text-white mb-4">Custom Image Background</h3>
          <div className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full p-4 rounded-xl bg-zinc-800/50 hover:bg-zinc-800/70 border-2 border-dashed border-zinc-700 hover:border-purple-500/50 transition-all flex flex-col items-center gap-2"
            >
              <FontAwesomeIcon icon={faUpload} className="text-2xl text-gray-400" />
              <span className="text-sm text-gray-300 font-medium">Upload Image</span>
              <span className="text-xs text-gray-500">Click to select an image</span>
            </button>
            {theme.backgroundImage && (
              <div className="relative">
                <div
                  className="h-32 rounded-xl border-2 border-zinc-700 bg-cover bg-center"
                  style={{ backgroundImage: `url(${theme.backgroundImage})` }}
                />
                <button
                  onClick={() => handleThemeUpdate({ backgroundImage: undefined })}
                  className="absolute top-2 right-2 p-2 rounded-full bg-red-500/80 hover:bg-red-500 text-white"
                >
                  <FontAwesomeIcon icon={faTimes} className="text-xs" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bubble Colors & Gradients */}
      <div>
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <FontAwesomeIcon icon={faPalette} className="text-cyan-400" />
          Message Bubble Colors
        </h3>
        <div className="space-y-6">
          {/* Sent Bubble */}
          <div className="space-y-3">
            <label className="block text-xs text-gray-400 font-medium">Sent Messages</label>
            
            {/* Gradient Toggle */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleThemeUpdate({ sentBubbleGradient: undefined })}
                className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  !theme.sentBubbleGradient
                    ? 'bg-cyan-500/20 text-cyan-400 ring-2 ring-cyan-500/50'
                    : 'bg-zinc-800/50 text-gray-400 hover:bg-zinc-800/70'
                }`}
              >
                Solid
              </button>
              <button
                onClick={() => {
                  if (!theme.sentBubbleGradient) {
                    handleThemeUpdate({ 
                      sentBubbleGradient: `linear-gradient(135deg, ${theme.sentBubbleColor} 0%, ${adjustColor(theme.sentBubbleColor, -20)} 100%)`
                    });
                  }
                }}
                className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  theme.sentBubbleGradient
                    ? 'bg-cyan-500/20 text-cyan-400 ring-2 ring-cyan-500/50'
                    : 'bg-zinc-800/50 text-gray-400 hover:bg-zinc-800/70'
                }`}
              >
                Gradient
              </button>
            </div>
            
            <ColorPicker
              color={theme.sentBubbleColor}
              onChange={(color) => {
                const updates: Partial<ChatTheme> = { sentBubbleColor: color };
                // Update gradient if enabled
                if (theme.sentBubbleGradient) {
                  updates.sentBubbleGradient = `linear-gradient(135deg, ${color} 0%, ${adjustColor(color, -20)} 100%)`;
                }
                handleThemeUpdate(updates);
              }}
              previewColor={theme.sentBubbleColor}
              label=""
            />
            
            {/* Preview */}
            <div className="h-12 rounded-xl border-2 border-zinc-700 flex items-center justify-center">
              <div 
                className="w-32 h-8 rounded-xl shadow-lg"
                style={{ 
                  background: theme.sentBubbleGradient || theme.sentBubbleColor,
                }}
              />
            </div>
          </div>

          {/* Received Bubble */}
          <div className="space-y-3">
            <label className="block text-xs text-gray-400 font-medium">Received Messages</label>
            
            {/* Gradient Toggle */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleThemeUpdate({ receivedBubbleGradient: undefined })}
                className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  !theme.receivedBubbleGradient
                    ? 'bg-cyan-500/20 text-cyan-400 ring-2 ring-cyan-500/50'
                    : 'bg-zinc-800/50 text-gray-400 hover:bg-zinc-800/70'
                }`}
              >
                Solid
              </button>
              <button
                onClick={() => {
                  if (!theme.receivedBubbleGradient) {
                    handleThemeUpdate({ 
                      receivedBubbleGradient: `linear-gradient(135deg, ${theme.receivedBubbleColor} 0%, ${adjustColor(theme.receivedBubbleColor, -15)} 100%)`
                    });
                  }
                }}
                className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  theme.receivedBubbleGradient
                    ? 'bg-cyan-500/20 text-cyan-400 ring-2 ring-cyan-500/50'
                    : 'bg-zinc-800/50 text-gray-400 hover:bg-zinc-800/70'
                }`}
              >
                Gradient
              </button>
            </div>
            
            <ColorPicker
              color={theme.receivedBubbleColor}
              onChange={(color) => {
                const updates: Partial<ChatTheme> = { receivedBubbleColor: color };
                // Update gradient if enabled
                if (theme.receivedBubbleGradient) {
                  updates.receivedBubbleGradient = `linear-gradient(135deg, ${color} 0%, ${adjustColor(color, -15)} 100%)`;
                }
                handleThemeUpdate(updates);
              }}
              previewColor={theme.receivedBubbleColor}
              label=""
            />
            
            {/* Preview */}
            <div className="h-12 rounded-xl border-2 border-zinc-700 flex items-center justify-center">
              <div 
                className="w-32 h-8 rounded-xl shadow-lg"
                style={{ 
                  background: theme.receivedBubbleGradient || theme.receivedBubbleColor,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bubble Shape */}
      <div>
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <FontAwesomeIcon icon={faShapes} className="text-pink-400" />
          Bubble Shape
        </h3>
        <div className="space-y-4">
          {/* Presets - FIXED: Changed grid-cols-5 to grid-cols-3 with flex-wrap for better layout */}
          <div className="grid grid-cols-3 gap-3">
            {bubbleShapePresets.map((preset) => (
              <button
                key={preset.value}
                onClick={() => {
                  const updates: Partial<ChatTheme> = { bubbleShapePreset: preset.value };
                  if (preset.value !== 'custom') {
                    updates.bubbleBorderRadius = preset.radius;
                  }
                  handleThemeUpdate(updates);
                }}
                className={`p-3 rounded-xl transition-all flex flex-col items-center ${
                  theme.bubbleShapePreset === preset.value
                    ? 'bg-pink-500/20 ring-2 ring-pink-500/50'
                    : 'bg-zinc-800/50 hover:bg-zinc-800/70'
                }`}
              >
                <div
                  className="w-full h-12 bg-cyan-500/30 mb-2 rounded-lg"
                  style={{ borderRadius: preset.value === 'custom' ? theme.bubbleBorderRadius : preset.radius }}
                />
                <span className="text-xs text-gray-300 font-medium text-center">{preset.label}</span>
              </button>
            ))}
          </div>
          {/* Border Radius Slider (when custom) */}
          {theme.bubbleShapePreset === 'custom' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs text-gray-400">Border Radius</label>
                <span className="text-xs text-cyan-400 font-bold">{theme.bubbleBorderRadius}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="24"
                value={theme.bubbleBorderRadius}
                onChange={(e) => handleThemeUpdate({ bubbleBorderRadius: Number(e.target.value) })}
                className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
            </div>
          )}
        </div>
      </div>

      {/* Accent Color - FIXED: Better layout */}
      <div>
        <h3 className="text-sm font-bold text-white mb-4">Accent Color</h3>
        <p className="text-xs text-gray-400 mb-3">Affects UI highlights and accents throughout the chat</p>
        <div className="grid grid-cols-4 gap-2">
          {accentColors.map((accent) => (
            <button
              key={accent.value}
              onClick={() => handleThemeUpdate({ accentColor: accent.value })}
              className={`p-3 rounded-xl transition-all flex flex-col items-center gap-2 ${
                theme.accentColor === accent.value
                  ? 'ring-2 ring-white/30 bg-zinc-800/70'
                  : 'bg-zinc-800/50 hover:bg-zinc-800/70'
              }`}
            >
              <div
                className="w-full h-10 rounded-lg shadow-lg"
                style={{ backgroundColor: accent.color }}
              />
              <span className="text-xs text-gray-300 font-medium">{accent.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Font Size */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white">Font Size</h3>
          <span className="text-xs text-cyan-400 font-bold">{fontSize}px</span>
        </div>
        <input
          type="range"
          min="12"
          max="20"
          step="1"
          value={fontSize}
          onChange={(e) => setFontSize(Number(e.target.value))}
          className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
        />
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>Small</span>
          <span>Medium</span>
          <span>Large</span>
        </div>
      </div>

      {/* Message Density - FIXED: Better button layout to prevent text overflow */}
      <div>
        <h3 className="text-sm font-bold text-white mb-4">Message Density</h3>
        <div className="grid grid-cols-3 gap-3">
          {(['compact', 'comfortable', 'spacious'] as const).map((density) => (
            <button
              key={density}
              onClick={() => setMessageDensity(density)}
              className={`px-4 py-3 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
                messageDensity === density
                  ? 'bg-green-500/20 text-green-400 ring-2 ring-green-500/50'
                  : 'bg-zinc-800/50 text-gray-400 hover:bg-zinc-800/70 hover:text-white'
              }`}
              title={density.charAt(0).toUpperCase() + density.slice(1)}
            >
              {density === 'comfortable' ? 'Comfy' : density.charAt(0).toUpperCase() + density.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Reset Button */}
      <div className="pt-4 border-t border-zinc-800">
        <button
          onClick={handleReset}
          className="w-full px-5 py-4 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 font-medium transition-colors flex items-center justify-center gap-2"
        >
          <FontAwesomeIcon icon={faTrash} />
          Reset to Defaults
        </button>
      </div>
    </div>
  );
}
