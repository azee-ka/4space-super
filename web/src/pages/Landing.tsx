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
  faCircleNodes
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

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10 transition-all duration-300">
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
                <button className="px-6 py-2 rounded-lg font-medium text-gray-300 hover:text-white transition-all duration-300">
                  Sign In
                </button>
              </Link>
              <Link to="/signup">
                <button className="px-6 py-2 rounded-lg font-medium bg-white text-black hover:bg-gray-200 transition-all duration-300 transform hover:scale-105">
                  Get Started
                </button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
        <div
          className="absolute inset-0 z-0 transition-transform duration-100"
          style={{
            transform: `translate(${mouseParallaxX}px, ${mouseParallaxY}px) translateY(${parallaxOffset}px)`
          }}
        >
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-600/30 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-purple-600/30 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute bottom-1/4 left-1/2 w-[500px] h-[500px] bg-pink-600/30 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
          <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 animate-fade-in backdrop-blur-sm">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-sm text-gray-300">Now Available Worldwide</span>
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

          <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            Bring your team together with spaces designed for collaboration.
            Chat, files, notes, tasks, calendar, and boards—all in one powerful platform.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
            <Link to="/signup">
              <button className="px-8 py-4 rounded-lg font-semibold bg-white text-black hover:bg-gray-200 transition-all duration-300 flex items-center gap-2 transform hover:scale-105 shadow-lg hover:shadow-xl">
                Start for Free
                <FontAwesomeIcon icon={faArrowRight} className="transition-transform group-hover:translate-x-1" />
              </button>
            </Link>
            <button className="px-8 py-4 rounded-lg font-semibold border border-white/20 text-white hover:bg-white/5 transition-all duration-300 transform hover:scale-105">
              Watch Demo
            </button>
          </div>

          {/* Hero Demo Card */}
          <ScaleReveal delay={600}>
            <div className="relative max-w-5xl mx-auto">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur-3xl opacity-20 animate-pulse" />
              <div className="relative bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-xl rounded-3xl border border-white/20 p-1 shadow-2xl transform hover:scale-[1.02] transition-all duration-500">
                <div className="bg-black rounded-2xl overflow-hidden">
                  <div className="bg-gradient-to-b from-gray-900 to-black p-8">
                    <div className="flex items-center gap-2 mb-6">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {[
                        { icon: faComments, label: 'Messages', color: 'from-blue-500 to-cyan-500', count: '247', trend: '+12%' },
                        { icon: faFolder, label: 'Files', color: 'from-purple-500 to-pink-500', count: '1.2K', trend: '+8%' },
                        { icon: faNoteSticky, label: 'Notes', color: 'from-orange-500 to-yellow-500', count: '143', trend: '+15%' },
                        { icon: faListCheck, label: 'Tasks', color: 'from-green-500 to-emerald-500', count: '89', trend: '+5%' },
                        { icon: faCalendarDays, label: 'Events', color: 'from-pink-500 to-rose-500', count: '24', trend: '+3%' },
                        { icon: faTableColumns, label: 'Boards', color: 'from-indigo-500 to-blue-500', count: '12', trend: '+2%' },
                      ].map((item, i) => (
                        <div
                          key={i}
                          className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-white/30 transition-all duration-300 group cursor-pointer transform hover:scale-105"
                          style={{ animationDelay: `${i * 100}ms` }}
                        >
                          <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center mb-3 transform group-hover:scale-110 transition-transform duration-300`}>
                            <FontAwesomeIcon icon={item.icon} className="text-white text-xl" />
                          </div>
                          <div className="flex items-baseline justify-between mb-1">
                            <span className="text-sm font-medium text-gray-300">{item.label}</span>
                            <span className="text-xs text-green-400">{item.trend}</span>
                          </div>
                          <div className="text-2xl font-bold">{item.count}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ScaleReveal>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-20 bg-gradient-to-b from-black to-gray-900">
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
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 mb-4 transform group-hover:scale-110 transition-transform duration-300">
                    <FontAwesomeIcon icon={stat.icon} className="text-3xl bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent" />
                  </div>
                  <div className="text-4xl font-bold mb-2 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">{stat.value}</div>
                  <div className="text-gray-400">{stat.label}</div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-32 bg-gradient-to-b from-gray-900 via-black to-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          <ScrollReveal>
            <div className="text-center mb-20">
              <div className="inline-block px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6">
                <span className="text-sm font-medium text-blue-400">POWERFUL FEATURES</span>
              </div>
              <h2 className="text-5xl md:text-7xl font-bold mb-6">
                Everything you need.
                <br />
                <span className="text-gray-500">All in one place.</span>
              </h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
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
                <div className="group bg-gradient-to-b from-white/5 to-white/0 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-white/30 transition-all duration-500 h-full transform hover:-translate-y-2">
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 transform group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <FontAwesomeIcon icon={feature.icon} className="text-white text-2xl" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                  <p className="text-gray-400 leading-relaxed mb-6">{feature.description}</p>
                  <ul className="space-y-2">
                    {feature.features.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-gray-500">
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
      <section className="relative py-32 bg-black">
        <div className="max-w-7xl mx-auto px-6">
          <ScrollReveal>
            <div className="text-center mb-20">
              <div className="inline-block px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-6">
                <span className="text-sm font-medium text-purple-400">HOW IT WORKS</span>
              </div>
              <h2 className="text-5xl md:text-7xl font-bold mb-6">
                Seamless workflow.
                <br />
                <span className="text-gray-500">From start to finish.</span>
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
                  <p className="text-gray-400 leading-relaxed text-lg">{step.description}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Spaces Demo Section */}
      <section className="relative py-32 bg-gradient-to-b from-black via-gray-900 to-black">
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
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
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
                <div className="bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden hover:border-white/40 transition-all duration-500 group cursor-pointer transform hover:scale-105">
                  <div className={`h-40 bg-gradient-to-br ${space.color} relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-black/30" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
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
                    <div className="flex items-center gap-2 mb-4 text-sm text-gray-400">
                      <FontAwesomeIcon icon={faUsers} />
                      <span>{space.members} members</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <div className="text-2xl font-bold">{space.messages.toLocaleString()}</div>
                        <div className="text-xs text-gray-400">Messages</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{space.files}</div>
                        <div className="text-xs text-gray-400">Files</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{space.tasks}</div>
                        <div className="text-xs text-gray-400">Tasks</div>
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
      <section className="relative py-32 bg-black">
        <div className="max-w-7xl mx-auto px-6">
          <ScrollReveal>
            <div className="text-center mb-20">
              <div className="inline-block px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 mb-6">
                <span className="text-sm font-medium text-green-400">ADVANCED CAPABILITIES</span>
              </div>
              <h2 className="text-5xl md:text-7xl font-bold mb-6">
                Built for performance.
                <br />
                <span className="text-gray-500">Designed for scale.</span>
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: faLock, title: 'End-to-End Encrypted', description: 'Military-grade encryption protects your data' },
              { icon: faBolt, title: 'Lightning Fast', description: 'Optimized for speed with instant sync' },
              { icon: faCloud, title: 'Cloud Native', description: 'Access anywhere, anytime, any device' },
              { icon: faMobileScreen, title: 'Mobile Apps', description: 'Native iOS and Android applications' },
              { icon: faShieldHalved, title: 'Enterprise Security', description: 'SOC 2 Type II compliant infrastructure' },
              { icon: faGauge, title: 'Real-time Sync', description: 'Changes appear instantly everywhere' },
              { icon: faSearch, title: 'Global Search', description: 'Find anything across all your spaces' },
              { icon: faTags, title: 'Smart Tags', description: 'Organize with custom tags and labels' },
              { icon: faChartPie, title: 'Analytics', description: 'Insights into team productivity' },
              { icon: faClockRotateLeft, title: 'Version History', description: 'Never lose work with full history' },
              { icon: faWandMagicSparkles, title: 'AI-Powered', description: 'Smart suggestions and automation' },
              { icon: faCircleNodes, title: 'Integrations', description: 'Connect with 100+ tools' },
              { icon: faFingerprint, title: '2FA Security', description: 'Multi-factor authentication built-in' },
              { icon: faGlobe, title: 'Multi-language', description: 'Available in 20+ languages' },
              { icon: faFileArrowDown, title: 'Bulk Export', description: 'Export all your data anytime' },
              { icon: faInfinity, title: 'Unlimited Spaces', description: 'Create as many as you need' },
            ].map((feature, i) => (
              <ScrollReveal key={i} delay={(i % 4) * 50}>
                <div className="bg-gradient-to-b from-white/5 to-white/0 rounded-xl p-6 border border-white/10 hover:border-white/30 transition-all duration-300 transform hover:-translate-y-1">
                  <FontAwesomeIcon
                    icon={feature.icon}
                    className="text-3xl mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
                  />
                  <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-400">{feature.description}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="relative py-32 bg-gradient-to-b from-black via-gray-900 to-black">
        <div className="max-w-7xl mx-auto px-6">
          <ScrollReveal>
            <div className="text-center mb-20">
              <div className="inline-block px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-6">
                <span className="text-sm font-medium text-indigo-400">USE CASES</span>
              </div>
              <h2 className="text-5xl md:text-7xl font-bold mb-6">
                Perfect for every team.
                <br />
                <span className="text-gray-500">And every individual.</span>
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-12">
            <ScrollReveal direction="left">
              <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-3xl p-10 border border-blue-500/20 backdrop-blur-sm">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-8 shadow-2xl">
                  <FontAwesomeIcon icon={faUsers} className="text-white text-3xl" />
                </div>
                <h3 className="text-4xl font-bold mb-6">For Teams</h3>
                <p className="text-gray-400 mb-8 text-lg">
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
                      <span className="text-gray-300 text-lg">{item.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="right">
              <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-3xl p-10 border border-purple-500/20 backdrop-blur-sm">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mb-8 shadow-2xl">
                  <FontAwesomeIcon icon={faRocket} className="text-white text-3xl" />
                </div>
                <h3 className="text-4xl font-bold mb-6">For Individuals</h3>
                <p className="text-gray-400 mb-8 text-lg">
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
                      <span className="text-gray-300 text-lg">{item.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative py-32 bg-black">
        <div className="max-w-7xl mx-auto px-6">
          <ScrollReveal>
            <div className="text-center mb-20">
              <div className="inline-block px-4 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/20 mb-6">
                <span className="text-sm font-medium text-yellow-400">TESTIMONIALS</span>
              </div>
              <h2 className="text-5xl md:text-7xl font-bold mb-6">
                Loved by teams
                <br />
                <span className="text-gray-500">around the world.</span>
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
                <div className="bg-gradient-to-b from-white/5 to-white/0 rounded-2xl p-8 border border-white/10 hover:border-white/30 transition-all duration-300">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <FontAwesomeIcon key={i} icon={faStar} className="text-yellow-400 text-sm" />
                    ))}
                  </div>
                  <p className="text-gray-300 mb-6 text-lg leading-relaxed">"{testimonial.quote}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600" />
                    <div>
                      <div className="font-bold">{testimonial.author}</div>
                      <div className="text-sm text-gray-400">{testimonial.role} at {testimonial.company}</div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-32 bg-gradient-to-b from-black via-gray-900 to-black">
        <div className="max-w-5xl mx-auto px-6">
          <ScrollReveal>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl blur-3xl opacity-30 animate-pulse" />
              <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-16 border border-white/20 text-center">
                <h2 className="text-5xl md:text-7xl font-bold mb-6">
                  Ready to get started?
                </h2>
                <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                  Join thousands of teams and individuals who've unified their digital workspace with 4SPACE.
                  Start organizing smarter today.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
                  <Link to="/signup">
                    <button className="px-12 py-5 rounded-lg font-bold text-xl bg-white text-black hover:bg-gray-200 transition-all duration-300 flex items-center gap-3 transform hover:scale-105 shadow-2xl">
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
      <footer className="relative border-t border-white/10 py-16 bg-black">
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
              <p className="text-gray-400 text-sm">
                Your unified digital workspace for everything that matters.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">GDPR</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-gray-500 text-sm">© 2024 4Space. All rights reserved.</div>
            <div className="flex gap-6">
              {[faGlobe, faUsers, faChartLine].map((icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all duration-300"
                >
                  <FontAwesomeIcon icon={icon} className="text-gray-400 hover:text-white transition-colors" />
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
