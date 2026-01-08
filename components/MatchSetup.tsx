
import React, { useState } from 'react';
import { Team, Player, MatchSetupConfig, MatchState } from '../types';
import { Users, ChevronRight, Settings, RotateCw, Trophy, Swords, Zap } from 'lucide-react';
import BccgLogo from './BccgLogo';

interface Props {
  teams: Team[];
  players: Player[];
  onStartMatch: (config: MatchState) => void;
}

const MatchSetup: React.FC<Props> = ({ teams, players, onStartMatch }) => {
  const [step, setStep] = useState<'config' | 'toss'>('config');
  const [teamAId, setTeamAId] = useState(teams[0]?.id || '');
  const [teamBId, setTeamBId] = useState(teams[1]?.id || '');
  const [overs, setOvers] = useState(5);
  const [playingXIA, setPlayingXIA] = useState<string[]>(teams[0]?.players || []);
  const [playingXIB, setPlayingXIB] = useState<string[]>(teams[1]?.players || []);
  
  const [tossWinnerId, setTossWinnerId] = useState<string | null>(null);
  const [tossChoice, setTossChoice] = useState<'Bat' | 'Bowl'>('Bat');
  const [isFlipping, setIsFlipping] = useState(false);

  const teamA = teams.find(t => t.id === teamAId);
  const teamB = teams.find(t => t.id === teamBId);

  const handleToss = () => {
    setIsFlipping(true);
    setTimeout(() => {
      const winner = Math.random() > 0.5 ? teamAId : teamBId;
      setTossWinnerId(winner);
      setIsFlipping(false);
    }, 1500);
  };

  const finalizeSetup = () => {
    if (!tossWinnerId) return;

    const battingTeamId = tossWinnerId === teamAId 
      ? (tossChoice === 'Bat' ? teamAId : teamBId)
      : (tossChoice === 'Bat' ? teamBId : teamAId);
    
    const bowlingTeamId = battingTeamId === teamAId ? teamBId : teamAId;

    const bPlayers = battingTeamId === teamAId ? playingXIA : playingXIB;
    const boPlayers = bowlingTeamId === teamAId ? playingXIA : playingXIB;

    const matchState: MatchState = {
      id: Math.random().toString(36).substr(2, 9),
      battingTeamId,
      bowlingTeamId,
      target: null,
      innings: 1,
      overs,
      balls: [],
      strikerId: bPlayers[0],
      nonStrikerId: bPlayers[1],
      currentBowlerId: boPlayers[boPlayers.length - 1],
      isComplete: false,
      playingXIA,
      playingXIB
    };

    onStartMatch(matchState);
  };

  if (step === 'config') {
    return (
      <div className="p-6 pt-12 animate-fade-in pb-32">
        <div className="flex items-center gap-4 mb-8">
           <div className="p-3 bg-blue-600 rounded-2xl shadow-xl">
              <Settings className="text-white" size={24} />
           </div>
           <div>
              <h2 className="text-3xl font-bebas text-white tracking-widest uppercase">Match Setup</h2>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Configure your gully encounter</p>
           </div>
        </div>

        <div className="space-y-6">
          {/* Team Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Team A</label>
              <select 
                value={teamAId}
                onChange={(e) => setTeamAId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 p-4 rounded-2xl text-white font-bold outline-none focus:border-blue-500"
              >
                {teams.map(t => <option key={t.id} value={t.id}>{t.logo} {t.name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Team B</label>
              <select 
                value={teamBId}
                onChange={(e) => setTeamBId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 p-4 rounded-2xl text-white font-bold outline-none focus:border-blue-500"
              >
                {teams.filter(t => t.id !== teamAId).map(t => <option key={t.id} value={t.id}>{t.logo} {t.name}</option>)}
              </select>
            </div>
          </div>

          {/* Overs Selection */}
          <div className="bg-slate-800 rounded-3xl p-6 border border-slate-700 shadow-xl">
             <div className="flex justify-between items-center mb-4">
                <h3 className="font-bebas text-xl text-white tracking-widest">Match Duration</h3>
                <span className="text-yellow-400 font-bebas text-2xl">{overs} OVERS</span>
             </div>
             <input 
              type="range" min="1" max="20" step="1" 
              value={overs}
              onChange={(e) => setOvers(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
             />
             <div className="flex justify-between mt-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                <span>1 Over</span>
                <span>20 Overs</span>
             </div>
          </div>

          {/* Squad View */}
          <div className="bg-slate-800 rounded-3xl p-6 border border-slate-700 shadow-xl">
             <div className="flex items-center gap-2 mb-4">
                <Users size={18} className="text-blue-400" />
                <h3 className="font-bebas text-xl text-white tracking-widest">Squad Confirmation</h3>
             </div>
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-tighter truncate">{teamA?.name}</p>
                   <div className="flex -space-x-2">
                      {teamA?.players.map(pid => (
                        <img key={pid} src={players.find(p => p.id === pid)?.profilePic} className="w-8 h-8 rounded-full border-2 border-slate-800 object-cover" alt="" />
                      ))}
                   </div>
                </div>
                <div className="space-y-2">
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-tighter truncate">{teamB?.name}</p>
                   <div className="flex -space-x-2">
                      {teamB?.players.map(pid => (
                        <img key={pid} src={players.find(p => p.id === pid)?.profilePic} className="w-8 h-8 rounded-full border-2 border-slate-800 object-cover" alt="" />
                      ))}
                   </div>
                </div>
             </div>
          </div>

          <button 
            onClick={() => setStep('toss')}
            className="w-full bg-blue-600 text-white font-black py-5 rounded-3xl uppercase tracking-widest shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3 border-b-4 border-blue-800"
          >
            PROCEED TO TOSS <ChevronRight size={18} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 pt-12 animate-fade-in pb-32 flex flex-col h-full">
      <div className="text-center mb-12">
         <h2 className="text-4xl font-bebas text-white tracking-widest uppercase mb-2">Toss Simulation</h2>
         <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Decision Day at the Gully</p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">
        <div className={`relative w-48 h-48 mb-12 transition-all duration-[1500ms] ease-in-out ${isFlipping ? 'scale-110 [transform:rotateY(1080deg)]' : ''}`}>
           <div className="absolute inset-0 bg-slate-900 rounded-full border-8 border-yellow-500 shadow-[0_0_50px_rgba(234,179,8,0.2)] flex items-center justify-center">
              <BccgLogo size={120} />
           </div>
        </div>

        {!tossWinnerId && !isFlipping && (
          <button 
            onClick={handleToss}
            className="px-12 py-5 bg-yellow-400 text-slate-900 font-black rounded-3xl uppercase tracking-widest shadow-2xl active:scale-95 transition-all border-b-4 border-yellow-600"
          >
            FLIP COIN
          </button>
        )}

        {tossWinnerId && !isFlipping && (
          <div className="w-full space-y-8 animate-fade-in">
             <div className="bg-slate-800 border border-blue-500/30 p-8 rounded-[2.5rem] text-center shadow-2xl">
                <Trophy className="mx-auto text-yellow-400 mb-4" size={48} />
                <h3 className="text-2xl font-bebas text-white tracking-widest uppercase mb-1">
                   {teams.find(t => t.id === tossWinnerId)?.name} Won!
                </h3>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">What's the call, Skip?</p>
                
                <div className="grid grid-cols-2 gap-4 mt-8">
                   <button 
                    onClick={() => setTossChoice('Bat')}
                    className={`py-6 rounded-3xl border-2 font-black uppercase tracking-widest text-sm transition-all ${tossChoice === 'Bat' ? 'bg-blue-600 border-blue-400 text-white shadow-lg' : 'bg-slate-900 border-slate-700 text-slate-500'}`}
                   >
                     <Swords className="mx-auto mb-2" />
                     Batting
                   </button>
                   <button 
                    onClick={() => setTossChoice('Bowl')}
                    className={`py-6 rounded-3xl border-2 font-black uppercase tracking-widest text-sm transition-all ${tossChoice === 'Bowl' ? 'bg-blue-600 border-blue-400 text-white shadow-lg' : 'bg-slate-900 border-slate-700 text-slate-500'}`}
                   >
                     <Zap className="mx-auto mb-2" />
                     Bowling
                   </button>
                </div>
             </div>

             <button 
              onClick={finalizeSetup}
              className="w-full bg-green-500 text-white font-black py-5 rounded-3xl uppercase tracking-widest shadow-xl active:scale-95 transition-all border-b-4 border-green-700"
             >
               START LIVE SCORING
             </button>
          </div>
        )}
      </div>

      <button onClick={() => setStep('config')} className="mt-8 text-slate-600 font-black uppercase text-[10px] tracking-widest hover:text-white transition-colors">
        GO BACK TO SETUP
      </button>
    </div>
  );
};

export default MatchSetup;
