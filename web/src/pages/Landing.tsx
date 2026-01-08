import React from 'react';
import { Link } from 'react-router-dom';
import { ThemeToggle } from '../components/ui/ThemeToggle';

export function Landing() {
  return (
    <div className="min-h-screen gradient-bg relative overflow-hidden bg-black">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center glow">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <span className="text-2xl font-bold text-gradient">4SPACE</span>
            </div>
            
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Link to="/login">
                <button className="glass px-6 py-2 rounded-xl font-medium hover:bg-white/10 transition-all">
                  Sign In
                </button>
              </Link>
              <Link to="/signup">
                <button className="gradient-primary px-6 py-2 rounded-xl font-medium text-white glow hover:glow-strong transition-all">
                  Get Started
                </button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-24">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-block mb-6 glass px-4 py-2 rounded-full text-sm font-medium">
            <span className="text-gradient-glow">Next Generation Digital Workspace</span>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
            Your Digital Space,
            <br />
            <span className="text-gradient">Infinitely Organized</span>
          </h1>
          
          <p className="text-xl text-slate-400 dark:text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            Create unlimited spaces for every aspect of your life. Secure, encrypted, and beautifully designed. 
            Collaborate seamlessly or work privately—your choice, your control.
          </p>

          <div className="flex items-center justify-center gap-4 mb-16">
            <Link to="/signup">
              <button className="gradient-primary px-8 py-4 rounded-xl font-semibold text-white glow hover:glow-strong transition-all transform hover:scale-105">
                Start Free
              </button>
            </Link>
            <button className="glass px-8 py-4 rounded-xl font-semibold hover:bg-white/10 transition-all">
              Watch Demo
            </button>
          </div>

          {/* Feature cards */}
          <div className="grid md:grid-cols-3 gap-6 mt-20">
            <div className="glass rounded-2xl p-8 hover:bg-white/10 transition-all group">
              <div className="w-14 h-14 rounded-xl gradient-bg flex items-center justify-center mb-4 group-hover:glow transition-all">
                <svg className="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">End-to-End Encrypted</h3>
              <p className="text-slate-400">Your data is encrypted before it leaves your device. We can't read it, and neither can anyone else.</p>
            </div>

            <div className="glass rounded-2xl p-8 hover:bg-white/10 transition-all group">
              <div className="w-14 h-14 rounded-xl gradient-bg flex items-center justify-center mb-4 group-hover:glow transition-all">
                <svg className="w-7 h-7 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Real-Time Sync</h3>
              <p className="text-slate-400">Messages and files sync instantly across all your devices. Stay connected, stay productive.</p>
            </div>

            <div className="glass rounded-2xl p-8 hover:bg-white/10 transition-all group">
              <div className="w-14 h-14 rounded-xl gradient-bg flex items-center justify-center mb-4 group-hover:glow transition-all">
                <svg className="w-7 h-7 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Infinite Flexibility</h3>
              <p className="text-slate-400">Create spaces for anything. Personal vaults, team projects, portfolios—your imagination is the limit.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-24 border-t border-white/10">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Everything You Need</h2>
          <p className="text-xl text-slate-400">One platform, unlimited possibilities</p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          <div className="glass-strong rounded-3xl p-12 scan-line">
            <h3 className="text-2xl font-bold mb-6 text-gradient">For Individuals</h3>
            <ul className="space-y-4">
              {[
                'Private vault for sensitive documents',
                'Personal journal with encryption',
                'Media library with intelligent organization',
                'Task management and planning',
                'Password manager integration'
              ].map((feature, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-slate-300">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="glass-strong rounded-3xl p-12 scan-line">
            <h3 className="text-2xl font-bold mb-6 text-gradient">For Teams</h3>
            <ul className="space-y-4">
              {[
                'Real-time collaboration on documents',
                'Encrypted team messaging',
                'File sharing with version control',
                'Project management boards',
                'Role-based access control'
              ].map((feature, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-slate-300">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 py-24">
        <div className="glass-strong rounded-3xl p-12 text-center holographic">
          <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-slate-400 mb-8">Join thousands organizing their digital lives</p>
          <Link to="/signup">
            <button className="gradient-primary px-10 py-4 rounded-xl font-semibold text-white text-lg glow-strong hover:scale-105 transition-all">
              Create Your Space
            </button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <span className="font-bold text-gradient">4SPACE</span>
            </div>
            <div className="text-slate-400 text-sm">
              © 2024 4Space. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}