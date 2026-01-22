export type Density = 'compact' | 'cozy' | 'spacious';

export interface ChatThemePreset {
  id: string;
  name: string;
  description: string;
  backgroundColor: string;
  sentBubbleColor: string;
  receivedBubbleColor: string;
  sentTextColor: string;
  receivedTextColor: string;
  bubbleRadius: number;
  density: Density;
}

export const CHAT_THEME_PRESETS: ChatThemePreset[] = [
  {
    id: 'midnight-drive',
    name: 'Midnight Drive',
    description: 'Deep indigo background + neon magenta bubbles',
    backgroundColor: '#020617',
    sentBubbleColor: '#ec4899',
    receivedBubbleColor: '#111827',
    sentTextColor: '#fdf3ff',
    receivedTextColor: '#d1d5db',
    bubbleRadius: 20,
    density: 'cozy',
  },
  {
    id: 'aurora-forest',
    name: 'Aurora Forest',
    description: 'Cyan glow with emerald accents',
    backgroundColor: '#03131e',
    sentBubbleColor: '#22d3ee',
    receivedBubbleColor: '#0f172a',
    sentTextColor: '#0f172a',
    receivedTextColor: '#e0f2fe',
    bubbleRadius: 18,
    density: 'cozy',
  },
  {
    id: 'copper-slate',
    name: 'Copper Slate',
    description: 'Slate blues with warm copper suggestions',
    backgroundColor: '#030711',
    sentBubbleColor: '#c2410c',
    receivedBubbleColor: '#1e293b',
    sentTextColor: '#fff7ed',
    receivedTextColor: '#cbd5f5',
    bubbleRadius: 14,
    density: 'spacious',
  },
  {
    id: 'console-grid',
    name: 'Console Grid',
    description: 'High contrast retro console look',
    backgroundColor: '#010a0f',
    sentBubbleColor: '#10b981',
    receivedBubbleColor: '#111927',
    sentTextColor: '#ecfccb',
    receivedTextColor: '#e2e8f0',
    bubbleRadius: 12,
    density: 'compact',
  },
];

export const DEFAULT_CHAT_THEME = CHAT_THEME_PRESETS[0];

export const getChatThemeById = (id?: string) => {
  if (!id) return DEFAULT_CHAT_THEME;
  const found = CHAT_THEME_PRESETS.find((preset) => preset.id === id);
  return found || DEFAULT_CHAT_THEME;
};
