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

// Get ambient background style for side panels - creates dramatic RGB lighting effect
export function getAmbientBackgroundStyle(theme: ChatTheme, enabled: boolean = true): Record<string, string> {
  const style: Record<string, string> = {};
  
  if (!enabled) {
    // Return default dark background if ambient lighting is disabled
    style.backgroundColor = '#09090b';
    return style;
  }
  
  // Extract base colors from theme for ambient RGB-like effect
  let baseColor = '#0a0a0a'; // default dark
  let secondaryColor = '#0a0a0a';
  
  switch (theme.backgroundType) {
    case 'solid':
      baseColor = theme.backgroundColor;
      secondaryColor = adjustColor(baseColor, -15);
      // Create dramatic ambient glow
      style.background = `
        radial-gradient(circle at 20% 50%, ${adjustColor(baseColor, 10)} 0%, transparent 50%),
        radial-gradient(circle at 80% 50%, ${adjustColor(baseColor, 5)} 0%, transparent 50%),
        linear-gradient(135deg, ${adjustColor(baseColor, -10)} 0%, ${adjustColor(baseColor, -20)} 100%)
      `;
      break;
    
    case 'gradient':
      const color1 = theme.backgroundColor;
      const color2 = theme.backgroundColor2 || theme.backgroundColor;
      // Create dramatic RGB-like lighting from gradient colors
      style.background = `
        radial-gradient(circle at 20% 30%, ${adjustColor(color1, 15)} 0%, transparent 45%),
        radial-gradient(circle at 80% 70%, ${adjustColor(color2, 15)} 0%, transparent 45%),
        radial-gradient(circle at 50% 50%, ${adjustColor(color1, -5)} 0%, transparent 60%),
        linear-gradient(135deg, ${adjustColor(color1, -15)} 0%, ${adjustColor(color2, -15)} 100%)
      `;
      break;
    
    case 'pattern':
      // Extract colors from pattern
      if (theme.backgroundPattern) {
        const patternCSS = getPatternBackgroundCSS(theme.backgroundPattern);
        const bgColorMatch = patternCSS.match(/background-color:\s*([^;]+)/);
        if (bgColorMatch) {
          baseColor = bgColorMatch[1].trim();
        }
      }
      style.background = `
        radial-gradient(circle at 25% 40%, ${adjustColor(baseColor, 12)} 0%, transparent 48%),
        radial-gradient(circle at 75% 60%, ${adjustColor(baseColor, 8)} 0%, transparent 48%),
        linear-gradient(135deg, ${adjustColor(baseColor, -12)} 0%, ${adjustColor(baseColor, -22)} 100%)
      `;
      break;
    
    case 'image':
      // Subtle ambient for images
      style.background = `
        radial-gradient(circle at 30% 40%, rgba(139, 92, 246, 0.08) 0%, transparent 50%),
        radial-gradient(circle at 70% 60%, rgba(99, 102, 241, 0.06) 0%, transparent 50%),
        #0a0a0a
      `;
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
