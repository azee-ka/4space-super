import { ImageSourcePropType } from 'react-native';

export type ChatBackgroundId =
  | 'void'
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
  type: 'solid' | 'image';
  color?: string;
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
