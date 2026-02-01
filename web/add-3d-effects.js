// Script to add 3D mouse tracking to cards
const add3DEffect = () => {
  document.querySelectorAll('.feature-card, .space-card, .workflow-card, .testimonial-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = (y - centerY) / 25;
      const rotateY = (centerX - x) / 25;
      
      card.style.transition = 'all 0.1s ease-out';
      card.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02) translateZ(10px)`;
      card.style.boxShadow = '0 20px 60px rgba(139, 92, 246, 0.3), 0 0 40px rgba(6, 182, 212, 0.2)';
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transition = 'all 0.3s ease-out';
      card.style.transform = 'perspective(1200px) rotateX(0) rotateY(0) scale(1) translateZ(0)';
      card.style.boxShadow = '';
    });
  });
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', add3DEffect);
} else {
  add3DEffect();
}
