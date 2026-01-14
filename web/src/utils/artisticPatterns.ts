// Artistic, non-repetitive background patterns with preset bubble colors
// These patterns use complex gradients, shapes, and colors to create unique, aesthetic backgrounds

export interface ArtisticPattern {
  name: string;
  css: string;
  sentBubbleColor: string;
  receivedBubbleColor: string;
  sentTextColor: string;
  receivedTextColor: string;
}

export const artisticPatterns: ArtisticPattern[] = [
  {
    name: 'Cosmic Nebula',
    css: `background: radial-gradient(circle at 20% 30%, rgba(138, 43, 226, 0.3) 0%, transparent 40%), radial-gradient(circle at 80% 70%, rgba(30, 144, 255, 0.3) 0%, transparent 40%), radial-gradient(circle at 40% 80%, rgba(255, 20, 147, 0.2) 0%, transparent 35%), radial-gradient(circle at 60% 20%, rgba(0, 255, 255, 0.2) 0%, transparent 35%), radial-gradient(ellipse at 50% 50%, rgba(75, 0, 130, 0.4) 0%, transparent 60%), linear-gradient(135deg, #0a0a1a 0%, #1a0a2e 50%, #0a1a1a 100%); background-size: cover; background-attachment: fixed;`,
    sentBubbleColor: '#8b5cf6',
    receivedBubbleColor: '#1e1b4b',
    sentTextColor: '#f3e8ff',
    receivedTextColor: '#e0e7ff'
  },
  {
    name: 'Aurora Dreams',
    css: `background: radial-gradient(ellipse at 30% 20%, rgba(0, 255, 200, 0.2) 0%, transparent 50%), radial-gradient(ellipse at 70% 40%, rgba(138, 43, 226, 0.2) 0%, transparent 50%), radial-gradient(ellipse at 20% 70%, rgba(255, 105, 180, 0.15) 0%, transparent 45%), radial-gradient(ellipse at 80% 80%, rgba(30, 144, 255, 0.15) 0%, transparent 45%), radial-gradient(circle at 50% 50%, rgba(0, 128, 128, 0.1) 0%, transparent 70%), linear-gradient(180deg, #0a1628 0%, #0f1419 50%, #0a1a1a 100%); background-size: cover; background-attachment: fixed;`,
    sentBubbleColor: '#06b6d4',
    receivedBubbleColor: '#0f172a',
    sentTextColor: '#cffafe',
    receivedTextColor: '#cbd5e1'
  },
  {
    name: 'Deep Ocean',
    css: `background: radial-gradient(circle at 15% 25%, rgba(0, 191, 255, 0.25) 0%, transparent 45%), radial-gradient(circle at 85% 65%, rgba(0, 105, 148, 0.25) 0%, transparent 45%), radial-gradient(circle at 45% 85%, rgba(32, 178, 170, 0.2) 0%, transparent 40%), radial-gradient(circle at 60% 15%, rgba(72, 209, 204, 0.15) 0%, transparent 35%), radial-gradient(ellipse at 50% 100%, rgba(0, 128, 128, 0.3) 0%, transparent 50%), linear-gradient(180deg, #020d1a 0%, #04192e 50%, #021a28 100%); background-size: cover; background-attachment: fixed;`,
    sentBubbleColor: '#3b82f6',
    receivedBubbleColor: '#1e293b',
    sentTextColor: '#dbeafe',
    receivedTextColor: '#cbd5e1'
  },
  {
    name: 'Violet Sunset',
    css: `background: radial-gradient(ellipse at 50% 10%, rgba(255, 140, 0, 0.3) 0%, transparent 40%), radial-gradient(circle at 30% 40%, rgba(186, 85, 211, 0.25) 0%, transparent 45%), radial-gradient(circle at 70% 60%, rgba(138, 43, 226, 0.25) 0%, transparent 45%), radial-gradient(ellipse at 50% 90%, rgba(75, 0, 130, 0.3) 0%, transparent 50%), linear-gradient(180deg, #1a0a0f 0%, #2d1b3d 40%, #1a0a1e 100%); background-size: cover; background-attachment: fixed;`,
    sentBubbleColor: '#a855f7',
    receivedBubbleColor: '#2d1b4e',
    sentTextColor: '#f3e8ff',
    receivedTextColor: '#e9d5ff'
  },
  {
    name: 'Emerald Forest',
    css: `background: radial-gradient(circle at 25% 30%, rgba(34, 139, 34, 0.2) 0%, transparent 40%), radial-gradient(circle at 75% 60%, rgba(0, 128, 0, 0.2) 0%, transparent 40%), radial-gradient(circle at 50% 80%, rgba(0, 255, 127, 0.15) 0%, transparent 35%), radial-gradient(ellipse at 40% 20%, rgba(46, 125, 50, 0.2) 0%, transparent 45%), radial-gradient(ellipse at 60% 90%, rgba(27, 94, 32, 0.25) 0%, transparent 50%), linear-gradient(135deg, #051a0a 0%, #0a1e0f 50%, #0a1a14 100%); background-size: cover; background-attachment: fixed;`,
    sentBubbleColor: '#059669',
    receivedBubbleColor: '#1f2937',
    sentTextColor: '#d1fae5',
    receivedTextColor: '#d1d5db'
  },
  {
    name: 'Crimson Night',
    css: `background: radial-gradient(circle at 30% 25%, rgba(220, 20, 60, 0.25) 0%, transparent 45%), radial-gradient(circle at 70% 55%, rgba(178, 34, 34, 0.2) 0%, transparent 40%), radial-gradient(circle at 20% 75%, rgba(255, 69, 0, 0.15) 0%, transparent 35%), radial-gradient(ellipse at 80% 30%, rgba(139, 0, 0, 0.2) 0%, transparent 45%), radial-gradient(ellipse at 50% 85%, rgba(128, 0, 32, 0.25) 0%, transparent 50%), linear-gradient(135deg, #1a0505 0%, #2e0a0a 50%, #1a0a0a 100%); background-size: cover; background-attachment: fixed;`,
    sentBubbleColor: '#dc2626',
    receivedBubbleColor: '#27272a',
    sentTextColor: '#fee2e2',
    receivedTextColor: '#e5e5e5'
  },
  {
    name: 'Golden Hour',
    css: `background: radial-gradient(ellipse at 50% 20%, rgba(255, 215, 0, 0.2) 0%, transparent 45%), radial-gradient(circle at 35% 50%, rgba(255, 165, 0, 0.2) 0%, transparent 40%), radial-gradient(circle at 65% 70%, rgba(218, 165, 32, 0.18) 0%, transparent 40%), radial-gradient(ellipse at 50% 90%, rgba(184, 134, 11, 0.22) 0%, transparent 50%), linear-gradient(180deg, #1a1508 0%, #2e2414 50%, #1a140a 100%); background-size: cover; background-attachment: fixed;`,
    sentBubbleColor: '#d97706',
    receivedBubbleColor: '#27272a',
    sentTextColor: '#fef3c7',
    receivedTextColor: '#e5e5e5'
  },
  {
    name: 'Glacial Ice',
    css: `background: radial-gradient(circle at 20% 30%, rgba(135, 206, 250, 0.2) 0%, transparent 40%), radial-gradient(circle at 80% 50%, rgba(176, 224, 230, 0.18) 0%, transparent 40%), radial-gradient(circle at 40% 80%, rgba(173, 216, 230, 0.15) 0%, transparent 35%), radial-gradient(ellipse at 60% 20%, rgba(240, 248, 255, 0.12) 0%, transparent 45%), radial-gradient(ellipse at 50% 50%, rgba(70, 130, 180, 0.2) 0%, transparent 60%), linear-gradient(135deg, #0a1419 0%, #0f1e28 50%, #0a1a1e 100%); background-size: cover; background-attachment: fixed;`,
    sentBubbleColor: '#60a5fa',
    receivedBubbleColor: '#1e293b',
    sentTextColor: '#dbeafe',
    receivedTextColor: '#cbd5e1'
  },
  {
    name: 'Purple Haze',
    css: `background: radial-gradient(circle at 25% 25%, rgba(147, 51, 234, 0.25) 0%, transparent 45%), radial-gradient(circle at 75% 60%, rgba(168, 85, 247, 0.22) 0%, transparent 45%), radial-gradient(circle at 40% 75%, rgba(192, 132, 252, 0.18) 0%, transparent 40%), radial-gradient(ellipse at 60% 35%, rgba(126, 34, 206, 0.2) 0%, transparent 45%), radial-gradient(ellipse at 50% 90%, rgba(107, 33, 168, 0.25) 0%, transparent 55%), linear-gradient(180deg, #0f0a1a 0%, #1a0f2e 50%, #0f0a1e 100%); background-size: cover; background-attachment: fixed;`,
    sentBubbleColor: '#7c3aed',
    receivedBubbleColor: '#3a2a5a',
    sentTextColor: '#e9d5ff',
    receivedTextColor: '#e9d5ff'
  },
  {
    name: 'Mystical Forest',
    css: `background: radial-gradient(circle at 30% 20%, rgba(0, 255, 127, 0.15) 0%, transparent 40%), radial-gradient(circle at 70% 50%, rgba(34, 139, 34, 0.2) 0%, transparent 40%), radial-gradient(circle at 20% 70%, rgba(107, 142, 35, 0.18) 0%, transparent 35%), radial-gradient(circle at 80% 80%, rgba(85, 107, 47, 0.15) 0%, transparent 35%), radial-gradient(ellipse at 50% 40%, rgba(46, 125, 50, 0.22) 0%, transparent 55%), linear-gradient(135deg, #051410 0%, #0a1e14 50%, #0a1a14 100%); background-size: cover; background-attachment: fixed;`,
    sentBubbleColor: '#10b981',
    receivedBubbleColor: '#1f2937',
    sentTextColor: '#d1fae5',
    receivedTextColor: '#d1d5db'
  },
  {
    name: 'Electric Storm',
    css: `background: radial-gradient(circle at 35% 30%, rgba(0, 255, 255, 0.2) 0%, transparent 40%), radial-gradient(circle at 65% 60%, rgba(138, 43, 226, 0.22) 0%, transparent 40%), radial-gradient(circle at 25% 75%, rgba(255, 0, 255, 0.18) 0%, transparent 35%), radial-gradient(circle at 75% 25%, rgba(0, 191, 255, 0.18) 0%, transparent 35%), radial-gradient(ellipse at 50% 50%, rgba(75, 0, 130, 0.25) 0%, transparent 60%), linear-gradient(135deg, #0a0a1a 0%, #14141e 50%, #0a0a14 100%); background-size: cover; background-attachment: fixed;`,
    sentBubbleColor: '#0891b2',
    receivedBubbleColor: '#0f172a',
    sentTextColor: '#cffafe',
    receivedTextColor: '#cbd5e1'
  },
  {
    name: 'Rose Gold',
    css: `background: radial-gradient(circle at 40% 30%, rgba(255, 192, 203, 0.18) 0%, transparent 40%), radial-gradient(circle at 60% 65%, rgba(255, 215, 0, 0.15) 0%, transparent 40%), radial-gradient(circle at 30% 80%, rgba(218, 165, 32, 0.18) 0%, transparent 35%), radial-gradient(ellipse at 70% 20%, rgba(255, 182, 193, 0.15) 0%, transparent 45%), radial-gradient(ellipse at 50% 50%, rgba(184, 134, 11, 0.2) 0%, transparent 55%), linear-gradient(135deg, #1a0f0f 0%, #2e1a14 50%, #1a140f 100%); background-size: cover; background-attachment: fixed;`,
    sentBubbleColor: '#be185d',
    receivedBubbleColor: '#27272a',
    sentTextColor: '#fce7f3',
    receivedTextColor: '#e5e5e5'
  },
];

export function getArtisticPatternCSS(patternName: string): string {
  const pattern = artisticPatterns.find(p => p.name === patternName);
  return pattern?.css || artisticPatterns[0].css;
}
