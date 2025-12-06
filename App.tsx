import React, { useState, useEffect } from 'react';
import { LayoutDashboard, MessageSquare, Sparkles, BrainCircuit } from 'lucide-react';
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
      // Logic for streak calculation could go here (e.g. check if yesterday was last study date)
      // For now, just update the date
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
    <div className="min-h-screen text-slate-200 font-sans selection:bg-neon-blue/30 overflow-hidden flex flex-col">
      
      {/* --- Header --- */}
      <header className="h-16 border-b border-white/10 bg-glass-dark backdrop-blur-md flex items-center justify-between px-6 z-50 shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-neon-blue to-neon-purple p-2 rounded-lg shadow-[0_0_15px_rgba(168,85,247,0.5)]">
            <BrainCircuit size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              Gemini Study Companion
            </h1>
            <p className="text-[10px] text-neon-blue tracking-wider uppercase font-medium">Powered by Google Gemini 2.5</p>
          </div>
        </div>

        {/* Desktop Nav - Hidden on Mobile */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <span className="hover:text-white cursor-pointer transition-colors">Dashboard</span>
            <span className="hover:text-white cursor-pointer transition-colors">Resources</span>
            <span className="hover:text-white cursor-pointer transition-colors">Settings</span>
        </div>
      </header>

      {/* --- Main Content Layout --- */}
      <main className="flex-1 overflow-hidden relative p-4 md:p-6 max-w-[1600px] mx-auto w-full">
        <div className="grid md:grid-cols-12 gap-6 h-full">
          
          {/* Left Panel: Tracker (Visible on Desktop, or Mobile Tab) */}
          <div className={`md:col-span-3 h-full overflow-hidden ${activeTab === AppTab.TRACKER ? 'block' : 'hidden md:block'}`}>
            <TrackerPanel stats={stats} updateStats={updateStats} />
          </div>

          {/* Center Panel: Chat (Visible on Desktop, or Mobile Tab) */}
          <div className={`md:col-span-6 h-full flex flex-col ${activeTab === AppTab.CHAT ? 'block' : 'hidden md:block'}`}>
            <ChatPanel incrementStats={incrementQuestions} />
          </div>

          {/* Right Panel: Summarizer (Visible on Desktop, or Mobile Tab) */}
          <div className={`md:col-span-3 h-full overflow-hidden ${activeTab === AppTab.SUMMARIZER ? 'block' : 'hidden md:block'}`}>
            <SummarizerPanel incrementStats={incrementSummaries} />
          </div>

        </div>
      </main>

      {/* --- Mobile Navigation Bar --- */}
      <div className="md:hidden h-16 bg-slate-900 border-t border-white/10 flex items-center justify-around shrink-0 z-50">
        <button 
          onClick={() => setActiveTab(AppTab.TRACKER)}
          className={`flex flex-col items-center gap-1 ${activeTab === AppTab.TRACKER ? 'text-neon-blue' : 'text-slate-500'}`}
        >
          <LayoutDashboard size={20} />
          <span className="text-[10px]">Tracker</span>
        </button>
        <button 
          onClick={() => setActiveTab(AppTab.CHAT)}
          className={`flex flex-col items-center gap-1 ${activeTab === AppTab.CHAT ? 'text-neon-blue' : 'text-slate-500'}`}
        >
          <MessageSquare size={20} />
          <span className="text-[10px]">Tutor</span>
        </button>
        <button 
          onClick={() => setActiveTab(AppTab.SUMMARIZER)}
          className={`flex flex-col items-center gap-1 ${activeTab === AppTab.SUMMARIZER ? 'text-neon-blue' : 'text-slate-500'}`}
        >
          <Sparkles size={20} />
          <span className="text-[10px]">Summarize</span>
        </button>
      </div>

    </div>
  );
};

export default App;
