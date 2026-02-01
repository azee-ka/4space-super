// Reusable smooth 3D card effect
export const add3DCardEffect = (element: HTMLElement) => {
  element.addEventListener('mousemove', (e: MouseEvent) => {
    const rect = element.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = (y - centerY) / 40; // Very smooth
    const rotateY = (centerX - x) / 40;
    
    element.style.transition = 'transform 0.12s cubic-bezier(0.23, 1, 0.32, 1), box-shadow 0.12s ease-out';
    element.style.transform = `perspective(1500px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(6px)`;
    element.style.boxShadow = '0 12px 35px rgba(139, 92, 246, 0.2), 0 0 25px rgba(6, 182, 212, 0.12)';
  });
  
  element.addEventListener('mouseleave', () => {
    element.style.transition = 'transform 0.5s cubic-bezier(0.23, 1, 0.32, 1), box-shadow 0.5s ease-out';
    element.style.transform = 'perspective(1500px) rotateX(0) rotateY(0) translateZ(0)';
    element.style.boxShadow = '';
  });
};
