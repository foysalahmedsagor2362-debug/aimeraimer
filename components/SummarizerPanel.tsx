import React, { useState } from 'react';
import { FileText, Link as LinkIcon, Upload, Copy, BookOpen, Layers, HelpCircle } from 'lucide-react';
import { GlassCard, Button } from './UIComponents';
import { SummaryResult } from '../types';
import { generateSmartSummary } from '../services/geminiService';

interface SummarizerPanelProps {
  incrementStats: () => void;
}

export const SummarizerPanel: React.FC<SummarizerPanelProps> = ({ incrementStats }) => {
  const [activeTab, setActiveTab] = useState<'text' | 'url' | 'file'>('text');
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SummaryResult | null>(null);

  const handleSummarize = async () => {
    if (!inputText.trim()) return;

    setIsLoading(true);
    setResult(null);

    try {
      const summaryData = await generateSmartSummary(inputText);
      setResult(summaryData);
      incrementStats();
    } catch (error) {
      console.error("Summary error:", error);
      alert("Failed to generate summary. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="h-full flex flex-col gap-4 overflow-y-auto">
      {/* Input Card */}
      <GlassCard title="Smart Summarizer" icon={<Layers size={18} />}>
        <div className="flex gap-2 mb-4 bg-slate-800/50 p-1 rounded-lg">
          {(['text', 'url', 'file'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTab === tab 
                  ? 'bg-neon-blue/20 text-neon-blue' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </div>

        {activeTab === 'text' && (
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste your study notes or article text here..."
            className="w-full h-32 bg-slate-900/50 border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-neon-blue/50 resize-none mb-3"
          />
        )}

        {activeTab === 'url' && (
          <div className="space-y-3 mb-3">
             <input
              type="text"
              placeholder="https://example.com/article"
              className="w-full bg-slate-900/50 border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-neon-blue/50"
              disabled
            />
             <p className="text-xs text-yellow-500/80">URL extraction coming soon. Please paste text for now.</p>
          </div>
        )}

        {activeTab === 'file' && (
          <div className="border-2 border-dashed border-white/10 rounded-lg h-32 flex flex-col items-center justify-center mb-3 cursor-pointer hover:bg-white/5 transition-colors">
            <Upload className="text-slate-400 mb-2" size={24} />
            <span className="text-xs text-slate-400">Click to upload PDF or TXT</span>
            <span className="text-[10px] text-slate-600 mt-1">(Mock UI Only)</span>
          </div>
        )}

        <Button 
          onClick={handleSummarize} 
          isLoading={isLoading} 
          disabled={!inputText && activeTab === 'text'}
          className="w-full"
        >
          Generate Summary
        </Button>
      </GlassCard>

      {/* Results Display */}
      {result && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-4 pb-4">
          <GlassCard title="Summary" icon={<BookOpen size={18} className="text-neon-pink" />}>
            <p className="text-sm text-slate-300 leading-relaxed mb-3">{result.summary}</p>
            <Button 
              variant="secondary" 
              className="text-xs py-1 h-8" 
              onClick={() => copyToClipboard(result.summary)}
              icon={<Copy size={12} />}
            >
              Copy
            </Button>
          </GlassCard>

          <GlassCard title="Key Points" icon={<FileText size={18} className="text-green-400" />}>
            <ul className="space-y-2">
              {result.keyPoints.map((point, idx) => (
                <li key={idx} className="flex gap-2 text-sm text-slate-300">
                  <span className="text-green-400 mt-1">•</span>
                  {point}
                </li>
              ))}
            </ul>
          </GlassCard>

          <GlassCard title="Key Terms" icon={<Layers size={18} className="text-orange-400" />}>
            <div className="grid gap-3">
              {result.terms.map((item, idx) => (
                <div key={idx} className="bg-slate-800/50 p-3 rounded-lg border border-white/5">
                  <span className="text-orange-300 font-medium text-sm block mb-1">{item.term}</span>
                  <span className="text-xs text-slate-400">{item.definition}</span>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard title="Flashcards / Quiz" icon={<HelpCircle size={18} className="text-neon-blue" />}>
             <div className="space-y-3">
              {result.practiceQuestions.map((q, idx) => (
                <div key={idx} className="bg-neon-blue/10 border border-neon-blue/20 p-3 rounded-lg">
                  <p className="text-sm text-neon-blue font-medium">Q{idx + 1}: {q}</p>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
};
