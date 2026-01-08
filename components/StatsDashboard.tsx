
import React, { useState, useRef } from 'react';
import { 
  LineChart, Line, AreaChart, Area, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Player } from '../types';
import { TrendingUp, ShieldCheck, Award, Swords, Zap, Camera, Target, Activity } from 'lucide-react';

interface Props {
  players: Player[];
  onUpdatePlayer: (p: Player) => void;
}

const StatsDashboard: React.FC<Props> = ({ players, onUpdatePlayer }) => {
  const [selectedPlayer, setSelectedPlayer] = useState(players[0]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Batting Average calculation
  const battingAvg = selectedPlayer.career.matches > 0 
    ? (selectedPlayer.career.runs / selectedPlayer.career.matches).toFixed(2) 
    : '0.00';

  const economyRate = selectedPlayer.career.economy.toFixed(2);

  const performanceData = [
    { match: 'M1', runs: 12, wickets: 1, sr: 120 },
    { match: 'M2', runs: 45, wickets: 0, sr: 155 },
    { match: 'M3', runs: 28, wickets: 2, sr: 110 },
    { match: 'M4', runs: 67, wickets: 1, sr: 180 },
    { match: 'M5', runs: 15, wickets: 3, sr: 90 },
  ];

  const handlePhotoUpdate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const updatedPlayer = { ...selectedPlayer, profilePic: reader.result as string };
        setSelectedPlayer(updatedPlayer);
        onUpdatePlayer(updatedPlayer);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-slate-900 min-h-screen pb-24 text-slate-100 p-4">
      {/* Hero Selection - Modern Scrollable Pill List */}
      <div className="flex gap-3 overflow-x-auto no-scrollbar mb-6 py-2">
        {players.map(p => (
          <button
            key={p.id}
            onClick={() => setSelectedPlayer(p)}
            className={`flex-shrink-0 px-5 py-2.5 rounded-2xl border transition-all flex items-center gap-3 shadow-lg ${
              selectedPlayer.id === p.id 
                ? 'bg-yellow-400 border-yellow-500 text-slate-900 font-black' 
                : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-500'
            }`}
          >
            <div className={`w-7 h-7 rounded-full overflow-hidden border ${selectedPlayer.id === p.id ? 'border-slate-900/20' : 'border-slate-700'}`}>
              <img src={p.profilePic} alt={p.name} className="w-full h-full object-cover" />
            </div>
            <span className="text-xs uppercase tracking-widest">{p.nickname}</span>
          </button>
        ))}
      </div>

      {/* Profile Header Card */}
      <div className="bg-slate-800 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden mb-6 border border-slate-700/50">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
          <ShieldCheck size={200} />
        </div>
        
        <div className="flex flex-col items-center text-center mb-8 relative z-10">
          <div className="relative mb-4">
            <div className="w-28 h-28 rounded-[2rem] overflow-hidden border-4 border-yellow-400 shadow-[0_0_30px_rgba(250,204,21,0.2)] bg-slate-900">
               <img src={selectedPlayer.profilePic} className="w-full h-full object-cover" alt={selectedPlayer.name} />
            </div>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-2 -right-2 bg-yellow-400 p-2.5 rounded-2xl text-slate-900 shadow-xl border-4 border-slate-800 active:scale-90 transition-all hover:bg-yellow-300"
            >
              <Camera size={18} />
            </button>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpdate} />
          </div>
          <h2 className="text-4xl font-bebas tracking-wider text-white mb-1 uppercase italic">{selectedPlayer.name}</h2>
          <div className="flex items-center gap-2 mb-4">
             <span className="bg-yellow-400/10 text-yellow-400 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-[0.2em] border border-yellow-400/20">
               {selectedPlayer.role}
             </span>
             <span className="bg-slate-700 text-slate-400 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
               {selectedPlayer.career.matches} Matches
             </span>
          </div>
          <div className="flex gap-3">
             <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5 bg-slate-900/50 px-3 py-1.5 rounded-xl">
               <Activity size={12} className="text-yellow-400" /> {selectedPlayer.battingStyle}
             </span>
             <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5 bg-slate-900/50 px-3 py-1.5 rounded-xl">
               <Target size={12} className="text-blue-400" /> {selectedPlayer.bowlingStyle}
             </span>
          </div>
        </div>

        <div className="space-y-6 relative z-10">
          {/* Batting Excellence Section */}
          <div className="bg-slate-900/40 rounded-3xl p-5 border border-yellow-400/10">
             <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-yellow-400 rounded-xl text-slate-900">
                   <Swords size={18} />
                </div>
                <h3 className="font-bebas text-xl text-white tracking-widest uppercase">Batting Excellence</h3>
             </div>
             <div className="grid grid-cols-2 gap-4">
                <StatBox label="Total Runs" value={selectedPlayer.career.runs} color="text-yellow-400" />
                <StatBox label="Average" value={battingAvg} color="text-yellow-400" />
                <StatBox label="Strike Rate" value={selectedPlayer.career.strikeRate} color="text-yellow-400" />
                <StatBox label="Best Score" value={selectedPlayer.career.highestScore} color="text-yellow-400" highlight />
             </div>
          </div>

          {/* Bowling Arsenal Section */}
          <div className="bg-slate-900/40 rounded-3xl p-5 border border-blue-400/10">
             <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-blue-500 rounded-xl text-white">
                   <Zap size={18} />
                </div>
                <h3 className="font-bebas text-xl text-white tracking-widest uppercase">Bowling Arsenal</h3>
             </div>
             <div className="grid grid-cols-2 gap-4">
                <StatBox label="Wickets" value={selectedPlayer.career.wickets} color="text-blue-400" />
                <StatBox label="Economy" value={economyRate} color="text-blue-400" />
                <StatBox label="Best Spell" value={selectedPlayer.career.bestBowling} color="text-blue-400" highlight />
                <StatBox label="Catches" value={selectedPlayer.career.catches} color="text-blue-400" />
             </div>
          </div>
        </div>
      </div>

      {/* Visual Analytics */}
      <div className="space-y-6">
        <div className="bg-slate-800 rounded-3xl p-6 border border-slate-700/50 shadow-xl">
           <div className="flex justify-between items-center mb-6">
              <h3 className="font-bebas text-xl tracking-widest text-white uppercase flex items-center gap-2">
                <TrendingUp size={20} className="text-yellow-400" /> Match Momentum
              </h3>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Recent 5 Inning Performance</p>
           </div>
           <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={performanceData}>
                    <defs>
                      <linearGradient id="colorRuns" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#fbbf24" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#1e293b" />
                    <XAxis 
                      dataKey="match" 
                      stroke="#475569" 
                      fontSize={11} 
                      tickLine={false} 
                      axisLine={false} 
                      tick={{ fill: '#64748b', fontWeight: 'bold' }}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '16px', fontSize: '11px', fontWeight: 'bold' }}
                      itemStyle={{ color: '#fbbf24' }}
                      cursor={{ stroke: '#fbbf24', strokeWidth: 1, strokeDasharray: '5 5' }}
                    />
                    <Area type="monotone" dataKey="runs" stroke="#fbbf24" strokeWidth={4} fillOpacity={1} fill="url(#colorRuns)" />
                 </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* Hero Achievements */}
        <div className="bg-slate-800 rounded-3xl p-6 border border-slate-700/50 shadow-xl">
          <h3 className="font-bebas text-xl tracking-widest mb-6 flex items-center gap-2 text-white uppercase">
            <Award size={20} className="text-yellow-400" /> Hero Badges
          </h3>
          <div className="flex gap-5 overflow-x-auto no-scrollbar pb-2">
            <Badge icon="🔥" name="Finisher" count={12} />
            <Badge icon="🎯" name="Yorker King" count={8} />
            <Badge icon="🧤" name="Clean Hands" count={15} />
            <Badge icon="⚡" name="Fast Feet" count={5} />
          </div>
        </div>
      </div>
    </div>
  );
};

const StatBox = ({ label, value, color, highlight }: { label: string, value: string | number, color: string, highlight?: boolean }) => (
  <div className={`p-4 rounded-2xl border transition-all ${highlight ? 'bg-slate-800/80 border-slate-700 shadow-inner' : 'bg-transparent border-slate-700/30'}`}>
    <p className="text-[9px] font-black text-slate-500 uppercase mb-1 tracking-widest">{label}</p>
    <p className={`text-2xl font-bebas tracking-widest ${color}`}>{value}</p>
  </div>
);

const Badge = ({ icon, name, count }: { icon: string, name: string, count: number }) => (
  <div className="flex flex-col items-center gap-2 group flex-shrink-0 animate-fade-in">
    <div className="w-16 h-16 bg-slate-900 rounded-[1.5rem] flex items-center justify-center text-3xl border-2 border-slate-700 group-hover:border-yellow-400 group-hover:bg-slate-800 transition-all shadow-xl">
      {icon}
    </div>
    <div className="text-center">
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{name}</p>
      <div className="inline-block px-3 py-0.5 bg-yellow-400 rounded-full text-[9px] font-black text-slate-900 uppercase">x{count}</div>
    </div>
  </div>
);

export default StatsDashboard;
