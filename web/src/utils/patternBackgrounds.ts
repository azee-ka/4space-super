// Enhanced CSS Pattern Backgrounds - Better geometric patterns with preset colors
// web/src/utils/patternBackgrounds.ts

export interface PatternBackground {
  id: string;
  name: string;
  css: string;
  sentBubbleColor: string;
  receivedBubbleColor: string;
  sentTextColor: string;
  receivedTextColor: string;
}

export const patternBackgrounds: PatternBackground[] = [
  {
    id: 'hexagon-grid',
    name: 'Hexagon Grid',
    css: `background-color: #0a0a0a; background-image: linear-gradient(30deg, #1a1a1a 12%, transparent 12.5%, transparent 87%, #1a1a1a 87.5%, #1a1a1a), linear-gradient(150deg, #1a1a1a 12%, transparent 12.5%, transparent 87%, #1a1a1a 87.5%, #1a1a1a), linear-gradient(30deg, #1a1a1a 12%, transparent 12.5%, transparent 87%, #1a1a1a 87.5%, #1a1a1a), linear-gradient(150deg, #1a1a1a 12%, transparent 12.5%, transparent 87%, #1a1a1a 87.5%, #1a1a1a), linear-gradient(60deg, #27272a 25%, transparent 25.5%, transparent 75%, #27272a 75%, #27272a), linear-gradient(60deg, #27272a 25%, transparent 25.5%, transparent 75%, #27272a 75%, #27272a); background-size: 80px 140px; background-position: 0 0, 0 0, 40px 70px, 40px 70px, 0 0, 40px 70px;`,
    sentBubbleColor: '#7c3aed',
    receivedBubbleColor: '#27272a',
    sentTextColor: '#e9d5ff',
    receivedTextColor: '#e5e5e5'
  },
  {
    id: 'diamond-tiles',
    name: 'Diamond Tiles',
    css: `background-color: #0a0a0a; background-image: linear-gradient(135deg, #18181b 25%, transparent 25%), linear-gradient(225deg, #18181b 25%, transparent 25%), linear-gradient(45deg, #18181b 25%, transparent 25%), linear-gradient(315deg, #18181b 25%, #0a0a0a 25%); background-size: 60px 60px; background-position: 30px 0, 30px 0, 0 0, 0 0;`,
    sentBubbleColor: '#8b5cf6',
    receivedBubbleColor: '#1f1f1f',
    sentTextColor: '#f3e8ff',
    receivedTextColor: '#e5e5e5'
  },
  {
    id: 'zigzag',
    name: 'Zigzag Pattern',
    css: `background-color: #0a0a0a; background-image: linear-gradient(135deg, #27272a 25%, transparent 25%), linear-gradient(225deg, #27272a 25%, transparent 25%), linear-gradient(315deg, #27272a 25%, transparent 25%), linear-gradient(45deg, #27272a 25%, transparent 25%); background-size: 40px 40px; background-position: 0 0, 20px 0, 20px -20px, 0px 20px;`,
    sentBubbleColor: '#a855f7',
    receivedBubbleColor: '#27272a',
    sentTextColor: '#f3e8ff',
    receivedTextColor: '#e5e5e5'
  },
  {
    id: 'dots-matrix',
    name: 'Dots Matrix',
    css: `background-color: #0a0a0a; background-image: radial-gradient(circle, #27272a 1.5px, transparent 1.5px); background-size: 25px 25px;`,
    sentBubbleColor: '#7c3aed',
    receivedBubbleColor: '#1f1f1f',
    sentTextColor: '#e9d5ff',
    receivedTextColor: '#e5e5e5'
  },
  {
    id: 'cross-hatch',
    name: 'Cross Hatch',
    css: `background-color: #0a0a0a; background-image: linear-gradient(90deg, #18181b 1px, transparent 1px), linear-gradient(0deg, #18181b 1px, transparent 1px); background-size: 30px 30px;`,
    sentBubbleColor: '#6b21a8',
    receivedBubbleColor: '#27272a',
    sentTextColor: '#e9d5ff',
    receivedTextColor: '#e5e5e5'
  },
  {
    id: 'waves',
    name: 'Waves',
    css: `background-color: #0a0a0a; background-image: repeating-linear-gradient(45deg, transparent, transparent 35px, #18181b 35px, #18181b 70px);`,
    sentBubbleColor: '#3b82f6',
    receivedBubbleColor: '#1e293b',
    sentTextColor: '#dbeafe',
    receivedTextColor: '#cbd5e1'
  },
  {
    id: 'checkerboard',
    name: 'Checkerboard',
    css: `background-color: #0a0a0a; background-image: linear-gradient(45deg, #18181b 25%, transparent 25%), linear-gradient(-45deg, #18181b 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #18181b 75%), linear-gradient(-45deg, transparent 75%, #18181b 75%); background-size: 40px 40px; background-position: 0 0, 0 20px, 20px -20px, -20px 0px;`,
    sentBubbleColor: '#8b5cf6',
    receivedBubbleColor: '#27272a',
    sentTextColor: '#f3e8ff',
    receivedTextColor: '#e5e5e5'
  },
  {
    id: 'diagonal-lines',
    name: 'Diagonal Lines',
    css: `background-color: #0a0a0a; background-image: repeating-linear-gradient(45deg, transparent, transparent 10px, #18181b 10px, #18181b 20px);`,
    sentBubbleColor: '#7c3aed',
    receivedBubbleColor: '#1f1f1f',
    sentTextColor: '#e9d5ff',
    receivedTextColor: '#e5e5e5'
  },
  {
    id: 'triangles',
    name: 'Triangles',
    css: `background-color: #0a0a0a; background-image: linear-gradient(45deg, #18181b 50%, transparent 50%), linear-gradient(-45deg, #18181b 50%, transparent 50%); background-size: 40px 40px; background-position: 0 0, 0 20px;`,
    sentBubbleColor: '#a855f7',
    receivedBubbleColor: '#27272a',
    sentTextColor: '#f3e8ff',
    receivedTextColor: '#e5e5e5'
  },
  {
    id: 'brick-wall',
    name: 'Brick Wall',
    css: `background-color: #0a0a0a; background-image: linear-gradient(335deg, #18181b 23px, transparent 23px), linear-gradient(155deg, #18181b 23px, transparent 23px), linear-gradient(335deg, #27272a 23px, transparent 23px), linear-gradient(155deg, #27272a 23px, transparent 23px); background-size: 58px 58px; background-position: 0px 2px, 4px 35px, 29px 31px, 34px 6px;`,
    sentBubbleColor: '#d97706',
    receivedBubbleColor: '#27272a',
    sentTextColor: '#fef3c7',
    receivedTextColor: '#e5e5e5'
  },
  {
    id: 'weave',
    name: 'Weave',
    css: `background-color: #0a0a0a; background-image: linear-gradient(45deg, #27272a 25%, transparent 25%, transparent 75%, #27272a 75%, #27272a), linear-gradient(45deg, #27272a 25%, transparent 25%, transparent 75%, #27272a 75%, #27272a); background-size: 60px 60px; background-position: 0 0, 30px 30px;`,
    sentBubbleColor: '#059669',
    receivedBubbleColor: '#1f2937',
    sentTextColor: '#d1fae5',
    receivedTextColor: '#d1d5db'
  },
  {
    id: 'plus-signs',
    name: 'Plus Signs',
    css: `background-color: #0a0a0a; background-image: linear-gradient(90deg, #18181b 2px, transparent 2px), linear-gradient(0deg, #18181b 2px, transparent 2px), linear-gradient(90deg, #27272a 1px, transparent 1px), linear-gradient(0deg, #27272a 1px, transparent 1px); background-size: 50px 50px, 50px 50px, 10px 10px, 10px 10px; background-position: -2px -2px, -2px -2px, -1px -1px, -1px -1px;`,
    sentBubbleColor: '#0891b2',
    receivedBubbleColor: '#334155',
    sentTextColor: '#cffafe',
    receivedTextColor: '#cbd5e1'
  },
  {
    id: 'polka-dots',
    name: 'Polka Dots',
    css: `background-color: #0a0a0a; background-image: radial-gradient(circle, #27272a 2px, transparent 2px); background-size: 30px 30px;`,
    sentBubbleColor: '#ec4899',
    receivedBubbleColor: '#27272a',
    sentTextColor: '#fce7f3',
    receivedTextColor: '#e5e5e5'
  },
  {
    id: 'squares-grid',
    name: 'Squares Grid',
    css: `background-color: #111827; background-image: repeating-linear-gradient(45deg, #374151 25%, transparent 25%, transparent 75%, #374151 75%, #374151), repeating-linear-gradient(45deg, #374151 25%, #111827 25%, #111827 75%, #374151 75%, #374151); background-position: 0 0, 15px 15px; background-size: 30px 30px;`,
    sentBubbleColor: '#4f46e5',
    receivedBubbleColor: '#1e293b',
    sentTextColor: '#e0e7ff',
    receivedTextColor: '#cbd5e1'
  },
  {
    id: 'argyle',
    name: 'Argyle',
    css: `background-color: #0a0a0a; background-image: repeating-linear-gradient(120deg, transparent, transparent 70px, #18181b 70px, #18181b 80px), repeating-linear-gradient(60deg, transparent, transparent 70px, #27272a 70px, #27272a 80px), linear-gradient(60deg, #1a1a1a 25%, transparent 25%, transparent 75%, #1a1a1a 75%, #1a1a1a), linear-gradient(120deg, #1a1a1a 25%, transparent 25%, transparent 75%, #1a1a1a 75%, #1a1a1a); background-size: 140px 240px;`,
    sentBubbleColor: '#10b981',
    receivedBubbleColor: '#1f2937',
    sentTextColor: '#d1fae5',
    receivedTextColor: '#d1d5db'
  },
];

export function getPatternBackgroundCSS(patternId: string): string {
  const pattern = patternBackgrounds.find(p => p.id === patternId);
  return pattern?.css || patternBackgrounds[0].css;
}
