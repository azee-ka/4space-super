// Toggle Switch Component
import { memo } from 'react';
import { motion } from 'framer-motion';
import { getAccentColorHex } from '../../utils/themeUtils';

interface ToggleSwitchProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  accentColor?: string; // accent color name (e.g., 'purple', 'cyan')
}

export const ToggleSwitch = memo(({ enabled, onToggle, size = 'md', disabled = false, accentColor }: ToggleSwitchProps) => {
  const sizes = {
    sm: {
      container: 'w-8 h-4',
      circle: 'w-3 h-3',
      onX: 16, // Position when enabled (right side)
      offX: 2, // Position when disabled (left side, accounting for padding)
    },
    md: {
      container: 'w-11 h-6',
      circle: 'w-5 h-5',
      onX: 20, // Position when enabled (right side)
      offX: 2, // Position when disabled (left side, accounting for padding)
    },
    lg: {
      container: 'w-14 h-7',
      circle: 'w-6 h-6',
      onX: 28, // Position when enabled (right side)
      offX: 2, // Position when disabled (left side, accounting for padding)
    },
  };

  const sizeConfig = sizes[size];
  const accentHex = accentColor ? getAccentColorHex(accentColor) : '#a855f7'; // Default purple

  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      disabled={disabled}
      onClick={() => !disabled && onToggle(!enabled)}
      className={`${sizeConfig.container} rounded-full p-0.5 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:ring-offset-2 focus:ring-offset-zinc-900 ${
        disabled
          ? 'opacity-50 cursor-not-allowed bg-zinc-700'
          : enabled
          ? 'transition-colors duration-200'
          : 'bg-zinc-700'
      }`}
      style={enabled && !disabled ? { backgroundColor: accentHex } : undefined}
    >
      <motion.div
        className={`${sizeConfig.circle} rounded-full bg-white shadow-lg`}
        animate={{ x: enabled ? sizeConfig.onX : sizeConfig.offX }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </button>
  );
});

ToggleSwitch.displayName = 'ToggleSwitch';
