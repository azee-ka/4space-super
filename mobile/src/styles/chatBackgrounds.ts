import { ImageSourcePropType } from 'react-native';

export type ChatBackgroundId = 'void' | 'nebula' | 'circuit' | 'geometry' | 'systems';

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
];

export const getChatBackgroundById = (id?: ChatBackgroundId) =>
  CHAT_BACKGROUNDS.find((preset) => preset.id === id) || CHAT_BACKGROUNDS[0];
