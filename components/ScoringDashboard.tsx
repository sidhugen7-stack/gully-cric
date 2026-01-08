
import React, { useState } from 'react';
import { MatchState, Ball, CompletedMatch } from '../types';
import { getMatchInsights } from '../services/geminiService';
import { MOCK_PLAYERS, MOCK_TEAMS } from '../store/mockData';
import { Undo2, RotateCcw, BrainCircuit, Zap, Settings2, X, ChevronRight, Edit3, Trash2, CheckCircle2, Trophy } from 'lucide-react';

interface Props {
  initialState: MatchState;
  onMatchComplete: (match: CompletedMatch) => void;
}

const ScoringDashboard: React.FC<Props> = ({ initialState, onMatchComplete }) => {
  const [match, setMatch] = useState<MatchState>({
    ...initialState,
    target: initialState.target || 120 
  });
  
  const [insight, setInsight] = useState<string>("Keep the pressure on, skip!");
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [editingBall, setEditingBall] = useState<Ball | null>(null);
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);

  const battingTeam = MOCK_TEAMS.find(t => t.id === match.battingTeamId);
  const bowlingTeam = MOCK_TEAMS.find(t => t.id === match.bowlingTeamId);

  const totalRuns = match.balls.reduce((acc, b) => acc + b.runs, 0);
  const totalWickets = match.balls.filter(b => b.isWicket).length;
  const legalBalls = match.balls.filter(b => !b.isWide && !b.isNoBall).length;
  const currentOver = Math.floor(legalBalls / 6);
  const ballInOver = legalBalls % 6;
  const totalMatchBalls = match.overs * 6;
  const ballsRemaining = totalMatchBalls - legalBalls;

  const getPlayer = (id: string) => MOCK_PLAYERS.find(p => p.id === id) || MOCK_PLAYERS[0];
  const striker = getPlayer(match.strikerId);
  const bowler = getPlayer(match.currentBowlerId);

  const isChasing = match.target !== null;
  const runsNeeded = isChasing ? match.target - totalRuns : 0;
  const crr = legalBalls > 0 ? (totalRuns / (legalBalls / 6)) : 0;
  const rrr = (isChasing && ballsRemaining > 0) ? (runsNeeded / (ballsRemaining / 6)) : 0;

  // Check for logical match end
  const isMatchDecided = match.isComplete || (isChasing && totalRuns >= match.target!) || ballsRemaining <= 0 || totalWickets >= 10;

  const handleBall = (scoredRuns: number, extra: 'none' | 'wide' | 'noball' | 'wicket' = 'none') => {
    if (match.isComplete) return;

    const isWide = extra === 'wide';
    const isNoBall = extra === 'noball';
    const extraPenalty = (isWide || isNoBall) ? 1 : 0;
    
    const newBall: Ball = {
      id: Math.random().toString(36).substr(2, 9),
      over: currentOver,
      ballNo: ballInOver + 1,
      runs: scoredRuns + extraPenalty, 
      isWide,
      isNoBall,
      isBye: false,
      isLegBye: false,
      isWicket: extra === 'wicket',
      wicketType: extra === 'wicket' ? 'Bowled' : undefined,
      batsmanId: match.strikerId,
      bowlerId: match.currentBowlerId,
    };

    const updatedBalls = [...match.balls, newBall];
    let newStriker = match.strikerId;
    let newNonStriker = match.nonStrikerId;

    if (scoredRuns % 2 !== 0) {
      newStriker = match.nonStrikerId;
      newNonStriker = match.strikerId;
    }

    if (!isWide && !isNoBall && (ballInOver + 1) === 6) {
      const temp = newStriker;
      newStriker = newNonStriker;
      newNonStriker = temp;
    }

    setMatch(prev => ({
      ...prev,
      balls: updatedBalls,
      strikerId: extra === 'wicket' ? 'p4' : newStriker, 
      nonStrikerId: newNonStriker
    }));
  };

  const finalizeMatch = () => {
    const now = new Date();
    const resultText = isChasing 
      ? (totalRuns >= match.target! 
          ? `${battingTeam?.name} won by ${10 - totalWickets} wickets` 
          : `${bowlingTeam?.name} won by ${runsNeeded} runs`)
      : "Match Completed";

    const completed: CompletedMatch = {
      id: Math.random().toString(36).substr(2, 9),
      teamAName: battingTeam?.name || 'Team A',
      teamBName: bowlingTeam?.name || 'Team B',
      scoreA: `${totalRuns}/${totalWickets} (${currentOver}.${ballInOver})`,
      scoreB: isChasing ? `Target: ${match.target}` : 'First Innings',
      result: resultText,
      timestamp: `${now.toLocaleDateString()} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    };

    setMatch(prev => ({ ...prev, isComplete: true }));
    onMatchComplete(completed);
  };

  const undoLastBall = () => {
    if (match.isComplete) return;
    setMatch(prev => ({
      ...prev,
      balls: prev.balls.slice(0, -1)
    }));
  };

  const updateBall = (ballId: string, updates: Partial<Ball>) => {
    if (match.isComplete) return;
    setMatch(prev => ({
      ...prev,
      balls: prev.balls.map(b => b.id === ballId ? { ...b, ...updates } : b)
    }));
    setEditingBall(null);
  };

  const deleteBall = (ballId: string) => {
    if (match.isComplete) return;
    setMatch(prev => ({
      ...prev,
      balls: prev.balls.filter(b => b.id !== ballId)
    }));
    setEditingBall(null);
  };

  const fetchInsight = async () => {
    setLoadingInsight(true);
    const text = await getMatchInsights({
      runs: totalRuns,
      wickets: totalWickets,
      overs: `${currentOver}.${ballInOver}`,
      striker: striker.name,
      bowler: bowler.name,
      target: match.target,
      rrr: rrr.toFixed(2)
    });
    setInsight(text);
    setLoadingInsight(false);
  };

  const overBalls = match.balls.filter(bl => !bl.isWide && !bl.isNoBall).slice(currentOver * 6);

  return (
    <div className="flex flex-col min-h-full bg-slate-950 relative pb-24">
      {/* Top Match Status Header */}
      <div className="bg-slate-900 border-b border-slate-800 p-4 pt-8 flex items-center justify-between sticky top-0 z-10 shadow-lg">
        <div className="flex items-center gap-3">
           <div className="w-8 h-8 rounded-lg bg-yellow-400 flex items-center justify-center text-slate-900 font-bold shadow-lg shadow-yellow-400/10">
              {battingTeam?.logo}
           </div>
           <div>
              <p className="text-[10px] font-black uppercase text-slate-500 tracking-tighter">Batting</p>
              <h2 className="text-sm font-bold text-white tracking-tight">{battingTeam?.name}</h2>
           </div>
        </div>
        <div className="text-center">
           <div className={`px-3 py-1 rounded-full border ${match.isComplete ? 'bg-red-500/20 border-red-500/50' : 'bg-slate-800 border-slate-700'}`}>
              <p className={`text-[9px] font-black uppercase tracking-widest ${match.isComplete ? 'text-red-400' : 'text-yellow-400'}`}>
                {match.isComplete ? 'FINISHED' : 'LIVE'}
              </p>
           </div>
        </div>
        <div className="flex items-center gap-3 text-right">
           <div>
              <p className="text-[10px] font-black uppercase text-slate-500 tracking-tighter">Bowling</p>
              <h2 className="text-sm font-bold text-white tracking-tight">{bowlingTeam?.name}</h2>
           </div>
           <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-white">
              {bowlingTeam?.logo}
           </div>
        </div>
      </div>

      {/* Main Score Display Area */}
      <div className="relative p-6 bg-gradient-to-b from-slate-900 to-slate-950">
        {!match.isComplete && (
          <button 
            onClick={() => setShowCorrectionModal(true)}
            className="absolute top-4 right-4 p-2 bg-slate-800 rounded-full text-slate-400 hover:text-yellow-400 transition-colors border border-slate-700"
          >
            <Settings2 size={18} />
          </button>
        )}
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <div className="flex items-baseline gap-2">
              <h1 className="text-7xl font-bebas text-white drop-shadow-2xl">
                {totalRuns}<span className="text-yellow-400">/</span>{totalWickets}
              </h1>
            </div>
            <div className="flex items-center gap-2">
               <span className="px-2 py-0.5 bg-yellow-400/10 border border-yellow-400/20 rounded text-yellow-400 text-xs font-bold font-bebas tracking-widest">
                 {currentOver}.{ballInOver} OVERS
               </span>
               {isChasing && (
                 <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                   Target: {match.target}
                 </span>
               )}
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <div className="bg-slate-800/50 p-2 rounded-xl border border-slate-700 min-w-[80px] text-center">
               <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">CRR</p>
               <p className="text-xl font-bebas text-white leading-none">{crr.toFixed(2)}</p>
            </div>
            {isChasing && !match.isComplete && (
              <div className="bg-indigo-500/10 p-2 rounded-xl border border-indigo-500/30 min-w-[80px] text-center">
                 <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mb-1">RRR</p>
                 <p className="text-xl font-bebas text-indigo-300 leading-none">{rrr.toFixed(2)}</p>
              </div>
            )}
          </div>
        </div>

        {/* Chasing Status Bar */}
        {isChasing && (
          <div className="mt-6">
            <div className="flex justify-between text-[10px] font-black uppercase mb-1 tracking-widest">
               <span className="text-slate-400">
                 {totalRuns >= match.target! ? 'Target Reached' : `Need ${runsNeeded} Runs`}
               </span>
               <span className="text-slate-400">
                 {ballsRemaining <= 0 ? 'Innings Over' : `${ballsRemaining} Balls Left`}
               </span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
               <div 
                className="h-full bg-gradient-to-r from-yellow-500 to-yellow-300 transition-all duration-500 shadow-[0_0_10px_rgba(234,179,8,0.3)]"
                style={{ width: `${Math.min(100, (totalRuns / (match.target || 1)) * 100)}%` }}
               />
            </div>
          </div>
        )}

        {match.isComplete && (
          <div className="mt-8 p-4 bg-yellow-400 rounded-2xl flex items-center justify-between border-b-4 border-yellow-600">
             <div className="flex items-center gap-3">
                <Trophy className="text-slate-900" size={24} />
                <div>
                  <p className="text-[10px] font-black text-slate-900/50 uppercase leading-none mb-1">Final Result</p>
                  <p className="text-sm font-black text-slate-900 uppercase tracking-tight">
                    {isChasing 
                      ? (totalRuns >= match.target! ? `${battingTeam?.name} VICTORY!` : `${bowlingTeam?.name} VICTORY!`)
                      : "INNINGS COMPLETED"}
                  </p>
                </div>
             </div>
             <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-slate-900 text-white font-bebas text-sm rounded-xl"
             >
               NEW GAME
             </button>
          </div>
        )}
      </div>

      {/* Players Detail Bar */}
      <div className="px-6 py-4 grid grid-cols-2 gap-4 border-y border-slate-900 bg-slate-950/50">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full border border-slate-700 overflow-hidden shrink-0 bg-slate-900">
                <img src={striker.profilePic} className="w-full h-full object-cover" alt="" />
             </div>
             <div className="min-w-0">
                <p className="text-[10px] font-black text-slate-500 uppercase truncate tracking-tighter">{striker.nickname}*</p>
                <p className="text-lg font-bebas text-white leading-none">24<span className="text-xs font-sans text-slate-500 ml-1">(12)</span></p>
             </div>
          </div>
          <div className="flex items-center gap-3 justify-end text-right">
             <div className="min-w-0">
                <p className="text-[10px] font-black text-slate-500 uppercase truncate tracking-tighter">{bowler.nickname}</p>
                <p className="text-lg font-bebas text-white leading-none">1/14<span className="text-xs font-sans text-slate-500 ml-1">(2.4)</span></p>
             </div>
             <div className="w-10 h-10 rounded-full border border-slate-700 overflow-hidden shrink-0 bg-slate-900">
                <img src={bowler.profilePic} className="w-full h-full object-cover" alt="" />
             </div>
          </div>
      </div>

      {/* Over Progress Dots - Locked if complete */}
      <div className={`px-6 py-4 transition-opacity ${match.isComplete ? 'opacity-50' : ''}`}>
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
            {match.isComplete ? 'Final Over Stats' : 'This Over (Tap ball to fix)'}
          </p>
          <p className="text-[10px] font-black text-yellow-400 uppercase tracking-widest">Total: {overBalls.reduce((s,b) => s+b.runs,0)}</p>
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          {[1, 2, 3, 4, 5, 6].map((b) => {
             const ball = overBalls[b-1];
             return (
               <button 
                 key={b} 
                 disabled={match.isComplete}
                 onClick={() => ball && setEditingBall(ball)}
                 className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center border transition-all shrink-0 ${!match.isComplete ? 'active:scale-90' : ''} ${
                 ball ? 'bg-slate-800 border-yellow-400/50 text-white shadow-lg' : 'bg-slate-900 border-slate-800 text-slate-600'
               }`}>
                 <span className="text-xl font-bebas leading-none">
                   {ball ? (ball.isWicket ? 'W' : ball.runs) : b}
                 </span>
                 {ball?.isWide && <span className="text-[8px] font-black uppercase text-yellow-500">WD</span>}
                 {ball?.isNoBall && <span className="text-[8px] font-black uppercase text-indigo-400">NB</span>}
                 {!ball && <span className="text-[8px] font-black uppercase opacity-40">Ball</span>}
               </button>
             );
          })}
        </div>
      </div>

      {/* Insights Section */}
      {!match.isComplete && (
        <div className="px-4 mb-4">
          <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-2xl p-4 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-2 opacity-10">
                <Zap className="text-indigo-400" size={40} />
            </div>
            <div className="flex gap-3">
                <BrainCircuit className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-[10px] font-black text-indigo-300 uppercase mb-1 tracking-widest">Gully Tactical Advice</p>
                  <p className="text-xs text-indigo-100/80 leading-relaxed font-medium">
                    {loadingInsight ? "Calculating match momentum..." : insight}
                  </p>
                </div>
                <button 
                  onClick={fetchInsight}
                  className="p-1 text-indigo-400/50 hover:text-indigo-200 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
            </div>
          </div>
        </div>
      )}

      {/* Controls Container - LOCKED if complete */}
      <div className={`px-6 pb-12 space-y-4 transition-all duration-500 ${match.isComplete ? 'opacity-30 pointer-events-none' : ''}`}>
        <div className="grid grid-cols-4 gap-3">
          {[0, 1, 2, 3, 4, 6].map((num) => (
            <button
              key={num}
              onClick={() => handleBall(num)}
              className="h-16 bg-slate-900 active:bg-yellow-400 active:text-slate-950 rounded-2xl flex items-center justify-center text-3xl font-bebas border border-slate-800 active:border-yellow-500 shadow-xl transition-all"
            >
              {num}
            </button>
          ))}
          <button
            onClick={() => handleBall(0, 'wide')}
            className="h-16 bg-slate-900 border-2 border-indigo-500/50 text-indigo-400 rounded-2xl flex items-center justify-center text-xl font-bebas active:scale-95 transition-all shadow-lg"
          >
            WD
          </button>
          <button
            onClick={() => handleBall(0, 'noball')}
            className="h-16 bg-slate-900 border-2 border-indigo-500/50 text-indigo-400 rounded-2xl flex items-center justify-center text-xl font-bebas active:scale-95 transition-all shadow-lg"
          >
            NB
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleBall(0, 'wicket')}
            className="h-16 bg-red-600 rounded-2xl flex items-center justify-center text-2xl font-bebas border-b-4 border-red-900 active:border-b-0 active:translate-y-1 shadow-xl transition-all uppercase tracking-widest text-white"
          >
            OUT!
          </button>
          <button
            onClick={undoLastBall}
            className="h-16 bg-slate-800 border border-slate-700 rounded-2xl flex items-center justify-center text-xl font-bebas active:scale-95 transition-all gap-2 text-slate-400"
          >
            <Undo2 className="w-5 h-5" /> UNDO
          </button>
        </div>
      </div>

      {/* Completion Trigger */}
      {isMatchDecided && !match.isComplete && (
        <div className="fixed bottom-24 left-6 right-6 z-50 animate-in slide-in-from-bottom">
           <button 
            onClick={finalizeMatch}
            className="w-full py-5 bg-yellow-400 text-slate-900 font-black uppercase tracking-widest rounded-3xl shadow-2xl flex items-center justify-center gap-3 border-b-4 border-yellow-600 active:translate-y-1 active:border-b-0 transition-all"
           >
             <CheckCircle2 size={24} /> FINISH & SAVE MATCH
           </button>
        </div>
      )}

      {/* Ball Edit Modal - LOCKED if complete */}
      {editingBall && !match.isComplete && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm z-[110] flex items-end justify-center">
          <div className="bg-slate-900 w-full max-w-md rounded-t-3xl border-t border-slate-700 p-6 animate-in slide-in-from-bottom shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bebas text-white flex items-center gap-2 tracking-wide">
                <Edit3 size={18} className="text-yellow-400" /> Correct Ball {editingBall.ballNo}
              </h3>
              <button onClick={() => setEditingBall(null)} className="text-slate-500 p-2"><X /></button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <p className="text-[10px] font-black text-slate-500 uppercase mb-3 tracking-widest">Change Runs</p>
                <div className="flex gap-2 flex-wrap">
                  {[0, 1, 2, 3, 4, 6].map(r => (
                    <button 
                      key={r}
                      onClick={() => updateBall(editingBall.id, { runs: r })}
                      className={`w-10 h-10 rounded-xl font-bebas text-xl transition-all ${editingBall.runs === r ? 'bg-yellow-400 text-slate-900' : 'bg-slate-800 text-slate-400'}`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <p className="text-[10px] font-black text-slate-500 uppercase mb-3 tracking-widest">Status</p>
                <div className="space-y-2">
                  <button 
                    onClick={() => updateBall(editingBall.id, { isWicket: !editingBall.isWicket })}
                    className={`w-full py-2 rounded-xl text-xs font-bold uppercase transition-all ${editingBall.isWicket ? 'bg-red-500 text-white' : 'bg-slate-800 text-slate-400'}`}
                  >
                    Wicket
                  </button>
                  <button 
                    onClick={() => updateBall(editingBall.id, { isWide: !editingBall.isWide })}
                    className={`w-full py-2 rounded-xl text-xs font-bold uppercase transition-all ${editingBall.isWide ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400'}`}
                  >
                    Wide
                  </button>
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => deleteBall(editingBall.id)}
              className="w-full py-4 bg-red-600/10 border border-red-500/20 text-red-500 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 active:bg-red-500/20 transition-all"
            >
              <Trash2 size={16} /> Delete Ball Record
            </button>
          </div>
        </div>
      )}

      {/* Global Correction Modal - LOCKED if complete */}
      {showCorrectionModal && !match.isComplete && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-md z-[120] p-6 pt-12">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bebas text-white tracking-widest">Correction <span className="text-yellow-400">Center</span></h2>
            <button onClick={() => setShowCorrectionModal(false)} className="bg-slate-800 p-2 rounded-xl text-slate-400"><X /></button>
          </div>
          
          <div className="space-y-6 overflow-y-auto max-h-[85vh] pr-1 no-scrollbar">
            <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800">
              <h3 className="text-sm font-black text-slate-500 uppercase mb-4 tracking-widest">Manual Score Adjust</h3>
              <div className="flex items-center justify-between gap-6">
                <div className="flex-1 text-center">
                   <p className="text-[10px] font-black text-slate-600 uppercase mb-2">Total Runs</p>
                   <div className="flex items-center justify-between bg-slate-950 rounded-2xl p-2 border border-slate-800">
                      <button 
                        onClick={() => handleBall(-1)} 
                        className="w-10 h-10 bg-slate-800 rounded-xl text-xl font-bebas"
                      >-</button>
                      <span className="text-3xl font-bebas text-white">{totalRuns}</span>
                      <button 
                        onClick={() => handleBall(1)} 
                        className="w-10 h-10 bg-slate-800 rounded-xl text-xl font-bebas"
                      >+</button>
                   </div>
                </div>
                <div className="flex-1 text-center">
                   <p className="text-[10px] font-black text-slate-600 uppercase mb-2">Wickets</p>
                   <div className="flex items-center justify-between bg-slate-950 rounded-2xl p-2 border border-slate-800">
                      <button 
                        onClick={() => {
                          const lastWicket = [...match.balls].reverse().find(b => b.isWicket);
                          if(lastWicket) updateBall(lastWicket.id, { isWicket: false });
                        }}
                        className="w-10 h-10 bg-slate-800 rounded-xl text-xl font-bebas"
                      >-</button>
                      <span className="text-3xl font-bebas text-white">{totalWickets}</span>
                      <button 
                        onClick={() => handleBall(0, 'wicket')}
                        className="w-10 h-10 bg-slate-800 rounded-xl text-xl font-bebas"
                      >+</button>
                   </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 overflow-hidden">
               <h3 className="text-sm font-black text-slate-500 uppercase mb-4 tracking-widest">Match History</h3>
               <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 no-scrollbar">
                  {match.balls.slice().reverse().map((b, idx) => (
                    <div key={b.id} className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800/50">
                       <div className="flex items-center gap-3">
                          <span className="text-[10px] font-black text-slate-700">BALL {match.balls.length - idx}</span>
                          <span className="font-bebas text-xl text-white">
                            {b.isWicket ? 'OUT' : b.runs}
                            {b.isWide && <span className="text-xs font-sans text-yellow-500 ml-1">WD</span>}
                            {b.isNoBall && <span className="text-xs font-sans text-indigo-400 ml-1">NB</span>}
                          </span>
                       </div>
                       <button 
                        onClick={() => {
                          setEditingBall(b);
                          setShowCorrectionModal(false);
                        }}
                        className="text-yellow-400 hover:text-white transition-colors"
                       >
                         <Edit3 size={16} />
                       </button>
                    </div>
                  ))}
               </div>
            </div>
            
            <button 
              onClick={() => setShowCorrectionModal(false)}
              className="w-full py-4 bg-yellow-400 text-slate-900 font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-yellow-400/10 mb-8"
            >
              SAVE CORRECTIONS
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScoringDashboard;
