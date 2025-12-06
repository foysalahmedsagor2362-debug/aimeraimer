import React, { useState, useEffect } from 'react';
import { LayoutDashboard, MessageSquare, Sparkles, Atom } from 'lucide-react';
import { StudyStats, AppTab } from './types';
import { TrackerPanel } from './components/TrackerPanel';
import { ChatPanel } from './components/ChatPanel';
import { SummarizerPanel } from './components/SummarizerPanel';

// Default / Initial Stats
const initialStats: StudyStats = {
  studyMinutes: 0,
  questionsAsked: 0,
  summariesGenerated: 0,
  streak: 1,
  lastStudyDate: new Date().toISOString().split('T')[0],
  goals: {
    studyMinutes: 120,
    questions: 10,
    summaries: 3
  }
};

const App: React.FC = () => {
  // --- State Management ---
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.CHAT);
  const [stats, setStats] = useState<StudyStats>(() => {
    const saved = localStorage.getItem('gemini-study-data');
    return saved ? JSON.parse(saved) : initialStats;
  });

  // --- Persistence ---
  useEffect(() => {
    localStorage.setItem('gemini-study-data', JSON.stringify(stats));
  }, [stats]);

  // Check streak on load
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    if (stats.lastStudyDate !== today) {
      setStats(prev => ({ ...prev, lastStudyDate: today }));
    }
  }, []);

  // --- Handlers ---
  const updateStats = (newStats: StudyStats) => {
    setStats(newStats);
  };

  const incrementQuestions = () => {
    setStats(prev => ({
      ...prev,
      questionsAsked: prev.questionsAsked + 1
    }));
  };

  const incrementSummaries = () => {
    setStats(prev => ({
      ...prev,
      summariesGenerated: prev.summariesGenerated + 1
    }));
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden flex flex-col">
      
      {/* --- Header --- */}
      <header className="h-16 border-b border-slate-200 bg-white shadow-sm flex items-center justify-between px-6 z-50 shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-primary-600 p-2 rounded-lg text-white shadow-md shadow-primary-200">
            <Atom size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              STEM Study AI
            </h1>
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Physics • Chem • Bio • Math</p>
          </div>
        </div>

        {/* Desktop Nav - Hidden on Mobile */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-500">
            <span className="hover:text-primary-600 cursor-pointer transition-colors">Dashboard</span>
            <span className="hover:text-primary-600 cursor-pointer transition-colors">Formulas</span>
            <span className="hover:text-primary-600 cursor-pointer transition-colors">Settings</span>
        </div>
      </header>

      {/* --- Main Content Layout --- */}
      <main className="flex-1 overflow-hidden relative p-4 md:p-6 max-w-[1600px] mx-auto w-full">
        <div className="grid md:grid-cols-12 gap-6 h-full">
          
          {/* Left Panel: Tracker */}
          <div className={`md:col-span-3 h-full overflow-hidden ${activeTab === AppTab.TRACKER ? 'block' : 'hidden md:block'}`}>
            <TrackerPanel stats={stats} updateStats={updateStats} />
          </div>

          {/* Center Panel: Chat */}
          <div className={`md:col-span-6 h-full flex flex-col ${activeTab === AppTab.CHAT ? 'block' : 'hidden md:block'}`}>
            <ChatPanel incrementStats={incrementQuestions} />
          </div>

          {/* Right Panel: Summarizer */}
          <div className={`md:col-span-3 h-full overflow-hidden ${activeTab === AppTab.SUMMARIZER ? 'block' : 'hidden md:block'}`}>
            <SummarizerPanel incrementStats={incrementSummaries} />
          </div>

        </div>
      </main>

      {/* --- Mobile Navigation Bar --- */}
      <div className="md:hidden h-16 bg-white border-t border-slate-200 flex items-center justify-around shrink-0 z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <button 
          onClick={() => setActiveTab(AppTab.TRACKER)}
          className={`flex flex-col items-center gap-1 ${activeTab === AppTab.TRACKER ? 'text-primary-600' : 'text-slate-400'}`}
        >
          <LayoutDashboard size={20} />
          <span className="text-[10px] font-medium">Tracker</span>
        </button>
        <button 
          onClick={() => setActiveTab(AppTab.CHAT)}
          className={`flex flex-col items-center gap-1 ${activeTab === AppTab.CHAT ? 'text-primary-600' : 'text-slate-400'}`}
        >
          <MessageSquare size={20} />
          <span className="text-[10px] font-medium">Tutor</span>
        </button>
        <button 
          onClick={() => setActiveTab(AppTab.SUMMARIZER)}
          className={`flex flex-col items-center gap-1 ${activeTab === AppTab.SUMMARIZER ? 'text-primary-600' : 'text-slate-400'}`}
        >
          <Sparkles size={20} />
          <span className="text-[10px] font-medium">Summarize</span>
        </button>
      </div>

    </div>
  );
};

export default App;