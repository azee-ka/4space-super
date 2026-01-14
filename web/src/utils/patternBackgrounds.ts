// Beautiful pattern backgrounds similar to Telegram/WhatsApp
export const patternBackgrounds = [
  {
    id: 'dots-blue',
    name: 'Dots Blue',
    css: `background-image: 
      radial-gradient(circle, rgba(59, 130, 246, 0.15) 1px, transparent 1px);
    background-size: 20px 20px;
    background-color: #0f172a;`,
  },
  {
    id: 'dots-purple',
    name: 'Dots Purple',
    css: `background-image: 
      radial-gradient(circle, rgba(147, 51, 234, 0.15) 1px, transparent 1px);
    background-size: 20px 20px;
    background-color: #1e1b4b;`,
  },
  {
    id: 'dots-pink',
    name: 'Dots Pink',
    css: `background-image: 
      radial-gradient(circle, rgba(236, 72, 153, 0.15) 1px, transparent 1px);
    background-size: 20px 20px;
    background-color: #4c1d95;`,
  },
  {
    id: 'dots-cyan',
    name: 'Dots Cyan',
    css: `background-image: 
      radial-gradient(circle, rgba(6, 182, 212, 0.15) 1px, transparent 1px);
    background-size: 18px 18px;
    background-color: #083344;`,
  },
  {
    id: 'grid-cyan',
    name: 'Grid Cyan',
    css: `background-image: 
      linear-gradient(rgba(6, 182, 212, 0.1) 1px, transparent 1px),
      linear-gradient(90deg, rgba(6, 182, 212, 0.1) 1px, transparent 1px);
    background-size: 25px 25px;
    background-color: #0c0a09;`,
  },
  {
    id: 'grid-gold',
    name: 'Grid Gold',
    css: `background-image: 
      linear-gradient(rgba(234, 179, 8, 0.12) 1px, transparent 1px),
      linear-gradient(90deg, rgba(234, 179, 8, 0.12) 1px, transparent 1px);
    background-size: 30px 30px;
    background-color: #1c1917;`,
  },
  {
    id: 'waves-blue',
    name: 'Waves Blue',
    css: `background-image: 
      repeating-linear-gradient(
        45deg,
        transparent,
        transparent 10px,
        rgba(59, 130, 246, 0.1) 10px,
        rgba(59, 130, 246, 0.1) 20px
      );
    background-color: #0f172a;`,
  },
  {
    id: 'waves-purple',
    name: 'Waves Purple',
    css: `background-image: 
      repeating-linear-gradient(
        45deg,
        transparent,
        transparent 10px,
        rgba(147, 51, 234, 0.1) 10px,
        rgba(147, 51, 234, 0.1) 20px
      );
    background-color: #1e1b4b;`,
  },
  {
    id: 'circles-multi',
    name: 'Multi Circles',
    css: `background-image: 
      radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.15) 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, rgba(147, 51, 234, 0.15) 0%, transparent 50%),
      radial-gradient(circle at 40% 20%, rgba(236, 72, 153, 0.15) 0%, transparent 50%);
    background-size: 100% 100%;
    background-color: #0c0a09;`,
  },
  {
    id: 'squares-colorful',
    name: 'Colorful Squares',
    css: `background-image: 
      linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
      linear-gradient(90deg, rgba(236, 72, 153, 0.1) 1px, transparent 1px),
      linear-gradient(rgba(147, 51, 234, 0.1) 1px, transparent 1px),
      linear-gradient(90deg, rgba(6, 182, 212, 0.1) 1px, transparent 1px);
    background-size: 30px 30px, 30px 30px, 15px 15px, 15px 15px;
    background-position: 0 0, 0 0, 15px 15px, 15px 15px;
    background-color: #0c0a09;`,
  },
  {
    id: 'hexagons',
    name: 'Hexagons',
    css: `background-image: 
      repeating-linear-gradient(30deg, transparent, transparent 35px, rgba(147, 51, 234, 0.08) 35px, rgba(147, 51, 234, 0.08) 70px),
      repeating-linear-gradient(60deg, transparent, transparent 35px, rgba(59, 130, 246, 0.08) 35px, rgba(59, 130, 246, 0.08) 70px),
      repeating-linear-gradient(90deg, transparent, transparent 35px, rgba(236, 72, 153, 0.08) 35px, rgba(236, 72, 153, 0.08) 70px);
    background-color: #0f172a;`,
  },
  {
    id: 'stars',
    name: 'Stars',
    css: `background-image: 
      radial-gradient(2px 2px at 20px 30px, rgba(255, 255, 255, 0.15), transparent),
      radial-gradient(2px 2px at 60px 70px, rgba(6, 182, 212, 0.2), transparent),
      radial-gradient(1px 1px at 50px 50px, rgba(147, 51, 234, 0.15), transparent),
      radial-gradient(1px 1px at 80px 10px, rgba(236, 72, 153, 0.15), transparent),
      radial-gradient(2px 2px at 90px 40px, rgba(59, 130, 246, 0.2), transparent),
      radial-gradient(1px 1px at 130px 80px, rgba(255, 255, 255, 0.12), transparent);
    background-size: 150px 100px, 150px 100px, 150px 100px, 150px 100px, 150px 100px, 150px 100px;
    background-color: #0a0a0a;`,
  },
  {
    id: 'diagonal-stripes',
    name: 'Diagonal Stripes',
    css: `background-image: 
      repeating-linear-gradient(
        45deg,
        transparent,
        transparent 10px,
        rgba(147, 51, 234, 0.05) 10px,
        rgba(147, 51, 234, 0.05) 20px
      ),
      repeating-linear-gradient(
        -45deg,
        transparent,
        transparent 10px,
        rgba(59, 130, 246, 0.05) 10px,
        rgba(59, 130, 246, 0.05) 20px
      );
    background-color: #0f172a;`,
  },
  {
    id: 'circuit-board',
    name: 'Circuit Board',
    css: `background-image: 
      linear-gradient(rgba(6, 182, 212, 0.08) 1px, transparent 1px),
      linear-gradient(90deg, rgba(6, 182, 212, 0.08) 1px, transparent 1px),
      linear-gradient(rgba(147, 51, 234, 0.06) 1px, transparent 1px),
      linear-gradient(90deg, rgba(147, 51, 234, 0.06) 1px, transparent 1px);
    background-size: 50px 50px, 50px 50px, 10px 10px, 10px 10px;
    background-position: -1px -1px, -1px -1px, -1px -1px, -1px -1px;
    background-color: #0a0a0a;`,
  },
  {
    id: 'subtle-noise',
    name: 'Subtle Noise',
    css: `background-image: 
      radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.08) 1px, transparent 0);
    background-size: 20px 20px;
    background-color: #0f172a;`,
  },
];

export function getPatternBackgroundCSS(patternId: string): string {
  const pattern = patternBackgrounds.find(p => p.id === patternId);
  return pattern?.css || '';
}
