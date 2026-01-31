import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faComments,
  faFolder,
  faNoteSticky,
  faListCheck,
  faCalendarDays,
  faTableColumns,
  faLock,
  faBolt,
  faUsers,
  faChartLine,
  faCloud,
  faShieldHalved,
  faMobileScreen,
  faArrowRight,
  faCube,
  faLayerGroup,
  faRocket,
  faGauge,
  faPuzzlePiece,
  faInfinity,
  faCode,
  faFileArrowDown,
  faUserGroup,
  faBell,
  faSearch,
  faTags,
  faChartPie,
  faClockRotateLeft,
  faStar,
  faCheck,
  faGlobe,
  faServer,
  faFingerprint,
  faWandMagicSparkles,
  faCircleNodes,
  faFlask,
  faBrain,
  faMicroscope
} from '@fortawesome/free-solid-svg-icons';

function useScrollAnimation() {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  return { ref, isVisible };
}

function ScrollReveal({ children, delay = 0, direction = 'up' }: { children: React.ReactNode; delay?: number; direction?: 'up' | 'down' | 'left' | 'right' }) {
  const { ref, isVisible } = useScrollAnimation();

  const getTransform = () => {
    switch (direction) {
      case 'up': return 'translate-y-12';
      case 'down': return '-translate-y-12';
      case 'left': return 'translate-x-12';
      case 'right': return '-translate-x-12';
      default: return 'translate-y-12';
    }
  };

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ease-out ${
        isVisible
          ? 'opacity-100 translate-y-0 translate-x-0'
          : `opacity-0 ${getTransform()}`
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

function ScaleReveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ease-out ${
        isVisible
          ? 'opacity-100 scale-100'
          : 'opacity-0 scale-90'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

export function Landing() {
  const [scrollY, setScrollY] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const parallaxOffset = scrollY * 0.5;
  const mouseParallaxX = (mousePosition.x - window.innerWidth / 2) * 0.01;
  const mouseParallaxY = (mousePosition.y - window.innerHeight / 2) * 0.01;

  const heroMetrics = [
    { label: 'Messages', count: '247', trend: '+12%', icon: faComments, glow: 'from-cyan-500/90 to-blue-500/90', accent: 'text-cyan-500' },
    { label: 'Files', count: '1.2K', trend: '+8%', icon: faFolder, glow: 'from-purple-500/80 to-pink-500/80', accent: 'text-purple-500' },
    { label: 'Notes', count: '143', trend: '+15%', icon: faNoteSticky, glow: 'from-orange-400/80 to-yellow-500/80', accent: 'text-orange-500' },
    { label: 'Tasks', count: '89', trend: '+5%', icon: faListCheck, glow: 'from-emerald-500/80 to-lime-500/80', accent: 'text-emerald-500' },
    { label: 'Events', count: '24', trend: '+3%', icon: faCalendarDays, glow: 'from-pink-500/80 to-rose-500/80', accent: 'text-pink-500' },
    { label: 'Boards', count: '12', trend: '+2%', icon: faTableColumns, glow: 'from-indigo-500/80 to-blue-500/80', accent: 'text-indigo-500' },
  ];

  const heroCodeSnippet = `const workspace = createWorkspace({
  mode: 'collaborative-ide',
  focus: 'mission-critical',
  shell: 'ai-navigator'
});
await workspace.sync();`;

  const advancedCapabilities = [
    { icon: faLock, title: 'End-to-End Encrypted', description: 'Military-grade encryption protects your data', iconBg: 'from-cyan-500/90 to-blue-600/80' },
    { icon: faBolt, title: 'Lightning Fast', description: 'Optimized for speed with instant sync', iconBg: 'from-emerald-500/80 to-sky-500/80' },
    { icon: faCloud, title: 'Cloud Native', description: 'Access anywhere, anytime, any device', iconBg: 'from-blue-500/80 to-purple-500/80' },
    { icon: faMobileScreen, title: 'Mobile Apps', description: 'Native iOS and Android applications', iconBg: 'from-fuchsia-500/80 to-rose-500/80' },
    { icon: faShieldHalved, title: 'Enterprise Security', description: 'SOC 2 Type II compliant infrastructure', iconBg: 'from-slate-700/80 to-slate-900/80' },
    { icon: faGauge, title: 'Real-time Sync', description: 'Changes appear instantly everywhere', iconBg: 'from-orange-500/80 to-amber-500/80' },
    { icon: faSearch, title: 'Global Search', description: 'Find anything across all your spaces', iconBg: 'from-sky-500/80 to-indigo-500/80' },
    { icon: faTags, title: 'Smart Tags', description: 'Organize with custom tags and labels', iconBg: 'from-violet-500/80 to-pink-500/80' },
    { icon: faChartPie, title: 'Analytics', description: 'Insights into team productivity', iconBg: 'from-emerald-500/80 to-teal-500/80' },
    { icon: faClockRotateLeft, title: 'Version History', description: 'Never lose work with full history', iconBg: 'from-slate-500/80 to-slate-700/80' },
    { icon: faWandMagicSparkles, title: 'AI-Powered', description: 'Smart suggestions and automation', iconBg: 'from-fuchsia-500/80 to-purple-500/80' },
    { icon: faCircleNodes, title: 'Integrations', description: 'Connect with 100+ tools', iconBg: 'from-blue-500/80 to-cyan-500/80' },
    { icon: faFingerprint, title: '2FA Security', description: 'Multi-factor authentication built-in', iconBg: 'from-sky-500/80 to-cyan-500/80' },
    { icon: faGlobe, title: 'Multi-language', description: 'Available in 20+ languages', iconBg: 'from-rose-500/80 to-orange-500/80' },
    { icon: faFileArrowDown, title: 'Bulk Export', description: 'Export all your data anytime', iconBg: 'from-amber-500/80 to-orange-500/80' },
    { icon: faInfinity, title: 'Unlimited Spaces', description: 'Create as many as you need', iconBg: 'from-pink-500/80 to-violet-500/80' },
  ];

  const ideSnippet = `const researchIDE = new NovaFlow({
  aiSupport: 'always-on',
  corpus: 'multi-modal',
  researchMode: true,
  codebase: 'self-healing',
});
await researchIDE.align();`;

  const codeFiles = [
    { name: 'nova.research.ts', description: 'AI research agent orchestration keeping experiments reproducible.', color: 'from-cyan-500/80 to-blue-500/80', tag: 'AI Research' },
    { name: 'signal.protocol.py', description: 'Signal-processing helpers for noisy datasets with live visualization hooks.', color: 'from-emerald-500/80 to-teal-500/80', tag: 'Signal Stack' },
    { name: 'scout.notebook.md', description: 'Research journal that surfaces ideas, docs, and citations in one unified stream.', color: 'from-purple-500/80 to-pink-500/80', tag: 'Research Log' },
  ];

  const researchInsights = [
    'Simulation-ready labs that pair data, visualization, and compute without extra tabs.',
    'AI copilots that remember citations, experiments, and why a change matters to the science.',
    'Universal codebase control blending notebook agility with IDE refactors and dataset-aware linting.',
  ];

  const researchFeatures = [
    { icon: faFlask, title: 'Experiments built in', detail: 'Orchestrate ML, physics, and biology runs inside the same workspace.' },
    { icon: faBrain, title: 'Insight-driven AI', detail: 'Summaries, next-step hints, and failure context tailored to research.' },
    { icon: faMicroscope, title: 'Research-grade context', detail: 'Track datasets, models, and references with lineage metadata.' },
  ];

  const colorCodeLines = [
    { text: "def train_research_model(data, sim_config):", color: 'text-emerald-300' },
    { text: "    with NovaFlow.research_guardian() as guardian:", color: 'text-sky-300' },
    { text: "        dataset = guardian.load(data, cache='adaptive')", color: 'text-purple-300' },
    { text: "        sim = guardian.simulate(dataset, config=sim_config)", color: 'text-orange-300' },
    { text: "        return sim.optimize(mode='multi-modal')", color: 'text-amber-200' },
  ];

  const novaIdePillars = [
    {
      title: 'Freelancer to Researcher',
      detail: 'A single IDE that scales from JS sprints to multi-GPU physics labs, keeping every git branch, invite, and context switch in sync.',
    },
    {
      title: 'AI-First Automation',
      detail: 'Copilots remember hypotheses, debug histories, and dataset lineage while proposing optimized pipelines for AI training, protein folding, or simulation tuning.',
    },
    {
      title: 'Physics & Bio Ready',
      detail: 'Built-in simulators for intricate science workloads, a bio-compute queue, and native graph explorers for molecules, models, and multi-dimensional experiments.',
    },
  ];

  const novaIdeSnippetLines = [
    { text: 'const novaIDE = new LuminousForge({', color: 'text-sky-300' },
    { text: "  focus: 'cross-disciplinary',", color: 'text-purple-300' },
    { text: "  modules: ['js-flow', 'ai-lab', 'bio-lab', 'quantum-git'],", color: 'text-emerald-300' },
    { text: "  gitOps: 'autonomous',", color: 'text-orange-300' },
    { text: "});", color: 'text-amber-200' },
    { text: 'await novaIDE.launch();', color: 'text-rose-200' },
  ];

  const novaIdeStats = [
    { label: 'Auto GitOps', value: 'Sync & guard', icon: faLock },
    { label: 'Compute Pools', value: 'ML · Bio · Physics', icon: faBolt },
    { label: 'Copilot Memory', value: 'Last 10 experiments', icon: faBrain },
    { label: 'Live Models', value: 'JS + Research', icon: faCode },
  ];

  const novaIdeBadges = ['AI training', 'Bio & Physics', 'JS + Research', 'Git Reinvented'];

  const novaIdeHighlights = [
    'Autonomous GitOps that syncs every repo, branch, and experiment.',
    'One console for JS flows, AI labs, & physics/bio simulators.',
    'Living copilot that tracks every hypothesis, failure, and discovery.',
    'Glow-first design with soft gradients that scale to light & dark themes.',
  ];

  return (
    <div className="min-h-screen overflow-hidden bg-slate-50 text-slate-900 transition-colors duration-500 dark:bg-black dark:text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 text-slate-900 border-b border-slate-200/60 backdrop-blur-xl transition-all duration-300 dark:bg-black/80 dark:text-white dark:border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center transform hover:scale-110 transition-transform">
                <FontAwesomeIcon icon={faCube} className="text-white text-lg" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                4SPACE
              </span>
            </div>

            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Link to="/login">
                <button className="px-6 py-2 rounded-lg font-medium text-slate-700/80 hover:text-slate-900 transition-all duration-300 dark:text-gray-300 dark:hover:text-white">
                  Sign In
                </button>
              </Link>
              <Link to="/signup">
                <button className="px-6 py-2 rounded-lg font-medium bg-slate-900 text-white hover:bg-slate-800 transition-all duration-300 transform hover:scale-105 dark:bg-white dark:text-black dark:hover:bg-slate-200">
                  Get Started
                </button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden bg-slate-50 dark:bg-transparent">
        <div
          className="absolute inset-0 z-0 transition-transform duration-100"
          style={{
            transform: `translate(${mouseParallaxX}px, ${mouseParallaxY}px) translateY(${parallaxOffset}px)`
          }}
        >
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-sky-200/70 rounded-full blur-[120px] animate-pulse transition-colors duration-500 dark:bg-blue-600/30" />
          <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-purple-200/60 rounded-full blur-[120px] animate-pulse transition-colors duration-500 dark:bg-purple-600/30" style={{ animationDelay: '1s' }} />
          <div className="absolute bottom-1/4 left-1/2 w-[500px] h-[500px] bg-rose-200/60 rounded-full blur-[120px] animate-pulse transition-colors duration-500 dark:bg-pink-600/30" style={{ animationDelay: '2s' }} />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
          <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 border border-slate-200/60 text-slate-600 animate-fade-in backdrop-blur-xl shadow-sm dark:bg-white/5 dark:border-white/10 dark:text-gray-300">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-sm text-slate-600 dark:text-gray-300">Now Available Worldwide</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-bold mb-8 leading-tight animate-fade-in-up">
            Your Digital
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient">
              Workspace
            </span>
            <br />
            Unified
          </h1>

          <p className="text-xl md:text-2xl text-slate-600 mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-in-up dark:text-gray-400" style={{ animationDelay: '200ms' }}>
            Bring your team together with spaces designed for collaboration.
            Chat, files, notes, tasks, calendar, and boards—all in one powerful platform.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
            <Link to="/signup">
              <button className="px-8 py-4 rounded-lg font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-all duration-300 flex items-center gap-2 transform hover:scale-105 shadow-lg hover:shadow-xl dark:bg-white dark:text-black dark:hover:bg-slate-200">
                Start for Free
                <FontAwesomeIcon icon={faArrowRight} className="transition-transform group-hover:translate-x-1" />
              </button>
            </Link>
            <button className="px-8 py-4 rounded-lg font-semibold border border-slate-300/80 text-slate-900 hover:bg-slate-100 transition-all duration-300 transform hover:scale-105 dark:border-white/20 dark:text-white dark:hover:bg-white/5">
              Watch Demo
            </button>
          </div>

          {/* Hero Demo Card */}
          <ScaleReveal delay={600}>
            <div className="relative max-w-5xl mx-auto">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/40 via-purple-500/40 to-pink-500/40 rounded-3xl blur-3xl opacity-70 animate-pulse dark:opacity-30" />
              <div className="relative border border-slate-200/70 rounded-3xl bg-white/90 p-1 shadow-2xl transition-all duration-500 dark:border-white/20 dark:bg-black/80">
                <div className="rounded-3xl bg-slate-50 dark:bg-black/80 p-8 lg:p-12 space-y-6 text-slate-900 dark:text-white">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.4em] text-slate-500 dark:text-slate-400">Command Matrix</p>
                      <h3 className="text-3xl font-bold leading-tight">Fusion workspace console</h3>
                      <p className="text-sm text-slate-500 dark:text-gray-400">
                        A futuristic window where you can see metrics, live IDE code, and the revolutionary coding platform you envision.
                      </p>
                    </div>
                    <span className="rounded-full border border-slate-300/80 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500 dark:border-white/30 dark:text-gray-300">
                      IDE Preview
                    </span>
                  </div>
                  <div className="grid gap-6 lg:grid-cols-[1.7fr_1fr] items-start">
                    <div className="rounded-2xl border border-slate-200/70 bg-white/90 p-6 shadow-lg dark:border-white/10 dark:bg-black/90">
                      <div className="flex items-center justify-between text-xs uppercase tracking-[0.4em] text-slate-500 dark:text-slate-400">
                        <span>Live Sync</span>
                        <span className="text-emerald-500">STABLE</span>
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
                        {heroMetrics.map((metric) => (
                          <div
                            key={metric.label}
                          className="rounded-2xl border border-slate-200/60 bg-white/80 p-3 text-center shadow-sm transition-colors duration-300 dark:border-white/10 dark:bg-black/80"
                          >
                            <div className={`mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr ${metric.glow} text-white`}>
                              <FontAwesomeIcon icon={metric.icon} className="text-lg" />
                            </div>
                            <div className="text-sm font-semibold text-slate-800 dark:text-white">{metric.label}</div>
                            <div className="text-2xl font-bold text-slate-900 dark:text-white">{metric.count}</div>
                            <div className={`text-xs font-semibold ${metric.accent}`}>{metric.trend}</div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 rounded-xl border border-dashed border-slate-300/60 p-3 text-xs text-slate-500 dark:border-white/20 dark:text-gray-400">
                        Every dashboard card is aware of the chaotic struggles in coding—context shifts, stubborn bugs, and long debugging nights.
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="rounded-2xl bg-slate-900/90 p-5 text-[13px] font-mono text-slate-100 shadow-2xl">
                        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.5em] text-emerald-300">
                          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                          <span>Code Pulse</span>
                        </div>
                        <pre className="mt-3 overflow-x-auto leading-relaxed">{heroCodeSnippet}</pre>
                      </div>
                      <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 text-sm text-slate-600 dark:border-white/20 dark:bg-white/5 dark:text-gray-300">
                        <p className="font-semibold text-slate-900 dark:text-white">
                          Revolutionary coding platform idea
                        </p>
                        <p className="text-xs text-slate-500 dark:text-gray-400">
                          Merge compute, collaboration, and AI copilots that know the pain of debugging in late nights—imagine a space that listens, surfaces insights, and keeps you coding in flow.
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.4em] text-slate-500 dark:text-gray-400">
                          <span className="rounded-full bg-emerald-100/70 px-3 py-1 dark:bg-emerald-500/20">Data calm</span>
                          <span className="rounded-full bg-sky-100/70 px-3 py-1 dark:bg-sky-500/20">Instant context</span>
                          <span className="rounded-full bg-purple-100/70 px-3 py-1 dark:bg-purple-500/20">AI insight</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ScaleReveal>
        </div>
      </section>

      {/* NovaIDE Vision */}
      <section className="relative py-28 bg-gradient-to-b from-slate-100 via-white to-slate-200 text-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-black dark:text-white overflow-hidden">
        <div className="pointer-events-none absolute inset-0 opacity-70">
          <div className="absolute top-[-120px] left-[10%] h-[380px] w-[380px] rounded-full bg-white/60 dark:bg-sky-500/30 blur-[140px]" />
          <div className="absolute bottom-[-80px] right-[5%] h-[320px] w-[320px] rounded-full bg-violet-200/70 dark:bg-purple-500/40 blur-[100px]" />
          <div className="absolute inset-0 border border-black/5 dark:border-white/5 rounded-[72px] shadow-[0_0_80px_rgba(149,167,255,0.4)]" />
        </div>
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <ScrollReveal>
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs uppercase tracking-[0.4em] text-slate-200">
                  <FontAwesomeIcon icon={faInfinity} className="text-slate-100" />
                  NovaIDE
                </div>
                <h2 className="text-4xl md:text-6xl font-bold leading-tight tracking-tight">
                  Redefine coding from Git to IDE.
                  <span className="block text-slate-200/80 dark:text-white/80 text-lg tracking-tight">
                    A unified IDE for freelancers, ML/AI engineers, and researchers.
                  </span>
                </h2>
                <p className="text-lg text-slate-300 max-w-xl">
                  NovaIDE unifies JS flows, ML training, protein folding, and physics modeling under one glow-first console. It pairs autonomous GitOps with memory-rich copilots so every experiment and sprint moves forward without context loss.
                </p>
                <div className="grid gap-4">
                  {novaIdePillars.map((pillar, index) => (
                    <div key={pillar.title} className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-lg shadow-[0_20px_50px_rgba(15,23,42,0.35)] dark:bg-white/5">
                      <div className="text-xs text-slate-400 uppercase tracking-[0.4em] mb-2">Pillar {String(index + 1).padStart(2, '0')}</div>
                      <h3 className="text-2xl font-semibold text-white mb-2">{pillar.title}</h3>
                      <p className="text-sm text-slate-300 leading-relaxed">{pillar.detail}</p>
                    </div>
                  ))}
                </div>
                <div className="grid gap-2 text-sm text-slate-200 max-w-xl">
                  {novaIdeHighlights.map((highlight) => (
                    <div key={highlight} className="flex items-center gap-3 rounded-full border border-white/15 bg-black/30 px-4 py-3 text-xs uppercase tracking-[0.4em] shadow-[0_15px_30px_rgba(0,0,0,0.4)]">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      {highlight}
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-4">
                  <Link to="/signup">
                    <button className="rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 px-8 py-3 font-semibold text-sm uppercase tracking-[0.4em] text-slate-950 shadow-xl shadow-cyan-500/40 transition-transform duration-300 hover:-translate-y-0.5">
                      Launch NovaIDE
                    </button>
                  </Link>
                  <button className="rounded-full border border-white/30 px-8 py-3 font-semibold text-sm uppercase tracking-[0.4em] text-white/80 backdrop-blur-lg transition-colors duration-300 hover:border-white hover:text-white">
                    Watch the Vision
                  </button>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="right">
              <div className="relative rounded-[40px] border border-white/20 bg-gradient-to-b from-white/10 to-white/0 p-1 shadow-[0_30px_60px_rgba(0,0,0,0.6)] backdrop-blur-3xl overflow-hidden">
                <div className="relative rounded-[36px] bg-slate-900/80 p-8 shadow-[inset_0_0_60px_rgba(56,189,248,0.3)]">
                  <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.5em] text-slate-400">
                    <span>Live Console</span>
                    <span className="text-emerald-400">STABLE · 4SPACE</span>
                  </div>
                  <div className="mt-5 rounded-3xl bg-[#0f172a]/80 p-6 text-sm font-mono text-slate-100 shadow-[0_20px_50px_rgba(15,23,42,0.7)]">
                    {novaIdeSnippetLines.map((line, idx) => (
                      <div key={idx} className={`leading-relaxed ${line.color}`}>
                        {line.text}
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 grid grid-cols-2 gap-4 text-xs text-slate-200">
                    {novaIdeStats.map((stat) => (
                      <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-lg shadow-[0_10px_30px_rgba(0,0,0,0.4)]">
                        <div className="flex items-center gap-2 text-slate-400">
                          <FontAwesomeIcon icon={stat.icon} className="text-base text-slate-100" />
                          {stat.label}
                        </div>
                        <div className="text-lg font-semibold text-white">{stat.value}</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 text-[12px] text-slate-500">
                    Glowing edges, soft gradients, and modular surfaces echo GitHub's futuristic polish while pointing to fully new possibilities—autonomous git flows, live simulation heatmaps, and compute orchestration that spans biology to physics.
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-20 bg-gradient-to-b from-slate-50 via-white to-slate-100 dark:bg-gradient-to-b dark:from-black dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '50K+', label: 'Active Users', icon: faUsers },
              { value: '99.9%', label: 'Uptime', icon: faServer },
              { value: '10M+', label: 'Messages Sent', icon: faComments },
              { value: '5M+', label: 'Files Stored', icon: faFolder },
            ].map((stat, i) => (
              <ScrollReveal key={i} delay={i * 100}>
                <div className="text-center group">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-slate-200/60 mb-4 transform group-hover:scale-110 transition-transform duration-300 dark:border-white/10">
                    <FontAwesomeIcon icon={stat.icon} className="text-3xl bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent" />
                  </div>
                  <div className="text-4xl font-bold mb-2 text-slate-900 dark:text-white">{stat.value}</div>
                  <div className="text-slate-500 dark:text-gray-400">{stat.label}</div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-32 bg-gradient-to-b from-slate-50 via-white to-slate-100 dark:bg-gradient-to-b dark:from-gray-900 dark:via-black dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          <ScrollReveal>
            <div className="text-center mb-20">
              <div className="inline-block px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6">
                <span className="text-sm font-medium text-blue-400">POWERFUL FEATURES</span>
              </div>
              <h2 className="text-5xl md:text-7xl font-bold mb-6 text-slate-900 dark:text-white">
                Everything you need.
                <br />
                <span className="text-slate-500 dark:text-gray-400">All in one place.</span>
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto dark:text-gray-400">
                Powerful tools that work seamlessly together to boost your team's productivity
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: faComments,
                title: 'Real-time Messaging',
                description: 'Encrypted chat with instant sync across devices. Share files, react to messages, create threads, and keep conversations organized by space.',
                features: ['End-to-end encryption', 'File sharing', 'Message threads', 'Rich media support'],
                gradient: 'from-blue-500 to-cyan-500',
              },
              {
                icon: faFolder,
                title: 'Smart File Management',
                description: 'Upload, organize, and collaborate on files with version history. Intelligent search finds anything instantly with advanced filters.',
                features: ['Version control', 'Smart search', 'File previews', 'Bulk operations'],
                gradient: 'from-purple-500 to-pink-500',
              },
              {
                icon: faNoteSticky,
                title: 'Rich Notes Editor',
                description: 'Powerful note-taking with markdown, code blocks, and media embedding. Link notes together for comprehensive knowledge management.',
                features: ['Markdown support', 'Code highlighting', 'Media embedding', 'Note linking'],
                gradient: 'from-orange-500 to-yellow-500',
              },
              {
                icon: faListCheck,
                title: 'Task Management',
                description: 'Create, assign, and track tasks with priorities and due dates. Visualize progress with customizable boards and workflows.',
                features: ['Priority levels', 'Due dates', 'Assignees', 'Custom workflows'],
                gradient: 'from-green-500 to-emerald-500',
              },
              {
                icon: faCalendarDays,
                title: 'Shared Calendar',
                description: 'Schedule events, set reminders, and coordinate with your team. Automatic sync keeps everyone on the same page across all devices.',
                features: ['Event scheduling', 'Reminders', 'Team sync', 'Recurring events'],
                gradient: 'from-pink-500 to-rose-500',
              },
              {
                icon: faTableColumns,
                title: 'Project Boards',
                description: 'Kanban-style boards for visual workflow management. Drag, drop, and customize columns to fit your team\'s unique process.',
                features: ['Kanban boards', 'Drag & drop', 'Custom columns', 'Workflow automation'],
                gradient: 'from-indigo-500 to-blue-500',
              },
            ].map((feature, i) => (
              <ScrollReveal key={i} delay={i * 100}>
                <div className="group bg-gradient-to-b from-white/90 to-slate-100 backdrop-blur-sm rounded-2xl p-8 border border-slate-200/70 hover:border-slate-300 transition-all duration-500 h-full transform hover:-translate-y-2 shadow-sm dark:from-black/90 dark:via-slate-900/80 dark:to-black/90 dark:bg-black/90 dark:border-white/10">
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 transform group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <FontAwesomeIcon icon={feature.icon} className="text-white text-2xl" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">{feature.title}</h3>
                  <p className="text-slate-600 leading-relaxed mb-6 dark:text-gray-400">{feature.description}</p>
                  <ul className="space-y-2">
                    {feature.features.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-slate-600 dark:text-gray-400">
                        <FontAwesomeIcon icon={faCheck} className="text-green-400 text-xs" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="relative py-32 bg-slate-50 dark:bg-black">
        <div className="max-w-7xl mx-auto px-6">
          <ScrollReveal>
            <div className="text-center mb-20">
              <div className="inline-block px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-6">
                <span className="text-sm font-medium text-purple-400">HOW IT WORKS</span>
              </div>
              <h2 className="text-5xl md:text-7xl font-bold mb-6 text-slate-900 dark:text-white">
                Seamless workflow.
                <br />
                <span className="text-slate-500 dark:text-gray-400">From start to finish.</span>
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                step: '01',
                title: 'Create Your Space',
                description: 'Set up a dedicated space for your project, team, or personal use. Customize it with your branding, invite team members, and configure permissions.',
                icon: faRocket,
                color: 'from-blue-500 to-cyan-500',
              },
              {
                step: '02',
                title: 'Collaborate in Real-time',
                description: 'Chat with your team, share files, take notes, and manage tasks together. Everything syncs instantly across all devices and team members.',
                icon: faUsers,
                color: 'from-purple-500 to-pink-500',
              },
              {
                step: '03',
                title: 'Track Progress',
                description: 'Monitor project status with boards, analyze team performance with insights, and ensure everyone stays aligned with shared calendars.',
                icon: faChartLine,
                color: 'from-orange-500 to-yellow-500',
              },
            ].map((step, i) => (
              <ScrollReveal key={i} delay={i * 150} direction="up">
                <div className="relative">
                  <div className={`text-8xl font-bold mb-6 bg-gradient-to-r ${step.color} bg-clip-text text-transparent opacity-20`}>
                    {step.step}
                  </div>
                  <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-6 shadow-2xl transform hover:scale-110 transition-transform duration-300`}>
                    <FontAwesomeIcon icon={step.icon} className="text-white text-3xl" />
                  </div>
                  <h3 className="text-3xl font-bold mb-4">{step.title}</h3>
                  <p className="text-slate-600 leading-relaxed text-lg dark:text-gray-400">{step.description}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Spaces Demo Section */}
      <section className="relative py-32 bg-gradient-to-b from-slate-50 via-white to-slate-100 dark:bg-gradient-to-b dark:from-black dark:via-gray-900 dark:to-black">
        <div className="max-w-7xl mx-auto px-6">
          <ScrollReveal>
            <div className="text-center mb-20">
              <div className="inline-block px-4 py-2 rounded-full bg-pink-500/10 border border-pink-500/20 mb-6">
                <span className="text-sm font-medium text-pink-400">UNLIMITED POSSIBILITIES</span>
              </div>
              <h2 className="text-5xl md:text-7xl font-bold mb-6">
                Create unlimited
                <br />
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Spaces
                </span>
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto dark:text-gray-400">
                Organize work by project, team, or topic. Each space is a complete workspace with all the tools you need.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {[
              {
                title: 'Product Development',
                description: 'End-to-end product lifecycle',
                members: 12,
                messages: 2847,
                files: 534,
                tasks: 127,
                color: 'from-blue-500 to-cyan-500',
                icon: faRocket,
              },
              {
                title: 'Marketing Campaign',
                description: 'Q1 2024 launch strategy',
                members: 8,
                messages: 1523,
                files: 356,
                tasks: 89,
                color: 'from-purple-500 to-pink-500',
                icon: faChartLine,
              },
              {
                title: 'Design System',
                description: 'Component library v2.0',
                members: 6,
                messages: 891,
                files: 712,
                tasks: 64,
                color: 'from-orange-500 to-yellow-500',
                icon: faLayerGroup,
              },
            ].map((space, i) => (
              <ScrollReveal key={i} delay={i * 100}>
              <div className="bg-gradient-to-b from-white/90 to-slate-100 border border-slate-200/70 backdrop-blur-sm rounded-2xl overflow-hidden hover:border-slate-300 transition-all duration-500 group cursor-pointer transform hover:scale-105 shadow-sm dark:from-black/90 dark:via-black/80 dark:to-black/90 dark:bg-black/90 dark:border-white/20">
                  <div className={`h-40 bg-gradient-to-br ${space.color} relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-slate-900/20 dark:bg-black/30" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent dark:from-black/60" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                          <FontAwesomeIcon icon={space.icon} className="text-white text-2xl" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white">{space.title}</h3>
                          <p className="text-sm text-white/80">{space.description}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-4 text-sm text-slate-500 dark:text-gray-400">
                      <FontAwesomeIcon icon={faUsers} />
                      <span>{space.members} members</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">{space.messages.toLocaleString()}</div>
                        <div className="text-xs text-slate-500 dark:text-gray-400">Messages</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">{space.files}</div>
                        <div className="text-xs text-slate-500 dark:text-gray-400">Files</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">{space.tasks}</div>
                        <div className="text-xs text-slate-500 dark:text-gray-400">Tasks</div>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Advanced Features Grid */}
      <section className="relative py-32 bg-slate-50 dark:bg-black">
        <div className="max-w-7xl mx-auto px-6">
          <ScrollReveal>
            <div className="text-center mb-20">
              <div className="inline-block px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 mb-6">
                <span className="text-sm font-medium text-green-400">ADVANCED CAPABILITIES</span>
              </div>
              <h2 className="text-5xl md:text-7xl font-bold mb-6 text-slate-900 dark:text-white">
                Built for performance.
                <br />
                <span className="text-slate-500 dark:text-gray-400">Designed for scale.</span>
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {advancedCapabilities.map((feature, i) => (
              <ScrollReveal key={feature.title} delay={(i % 4) * 50}>
                <div className="bg-white/95 rounded-xl p-6 border border-slate-200/70 hover:border-slate-300 transition-all duration-300 transform hover:-translate-y-1 shadow-sm dark:bg-black/90 dark:border-white/10">
                  <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.iconBg} shadow-lg`}>
                    <FontAwesomeIcon icon={feature.icon} className="text-2xl text-white" />
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-slate-900 dark:text-white">{feature.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-gray-400">{feature.description}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="relative py-32 bg-gradient-to-b from-slate-50 via-white to-slate-100 dark:bg-gradient-to-b dark:from-black dark:via-gray-900 dark:to-black">
        <div className="max-w-7xl mx-auto px-6">
          <ScrollReveal>
            <div className="text-center mb-20">
              <div className="inline-block px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-6">
                <span className="text-sm font-medium text-indigo-400">USE CASES</span>
              </div>
              <h2 className="text-5xl md:text-7xl font-bold mb-6 text-slate-900 dark:text-white">
                Perfect for every team.
                <br />
                <span className="text-slate-500 dark:text-gray-400">And every individual.</span>
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-12">
            <ScrollReveal direction="left">
              <div className="bg-gradient-to-br from-slate-100 to-white rounded-3xl p-10 border border-slate-200/60 backdrop-blur-sm shadow-sm dark:from-black/90 dark:via-black/80 dark:to-black/90 dark:bg-black/90 dark:border-white/10">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-8 shadow-2xl">
                  <FontAwesomeIcon icon={faUsers} className="text-white text-3xl" />
                </div>
                <h3 className="text-4xl font-bold mb-6 text-slate-900 dark:text-white">For Teams</h3>
                <p className="text-slate-600 mb-8 text-lg dark:text-gray-400">
                  Empower your team with a unified workspace that scales with your needs.
                </p>
                <ul className="space-y-4">
                  {[
                    { text: 'Dedicated spaces for each project', icon: faLayerGroup },
                    { text: 'Real-time collaboration on all content', icon: faBolt },
                    { text: 'Centralized file repository with version control', icon: faFolder },
                    { text: 'Team chat with threading and mentions', icon: faComments },
                    { text: 'Shared task boards and workflows', icon: faTableColumns },
                    { text: 'Calendar for team scheduling', icon: faCalendarDays },
                    { text: 'Activity tracking and analytics', icon: faChartPie },
                    { text: 'Role-based permissions and access control', icon: faShieldHalved },
                    { text: 'Custom integrations and API access', icon: faCode },
                    { text: 'Priority support and SLA guarantees', icon: faStar },
                  ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3 group">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 mt-0.5 transform group-hover:scale-110 transition-transform">
                        <FontAwesomeIcon icon={item.icon} className="text-white text-sm" />
                      </div>
                      <span className="text-slate-700 text-lg dark:text-white">{item.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="right">
              <div className="bg-gradient-to-br from-slate-100 to-white rounded-3xl p-10 border border-slate-200/60 backdrop-blur-sm shadow-sm dark:from-black/90 dark:via-black/80 dark:to-black/90 dark:bg-black/90 dark:border-white/10">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mb-8 shadow-2xl">
                  <FontAwesomeIcon icon={faRocket} className="text-white text-3xl" />
                </div>
                <h3 className="text-4xl font-bold mb-6 text-slate-900 dark:text-white">For Individuals</h3>
                <p className="text-slate-600 mb-8 text-lg dark:text-gray-400">
                  Your personal command center for life's projects and passions.
                </p>
                <ul className="space-y-4">
                  {[
                    { text: 'Private vault for sensitive content', icon: faLock },
                    { text: 'Encrypted journal and personal notes', icon: faNoteSticky },
                    { text: 'Unlimited file storage and organization', icon: faFolder },
                    { text: 'Personal task and goal management', icon: faListCheck },
                    { text: 'Calendar for scheduling and planning', icon: faCalendarDays },
                    { text: 'Project planning with visual boards', icon: faTableColumns },
                    { text: 'Knowledge base and research collection', icon: faLayerGroup },
                    { text: 'Cross-device sync and mobile access', icon: faMobileScreen },
                    { text: 'Smart search across all content', icon: faSearch },
                    { text: 'Free forever for personal use', icon: faInfinity },
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 group">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center flex-shrink-0 mt-0.5 transform group-hover:scale-110 transition-transform">
                        <FontAwesomeIcon icon={item.icon} className="text-white text-sm" />
                      </div>
                      <span className="text-slate-700 text-lg dark:text-white">{item.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative py-32 bg-slate-50 dark:bg-black">
        <div className="max-w-7xl mx-auto px-6">
          <ScrollReveal>
            <div className="text-center mb-20">
              <div className="inline-block px-4 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/20 mb-6">
                <span className="text-sm font-medium text-yellow-400">TESTIMONIALS</span>
              </div>
              <h2 className="text-5xl md:text-7xl font-bold mb-6 text-slate-900 dark:text-white">
                Loved by teams
                <br />
                <span className="text-slate-500 dark:text-gray-400">around the world.</span>
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote: "4SPACE transformed how our team collaborates. Everything we need is in one place, and the real-time sync is phenomenal.",
                author: "Sarah Chen",
                role: "Product Manager",
                company: "TechCorp",
              },
              {
                quote: "The best workspace tool we've ever used. Clean interface, powerful features, and exceptional performance.",
                author: "Michael Rodriguez",
                role: "Engineering Lead",
                company: "StartupXYZ",
              },
              {
                quote: "Finally, a platform that doesn't compromise on security or usability. Our entire organization runs on 4SPACE.",
                author: "Emily Watson",
                role: "CTO",
                company: "Enterprise Co",
              },
            ].map((testimonial, i) => (
              <ScrollReveal key={i} delay={i * 100}>
                <div className="bg-gradient-to-b from-white/90 via-slate-100 to-slate-100 rounded-2xl p-8 border border-slate-200/70 hover:border-slate-300 transition-all duration-300 shadow-sm dark:from-black/90 dark:via-black/80 dark:to-black/90 dark:bg-black/90 dark:border-white/10">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <FontAwesomeIcon key={i} icon={faStar} className="text-yellow-400 text-sm" />
                    ))}
                  </div>
                  <p className="text-slate-600 mb-6 text-lg leading-relaxed dark:text-gray-300">"{testimonial.quote}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600" />
                    <div>
                      <div className="font-bold">{testimonial.author}</div>
                      <div className="text-sm text-slate-500 dark:text-gray-400">{testimonial.role} at {testimonial.company}</div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-32 bg-gradient-to-b from-slate-50 via-white to-slate-100 dark:bg-gradient-to-b dark:from-black dark:via-gray-900 dark:to-black">
        <div className="max-w-5xl mx-auto px-6">
          <ScrollReveal>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl blur-3xl opacity-30 animate-pulse" />
              <div className="relative bg-gradient-to-br from-white to-slate-100 backdrop-blur-3xl rounded-3xl p-16 border border-slate-200/70 text-center shadow-2xl dark:bg-black/90 dark:border-white/30 dark:shadow-[0px_0px_45px_rgba(255,255,255,0.2)] dark:from-slate-900 dark:to-black">
                <h2 className="text-5xl md:text-7xl font-bold mb-6">
                  Ready to get started?
                </h2>
                <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed dark:text-gray-400">
                  Join thousands of teams and individuals who've unified their digital workspace with 4SPACE.
                  Start organizing smarter today.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
                  <Link to="/signup">
                    <button className="px-12 py-5 rounded-lg font-bold text-xl bg-slate-900 text-white hover:bg-slate-800 transition-all duration-300 flex items-center gap-3 transform hover:scale-105 shadow-2xl dark:bg-white dark:text-black dark:hover:bg-slate-200">
                      Create Your Free Space
                      <FontAwesomeIcon icon={faArrowRight} />
                    </button>
                  </Link>
                </div>
                <div className="flex items-center justify-center gap-8 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faCheck} className="text-green-400" />
                    No credit card required
                  </div>
                  <div className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faCheck} className="text-green-400" />
                    Free forever for personal use
                  </div>
                  <div className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faCheck} className="text-green-400" />
                    Set up in 60 seconds
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-slate-200/60 py-16 bg-slate-50 text-slate-700 dark:border-white/10 dark:bg-black dark:text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <FontAwesomeIcon icon={faCube} className="text-white" />
                </div>
                <span className="font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent text-xl">
                  4SPACE
                </span>
              </div>
              <p className="text-sm text-slate-500 dark:text-gray-400">
                Your unified digital workspace for everything that matters.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-slate-500 dark:text-gray-400">
                <li><a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Integrations</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-slate-500 dark:text-gray-400">
                <li><a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-500 dark:text-gray-400">
                <li><a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Cookie Policy</a></li>
                <li><a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">GDPR</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-200/60 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 dark:border-white/10">
            <div className="text-sm text-slate-500 dark:text-gray-400">© 2024 4Space. All rights reserved.</div>
            <div className="flex gap-6">
              {[faGlobe, faUsers, faChartLine].map((icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-10 h-10 rounded-lg bg-slate-900/5 flex items-center justify-center hover:bg-slate-900/10 transition-all duration-300 dark:bg-white/5 dark:hover:bg-white/10"
                >
                  <FontAwesomeIcon icon={icon} className="text-slate-600 hover:text-slate-900 transition-colors dark:text-gray-400 dark:hover:text-white" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out;
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </div>
  );
}
