// Utility functions for theme background styling
import type { ChatTheme } from '../store/chatSettingsStore';
import { getPatternBackgroundCSS } from './patternBackgrounds';

export function getBackgroundStyle(theme: ChatTheme): Record<string, string> {
  const style: Record<string, string> = {};

  switch (theme.backgroundType) {
    case 'solid':
      style.backgroundColor = theme.backgroundColor;
      break;
    
    case 'gradient':
      style.background = `linear-gradient(135deg, ${theme.backgroundColor} 0%, ${theme.backgroundColor2 || theme.backgroundColor} 100%)`;
      break;
    
    case 'pattern':
      if (theme.backgroundPattern) {
        const patternCSS = getPatternBackgroundCSS(theme.backgroundPattern);
        // Parse the CSS string and apply it
        const cssRules = patternCSS.split(';').filter(rule => rule.trim());
        cssRules.forEach(rule => {
          const [property, value] = rule.split(':').map(s => s.trim());
          if (property && value) {
            style[property] = value;
          }
        });
      }
      break;
    
    case 'image':
      if (theme.backgroundImage) {
        style.backgroundImage = `url(${theme.backgroundImage})`;
        style.backgroundSize = 'cover';
        style.backgroundPosition = 'center';
        style.backgroundRepeat = 'no-repeat';
      }
      break;
  }

  return style;
}

// Get ambient background style for side panels - creates a subtle, related background
export function getAmbientBackgroundStyle(theme: ChatTheme): Record<string, string> {
  const style: Record<string, string> = {};
  
  // Extract base color from theme for ambient effect
  let baseColor = '#0a0a0a'; // default dark
  
  switch (theme.backgroundType) {
    case 'solid':
      baseColor = theme.backgroundColor;
      // Create a darker version for ambient
      style.background = `linear-gradient(135deg, ${baseColor} 0%, ${adjustColor(baseColor, -20)} 100%)`;
      style.filter = 'blur(40px) opacity(0.3)';
      break;
    
    case 'gradient':
      const color1 = theme.backgroundColor;
      const color2 = theme.backgroundColor2 || theme.backgroundColor;
      // Create darker, more subtle gradient for ambient
      style.background = `linear-gradient(135deg, ${adjustColor(color1, -30)} 0%, ${adjustColor(color2, -30)} 100%)`;
      style.filter = 'blur(50px) opacity(0.25)';
      break;
    
    case 'pattern':
      // Use pattern's base color for ambient
      if (theme.backgroundPattern) {
        const patternCSS = getPatternBackgroundCSS(theme.backgroundPattern);
        const bgColorMatch = patternCSS.match(/background-color:\s*([^;]+)/);
        if (bgColorMatch) {
          baseColor = bgColorMatch[1].trim();
        }
      }
      style.background = `linear-gradient(135deg, ${baseColor} 0%, ${adjustColor(baseColor, -25)} 100%)`;
      style.filter = 'blur(45px) opacity(0.28)';
      break;
    
    case 'image':
      // Use a very dark, blurred version for ambient
      style.background = `linear-gradient(135deg, #0a0a0a 0%, #050505 100%)`;
      style.filter = 'blur(60px) opacity(0.2)';
      break;
  }

  return style;
}

// Helper function to adjust color brightness
function adjustColor(color: string, brightness: number): string {
  // Convert hex to RGB
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Adjust brightness (make darker)
  const newR = Math.max(0, Math.min(255, r + brightness));
  const newG = Math.max(0, Math.min(255, g + brightness));
  const newB = Math.max(0, Math.min(255, b + brightness));
  
  // Convert back to hex
  return `#${[newR, newG, newB].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('')}`;
}
