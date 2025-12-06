import React, { useEffect, useState } from 'react';
import { Play, Pause, Target, Flame, CheckCircle, Clock } from 'lucide-react';
import { GlassCard, Button } from './UIComponents';
import { StudyStats } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface TrackerPanelProps {
  stats: StudyStats;
  updateStats: (newStats: StudyStats) => void;
}

export const TrackerPanel: React.FC<TrackerPanelProps> = ({ stats, updateStats }) => {
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [sessionSeconds, setSessionSeconds] = useState(0);

  // Timer Logic
  useEffect(() => {
    let interval: number;
    if (isTimerRunning) {
      interval = window.setInterval(() => {
        setSessionSeconds(s => s + 1);
        // Update global stats every minute to save progress
        if ((sessionSeconds + 1) % 60 === 0) {
          updateStats({
            ...stats,
            studyMinutes: stats.studyMinutes + 1
          });
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, sessionSeconds, stats, updateStats]);

  const toggleTimer = () => {
    setIsTimerRunning(!isTimerRunning);
  };

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Chart Data
  const data = [
    { name: 'Studied', value: stats.studyMinutes },
    { name: 'Remaining', value: Math.max(0, stats.goals.studyMinutes - stats.studyMinutes) },
  ];
  const COLORS = ['#00f5ff', '#334155'];

  const progressPercent = Math.min(100, Math.round((stats.studyMinutes / stats.goals.studyMinutes) * 100));

  return (
    <div className="flex flex-col gap-4 h-full overflow-y-auto">
      {/* Timer Card */}
      <GlassCard className="text-center py-8">
        <h3 className="text-slate-400 text-sm uppercase tracking-widest mb-2">Current Session</h3>
        <div className="text-5xl font-mono font-bold text-white mb-6 tabular-nums tracking-wider">
          {formatTime(sessionSeconds)}
        </div>
        <Button 
          onClick={toggleTimer} 
          variant={isTimerRunning ? 'secondary' : 'primary'}
          className="w-full max-w-[200px]"
          icon={isTimerRunning ? <Pause size={18} /> : <Play size={18} />}
        >
          {isTimerRunning ? 'Pause Session' : 'Start Focus'}
        </Button>
      </GlassCard>

      {/* Daily Progress */}
      <GlassCard title="Daily Progress" icon={<Target size={18} />}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-slate-300">Study Goal</span>
          <span className="text-sm font-medium text-neon-blue">{stats.studyMinutes} / {stats.goals.studyMinutes} min</span>
        </div>
        <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden mb-6">
          <div 
            className="bg-neon-blue h-full transition-all duration-500 shadow-[0_0_10px_#00f5ff]" 
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="h-40 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={60}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-xl font-bold text-white">{progressPercent}%</span>
            </div>
        </div>
      </GlassCard>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <GlassCard className="flex flex-col items-center justify-center p-4">
          <Flame className="text-orange-500 mb-2" size={24} />
          <span className="text-2xl font-bold text-white">{stats.streak}</span>
          <span className="text-xs text-slate-400">Day Streak</span>
        </GlassCard>
        
        <GlassCard className="flex flex-col items-center justify-center p-4">
          <CheckCircle className="text-green-400 mb-2" size={24} />
          <span className="text-2xl font-bold text-white">{stats.summariesGenerated}</span>
          <span className="text-xs text-slate-400">Summaries</span>
        </GlassCard>
      </div>
    </div>
  );
};
