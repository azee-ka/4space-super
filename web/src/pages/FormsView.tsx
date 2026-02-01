import React, { useMemo, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faCircleCheck, faGaugeSimple } from '@fortawesome/free-solid-svg-icons';

type FormStatus = 'active' | 'closed' | 'draft';

interface FormQuestion {
  id: string;
  type: 'text' | 'multiple-choice' | 'checkbox' | 'rating' | 'email';
  question: string;
  required: boolean;
}

interface FormItem {
  id: string;
  title: string;
  description: string;
  status: FormStatus;
  createdBy: string;
  modifiedAt: string;
  questions: number;
  responses: number;
  completionRate: number;
  questions_detail: FormQuestion[];
}

const FORMS: FormItem[] = [
  { id: '1', title: 'User Satisfaction Survey', description: 'Gather product experience feedback', status: 'active', createdBy: 'Sarah Chen', modifiedAt: 'Jan 27, 2026', questions: 12, responses: 156, completionRate: 87, questions_detail: [{ id: 'q1', type: 'rating', question: 'How satisfied are you?', required: true }] },
  { id: '2', title: 'Employee Onboarding', description: 'Collect info from new team members', status: 'active', createdBy: 'Emma Wilson', modifiedAt: 'Jan 25, 2026', questions: 8, responses: 24, completionRate: 95, questions_detail: [{ id: 'q1', type: 'text', question: 'Full name', required: true }] },
  { id: '3', title: 'Event Registration', description: 'Register for team gathering', status: 'active', createdBy: 'Mike Johnson', modifiedAt: 'Jan 26, 2026', questions: 6, responses: 42, completionRate: 73, questions_detail: [{ id: 'q1', type: 'multiple-choice', question: 'Will you attend?', required: true }] },
  { id: '4', title: 'Feature Request Form', description: 'Submit ideas for new features', status: 'active', createdBy: 'Alex Brown', modifiedAt: 'Jan 24, 2026', questions: 5, responses: 89, completionRate: 91, questions_detail: [{ id: 'q1', type: 'text', question: 'Feature title', required: true }] },
  { id: '5', title: 'Customer Feedback', description: 'Share your experience', status: 'closed', createdBy: 'Lisa Martinez', modifiedAt: 'Jan 20, 2026', questions: 10, responses: 203, completionRate: 89, questions_detail: [{ id: 'q1', type: 'rating', question: 'Overall satisfaction', required: true }] },
  { id: '6', title: 'Team Skills Assessment', description: 'Assess skills and interests', status: 'draft', createdBy: 'Tom Anderson', modifiedAt: 'Jan 26, 2026', questions: 15, responses: 0, completionRate: 0, questions_detail: [{ id: 'q1', type: 'multiple-choice', question: 'Primary skill area', required: true }] },
];

