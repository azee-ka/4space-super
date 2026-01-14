// Utility functions for theme background styling
import type { ChatTheme } from '../store/chatSettingsStore';
import { getPatternBackgroundCSS } from './patternBackgrounds';
import { getArtisticPatternCSS } from './artisticPatterns';

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
        // Parse and apply CSS - handle both inline and multi-line CSS
        const cssRules = patternCSS.split(';').filter(rule => rule.trim());
        cssRules.forEach(rule => {
          const colonIndex = rule.indexOf(':');
          if (colonIndex > -1) {
            const property = rule.substring(0, colonIndex).trim();
            const value = rule.substring(colonIndex + 1).trim();
            if (property && value) {
              // Convert kebab-case to camelCase for React inline styles
              const camelProperty = property.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
              style[camelProperty] = value;
            }
          }
        });
      }
      break;
    
    case 'artistic':
      if (theme.backgroundPattern) {
        const artisticCSS = getArtisticPatternCSS(theme.backgroundPattern);
        const bgMatch = artisticCSS.match(/background:\s*([^;]+)/);
        if (bgMatch) {
          style.background = bgMatch[1].trim();
        }
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
export function getAmbientBackgroundStyle(theme: ChatTheme, enabled: boolean = true, intensity: number = 50): Record<string, string> {
  const style: Record<string, string> = {};
  
  if (!enabled) {
    // Return default dark background if ambient lighting is disabled
    style.backgroundColor = '#09090b';
    return style;
  }
  
  // Normalize intensity (0-100 to 0-1)
  const intensityFactor = intensity / 100;
  
  // Extract base colors from theme for ambient RGB-like effect
  let baseColor = '#0a0a0a'; // default dark
  
  switch (theme.backgroundType) {
    case 'solid':
      baseColor = theme.backgroundColor;
      // Create dramatic ambient glow with intensity control
      const brightness1 = Math.round(10 * intensityFactor);
      const brightness2 = Math.round(5 * intensityFactor);
      const darken1 = Math.round(-10 - (10 * (1 - intensityFactor)));
      const darken2 = Math.round(-20 - (10 * (1 - intensityFactor)));
      style.background = `
        radial-gradient(circle at 20% 50%, ${adjustColor(baseColor, brightness1)} 0%, transparent ${50 + (20 * (1 - intensityFactor))}%),
        radial-gradient(circle at 80% 50%, ${adjustColor(baseColor, brightness2)} 0%, transparent ${50 + (20 * (1 - intensityFactor))}%),
        linear-gradient(135deg, ${adjustColor(baseColor, darken1)} 0%, ${adjustColor(baseColor, darken2)} 100%)
      `;
      break;
    
    case 'gradient':
      const color1 = theme.backgroundColor;
      const color2 = theme.backgroundColor2 || theme.backgroundColor;
      // Create dramatic RGB-like lighting from gradient colors with intensity
      const gradBright1 = Math.round(15 * intensityFactor);
      const gradBright2 = Math.round(15 * intensityFactor);
      const gradDarken = Math.round(-15 - (10 * (1 - intensityFactor)));
      style.background = `
        radial-gradient(circle at 20% 30%, ${adjustColor(color1, gradBright1)} 0%, transparent ${45 + (25 * (1 - intensityFactor))}%),
        radial-gradient(circle at 80% 70%, ${adjustColor(color2, gradBright2)} 0%, transparent ${45 + (25 * (1 - intensityFactor))}%),
        radial-gradient(circle at 50% 50%, ${adjustColor(color1, Math.round(-5 * intensityFactor))} 0%, transparent 60%),
        linear-gradient(135deg, ${adjustColor(color1, gradDarken)} 0%, ${adjustColor(color2, gradDarken)} 100%)
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
