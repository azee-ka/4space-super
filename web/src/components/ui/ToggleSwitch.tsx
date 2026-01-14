// Toggle Switch Component
import { memo } from 'react';
import { motion } from 'framer-motion';

interface ToggleSwitchProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

export const ToggleSwitch = memo(({ enabled, onToggle, size = 'md', disabled = false }: ToggleSwitchProps) => {
  const sizes = {
    sm: {
      container: 'w-8 h-4',
      circle: 'w-3 h-3',
      translate: 'translate-x-4',
    },
    md: {
      container: 'w-11 h-6',
      circle: 'w-5 h-5',
      translate: 'translate-x-5',
    },
    lg: {
      container: 'w-14 h-7',
      circle: 'w-6 h-6',
      translate: 'translate-x-7',
    },
  };

  const sizeConfig = sizes[size];

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
          ? 'bg-purple-600'
          : 'bg-zinc-700'
      }`}
    >
      <motion.div
        layout
        transition={{
          type: 'spring',
          stiffness: 500,
          damping: 30,
        }}
        className={`${sizeConfig.circle} rounded-full bg-white shadow-lg ${
          enabled ? sizeConfig.translate : 'translate-x-0'
        }`}
      />
    </button>
  );
});

ToggleSwitch.displayName = 'ToggleSwitch';
