import React, { useState } from 'react';

interface Card3DProps {
  children: React.ReactNode;
  gradient: string;
  delay?: number;
}

export function Card3D({ children, gradient, delay = 0 }: Card3DProps) {
  const [transform, setTransform] = useState('');
  const [glow, setGlow] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / 15;
    const rotateY = (centerX - x) / 15;

    setTransform(`perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(20px)`);
    setGlow(true);
  };

  const handleMouseLeave = () => {
    setTransform('perspective(1200px) rotateX(0deg) rotateY(0deg) translateZ(0)');
    setGlow(false);
  };

  return (
    <div
      className="group relative rounded-2xl p-8 h-full overflow-hidden transition-all duration-300"
      style={{
        transformStyle: 'preserve-3d',
        transform: transform || 'perspective(1200px) translateZ(0)',
        background: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(10px)',
        border: glow ? '1px solid rgba(139, 92, 246, 0.6)' : '1px solid rgba(139, 92, 246, 0.3)',
        boxShadow: glow
          ? '0 25px 50px rgba(139, 92, 246, 0.4), 0 0 60px rgba(6, 182, 212, 0.3), inset 0 0 0 1px rgba(255, 255, 255, 0.1)'
          : '0 8px 32px rgba(139, 92, 246, 0.2), inset 0 0 0 1px rgba(255, 255, 255, 0.05)',
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Glowing border effect */}
      <div
        className="absolute -inset-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-xl"
        style={{
          background: `linear-gradient(45deg, rgba(139, 92, 246, 0.6), rgba(6, 182, 212, 0.6), rgba(217, 70, 239, 0.6))`,
        }}
      />

      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-16 h-16 border-l-2 border-t-2 border-purple-500/50 group-hover:border-purple-400 transition-colors duration-300" />
      <div className="absolute bottom-0 right-0 w-16 h-16 border-r-2 border-b-2 border-cyan-500/50 group-hover:border-cyan-400 transition-colors duration-300" />

      <div className="relative z-10">{children}</div>
    </div>
  );
}
