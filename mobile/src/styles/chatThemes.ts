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
  sentTimestampColor?: string;
  receivedTimestampColor?: string;
  bubbleRadius: number;
  density: Density;
  bubbleStyle?: 'solid' | 'gradient';
  sentBubbleGradient?: [string, string];
  receivedBubbleGradient?: [string, string];
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
  {
    id: 'tech-grid',
    name: 'Tech Grid',
    description: 'Magenta + cyan pulses on deep black',
    backgroundColor: '#05050a',
    sentBubbleColor: '#ec4899',
    receivedBubbleColor: '#06b6d4',
    sentTextColor: '#ffffff',
    receivedTextColor: '#ecfeff',
    bubbleRadius: 18,
    density: 'cozy',
  },
  {
    id: 'neon-pulse',
    name: 'Neon Pulse',
    description: 'Hyper neon with electric violet',
    backgroundColor: '#040409',
    sentBubbleColor: '#a855f7',
    receivedBubbleColor: '#1e1b4b',
    sentTextColor: '#fdf4ff',
    receivedTextColor: '#e0e7ff',
    bubbleRadius: 20,
    density: 'cozy',
  },
  {
    id: 'equation-board',
    name: 'Equation Board',
    description: 'Green meets amber for nerdy focus',
    backgroundColor: '#040607',
    sentBubbleColor: '#22c55e',
    receivedBubbleColor: '#f97316',
    sentTextColor: '#052e16',
    receivedTextColor: '#fff7ed',
    bubbleRadius: 16,
    density: 'cozy',
  },
  {
    id: 'productivity-boost',
    name: 'Productivity Boost',
    description: 'Emerald focus with slate calm',
    backgroundColor: '#03060a',
    sentBubbleColor: '#16a34a',
    receivedBubbleColor: '#0f172a',
    sentTextColor: '#f0fdf4',
    receivedTextColor: '#e2e8f0',
    bubbleRadius: 18,
    density: 'cozy',
  },
  {
    id: 'sport-flash',
    name: 'Sport Flash',
    description: 'Red energy with green contrast',
    backgroundColor: '#050607',
    sentBubbleColor: '#ef4444',
    receivedBubbleColor: '#22c55e',
    sentTextColor: '#fef2f2',
    receivedTextColor: '#dcfce7',
    bubbleRadius: 16,
    density: 'spacious',
  },
  {
    id: 'food-court',
    name: 'Food Court',
    description: 'Warm reds and tangy oranges',
    backgroundColor: '#060506',
    sentBubbleColor: '#ef4444',
    receivedBubbleColor: '#f97316',
    sentTextColor: '#fff1f2',
    receivedTextColor: '#fff7ed',
    bubbleRadius: 16,
    density: 'cozy',
  },
  {
    id: 'topography',
    name: 'Topography',
    description: 'Cool blues with layered depth',
    backgroundColor: '#02070f',
    sentBubbleColor: '#38bdf8',
    receivedBubbleColor: '#1e293b',
    sentTextColor: '#0f172a',
    receivedTextColor: '#e2e8f0',
    bubbleRadius: 18,
    density: 'cozy',
  },
  {
    id: 'data-stream',
    name: 'Data Stream',
    description: 'Cyan + amber telemetry',
    backgroundColor: '#02060c',
    sentBubbleColor: '#22d3ee',
    receivedBubbleColor: '#f59e0b',
    sentTextColor: '#0f172a',
    receivedTextColor: '#1c1917',
    bubbleRadius: 14,
    density: 'compact',
  },
];

export const DEFAULT_CHAT_THEME = CHAT_THEME_PRESETS[0];

export const getChatThemeById = (id?: string) => {
  if (!id) return DEFAULT_CHAT_THEME;
  const found = CHAT_THEME_PRESETS.find((preset) => preset.id === id);
  return found || DEFAULT_CHAT_THEME;
};
