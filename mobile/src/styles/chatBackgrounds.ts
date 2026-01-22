import { ImageSourcePropType } from 'react-native';

export type ChatBackgroundId =
  | 'void'
  | 'custom-photo'
  | 'solid-ink'
  | 'solid-graphite'
  | 'solid-obsidian'
  | 'solid-forest'
  | 'solid-ocean'
  | 'solid-classic-dark'
  | 'solid-midnight-blue'
  | 'solid-forest-green'
  | 'solid-crimson-red'
  | 'solid-amber-gold'
  | 'solid-pink-rose'
  | 'solid-cyan-aqua'
  | 'solid-indigo-deep'
  | 'solid-emerald-bright'
  | 'solid-slate-gray'
  | 'solid-lime-green'
  | 'solid-orange-sunset'
  | 'solid-teal-ocean'
  | 'solid-violet-purple'
  | 'solid-fuchsia-magenta'
  | 'solid-sky-blue'
  | 'gradient-deep-space'
  | 'gradient-ocean-depths'
  | 'gradient-purple-haze'
  | 'gradient-fire-ember'
  | 'gradient-tropical-paradise'
  | 'gradient-lavender-mist'
  | 'gradient-peach-cream'
  | 'gradient-mint-fresh'
  | 'gradient-royal-blue'
  | 'gradient-rose-wine'
  | 'gradient-amber-glow'
  | 'gradient-electric-blue'
  | 'nebula'
  | 'circuit'
  | 'geometry'
  | 'systems'
  | 'tech-1'
  | 'tech-2'
  | 'tech-3'
  | 'tech-matrix'
  | 'equations'
  | 'productivity'
  | 'sports'
  | 'food'
  | 'random-objects'
  | 'mechanical'
  | 'graphic-geometry'
  | 'topography'
  | 'seasons'
  | 'data-stream'
  | 'systems-1';

export interface ChatBackgroundPreset {
  id: ChatBackgroundId;
  label: string;
  type: 'solid' | 'image' | 'gradient';
  color?: string;
  colors?: [string, string];
  image?: ImageSourcePropType;
  overlayColor: string;
  overlayOpacity: number;
}

