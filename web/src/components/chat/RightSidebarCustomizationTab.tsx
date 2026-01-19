// Comprehensive Customization Tab Component - For General Chat
// Adapted from spaces/chat/rightPanel/CustomizationTab.tsx

import { useRef, useCallback, memo, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPalette, faTrash, faUpload, faTimes, faImages,
  faShapes, faSlidersH, faCheck, faStar, faCircle,
  faRobot, faClock, faSync, faBolt, faEye, faVolumeUp,
  faShare, faDownload, faMagic, faSun, faMoon, faCloud,
  faZap, faWandMagicSparkles, faBrain, faRocket
} from '@fortawesome/free-solid-svg-icons';
import { useChatSettingsStore, type BackgroundType, type BubbleShapePreset, type ChatTheme } from '../../store/chatSettingsStore';
import { themePresets, getThemesByCategory } from '../../utils/themePresets';
import { ColorPicker } from '../ui/ColorPicker';
import { getAccentColorHex } from '../../utils/themeUtils';

// Toggle Switch Component with smooth animation and accent color support
const ToggleSwitch = memo(({ enabled, onToggle, accentColor }: { enabled: boolean; onToggle: (value: boolean) => void; accentColor?: string }) => {
  const accentHex = accentColor ? getAccentColorHex(accentColor) : '#a855f7'; // Default purple

  return (
    <motion.button
      onClick={() => onToggle(!enabled)}
      className={`w-12 h-6 rounded-full transition-colors flex items-center ${
        enabled ? 'transition-colors duration-200' : 'bg-zinc-700'
      }`}
      style={enabled ? { backgroundColor: accentHex } : undefined}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        className="w-5 h-5 rounded-full bg-white"
        animate={{ x: enabled ? 24 : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </motion.button>
  );
});

const GradientStopSwatch = ({
  label,
  color,
  onChange,
  disabled = false,
}: {
  label: string;
  color: string;
  onChange: (color: string) => void;
  disabled?: boolean;
}) => (
  <div className="flex items-center gap-3">
    <span className="text-xs text-gray-400 min-w-12">{label}</span>
    <div
      className={`w-8 h-8 rounded-lg border-2 border-zinc-600 cursor-pointer transition-all ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-zinc-400'
      }`}
      style={{ backgroundColor: color }}
      onClick={() => !disabled && onChange(color)}
    />
  </div>
);

interface RightSidebarCustomizationTabProps {
  theme: ChatTheme;
  onThemeChange: (theme: ChatTheme, roomId?: string, category?: string) => void;
}

export function RightSidebarCustomizationTab({ theme, onThemeChange }: RightSidebarCustomizationTabProps) {
  console.log('RightSidebarCustomizationTab rendering');

  const {
    backgroundType,
    backgroundColor,
    backgroundImage,
    backgroundGradient,
    bubbleShapePreset,
    customBubbleShape,
    accentColor,
    messageDensity,
    animationSettings,
    soundSettings,
    notificationSettings,
    setBackgroundType,
    setBackgroundColor,
    setBackgroundImage,
    setBackgroundGradient,
    setBubbleShapePreset,
    setCustomBubbleShape,
    setAccentColor,
    setMessageDensity,
    setAnimationSettings,
    setSoundSettings,
    setNotificationSettings,
  } = useChatSettingsStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [previewTheme, setPreviewTheme] = useState<ChatTheme | null>(null);

  const currentTheme = previewTheme || theme;

  const handleThemeApply = useCallback((newTheme: ChatTheme) => {
    onThemeChange(newTheme);
    setPreviewTheme(null);
  }, [onThemeChange]);

  const handleThemePreview = useCallback((newTheme: ChatTheme) => {
    setPreviewTheme(newTheme);
  }, []);

  const handleBackgroundUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setBackgroundImage(result);
        setBackgroundType('image');
      };
      reader.readAsDataURL(file);
    }
  }, [setBackgroundImage, setBackgroundType]);

  const categories = [
    { id: 'all', label: 'All Themes', icon: faPalette },
    { id: 'dark', label: 'Dark', icon: faMoon },
    { id: 'light', label: 'Light', icon: faSun },
    { id: 'colorful', label: 'Colorful', icon: faZap },
    { id: 'minimal', label: 'Minimal', icon: faCircle },
  ];

  const filteredThemes = selectedCategory === 'all'
    ? themePresets
    : getThemesByCategory(selectedCategory);

  return (
    <div className="p-4 space-y-6 max-h-full overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
          <FontAwesomeIcon icon={faPalette} className="text-purple-400" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">Customization</h2>
          <p className="text-sm text-gray-400">Personalize your chat experience</p>
        </div>
      </div>

      {/* Theme Categories */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <FontAwesomeIcon icon={faShapes} className="text-purple-400" />
          Theme Categories
        </h3>
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {categories.map((category) => (
            <motion.button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium transition-all ${
                selectedCategory === category.id
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  : 'bg-zinc-800/50 text-gray-400 hover:text-white hover:bg-zinc-700/50'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FontAwesomeIcon icon={category.icon} className="text-xs" />
              {category.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Theme Grid */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <FontAwesomeIcon icon={faMagic} className="text-blue-400" />
          Available Themes
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {filteredThemes.map((themePreset) => (
            <motion.div
              key={themePreset.id}
              className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                currentTheme.id === themePreset.id
                  ? 'border-purple-500/50 bg-purple-500/10'
                  : 'border-zinc-700/50 bg-zinc-800/50 hover:border-zinc-600/50'
              }`}
              onClick={() => handleThemePreview(themePreset)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-white">{themePreset.name}</span>
                {currentTheme.id === themePreset.id && (
                  <FontAwesomeIcon icon={faCheck} className="text-purple-400 text-xs" />
                )}
              </div>
              <div className="flex gap-1">
                <div
                  className="w-4 h-4 rounded-full border border-zinc-600"
                  style={{ backgroundColor: themePreset.accentColor }}
                />
                <div
                  className="w-4 h-4 rounded-full border border-zinc-600"
                  style={{ backgroundColor: themePreset.backgroundColor }}
                />
                <div
                  className="w-4 h-4 rounded-full border border-zinc-600"
                  style={{ backgroundColor: themePreset.surfaceColor }}
                />
              </div>
            </motion.div>
          ))}
        </div>
        {previewTheme && (
          <div className="flex gap-2">
            <motion.button
              onClick={() => handleThemeApply(previewTheme)}
              className="flex-1 px-4 py-2 bg-purple-500/20 text-purple-300 rounded-xl hover:bg-purple-500/30 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Apply Theme
            </motion.button>
            <motion.button
              onClick={() => setPreviewTheme(null)}
              className="px-4 py-2 bg-zinc-700/50 text-gray-400 rounded-xl hover:bg-zinc-600/50 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Cancel
            </motion.button>
          </div>
        )}
      </div>

      {/* Background Settings */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <FontAwesomeIcon icon={faImages} className="text-green-400" />
          Background
        </h3>

        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'solid', label: 'Solid', icon: faCircle },
            { id: 'gradient', label: 'Gradient', icon: faZap },
            { id: 'image', label: 'Image', icon: faImages },
          ].map((type) => (
            <motion.button
              key={type.id}
              onClick={() => setBackgroundType(type.id as BackgroundType)}
              className={`p-3 rounded-xl border-2 transition-all ${
                backgroundType === type.id
                  ? 'border-green-500/50 bg-green-500/10'
                  : 'border-zinc-700/50 bg-zinc-800/50 hover:border-zinc-600/50'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FontAwesomeIcon icon={type.icon} className="text-white mb-1" />
              <div className="text-xs text-gray-300">{type.label}</div>
            </motion.button>
          ))}
        </div>

        {backgroundType === 'solid' && (
          <div className="space-y-2">
            <label className="text-sm text-gray-400">Background Color</label>
            <ColorPicker
              color={backgroundColor}
              onChange={setBackgroundColor}
              className="w-full"
            />
          </div>
        )}

        {backgroundType === 'gradient' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <GradientStopSwatch
                label="Start"
                color={backgroundGradient.start}
                onChange={(color) => setBackgroundGradient({ ...backgroundGradient, start: color })}
              />
              <GradientStopSwatch
                label="End"
                color={backgroundGradient.end}
                onChange={(color) => setBackgroundGradient({ ...backgroundGradient, end: color })}
              />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-400">Direction</span>
              <select
                value={backgroundGradient.direction}
                onChange={(e) => setBackgroundGradient({ ...backgroundGradient, direction: e.target.value as any })}
                className="px-3 py-2 bg-zinc-800/50 border border-zinc-600/50 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              >
                <option value="to bottom">Vertical</option>
                <option value="to right">Horizontal</option>
                <option value="45deg">Diagonal</option>
              </select>
            </div>
          </div>
        )}

        {backgroundType === 'image' && (
          <div className="space-y-3">
            <motion.button
              onClick={() => fileInputRef.current?.click()}
              className="w-full p-4 border-2 border-dashed border-zinc-600/50 rounded-xl hover:border-zinc-500/50 transition-colors"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <FontAwesomeIcon icon={faUpload} className="text-gray-400 mb-2" />
              <div className="text-sm text-gray-400">Upload Background Image</div>
            </motion.button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleBackgroundUpload}
              className="hidden"
            />
            {backgroundImage && (
              <div className="relative">
                <img
                  src={backgroundImage}
                  alt="Background preview"
                  className="w-full h-24 object-cover rounded-lg"
                />
                <motion.button
                  onClick={() => setBackgroundImage('')}
                  className="absolute top-2 right-2 w-6 h-6 bg-red-500/80 rounded-full flex items-center justify-center"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <FontAwesomeIcon icon={faTimes} className="text-white text-xs" />
                </motion.button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Message Bubble Settings */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <FontAwesomeIcon icon={faShapes} className="text-pink-400" />
          Message Bubbles
        </h3>

        <div className="space-y-3">
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Bubble Shape</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'rounded', label: 'Rounded', preview: 'rounded-xl' },
                { id: 'square', label: 'Square', preview: 'rounded-lg' },
                { id: 'pill', label: 'Pill', preview: 'rounded-full' },
              ].map((shape) => (
                <motion.button
                  key={shape.id}
                  onClick={() => setBubbleShapePreset(shape.id as BubbleShapePreset)}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    bubbleShapePreset === shape.id
                      ? 'border-pink-500/50 bg-pink-500/10'
                      : 'border-zinc-700/50 bg-zinc-800/50 hover:border-zinc-600/50'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className={`w-full h-8 bg-purple-500/30 ${shape.preview} mb-1`} />
                  <div className="text-xs text-gray-300">{shape.label}</div>
                </motion.button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-2 block">Accent Color</label>
            <ColorPicker
              color={accentColor}
              onChange={setAccentColor}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Animation & Effects */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <FontAwesomeIcon icon={faBolt} className="text-yellow-400" />
          Animations & Effects
        </h3>

        <div className="space-y-3">
          {[
            {
              key: 'messageAnimations',
              label: 'Message Animations',
              description: 'Smooth entrance animations for messages',
              enabled: animationSettings.messageAnimations,
              setter: (value: boolean) => setAnimationSettings({ ...animationSettings, messageAnimations: value }),
            },
            {
              key: 'typingIndicators',
              label: 'Typing Indicators',
              description: 'Show typing animations',
              enabled: animationSettings.typingIndicators,
              setter: (value: boolean) => setAnimationSettings({ ...animationSettings, typingIndicators: value }),
            },
            {
              key: 'emojiReactions',
              label: 'Emoji Reactions',
              description: 'Animated emoji reactions',
              enabled: animationSettings.emojiReactions,
              setter: (value: boolean) => setAnimationSettings({ ...animationSettings, emojiReactions: value }),
            },
          ].map((setting) => (
            <div key={setting.key} className="flex items-center justify-between p-3 rounded-xl bg-zinc-800/50">
              <div className="flex-1">
                <div className="text-sm font-medium text-white">{setting.label}</div>
                <div className="text-xs text-gray-400">{setting.description}</div>
              </div>
              <ToggleSwitch
                enabled={setting.enabled}
                onToggle={setting.setter}
                accentColor={accentColor}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Sound Settings */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <FontAwesomeIcon icon={faVolumeUp} className="text-blue-400" />
          Sound Effects
        </h3>

        <div className="space-y-3">
          {[
            {
              key: 'messageSounds',
              label: 'Message Sounds',
              description: 'Play sound when receiving messages',
              enabled: soundSettings.messageSounds,
              setter: (value: boolean) => setSoundSettings({ ...soundSettings, messageSounds: value }),
            },
            {
              key: 'notificationSounds',
              label: 'Notification Sounds',
              description: 'Alert sounds for mentions and replies',
              enabled: soundSettings.notificationSounds,
              setter: (value: boolean) => setSoundSettings({ ...soundSettings, notificationSounds: value }),
            },
            {
              key: 'typingSounds',
              label: 'Typing Sounds',
              description: 'Subtle sounds while typing',
              enabled: soundSettings.typingSounds,
              setter: (value: boolean) => setSoundSettings({ ...soundSettings, typingSounds: value }),
            },
          ].map((setting) => (
            <div key={setting.key} className="flex items-center justify-between p-3 rounded-xl bg-zinc-800/50">
              <div className="flex-1">
                <div className="text-sm font-medium text-white">{setting.label}</div>
                <div className="text-xs text-gray-400">{setting.description}</div>
              </div>
              <ToggleSwitch
                enabled={setting.enabled}
                onToggle={setting.setter}
                accentColor={accentColor}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Advanced Settings */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <FontAwesomeIcon icon={faSlidersH} className="text-orange-400" />
          Advanced
        </h3>

        <div className="space-y-3">
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Message Density</label>
            <select
              value={messageDensity}
              onChange={(e) => setMessageDensity(e.target.value as any)}
              className="w-full px-3 py-2 bg-zinc-800/50 border border-zinc-600/50 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            >
              <option value="comfortable">Comfortable</option>
              <option value="compact">Compact</option>
              <option value="cozy">Cozy</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}