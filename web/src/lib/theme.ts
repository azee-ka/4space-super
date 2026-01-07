export type Theme = 'light' | 'dark';

export const getTheme = (): Theme => {
  if (typeof window === 'undefined') return 'dark';
  
  const stored = localStorage.getItem('4space-theme');
  if (stored === 'light' || stored === 'dark') return stored;
  
  // Default to dark (dark-focused app)
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'dark' : 'dark'; // Always default to dark
};

export const setTheme = (theme: Theme) => {
  localStorage.setItem('4space-theme', theme);
  
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};

export const toggleTheme = (): Theme => {
  const current = getTheme();
  const next = current === 'dark' ? 'light' : 'dark';
  setTheme(next);
  return next;
};

// Initialize theme on load
if (typeof window !== 'undefined') {
  setTheme(getTheme());
}