export function FormsView() {
  const [filter, setFilter] = useState<FormStatus | 'all'>('all');
  const [selectedForm, setSelectedForm] = useState<FormItem | null>(null);

  const filteredForms = useMemo(() => {
    if (filter === 'all') return FORMS;
    return FORMS.filter((form) => form.status === filter);
  }, [filter]);

  const metrics = useMemo(() => ({
    total: FORMS.length,
    active: FORMS.filter((form) => form.status === 'active').length,
    responses: FORMS.reduce((sum, form) => sum + form.responses, 0),
    completion: Math.round(FORMS.reduce((sum, form) => sum + form.completionRate, 0) / FORMS.length),
  }), []);

  return (
    <div className="min-h-screen bg-[#00060d] text-white">
      <div className="max-w-6xl mx-auto px-6 py-10 space-y-10">
        <section className="rounded-[40px] border border-white/[0.05] bg-gradient-to-b from-white/5 to-black/60 p-8 shadow-[0_25px_90px_rgba(0,0,0,0.6)]">
          <div className="flex flex-col gap-3">
            <p className="text-[11px] uppercase tracking-[0.5em] text-gray-400">Forms</p>
            <h1 className="text-4xl font-bold">Signal forms</h1>
            <p className="text-sm text-gray-400">Ambient controls, neon pills, and data whispers inspired by the chat canvas.</p>
            <button className="mt-4 flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 px-5 py-2 text-xs font-semibold uppercase tracking-[0.4em]">
              <FontAwesomeIcon icon={faPlus} />
              New form
            </button>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-4">
          <div className="rounded-[32px] border border-white/[0.05] bg-black/60 p-5 space-y-1">
            <p className="text-[11px] uppercase tracking-[0.4em] text-gray-400">Total forms</p>
            <p className="text-3xl font-bold text-white">{metrics.total}</p>
          </div>
          <div className="rounded-[32px] border border-white/[0.05] bg-black/60 p-5">
            <p className="text-[11px] uppercase tracking-[0.4em] text-gray-400">Active</p>
            <p className="text-3xl font-bold text-emerald-300">{metrics.active}</p>
          </div>
          <div className="rounded-[32px] border border-white/[0.05] bg-black/60 p-5">
            <p className="text-[11px] uppercase tracking-[0.4em] text-gray-400">Responses</p>
            <p className="text-3xl font-bold text-cyan-300">{metrics.responses}</p>
          </div>
          <div className="rounded-[32px] border border-white/[0.05] bg-black/60 p-5">
            <p className="text-[11px] uppercase tracking-[0.4em] text-gray-400">Completion</p>
            <p className="text-3xl font-bold text-white">{metrics.completion}%</p>
          </div>
        </section>

        <section className="rounded-[36px] border border-white/[0.05] bg-black/50 p-6 space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            {(['all', 'active', 'closed', 'draft'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-full text-[11px] font-semibold transition ${
                  filter === status ? 'bg-white/20 text-white' : 'bg-black/30 text-gray-400'
                }`}
              >
                {status.toUpperCase()}
              </button>
            ))}
            <div className="ml-auto flex items-center gap-2 text-[11px] uppercase tracking-[0.4em] text-gray-400">
              <FontAwesomeIcon icon={faGaugeSimple} />
              {filteredForms.length} live cards
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {filteredForms.map((form) => (
              <button
                key={form.id}
                onClick={() => setSelectedForm(form)}
                className="rounded-[30px] border border-white/[0.05] bg-gradient-to-br from-white/5 to-black/30 p-5 text-left hover:border-white/30 transition space-y-2"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{form.title}</h3>
                  <span className="text-[10px] text-gray-400 uppercase">{form.status}</span>
                </div>
                <p className="text-sm text-gray-300">{form.description}</p>
                <div className="flex items-center gap-3 text-[11px] text-gray-400">
                  <span>{form.questions} questions</span>
                  <span>{form.responses} responses</span>
                  <span>{form.modifiedAt}</span>
                </div>
              </button>
            ))}
          </div>
        </section>

        {selectedForm && (
          <section className="rounded-[36px] border border-white/[0.08] bg-gradient-to-br from-white/10 to-black/60 p-6 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-[11px] uppercase tracking-[0.4em] text-gray-400">Form playbook</p>
              <FontAwesomeIcon icon={faCircleCheck} className="text-emerald-300" />
            </div>
            <h2 className="text-3xl font-bold">{selectedForm.title}</h2>
            <p className="text-sm text-gray-300">{selectedForm.description}</p>
            <div className="grid md:grid-cols-4 gap-4 text-[11px] text-gray-400">
              <div>
                <span className="block text-[10px] uppercase text-gray-500">Status</span>
                {selectedForm.status}
              </div>
              <div>
                <span className="block text-[10px] uppercase text-gray-500">Responses</span>
                {selectedForm.responses}
              </div>
              <div>
                <span className="block text-[10px] uppercase text-gray-500">Completion</span>
                {selectedForm.completionRate}%
              </div>
              <div>
                <span className="block text-[10px] uppercase text-gray-500">Modified</span>
                {selectedForm.modifiedAt}
              </div>
            </div>
            <div className="space-y-3">
              {selectedForm.questions_detail.map((question) => (
                <div key={question.id} className="rounded-2xl border border-white/[0.05] bg-black/40 px-4 py-3 text-[11px]">
                  <p className="text-xs uppercase tracking-[0.3em] text-gray-400">{question.type}</p>
                  <p className="text-sm text-white">{question.question}</p>
                  <p className="text-[10px] text-gray-500">{question.required ? 'Required' : 'Optional'}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
