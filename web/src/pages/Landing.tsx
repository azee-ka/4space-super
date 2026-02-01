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
  faMicroscope,
  faAtom,
  faDna,
  faChartArea,
  faTerminal,
  faMagic,
  faNetworkWired,
  faLightbulb,
  faGripVertical,
  faEye,
  faProjectDiagram,
  faCodeBranch,
  faDatabase,
  faCogs,
  faWaveSquare
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
  const scrollProgress = Math.min(scrollY / (document.documentElement.scrollHeight - window.innerHeight), 1);

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
    { label: 'Auto GitOps', value: 'Sync & guard', detail: 'Continuous merges with observability hooks', icon: faLock },
    { label: 'Compute Pools', value: 'ML · Bio · Physics', detail: 'Queue, scale, and visualize from one control plane', icon: faBolt },
    { label: 'Copilot Memory', value: 'Last 10 experiments', detail: 'Context from previous hypotheses and failures', icon: faBrain },
    { label: 'Live Models', value: 'JS + Research', detail: 'Full stack + notebook signal in one workspace', icon: faCode },
  ];

  const novaIdeBadges = ['AI training', 'Bio & Physics', 'JS + Research', 'Git Reinvented'];

  const novaIdeHighlights = [
    'Autonomous GitOps that syncs every repo, branch, and experiment.',
    'One console for JS flows, AI labs, & physics/bio simulators.',
    'Living copilot that tracks every hypothesis, failure, and discovery.',
    'Glow-first design with soft gradients that scale to light & dark themes.',
  ];

  const novaIdeFocus = [
    { title: 'Context Matrix', detail: 'Keeps tabs on git, ML experiments, protein simulations, and docs so you never lose your train of thought.' },
    { title: 'Live Compute Stream', detail: 'Route ML trainers, bio simulators, and physics engines through one dashboard with instant metrics.' },
    { title: 'Signal Copilot', detail: 'Auto-suggest refactors, next steps, and citations tuned for researchers and freelancers alike.' },
    { title: 'Git Renaissance', detail: 'Autonomous pushes, rebases, and PR drafts with science-grade audit trails.' },
  ];

  const novaLabHighlights = [
    {
      icon: faGauge,
      title: 'Signal Console',
      detail: 'Live telemetry, git diffs, and simulator flashes in one glance.',
      gradient: 'from-indigo-500/50 via-purple-500/40 to-rose-500/30',
    },
    {
      icon: faBolt,
      title: 'Compute Guardrails',
      detail: 'Queue ML, physics, and bio runs with cost whispers and retry signals.',
      gradient: 'from-cyan-500/50 via-blue-500/40 to-indigo-500/30',
    },
    {
      icon: faCode,
      title: 'Unified Workbench',
      detail: 'Git, notebooks, docs, and copilots live on the same timeline.',
      gradient: 'from-emerald-500/50 via-teal-500/40 to-sky-500/30',
    },
  ];

  const novaLabSignals = [
    {
      title: 'Capture',
      detail: 'Every branch, diff, and experiment pulse is sampled into a single signal path.',
    },
    {
      title: 'Momentum',
      detail: 'Copilots remember your last failure, your next idea, and why the retry mattered.',
    },
    {
      title: 'Clarity',
      detail: 'Layouts prioritize the work that moves you forward, hiding the vanity metrics.',
    },
  ];

  return (
    <div className="min-h-screen overflow-hidden bg-slate-50 text-slate-900 transition-colors duration-500 dark:bg-black dark:text-white">
      {/* Glowing Scroll Trail */}
      <div className="fixed left-6 top-0 bottom-0 w-1 z-50 pointer-events-none hidden xl:block">
        {/* Glowing trail that follows scroll */}
        <div
          className="absolute top-0 w-full bg-gradient-to-b from-cyan-400 via-purple-500 to-transparent transition-all duration-500 ease-out"
          style={{
            height: `${scrollProgress * 100}%`,
            filter: 'blur(1px)',
            boxShadow: '0 0 20px rgba(34, 211, 238, 0.6), 0 0 40px rgba(168, 85, 247, 0.4)',
          }}
        />
        {/* Active indicator dot */}
        <div
          className="absolute w-3 h-3 -left-1 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-full transition-all duration-500 ease-out"
          style={{
            top: `${scrollProgress * 100}%`,
            boxShadow: '0 0 15px rgba(34, 211, 238, 0.8), 0 0 30px rgba(168, 85, 247, 0.6)',
          }}
        />
      </div>


      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 text-slate-900 border-0 border-slate-200/60 backdrop-blur-xl transition-all duration-300 dark:bg-black/0 dark:text-white dark:border-white/10">
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

      {/* Revolutionary 4SPACE Lab Section */}
      <section className="relative py-40 bg-white dark:bg-black text-slate-900 dark:text-white overflow-hidden">
        {/* Animated Background */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-[-200px] left-[5%] h-[600px] w-[600px] rounded-full bg-purple-400/20 dark:bg-purple-600/20 blur-[180px]" />
          <div className="absolute top-[30%] right-[10%] h-[500px] w-[500px] rounded-full bg-cyan-400/20 dark:bg-cyan-500/20 blur-[160px]" />
          <div className="absolute bottom-[-100px] left-[20%] h-[450px] w-[450px] rounded-full bg-fuchsia-400/20 dark:bg-fuchsia-600/20 blur-[140px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6">
          {/* Header */}
          <ScrollReveal>
            <div className="text-center mb-20">
              <div className="inline-flex items-center gap-3 rounded-full border border-slate-300 dark:border-white/20 bg-gradient-to-r from-purple-500/10 via-cyan-500/10 to-fuchsia-500/10 px-6 py-2 text-xs font-bold uppercase tracking-[0.4em] text-slate-700 dark:text-white mb-8 backdrop-blur-xl">
                <FontAwesomeIcon icon={faInfinity} className="text-cyan-500 dark:text-cyan-400" />
                The Future of Development
              </div>
              <h2 className="text-6xl md:text-8xl font-black mb-8 leading-tight">
                <span className="bg-gradient-to-r from-cyan-500 via-purple-500 to-fuchsia-500 dark:from-cyan-400 dark:via-purple-400 dark:to-fuchsia-400 bg-clip-text text-transparent">
                  4SPACE Lab
                </span>
              </h2>
              <p className="text-2xl md:text-3xl text-slate-700 dark:text-slate-300 max-w-4xl mx-auto leading-relaxed">
                The world's first <span className="text-cyan-600 dark:text-cyan-400 font-semibold">Quantum-Ready</span>, <span className="text-purple-600 dark:text-purple-400 font-semibold">AI-Native</span> development environment.
                <br />From freelance code to protein folding, physics simulations to ML research.
              </p>
            </div>
          </ScrollReveal>

          {/* Revolutionary Features Grid */}
          <div className="grid lg:grid-cols-3 gap-8 mb-24">
            {[
              {
                icon: faBrain,
                title: 'Cognitive Code Engine',
                description: 'AI that understands your codebase at quantum depth. Predicts bugs before they exist, suggests optimizations in real-time, and learns your coding patterns to become your perfect pair programmer.',
                features: ['Context-aware autocomplete', 'Semantic bug prediction', 'Intent-based refactoring', 'Cross-language translation'],
                gradient: 'from-purple-500/20 via-fuchsia-500/20 to-pink-500/20',
                iconGradient: 'from-purple-500 to-fuchsia-600',
              },
              {
                icon: faAtom,
                title: 'Quantum Simulation Workspace',
                description: 'Native quantum computing integration. Run quantum algorithms, simulate molecular dynamics, and prototype quantum ML models directly in your IDE with real-time visualization.',
                features: ['Quantum circuit designer', 'Molecular dynamics engine', 'Qubit state visualizer', 'Hybrid quantum-classical debugging'],
                gradient: 'from-cyan-500/20 via-blue-500/20 to-indigo-500/20',
                iconGradient: 'from-cyan-500 to-blue-600',
              },
              {
                icon: faDna,
                title: 'BioCompute Laboratory',
                description: 'Protein folding, genomic analysis, and drug discovery tools built into your development flow. AlphaFold integration, CRISPR design tools, and molecular docking simulations at your fingertips.',
                features: ['Protein structure prediction', 'Gene expression analysis', 'Drug-target interaction modeling', '3D molecular viewer'],
                gradient: 'from-emerald-500/20 via-green-500/20 to-teal-500/20',
                iconGradient: 'from-emerald-500 to-teal-600',
              },
            ].map((feature, i) => (
              <ScrollReveal key={feature.title} delay={i * 150}>
                <div className="group relative h-full">
                  {/* Subtle border glow on hover */}
                  <div className={`absolute -inset-0.5 bg-gradient-to-r ${feature.iconGradient} rounded-3xl opacity-0 blur-lg group-hover:opacity-20 transition-opacity duration-500`} />

                  <div
                    className={`relative h-full bg-gradient-to-br ${feature.gradient} border border-slate-200 dark:border-white/10 rounded-3xl p-8 backdrop-blur-xl hover:border-slate-300 dark:hover:border-white/30 transition-all duration-500`}
                    style={{ transformStyle: 'preserve-3d' }}
                    onMouseMove={(e) => {
                      const card = e.currentTarget;
                      const rect = card.getBoundingClientRect();
                      const x = e.clientX - rect.left;
                      const y = e.clientY - rect.top;
                      const rotateX = (y - rect.height / 2) / 30;
                      const rotateY = (rect.width / 2 - x) / 30;
                      card.style.transition = 'transform 0.12s cubic-bezier(0.23, 1, 0.32, 1)';
                      card.style.transform = `perspective(1500px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(15px)`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transition = 'transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)';
                      e.currentTarget.style.transform = 'perspective(1500px)';
                    }}
                  >
                    <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${feature.iconGradient} flex items-center justify-center mb-6 transform group-hover:scale-105 transition-all duration-500 shadow-2xl dark:shadow-[0_25px_50px_-12px_rgba(147,51,234,0.4)]`}>
                      <FontAwesomeIcon icon={feature.icon} className="text-3xl text-white" />
                    </div>

                    <h3 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">{feature.title}</h3>
                    <p className="text-slate-700 dark:text-slate-300 mb-6 leading-relaxed">{feature.description}</p>

                    <div className="space-y-2">
                      {feature.features.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                          <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${feature.iconGradient}`} />
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>

          {/* Immersive IDE Preview */}
          <ScrollReveal>
            <div className="relative mb-24">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 via-cyan-300/30 to-fuchsia-400/20 rounded-[48px] blur-[100px] opacity-70 animate-pulse dark:from-purple-600/30 dark:via-cyan-500/35 dark:to-fuchsia-600/30" />

              <div className="relative border border-slate-200/70 rounded-[48px] bg-gradient-to-b from-white/90 via-slate-50 to-slate-100 p-2 backdrop-blur-2xl dark:border-white/20 dark:bg-gradient-to-b dark:from-slate-900/60 dark:via-slate-950/60 dark:to-black/80">
                <div className="bg-white rounded-[44px] overflow-hidden border border-slate-200/70 dark:bg-black/90 dark:border-white/5">
                  {/* IDE Header */}
                  <div className="border-b border-white/10 p-4 flex items-center justify-between bg-gradient-to-r from-slate-900/80 to-slate-950/80">
                    <div className="flex items-center gap-3">
                      <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500/80" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                        <div className="w-3 h-3 rounded-full bg-green-500/80" />
                      </div>
                      <span className="text-xs uppercase tracking-[0.3em] text-slate-400">4SPACE Lab · Quantum Mode</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-400">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        AI Active
                      </div>
                      <div className="flex items-center gap-2">
                        <FontAwesomeIcon icon={faAtom} className="text-cyan-400" />
                        Quantum Ready
                      </div>
                    </div>
                  </div>

                  <div className="grid lg:grid-cols-[1fr_1.2fr] gap-px bg-white/5">
                    {/* Code Editor */}
                    <div className="bg-white/90 dark:bg-[#0a0e1a] p-6 text-slate-900 dark:text-white">
                      <div className="mb-4 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <FontAwesomeIcon icon={faCode} />
                        <span>quantum_research.py</span>
                        <span className="ml-auto text-emerald-400">● Editing</span>
                      </div>
                      <div className="font-mono text-sm space-y-1">
                        <div className="flex gap-4">
                          <span className="text-slate-600 select-none w-8 text-right dark:text-slate-500">1</span>
                          <span className="text-purple-400 dark:text-purple-300">import</span>
                          <span className="text-cyan-300 dark:text-cyan-200">quantumflow</span>
                          <span className="text-slate-400 dark:text-slate-300">as</span>
                          <span className="text-cyan-300 dark:text-cyan-200">qf</span>
                        </div>
                        <div className="flex gap-4">
                          <span className="text-slate-600 select-none w-8 text-right dark:text-slate-500">2</span>
                          <span className="text-purple-400 dark:text-purple-300">from</span>
                          <span className="text-cyan-300 dark:text-cyan-200">bioforge</span>
                          <span className="text-purple-400 dark:text-purple-300">import</span>
                          <span className="text-yellow-300 dark:text-yellow-200">ProteinFolder</span>
                        </div>
                        <div className="flex gap-4">
                          <span className="text-slate-600 select-none w-8 text-right dark:text-slate-500">3</span>
                        </div>
                        <div className="flex gap-4">
                          <span className="text-slate-600 select-none w-8 text-right dark:text-slate-500">4</span>
                          <span className="text-slate-400 dark:text-slate-300"># AI suggests: Use quantum annealing for optimization</span>
                        </div>
                        <div className="flex gap-4">
                          <span className="text-slate-600 select-none w-8 text-right dark:text-slate-500">5</span>
                          <span className="text-purple-400 dark:text-purple-300">async def</span>
                          <span className="text-emerald-300 dark:text-emerald-200">fold_protein</span>
                          <span className="text-slate-400 dark:text-slate-300">(</span>
                          <span className="text-orange-300 dark:text-orange-200">sequence</span>
                          <span className="text-slate-400 dark:text-slate-300">):</span>
                        </div>
                        <div className="flex gap-4">
                          <span className="text-slate-600 select-none w-8 text-right dark:text-slate-500">6</span>
                          <span className="ml-8 text-slate-300 dark:text-slate-400">quantum_circuit</span>
                          <span className="text-slate-400 dark:text-slate-300">=</span>
                          <span className="text-cyan-300 dark:text-cyan-200">qf</span>
                          <span className="text-slate-400 dark:text-slate-300">.</span>
                          <span className="text-emerald-300 dark:text-emerald-200">create_circuit</span>
                          <span className="text-slate-400 dark:text-slate-300">(</span>
                          <span className="text-orange-300 dark:text-orange-200">qubits</span>
                          <span className="text-slate-400 dark:text-slate-300">=</span>
                          <span className="text-fuchsia-300 dark:text-fuchsia-200">128</span>
                          <span className="text-slate-400 dark:text-slate-300">)</span>
                        </div>
                        <div className="flex gap-4">
                          <span className="text-slate-600 select-none w-8 text-right dark:text-slate-500">7</span>
                          <span className="ml-8 text-slate-300 dark:text-slate-400">folder</span>
                          <span className="text-slate-400 dark:text-slate-300">=</span>
                          <span className="text-yellow-300 dark:text-yellow-200">ProteinFolder</span>
                          <span className="text-slate-400 dark:text-slate-300">(</span>
                          <span className="text-slate-300 dark:text-slate-400">quantum_circuit</span>
                          <span className="text-slate-400 dark:text-slate-300">)</span>
                        </div>
                        <div className="flex gap-4">
                          <span className="text-slate-600 select-none w-8 text-right dark:text-slate-500">8</span>
                          <span className="ml-8 text-purple-400 dark:text-purple-300">return</span>
                          <span className="text-purple-400 dark:text-purple-300">await</span>
                          <span className="text-slate-300 dark:text-slate-200">folder</span>
                          <span className="text-slate-400 dark:text-slate-300">.</span>
                          <span className="text-emerald-300 dark:text-emerald-200">optimize</span>
                          <span className="text-slate-400 dark:text-slate-300">(</span>
                          <span className="text-orange-300 dark:text-orange-200">sequence</span>
                          <span className="text-slate-400 dark:text-slate-300">)</span>
                        </div>
                      </div>

                      {/* AI Suggestion */}
                      <div className="mt-6 rounded-2xl bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-purple-500/30 p-4 dark:border-purple-500/30 dark:bg-gradient-to-r dark:from-purple-600/10 dark:to-cyan-600/10">
                        <div className="flex items-center gap-2 text-xs text-purple-400 mb-2">
                          <FontAwesomeIcon icon={faWandMagicSparkles} className="animate-pulse" />
                          AI Co-Pilot Suggestion
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-300">
                          Consider adding error correction codes for quantum noise. Would you like me to implement QECC?
                        </p>
                      </div>
                    </div>

                    {/* Live Visualization */}
                    <div className="bg-white/90 dark:bg-[#050810] p-6 border border-slate-200/70 dark:border-white/10 text-slate-900 dark:text-white">
                      <div className="mb-4 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <FontAwesomeIcon icon={faEye} />
                        <span>Live Quantum Visualization</span>
                      </div>

                      {/* 3D Protein Viz Placeholder */}
                      <div className="relative aspect-video rounded-2xl bg-gradient-to-br from-white/80 via-slate-100 to-slate-200 border border-slate-200/60 overflow-hidden mb-4 shadow-inner dark:bg-gradient-to-br dark:from-purple-950/40 dark:via-slate-950 dark:to-cyan-950/40 dark:border-white/10">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="relative">
                            {/* Animated protein structure */}
                            <div className="w-32 h-32 relative animate-spin" style={{ animationDuration: '20s' }}>
                              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/40 to-cyan-500/40 blur-xl dark:from-purple-600/40 dark:to-cyan-500/40" />
                              {[...Array(8)].map((_, i) => (
                                <div
                                  key={i}
                                  className="absolute w-4 h-4 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500"
                                  style={{
                                    top: '50%',
                                    left: '50%',
                                    transform: `rotate(${i * 45}deg) translateY(-50px)`,
                                  }}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="absolute top-4 left-4 text-xs text-cyan-700 font-mono dark:text-cyan-300">
                          <div>Qubits: 128</div>
                          <div>Fidelity: 99.7%</div>
                          <div>States: Superposition</div>
                        </div>
                      </div>

                      {/* Metrics */}
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { label: 'Quantum Ops/s', value: '2.4M', icon: faAtom, color: 'from-cyan-500 to-blue-500' },
                          { label: 'Protein Accuracy', value: '94.2%', icon: faDna, color: 'from-emerald-500 to-teal-500' },
                          { label: 'GPU Utilization', value: '87%', icon: faChartArea, color: 'from-purple-500 to-fuchsia-500' },
                          { label: 'AI Confidence', value: '96.8%', icon: faBrain, color: 'from-orange-500 to-rose-500' },
                        ].map((metric) => (
                          <div key={metric.label} className="rounded-xl bg-white/90 border border-slate-200/60 p-3 backdrop-blur-sm dark:bg-white/5 dark:border-white/10">
                            <div className="flex items-center gap-2 mb-1">
                              <FontAwesomeIcon icon={metric.icon} className={`text-xs bg-gradient-to-r ${metric.color} bg-clip-text text-transparent`} />
                              <span className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-300">{metric.label}</span>
                            </div>
                            <div className="text-xl font-bold text-slate-900 dark:text-white">{metric.value}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Innovation Pillars */}
          <div className="grid md:grid-cols-2 gap-8 mb-24">
            {[
              {
                icon: faNetworkWired,
                title: 'Neural Environment System',
                description: 'Environments that think. Auto-configure dependencies, predict library conflicts, and manage containerization with AI-driven intelligence. Jupyter meets VS Code meets the future.',
                points: ['Self-healing dependencies', 'Predictive conflict resolution', 'One-click quantum environments', 'Cross-platform reproducibility'],
                gradient: 'from-purple-500 to-fuchsia-500',
              },
              {
                icon: faProjectDiagram,
                title: 'Temporal Code Navigation',
                description: 'Git reimagined. See your code evolve in 4D. Visual timeline of every change, AI-explained commit history, and parallel universe branching for testing "what-if" scenarios.',
                points: ['4D code timeline visualization', 'AI commit archaeology', 'Parallel universe branches', 'Automatic conflict resolution'],
                gradient: 'from-purple-500 to-rose-500',
              },
              {
                icon: faDatabase,
                title: 'Infinite Data Canvas',
                description: 'Work with petabyte-scale datasets as easily as Excel. Stream data from anywhere, visualize in real-time, and apply transformations that compile to optimized distributed compute.',
                points: ['Petabyte-scale data handling', 'Real-time stream processing', 'Visual ETL pipelines', 'Auto-optimizing queries'],
                gradient: 'from-amber-500 to-fuchsia-500',
              },
              {
                icon: faLightbulb,
                title: 'Collaborative Intelligence',
                description: 'Multiplayer coding evolved. See teammates\' cursors, thoughts, and AI suggestions in real-time. Pair programming with AI mediators that understand team dynamics and suggest compromises.',
                points: ['Real-time collaborative debugging', 'AI team mediator', 'Shared consciousness mode', 'Live knowledge synthesis'],
                gradient: 'from-pink-500 to-purple-600',
              },
            ].map((pillar, i) => (
              <ScrollReveal key={pillar.title} delay={i * 100}>
              <div className="group relative">
                {/* Subtle glow effect */}
                <div className="absolute -inset-0.5 bg-gradient-to-br from-purple-200/40 via-purple-100/40 to-white/60 rounded-3xl opacity-80 blur-2xl pointer-events-none transition-opacity duration-500 group-hover:opacity-100 dark:from-black/70 dark:via-purple-950/70 dark:to-black/60" />

                <div
                  className="relative bg-white/90 border border-slate-200/70 rounded-3xl p-8 backdrop-blur-3xl hover:border-slate-300 transition-all duration-250 ease-out text-slate-900 shadow-lg dark:bg-black/90 dark:border-purple-900/60 dark:text-white dark:shadow-[0_10px_40px_-10px_rgba(147,51,234,0.3)]"
                >
                    <div className="flex items-start gap-4 mb-6">
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${pillar.gradient} flex items-center justify-center flex-shrink-0 shadow-xl group-hover:shadow-2xl transition-shadow duration-500 dark:shadow-[0_20px_50px_-12px_rgba(147,51,234,0.4)] dark:group-hover:shadow-[0_25px_60px_-15px_rgba(147,51,234,0.5)]`}>
                        <FontAwesomeIcon icon={pillar.icon} className="text-2xl text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{pillar.title}</h3>
                        <div className={`h-1 w-16 rounded-full bg-gradient-to-r ${pillar.gradient}`} />
                      </div>
                    </div>

                    <p className="text-slate-700 dark:text-slate-200 mb-6 leading-relaxed">{pillar.description}</p>

                    <div className="grid grid-cols-2 gap-3">
                      {pillar.points.map((point, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2 bg-white/90 rounded-xl p-3 border border-slate-200/70 hover:border-slate-300 transition-colors text-slate-700 dark:bg-slate-900/90 dark:border-slate-800/60 dark:text-slate-100"
                        >
                          <FontAwesomeIcon icon={faCheck} className={`text-xs mt-0.5 bg-gradient-to-r ${pillar.gradient} bg-clip-text text-transparent flex-shrink-0`} />
                          <span className="text-sm">{point}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>

          {/* Use Cases Showcase */}
          <ScrollReveal>
            <div className="text-center mb-16">
              <h3 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900 dark:text-white">
                <span className="bg-gradient-to-r from-slate-900 via-purple-600 to-fuchsia-500 bg-clip-text text-transparent">
                  One IDE. Infinite Possibilities.
                </span>
              </h3>
              <p className="text-xl text-slate-700 max-w-3xl mx-auto">
                From building apps to discovering new physics. All in the same environment.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4 mb-20">
            {[
              {
                icon: faCode,
                label: 'Full-Stack Development',
                desc: 'React, Node, Python, Go',
                color: 'from-purple-600 to-purple-500',
                stats: '2M+ devs'
              },
              {
                icon: faBrain,
                label: 'ML/AI Research',
                desc: 'PyTorch, TensorFlow, JAX',
                color: 'from-fuchsia-500 to-pink-500',
                stats: '500K+ researchers'
              },
              {
                icon: faDna,
                label: 'Biotech Research',
                desc: 'AlphaFold, CRISPR, Genomics',
                color: 'from-rose-500 to-amber-500',
                stats: '100K+ scientists'
              },
              {
                icon: faAtom,
                label: 'Quantum Computing',
                desc: 'Qiskit, Cirq, Q#',
                color: 'from-purple-500 to-fuchsia-500',
                stats: '50K+ quantum devs'
              },
              {
                icon: faWaveSquare,
                label: 'Physics Modeling',
                desc: 'COMSOL, FEniCS, OpenFOAM',
                color: 'from-amber-500 to-rose-500',
                stats: '200K+ physicists'
              },
              {
                icon: faChartArea,
                label: 'Data Science',
                desc: 'Pandas, Spark, Dask',
                color: 'from-rose-500 to-purple-700',
                stats: '3M+ analysts'
              },
              {
                icon: faMicroscope,
                label: 'Scientific Computing',
                desc: 'NumPy, SciPy, Julia',
                color: 'from-indigo-700 to-purple-600',
                stats: '1M+ scientists'
              },
              {
                icon: faProjectDiagram,
                label: 'Systems Architecture',
                desc: 'Kubernetes, Docker, Terraform',
                color: 'from-slate-700 to-slate-900',
                stats: '800K+ architects'
              },
              {
                icon: faCogs,
                label: 'DevOps & Cloud',
                desc: 'AWS, GCP, Azure',
                color: 'from-purple-700 to-fuchsia-600',
                stats: '2.5M+ engineers'
              },
              {
                icon: faRocket,
                label: 'Startup MVP',
                desc: 'Rapid prototyping & scaling',
                color: 'from-rose-600 to-pink-600',
                stats: '400K+ startups'
              },
            ].map((useCase, i) => (
              <ScrollReveal key={useCase.label} delay={i * 50}>
                <div className="group relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-200/30 via-purple-100/40 to-white/60 rounded-2xl blur-3xl opacity-70 pointer-events-none transition-opacity duration-500 group-hover:opacity-100 dark:from-black/80 dark:via-purple-900/60 dark:to-black" />

                  <div className="relative bg-white/95 border border-slate-200/70 rounded-2xl p-6 hover:border-slate-300 transition-all duration-250 ease-out backdrop-blur-sm h-full flex flex-col shadow-lg text-slate-900 dark:bg-black/90 dark:border-purple-900/60 dark:text-white dark:shadow-[0_10px_40px_-10px_rgba(147,51,234,0.3)]">
                    <div className={`w-16 h-16 mb-4 rounded-xl bg-gradient-to-br ${useCase.color} flex items-center justify-center transform group-hover:scale-105 transition-transform duration-300 shadow-lg dark:shadow-[0_10px_30px_-5px_rgba(147,51,234,0.4)]`}>
                      <FontAwesomeIcon icon={useCase.icon} className="text-2xl text-white" />
                    </div>

                    <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2">{useCase.label}</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mb-3 flex-grow">{useCase.desc}</p>

                    <div className="flex items-center gap-2 pt-3 border-t border-purple-900/60">
                      <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${useCase.color}`} />
                      <span className="text-[10px] text-slate-600 uppercase tracking-wider dark:text-slate-300">{useCase.stats}</span>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>

          {/* CTA Section */}
          <ScrollReveal>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-200/40 via-purple-100/50 to-white/80 rounded-[48px] blur-[120px] dark:from-black/70 dark:via-purple-900/60 dark:to-black/90" />

              <div className="relative bg-white/95 border border-slate-200/70 rounded-[48px] p-12 md:p-16 text-center backdrop-blur-2xl shadow-2xl text-slate-900 dark:bg-black/90 dark:border-purple-900/40 dark:text-white">
                <h3 className="text-4xl md:text-5xl font-bold mb-6">
                  The Future of Development
                  <br />
                  <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
                    Starts Now
                  </span>
                </h3>
                <p className="text-xl text-slate-700 mb-10 max-w-2xl mx-auto dark:text-slate-200">
                  Join the waitlist for early access to 4SPACE Lab. Be among the first to experience the IDE that will change everything.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link to="/signup">
                    <button className="group px-10 py-5 rounded-full font-bold text-lg bg-gradient-to-r from-purple-900 via-purple-800 to-black text-white shadow-2xl shadow-purple-900/50 hover:shadow-purple-900/70 transition-all duration-300 transform hover:scale-105">
                      Join Waitlist
                      <FontAwesomeIcon icon={faArrowRight} className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </Link>
                  <button className="px-10 py-5 rounded-full font-bold text-lg border-2 border-white/40 text-slate-900 hover:bg-white/10 transition-all duration-300 dark:text-white">
                    Watch Demo
                  </button>
                </div>

                <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faCheck} className="text-emerald-400" />
                    Free for researchers
                  </div>
                  <div className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faCheck} className="text-emerald-400" />
                    Open-source core
                  </div>
                  <div className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faCheck} className="text-emerald-400" />
                    Cloud + Local
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>


      {/* Features Section */}
      <section className="relative py-32 bg-gradient-to-b from-slate-50 via-white to-slate-100 dark:bg-gradient-to-b dark:from-gray-900 dark:via-black dark:to-gray-900 overflow-hidden">
        {/* Animated grid background */}
        <div className="absolute inset-0 opacity-30 dark:opacity-20">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(6, 182, 212, 0.1) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(6, 182, 212, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: '60px 60px',
              transform: `translateY(${scrollY * 0.1}px)`,
            }}
          />
        </div>

        {/* Glow orbs that follow scroll */}
        <div
          className="absolute w-96 h-96 bg-cyan-500/20 dark:bg-cyan-400/30 rounded-full blur-[150px]"
          style={{
            top: `${20 + scrollY * 0.05}%`,
            left: `${10 + Math.sin(scrollY * 0.001) * 20}%`,
            transition: 'all 0.3s ease-out'
          }}
        />
        <div
          className="absolute w-96 h-96 bg-purple-500/20 dark:bg-purple-400/30 rounded-full blur-[150px]"
          style={{
            bottom: `${20 + scrollY * 0.03}%`,
            right: `${10 + Math.cos(scrollY * 0.001) * 20}%`,
            transition: 'all 0.3s ease-out'
          }}
        />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
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
                <div
                  className="group bg-gradient-to-b from-white/90 to-slate-100 backdrop-blur-sm rounded-2xl p-8 border border-slate-200/70 hover:border-slate-300 transition-all duration-500 h-full shadow-sm dark:from-black/90 dark:via-slate-900/80 dark:to-black/90 dark:bg-black/90 dark:border-white/10 dark:shadow-[0_2px_15px_-3px_rgba(147,51,234,0.2)] card-3d"
                  style={{
                    transformStyle: 'preserve-3d',
                    transform: 'perspective(1000px)'
                  }}
                  onMouseMove={(e) => {
                    const card = e.currentTarget;
                    const rect = card.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    const centerX = rect.width / 2;
                    const centerY = rect.height / 2;
                    const rotateX = (y - rect.height / 2) / 30;
                    const rotateY = (rect.width / 2 - x) / 30;
                    const isDark = document.documentElement.classList.contains('dark');
                    card.style.transition = 'transform 0.12s cubic-bezier(0.23, 1, 0.32, 1), box-shadow 0.12s cubic-bezier(0.23, 1, 0.32, 1)';
                    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(15px)`;
                    card.style.boxShadow = isDark
                      ? '0 10px 30px rgba(147, 51, 234, 0.3), 0 0 20px rgba(147, 51, 234, 0.2), inset 0 0 30px rgba(147, 51, 234, 0.1)'
                      : '0 10px 30px rgba(139, 92, 246, 0.15), 0 0 20px rgba(6, 182, 212, 0.1), inset 0 0 30px rgba(255, 255, 255, 0.1)';
                    card.style.border = '1px solid rgba(139, 92, 246, 0.8)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1) translateZ(0)';
                    e.currentTarget.style.boxShadow = '';
                    e.currentTarget.style.border = '';
                  }}
                >
                  {/* Circuit-board style corner accents */}
                  <div className="absolute top-2 left-2 w-4 h-4">
                    <div className="absolute top-0 left-0 w-2 h-2 border-l-2 border-t-2 border-cyan-400/60 rounded-tl" />
                    <div className="absolute top-0 left-1 w-1 h-0.5 bg-cyan-400/40" />
                    <div className="absolute top-1 left-0 w-0.5 h-1 bg-cyan-400/40" />
                  </div>
                  <div className="absolute top-2 right-2 w-4 h-4">
                    <div className="absolute top-0 right-0 w-2 h-2 border-r-2 border-t-2 border-purple-400/60 rounded-tr" />
                    <div className="absolute top-0 right-1 w-1 h-0.5 bg-purple-400/40" />
                    <div className="absolute top-1 right-0 w-0.5 h-1 bg-purple-400/40" />
                  </div>

                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 transform group-hover:scale-110 transition-transform duration-300 shadow-lg group-hover:shadow-2xl dark:shadow-[0_10px_30px_-5px_rgba(147,51,234,0.4)] dark:group-hover:shadow-[0_25px_50px_-12px_rgba(147,51,234,0.5)]`}>
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
      <section className="relative py-32 bg-slate-50 dark:bg-black overflow-hidden">
        {/* Diagonal grid pattern */}
        <div className="absolute inset-0 opacity-20 dark:opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(45deg, rgba(139, 92, 246, 0.15) 1px, transparent 1px),
                linear-gradient(-45deg, rgba(139, 92, 246, 0.15) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px',
            }}
          />
        </div>
        <div className="max-w-7xl mx-auto px-6 relative">
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
                <div
                  className="relative"
                  style={{ transformStyle: 'preserve-3d' }}
                  onMouseMove={(e) => {
                    const card = e.currentTarget;
                    const rect = card.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    const rotateX = (y - rect.height / 2) / 30;
                    const rotateY = (rect.width / 2 - x) / 30;
                    card.style.transition = 'transform 0.12s cubic-bezier(0.23, 1, 0.32, 1)';
                    card.style.transform = `perspective(1500px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(15px)`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transition = 'transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)';
                    e.currentTarget.style.transform = 'perspective(1500px)';
                  }}
                >
                  {/* Chip-like corner decorations */}
                  <div className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 border-purple-400/50 rounded-tl-lg" />
                  <div className="absolute top-0 right-0 w-3 h-3 border-r-2 border-t-2 border-purple-400/50 rounded-tr-lg" />
                  <div className="absolute bottom-0 left-0 w-3 h-3 border-l-2 border-b-2 border-cyan-400/50 rounded-bl-lg" />
                  <div className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 border-cyan-400/50 rounded-br-lg" />

                  <div className={`text-8xl font-bold mb-6 bg-gradient-to-r ${step.color} bg-clip-text text-transparent opacity-20`}>
                    {step.step}
                  </div>
                  <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-6 shadow-2xl transform hover:scale-110 transition-transform duration-300 dark:shadow-[0_25px_50px_-12px_rgba(147,51,234,0.4)]`}>
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
      <section className="relative py-32 bg-gradient-to-b from-slate-50 via-white to-slate-100 dark:bg-gradient-to-b dark:from-black dark:via-gray-900 dark:to-black overflow-hidden">
        {/* Hexagonal grid pattern */}
        <div className="absolute inset-0 opacity-15 dark:opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                radial-gradient(circle at center, rgba(219, 39, 119, 0.2) 1px, transparent 1px)
              `,
              backgroundSize: '30px 30px',
            }}
          />
        </div>
        <div className="max-w-7xl mx-auto px-6 relative">
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
              <div
                className="bg-gradient-to-b from-white/90 to-slate-100 border border-slate-200/70 backdrop-blur-sm rounded-2xl overflow-hidden hover:border-slate-300 transition-all duration-500 group cursor-pointer shadow-sm dark:from-black/90 dark:via-black/80 dark:to-black/90 dark:bg-black/90 dark:border-white/20 dark:shadow-[0_2px_15px_-3px_rgba(147,51,234,0.2)]"
                style={{ transformStyle: 'preserve-3d' }}
                onMouseMove={(e) => {
                  const card = e.currentTarget;
                  const rect = card.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const y = e.clientY - rect.top;
                  const rotateX = (y - rect.height / 2) / 30;
                  const rotateY = (rect.width / 2 - x) / 30;
                  card.style.transition = 'transform 0.12s cubic-bezier(0.23, 1, 0.32, 1)';
                  card.style.transform = `perspective(1500px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(15px)`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transition = 'transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)';
                  e.currentTarget.style.transform = 'perspective(1500px)';
                }}
              >
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
      <section className="relative py-32 bg-slate-50 dark:bg-black overflow-hidden">
        {/* Circuit-style grid pattern */}
        <div className="absolute inset-0 opacity-15 dark:opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(34, 197, 94, 0.2) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(34, 197, 94, 0.2) 1px, transparent 1px)
              `,
              backgroundSize: '40px 40px',
            }}
          />
        </div>
        <div className="max-w-7xl mx-auto px-6 relative">
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
                <div
                  className="bg-white/95 rounded-xl p-6 border border-slate-200/70 hover:border-slate-300 transition-all duration-300 shadow-sm dark:bg-black/90 dark:border-white/10 dark:shadow-[0_2px_15px_-3px_rgba(147,51,234,0.2)]"
                  style={{ transformStyle: 'preserve-3d' }}
                  onMouseMove={(e) => {
                    const card = e.currentTarget;
                    const rect = card.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    const rotateX = (y - rect.height / 2) / 30;
                    const rotateY = (rect.width / 2 - x) / 30;
                    card.style.transition = 'transform 0.12s cubic-bezier(0.23, 1, 0.32, 1)';
                    card.style.transform = `perspective(1500px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(15px)`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transition = 'transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)';
                    e.currentTarget.style.transform = 'perspective(1500px)';
                  }}
                >
                  <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.iconBg} shadow-lg dark:shadow-[0_10px_30px_-5px_rgba(147,51,234,0.4)]`}>
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
      <section className="relative py-32 bg-gradient-to-b from-slate-50 via-white to-slate-100 dark:bg-gradient-to-b dark:from-black dark:via-gray-900 dark:to-black overflow-hidden">
        {/* Cross-hatch grid pattern */}
        <div className="absolute inset-0 opacity-15 dark:opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(45deg, rgba(99, 102, 241, 0.15) 1px, transparent 1px),
                linear-gradient(-45deg, rgba(99, 102, 241, 0.15) 1px, transparent 1px)
              `,
              backgroundSize: '35px 35px',
            }}
          />
        </div>
        <div className="max-w-7xl mx-auto px-6 relative">
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
              <div
                className="bg-gradient-to-br from-slate-100 to-white rounded-3xl p-10 border border-slate-200/60 backdrop-blur-sm shadow-sm dark:from-black/90 dark:via-black/80 dark:to-black/90 dark:bg-black/90 dark:border-white/10 dark:shadow-[0_2px_15px_-3px_rgba(147,51,234,0.2)]"
                style={{ transformStyle: 'preserve-3d' }}
                onMouseMove={(e) => {
                  const card = e.currentTarget;
                  const rect = card.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const y = e.clientY - rect.top;
                  const rotateX = (y - rect.height / 2) / 30;
                  const rotateY = (rect.width / 2 - x) / 30;
                  card.style.transition = 'transform 0.12s cubic-bezier(0.23, 1, 0.32, 1)';
                  card.style.transform = `perspective(1500px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(15px)`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transition = 'transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)';
                  e.currentTarget.style.transform = 'perspective(1500px)';
                }}
              >
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-8 shadow-2xl dark:shadow-[0_25px_50px_-12px_rgba(147,51,234,0.4)]">
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
              <div
                className="bg-gradient-to-br from-slate-100 to-white rounded-3xl p-10 border border-slate-200/60 backdrop-blur-sm shadow-sm dark:from-black/90 dark:via-black/80 dark:to-black/90 dark:bg-black/90 dark:border-white/10 dark:shadow-[0_2px_15px_-3px_rgba(147,51,234,0.2)]"
                style={{ transformStyle: 'preserve-3d' }}
                onMouseMove={(e) => {
                  const card = e.currentTarget;
                  const rect = card.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const y = e.clientY - rect.top;
                  const rotateX = (y - rect.height / 2) / 30;
                  const rotateY = (rect.width / 2 - x) / 30;
                  card.style.transition = 'transform 0.12s cubic-bezier(0.23, 1, 0.32, 1)';
                  card.style.transform = `perspective(1500px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(15px)`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transition = 'transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)';
                  e.currentTarget.style.transform = 'perspective(1500px)';
                }}
              >
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mb-8 shadow-2xl dark:shadow-[0_25px_50px_-12px_rgba(147,51,234,0.4)]">
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
      <section className="relative py-32 bg-slate-50 dark:bg-black overflow-hidden">
        {/* Scattered dot grid pattern */}
        <div className="absolute inset-0 opacity-15 dark:opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                radial-gradient(circle, rgba(234, 179, 8, 0.3) 1px, transparent 1px)
              `,
              backgroundSize: '25px 25px',
            }}
          />
        </div>
        <div className="max-w-7xl mx-auto px-6 relative">
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
                <div
                  className="bg-gradient-to-b from-white/90 via-slate-100 to-slate-100 rounded-2xl p-8 border border-slate-200/70 hover:border-slate-300 transition-all duration-300 shadow-sm dark:from-black/90 dark:via-black/80 dark:to-black/90 dark:bg-black/90 dark:border-white/10 dark:shadow-[0_2px_15px_-3px_rgba(147,51,234,0.2)]"
                  style={{ transformStyle: 'preserve-3d' }}
                  onMouseMove={(e) => {
                    const card = e.currentTarget;
                    const rect = card.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    const rotateX = (y - rect.height / 2) / 30;
                    const rotateY = (rect.width / 2 - x) / 30;
                    card.style.transition = 'transform 0.12s cubic-bezier(0.23, 1, 0.32, 1)';
                    card.style.transform = `perspective(1500px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(15px)`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transition = 'transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)';
                    e.currentTarget.style.transform = 'perspective(1500px)';
                  }}
                >
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

        @keyframes spinGlobe {
          from { transform: rotateY(0deg) rotateX(60deg); }
          to { transform: rotateY(360deg) rotateX(60deg); }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        @keyframes dashArray {
          0% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: -30; }
        }

        .card-3d {
          transition: transform 0.1s ease-out, box-shadow 0.3s ease-out;
        }

        .card-3d:hover {
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3), 0 0 40px rgba(34, 211, 238, 0.2);
        }
      `}</style>
    </div>
  );
}