export const CHAT_BACKGROUNDS: ChatBackgroundPreset[] = [
  {
    id: 'void',
    label: 'Void',
    type: 'solid',
    color: '#050508',
    overlayColor: '#05070c',
    overlayOpacity: 0.55,
  },
  {
    id: 'solid-ink',
    label: 'Ink',
    type: 'solid',
    color: '#05080f',
    overlayColor: '#05080f',
    overlayOpacity: 0.4,
  },
  {
    id: 'solid-graphite',
    label: 'Graphite',
    type: 'solid',
    color: '#0a0a0f',
    overlayColor: '#0a0a0f',
    overlayOpacity: 0.35,
  },
  {
    id: 'solid-obsidian',
    label: 'Obsidian',
    type: 'solid',
    color: '#0a0f14',
    overlayColor: '#0a0f14',
    overlayOpacity: 0.32,
  },
  {
    id: 'solid-forest',
    label: 'Forest',
    type: 'solid',
    color: '#061116',
    overlayColor: '#061116',
    overlayOpacity: 0.32,
  },
  {
    id: 'solid-ocean',
    label: 'Ocean',
    type: 'solid',
    color: '#04131e',
    overlayColor: '#04131e',
    overlayOpacity: 0.32,
  },
  {
    id: 'solid-classic-dark',
    label: 'Classic Dark',
    type: 'solid',
    color: '#000000',
    overlayColor: '#000000',
    overlayOpacity: 0.38,
  },
  {
    id: 'solid-midnight-blue',
    label: 'Midnight Blue',
    type: 'solid',
    color: '#0f172a',
    overlayColor: '#0f172a',
    overlayOpacity: 0.35,
  },
  {
    id: 'solid-forest-green',
    label: 'Forest Green',
    type: 'solid',
    color: '#0a1f0a',
    overlayColor: '#0a1f0a',
    overlayOpacity: 0.35,
  },
  {
    id: 'solid-crimson-red',
    label: 'Crimson Red',
    type: 'solid',
    color: '#0a0a0a',
    overlayColor: '#0a0a0a',
    overlayOpacity: 0.35,
  },
  {
    id: 'solid-amber-gold',
    label: 'Amber Gold',
    type: 'solid',
    color: '#0a0a0a',
    overlayColor: '#0a0a0a',
    overlayOpacity: 0.35,
  },
  {
    id: 'solid-pink-rose',
    label: 'Pink Rose',
    type: 'solid',
    color: '#0a0a0a',
    overlayColor: '#0a0a0a',
    overlayOpacity: 0.35,
  },
  {
    id: 'solid-cyan-aqua',
    label: 'Cyan Aqua',
    type: 'solid',
    color: '#0a0a0a',
    overlayColor: '#0a0a0a',
    overlayOpacity: 0.35,
  },
  {
    id: 'solid-indigo-deep',
    label: 'Indigo Deep',
    type: 'solid',
    color: '#0f0a1a',
    overlayColor: '#0f0a1a',
    overlayOpacity: 0.35,
  },
  {
    id: 'solid-emerald-bright',
    label: 'Emerald Bright',
    type: 'solid',
    color: '#0a0a0a',
    overlayColor: '#0a0a0a',
    overlayOpacity: 0.35,
  },
  {
    id: 'solid-slate-gray',
    label: 'Slate Gray',
    type: 'solid',
    color: '#0f172a',
    overlayColor: '#0f172a',
    overlayOpacity: 0.35,
  },
  {
    id: 'solid-lime-green',
    label: 'Lime Green',
    type: 'solid',
    color: '#0a0a0a',
    overlayColor: '#0a0a0a',
    overlayOpacity: 0.35,
  },
  {
    id: 'solid-orange-sunset',
    label: 'Orange Sunset',
    type: 'solid',
    color: '#0a0a0a',
    overlayColor: '#0a0a0a',
    overlayOpacity: 0.35,
  },
  {
    id: 'solid-teal-ocean',
    label: 'Teal Ocean',
    type: 'solid',
    color: '#0a1419',
    overlayColor: '#0a1419',
    overlayOpacity: 0.35,
  },
  {
    id: 'solid-violet-purple',
    label: 'Violet Purple',
    type: 'solid',
    color: '#0a0a0a',
    overlayColor: '#0a0a0a',
    overlayOpacity: 0.35,
  },
  {
    id: 'solid-fuchsia-magenta',
    label: 'Fuchsia Magenta',
    type: 'solid',
    color: '#0a0a0a',
    overlayColor: '#0a0a0a',
    overlayOpacity: 0.35,
  },
  {
    id: 'solid-sky-blue',
    label: 'Sky Blue',
    type: 'solid',
    color: '#0a0f1a',
    overlayColor: '#0a0f1a',
    overlayOpacity: 0.35,
  },
  {
    id: 'gradient-deep-space',
    label: 'Deep Space',
    type: 'gradient',
    colors: ['#0a0a0a', '#1a1a2e'],
    overlayColor: '#04040a',
    overlayOpacity: 0.35,
  },
  {
    id: 'gradient-ocean-depths',
    label: 'Ocean Depths',
    type: 'gradient',
    colors: ['#0f172a', '#1e293b'],
    overlayColor: '#04070f',
    overlayOpacity: 0.32,
  },
  {
    id: 'gradient-purple-haze',
    label: 'Purple Haze',
    type: 'gradient',
    colors: ['#1a0a1a', '#2d1b4e'],
    overlayColor: '#0a0712',
    overlayOpacity: 0.32,
  },
  {
    id: 'gradient-fire-ember',
    label: 'Fire Ember',
    type: 'gradient',
    colors: ['#1a0505', '#2e0a0a'],
    overlayColor: '#120404',
    overlayOpacity: 0.32,
  },
  {
    id: 'gradient-tropical-paradise',
    label: 'Tropical',
    type: 'gradient',
    colors: ['#051410', '#0a1a1e'],
    overlayColor: '#031012',
    overlayOpacity: 0.3,
  },
  {
    id: 'gradient-lavender-mist',
    label: 'Lavender',
    type: 'gradient',
    colors: ['#0f0a1a', '#1a0f2e'],
    overlayColor: '#0a0714',
    overlayOpacity: 0.32,
  },
  {
    id: 'gradient-peach-cream',
    label: 'Peach',
    type: 'gradient',
    colors: ['#1a0f0a', '#2e1a14'],
    overlayColor: '#120807',
    overlayOpacity: 0.32,
  },
  {
    id: 'gradient-mint-fresh',
    label: 'Mint',
    type: 'gradient',
    colors: ['#0a1410', '#0f1e1a'],
    overlayColor: '#06110f',
    overlayOpacity: 0.32,
  },
  {
    id: 'gradient-royal-blue',
    label: 'Royal',
    type: 'gradient',
    colors: ['#0a0f1a', '#0f1428'],
    overlayColor: '#060914',
    overlayOpacity: 0.32,
  },
  {
    id: 'gradient-rose-wine',
    label: 'Rose Wine',
    type: 'gradient',
    colors: ['#1a0a0f', '#2e1420'],
    overlayColor: '#12070e',
    overlayOpacity: 0.32,
  },
  {
    id: 'gradient-amber-glow',
    label: 'Amber Glow',
    type: 'gradient',
    colors: ['#1a1008', '#2e1e0f'],
    overlayColor: '#120b06',
    overlayOpacity: 0.32,
  },
  {
    id: 'gradient-electric-blue',
    label: 'Electric Blue',
    type: 'gradient',
    colors: ['#0a0a1a', '#0f0f2e'],
    overlayColor: '#060614',
    overlayOpacity: 0.32,
  },
  {
    id: 'custom-photo',
    label: 'Custom Photo',
    type: 'image',
    overlayColor: '#05070c',
    overlayOpacity: 0.55,
  },
  {
    id: 'nebula',
    label: 'Nebula',
    type: 'image',
    image: require('../../assets/chat_themes/space.png'),
    overlayColor: '#04070f',
    overlayOpacity: 0.6,
  },
  {
    id: 'circuit',
    label: 'Circuit',
    type: 'image',
    image: require('../../assets/chat_themes/tech.png'),
    overlayColor: '#04060b',
    overlayOpacity: 0.68,
  },
  {
    id: 'geometry',
    label: 'Geometry',
    type: 'image',
    image: require('../../assets/chat_themes/geometry-gradient.png'),
    overlayColor: '#05060b',
    overlayOpacity: 0.55,
  },
  {
    id: 'systems',
    label: 'Systems',
    type: 'image',
    image: require('../../assets/chat_themes/systems.png'),
    overlayColor: '#04070a',
    overlayOpacity: 0.62,
  },
  {
    id: 'tech-1',
    label: 'Tech Circuit',
    type: 'image',
    image: require('../../assets/chat_themes_3/tech-1.png'),
    overlayColor: '#04040d',
    overlayOpacity: 0.58,
  },
  {
    id: 'tech-2',
    label: 'Tech Grid',
    type: 'image',
    image: require('../../assets/chat_themes_3/tech-2.png'),
    overlayColor: '#04060c',
    overlayOpacity: 0.55,
  },
  {
    id: 'tech-3',
    label: 'Tech Neon',
    type: 'image',
    image: require('../../assets/chat_themes_3/tech-3.png'),
    overlayColor: '#05070d',
    overlayOpacity: 0.6,
  },
  {
    id: 'tech-matrix',
    label: 'Tech Matrix',
    type: 'image',
    image: require('../../assets/chat_themes_3/tech-1-1.png'),
    overlayColor: '#05050b',
    overlayOpacity: 0.58,
  },
  {
    id: 'equations',
    label: 'Equations',
    type: 'image',
    image: require('../../assets/chat_themes_3/equations-1.png'),
    overlayColor: '#05080e',
    overlayOpacity: 0.58,
  },
  {
    id: 'productivity',
    label: 'Productivity',
    type: 'image',
    image: require('../../assets/chat_themes_3/productivity-1.png'),
    overlayColor: '#04080a',
    overlayOpacity: 0.56,
  },
  {
    id: 'sports',
    label: 'Sports',
    type: 'image',
    image: require('../../assets/chat_themes_3/sports.png'),
    overlayColor: '#05070a',
    overlayOpacity: 0.58,
  },
  {
    id: 'food',
    label: 'Food',
    type: 'image',
    image: require('../../assets/chat_themes_3/food.png'),
    overlayColor: '#06060c',
    overlayOpacity: 0.6,
  },
  {
    id: 'random-objects',
    label: 'Objects',
    type: 'image',
    image: require('../../assets/chat_themes_3/random-objects.png'),
    overlayColor: '#060606',
    overlayOpacity: 0.6,
  },
  {
    id: 'mechanical',
    label: 'Mechanical',
    type: 'image',
    image: require('../../assets/chat_themes_3/mechanical.png'),
    overlayColor: '#05070c',
    overlayOpacity: 0.6,
  },
  {
    id: 'graphic-geometry',
    label: 'Graphic Geometry',
    type: 'image',
    image: require('../../assets/chat_themes_3/graphic-geometry.png'),
    overlayColor: '#04060c',
    overlayOpacity: 0.55,
  },
  {
    id: 'topography',
    label: 'Topography',
    type: 'image',
    image: require('../../assets/chat_themes_3/topography.png'),
    overlayColor: '#03060c',
    overlayOpacity: 0.55,
  },
  {
    id: 'seasons',
    label: 'Seasons',
    type: 'image',
    image: require('../../assets/chat_themes_3/seasons.png'),
    overlayColor: '#03060b',
    overlayOpacity: 0.6,
  },
  {
    id: 'data-stream',
    label: 'Data Stream',
    type: 'image',
    image: require('../../assets/chat_themes_3/data.png'),
    overlayColor: '#03060a',
    overlayOpacity: 0.62,
  },
  {
    id: 'systems-1',
    label: 'Systems Grid',
    type: 'image',
    image: require('../../assets/chat_themes_3/systems-1.png'),
    overlayColor: '#04070a',
    overlayOpacity: 0.6,
  },
];

export const getChatBackgroundById = (id?: ChatBackgroundId) =>
  CHAT_BACKGROUNDS.find((preset) => preset.id === id) || CHAT_BACKGROUNDS[0];
