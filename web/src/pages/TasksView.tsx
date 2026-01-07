import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { ThemeToggle } from '../components/ui/ThemeToggle';

export function TasksView() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen gradient-bg">
      <header className="border-b border-white/10 glass">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(`/spaces/${id}`)}
                className="glass w-10 h-10 rounded-xl flex items-center justify-center hover:bg-white/10 transition-all"
              >
                <FontAwesomeIcon icon={faArrowLeft} className="text-cyan-400" />
              </button>
              <h1 className="text-lg font-bold">Tasks</h1>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md">
            <h2 className="text-2xl font-bold mb-3">Tasks</h2>
            <p className="text-slate-400 mb-6">Coming soon!</p>
          </div>
        </div>
      </main>
    </div>
  );
}
