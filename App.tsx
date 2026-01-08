
import React, { useState, useEffect } from 'react';
import { 
  Home, Trophy, LayoutGrid, Award, BarChart3, Radio, Plus, 
  CheckCircle2, UserPlus, X, Camera, ChevronRight, Medal, 
  Calendar, History, Search, UserCheck, Lock, 
  Smartphone, ShieldAlert, LogOut, HelpCircle, KeyRound, MessageSquare
} from 'lucide-react';
import ScoringDashboard from './components/ScoringDashboard';
import StatsDashboard from './components/StatsDashboard';
import MatchSetup from './components/MatchSetup';
import BccgLogo from './components/BccgLogo';
import { MOCK_TEAMS, MOCK_PLAYERS, MOCK_TOURNAMENTS } from './store/mockData';
import { MatchState, Team, Player, PlayerRole, Tournament, CompletedMatch } from './types';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isPendingApproval, setIsPendingApproval] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'setup' | 'scoring' | 'stats' | 'leagues'>('home');
  const [teams, setTeams] = useState<Team[]>(MOCK_TEAMS);
  const [players, setPlayers] = useState<Player[]>(MOCK_PLAYERS);
  const [tournaments] = useState<Tournament[]>(MOCK_TOURNAMENTS);
  const [completedMatches, setCompletedMatches] = useState<CompletedMatch[]>([]);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [currentMatch, setCurrentMatch] = useState<MatchState | null>(null);

  useEffect(() => {
    const savedSession = localStorage.getItem('GCA_SESSION');
    if (savedSession) {
      const { user, expiry } = JSON.parse(savedSession);
      if (new Date().getTime() < expiry) {
        setCurrentUser(user);
        setIsAuthenticated(true);
      } else {
        localStorage.removeItem('GCA_SESSION');
      }
    }
  }, []);

  const handleLogin = (nickname: string, isOwner = false) => {
    setCurrentUser(nickname);
    if (isOwner) {
      finalizeAuth(nickname);
    } else {
      setIsPendingApproval(true);
      setTimeout(() => {
        setIsPendingApproval(false);
        finalizeAuth(nickname);
      }, 3000);
    }
  };

  const finalizeAuth = (nickname: string) => {
    const expiry = new Date().getTime() + 1000 * 60 * 60 * 24; // 24h
    localStorage.setItem('GCA_SESSION', JSON.stringify({ user: nickname, expiry }));
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('GCA_SESSION');
    setIsAuthenticated(false);
    setCurrentUser(null);
    setActiveTab('home');
  };

  const handleStartMatch = (matchConfig: MatchState) => {
    setCurrentMatch(matchConfig);
    setActiveTab('scoring');
  };

  const handleCompleteMatch = (finalMatch: CompletedMatch) => {
    setCompletedMatches(prev => [finalMatch, ...prev]);
    setCurrentMatch(null);
    setActiveTab('home');
  };

  if (!isAuthenticated) {
    return (
      <LoginView 
        onLogin={handleLogin} 
        isPending={isPendingApproval} 
        nickname={currentUser || ''} 
      />
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomeView players={players} completedMatches={completedMatches} onStartScoring={() => setActiveTab('setup')} onLogout={handleLogout} />;
      case 'setup':
        return <MatchSetup teams={teams} players={players} onStartMatch={handleStartMatch} />;
      case 'scoring':
        return currentMatch ? (
          <ScoringDashboard initialState={currentMatch} onMatchComplete={handleCompleteMatch} />
        ) : (
          <div className="p-12 text-center text-slate-500">
            <Radio className="mx-auto mb-4 opacity-20" size={48} />
            <p className="font-bebas text-xl uppercase tracking-widest">No Active Match</p>
            <button onClick={() => setActiveTab('setup')} className="mt-4 text-yellow-400 font-bold uppercase text-xs">Start New Session</button>
          </div>
        );
      case 'stats':
        return <StatsDashboard players={players} onUpdatePlayer={(p) => setPlayers(prev => prev.map(pl => pl.id === p.id ? p : pl))} />;
      case 'leagues':
        return <LeaguesView 
          teams={teams} 
          players={players} 
          tournaments={tournaments} 
          onTogglePlayer={(tid, pid) => {
            setTeams(prev => prev.map(t => {
              if (t.id === tid) {
                const isPresent = t.players.includes(pid);
                return { ...t, players: isPresent ? t.players.filter(id => id !== pid) : [...t.players, pid] };
              }
              return t;
            }));
          }} 
          onAddPlayer={(p) => setPlayers(prev => [...prev, p])} 
        />;
      default:
        return <HomeView players={players} completedMatches={completedMatches} onStartScoring={() => setActiveTab('setup')} onLogout={handleLogout} />;
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] max-w-md mx-auto bg-slate-900 relative overflow-hidden">
      <div className="flex-1 overflow-y-auto no-scrollbar scroll-smooth">
        {renderContent()}
      </div>

      <nav className="fixed bottom-0 left-0 right-0 h-20 bg-slate-800/95 backdrop-blur-md border-t border-slate-700 flex items-center justify-around px-6 z-50 max-w-md mx-auto">
        <NavButton active={activeTab === 'home'} icon={<LayoutGrid />} label="Lobby" onClick={() => setActiveTab('home')} />
        <NavButton active={activeTab === 'setup' || activeTab === 'scoring'} icon={<Radio />} label="Live" onClick={() => setActiveTab('setup')} />
        <div className="relative -top-6">
           <button onClick={() => setActiveTab('setup')} className="w-16 h-16 bg-slate-900 rounded-3xl rotate-45 flex items-center justify-center shadow-xl border-4 border-slate-800 active:scale-95 transition-all">
              <div className="-rotate-45">
                <BccgLogo size={40} />
              </div>
           </button>
        </div>
        <NavButton active={activeTab === 'stats'} icon={<BarChart3 />} label="Stats" onClick={() => setActiveTab('stats')} />
        <NavButton active={activeTab === 'leagues'} icon={<Trophy />} label="Leagues" onClick={() => setActiveTab('leagues')} />
      </nav>
    </div>
  );
};

const NavButton = ({ active, icon, label, onClick }: any) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1 transition-all ${active ? 'text-yellow-400' : 'text-slate-500'}`}>
    {React.cloneElement(icon, { size: 22 })}
    <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
  </button>
);

const LoginView = ({ onLogin, isPending, nickname }: { onLogin: (n: string, isOwner?: boolean) => void, isPending: boolean, nickname: string }) => {
  const [view, setView] = useState<'login' | 'forgot'>('login');
  const [inputNickname, setInputNickname] = useState('');
  const [accessKey, setAccessKey] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!inputNickname || !accessKey) {
      setError('Captain, fill all details first!');
      return;
    }
    if (accessKey.toUpperCase() === 'OWNER777') {
      onLogin(inputNickname, true);
    } else if (accessKey.toUpperCase() === 'GULLY2024') {
      onLogin(inputNickname);
    } else {
      setError('Invalid Access Key. Check with your Captain.');
    }
  };

  const handleForgot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputNickname) {
      setError('Enter your nickname to ping the Admin.');
      return;
    }
    setError('');
    setSuccess(`Recovery request sent for ${inputNickname}. Admin will shout the code!`);
    setTimeout(() => {
      setSuccess('');
      setView('login');
    }, 4000);
  };

  if (isPending) {
    return (
      <div className="h-[100dvh] max-w-md mx-auto bg-slate-950 flex flex-col items-center justify-center p-8 text-center animate-fade-in">
        <div className="relative mb-10">
          <div className="absolute inset-0 bg-blue-600 rounded-full blur-3xl opacity-20 animate-pulse"></div>
          <BccgLogo size={120} className="animate-pulse relative z-10" />
        </div>
        <h2 className="text-3xl font-bebas tracking-widest text-white mb-2 uppercase">Awaiting Field Access</h2>
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-8">VERIFYING {nickname} WITH BCCG OWNER</p>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3 w-full">
           <div className="flex items-center gap-3 text-left">
              <ShieldAlert className="text-yellow-500 shrink-0" size={20} />
              <p className="text-[10px] font-bold text-slate-300 leading-relaxed uppercase">The BCCG Board is reviewing your entry credentials.</p>
           </div>
           <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 animate-pulse" style={{width: '60%'}}></div>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] max-w-md mx-auto bg-slate-950 flex flex-col p-8 overflow-y-auto no-scrollbar">
      <div className="mt-8 mb-12 text-center">
        <BccgLogo size={160} className="mx-auto mb-10" />
        <h1 className="text-5xl font-bebas tracking-tighter text-white leading-none">
          GULLY HEROES<br/><span className="text-yellow-400">ASSOCIATION</span>
        </h1>
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-4 italic">Managed by Board of Control for Cricket in Gully</p>
      </div>

      {view === 'login' ? (
        <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Hero Nickname</label>
            <div className="relative">
              <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
              <input 
                type="text" 
                placeholder="e.g. Master Blaster"
                value={inputNickname}
                onChange={(e) => setInputNickname(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 p-4 pl-12 rounded-2xl text-white font-bold outline-none focus:border-yellow-400 transition-all text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Access Key</label>
              <button 
                type="button" 
                onClick={() => setView('forgot')}
                className="text-[10px] font-black text-yellow-500 uppercase tracking-widest hover:underline"
              >
                Forgot Key?
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
              <input 
                type="password" 
                placeholder="••••••••"
                value={accessKey}
                onChange={(e) => setAccessKey(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 p-4 pl-12 rounded-2xl text-white font-bold outline-none focus:border-yellow-400 transition-all text-sm"
              />
            </div>
          </div>

          {error && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-black uppercase rounded-xl flex items-center gap-2 animate-shake"><ShieldAlert size={14}/> {error}</div>}

          <button type="submit" className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3">
            ENTER GULLY ARENA <ChevronRight size={18} />
          </button>
        </form>
      ) : (
        <form onSubmit={handleForgot} className="space-y-6 animate-fade-in">
           <div className="p-6 bg-yellow-400/5 border border-yellow-400/10 rounded-2xl text-center mb-4">
              <HelpCircle className="mx-auto text-yellow-400 mb-2" size={32} />
              <p className="text-xs text-slate-300 font-bold leading-relaxed uppercase">Enter your nickname. We'll send a ping to the BCCG Admin to reveal your key.</p>
           </div>
           
           <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Confirm Nickname</label>
            <div className="relative">
              <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
              <input 
                type="text" 
                placeholder="The nickname you registered"
                value={inputNickname}
                onChange={(e) => setInputNickname(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 p-4 pl-12 rounded-2xl text-white font-bold outline-none focus:border-yellow-400 transition-all text-sm"
              />
            </div>
          </div>

          {error && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-black uppercase rounded-xl flex items-center gap-2 animate-shake"><ShieldAlert size={14}/> {error}</div>}
          {success && <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-black uppercase rounded-xl flex items-center gap-2"><CheckCircle2 size={14}/> {success}</div>}

          <div className="space-y-3">
            <button type="submit" className="w-full bg-slate-100 text-slate-900 font-black py-4 rounded-2xl uppercase tracking-widest shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2">
              <KeyRound size={18} /> REQUEST KEY HINT
            </button>
            <button type="button" onClick={() => setView('login')} className="w-full py-4 text-slate-500 font-black uppercase text-[10px] tracking-[0.3em] hover:text-white transition-colors">
              BACK TO LOGIN
            </button>
          </div>
        </form>
      )}

      <div className="mt-auto pt-8 text-center border-t border-slate-900/50">
        <p className="text-slate-600 text-[8px] font-black uppercase tracking-[0.3em] mb-4">Secured by BCCG Neighborhood Watch</p>
        <div className="flex justify-center gap-6 text-slate-800">
           <Medal size={20} /> <Trophy size={20} /> <MessageSquare size={20} />
        </div>
      </div>
    </div>
  );
};

const HomeView = ({ onStartScoring, players, completedMatches, onLogout }: { onStartScoring: () => void, players: Player[], completedMatches: CompletedMatch[], onLogout: () => void }) => (
  <div className="p-6 pt-12 pb-32">
    <div className="flex justify-between items-start mb-10">
      <div className="flex items-center gap-4">
        <BccgLogo size={60} />
        <div>
          <h1 className="text-2xl font-bebas tracking-widest text-white leading-tight">GULLY CRICKET<br/><span className="text-yellow-400">ASSOCIATION</span></h1>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">Official Neighborhood Portal</p>
        </div>
      </div>
      <button onClick={onLogout} className="p-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-400 hover:text-red-400 transition-colors shadow-lg">
        <LogOut size={20} />
      </button>
    </div>

    <div className="space-y-6">
      <div className="bg-gradient-to-br from-blue-700 to-blue-900 rounded-3xl p-6 shadow-2xl relative overflow-hidden group border border-blue-400/20">
        <div className="absolute -right-4 -bottom-4 opacity-10 transform scale-150 group-hover:rotate-12 transition-transform duration-700">
           <Trophy size={150} />
        </div>
        <div className="relative z-10">
          <p className="text-blue-200 text-[10px] font-black uppercase tracking-widest mb-1">Upcoming Highlight</p>
          <h2 className="text-3xl font-bebas mb-2 text-white tracking-wide">Sunday Bash Finals</h2>
          <p className="text-blue-100/70 text-xs font-medium mb-6 uppercase tracking-wider italic">Strikers vs Warriors • Local Park Arena</p>
          <button onClick={onStartScoring} className="bg-white text-blue-700 px-8 py-3 rounded-2xl font-black text-xs shadow-xl active:scale-95 transition-all uppercase tracking-widest">
            START LIVE SCORE
          </button>
        </div>
      </div>

      <section className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <div className="flex justify-between items-center mb-4 px-1">
           <h3 className="font-bebas text-xl text-slate-300 tracking-wider flex items-center gap-2">
             <History size={18} className="text-yellow-400" /> Match Archive
           </h3>
           <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{completedMatches.length} Matches</span>
        </div>
        
        <div className="space-y-4">
          {completedMatches.length > 0 ? (
            completedMatches.map(match => (
              <div key={match.id} className="bg-slate-800 rounded-2xl p-4 border border-slate-700 shadow-xl group">
                 <div className="flex justify-between items-start mb-3">
                    <span className="flex items-center gap-1.5 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                       <Calendar size={10} className="text-yellow-400" /> {match.timestamp}
                    </span>
                    <span className="px-2 py-0.5 bg-green-500/10 text-green-400 text-[8px] font-black rounded-full uppercase tracking-tighter">Verified Result</span>
                 </div>
                 <div className="grid grid-cols-[1fr,auto,1fr] gap-4 items-center mb-3">
                    <div className="text-right">
                       <p className="text-xs font-bold text-slate-300 uppercase truncate">{match.teamAName}</p>
                    </div>
                    <div className="px-2 py-1 bg-slate-900 rounded font-bebas text-[10px] text-slate-500 italic">VS</div>
                    <div className="text-left">
                       <p className="text-xs font-bold text-slate-300 uppercase truncate">{match.teamBName}</p>
                    </div>
                 </div>
                 <div className="pt-2 border-t border-slate-700 text-[10px] text-yellow-400 font-black uppercase italic tracking-widest text-center">
                    {match.result}
                 </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center border-2 border-dashed border-slate-800 rounded-3xl opacity-50">
               <History size={32} className="mx-auto text-slate-700 mb-3" />
               <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.2em]">The Scorebook is currently empty</p>
            </div>
          )}
        </div>
      </section>

      <section className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
        <div className="flex justify-between items-center mb-4 px-1">
           <h3 className="font-bebas text-xl text-slate-300 tracking-wider">Neighborhood Elites</h3>
           <button className="text-yellow-400 text-[10px] font-black uppercase tracking-widest">Rankings</button>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {players.slice(0, 3).map((p, idx) => (
            <div key={p.id} className="bg-slate-800/40 p-4 rounded-3xl border border-slate-700/50 text-center relative overflow-hidden">
               <div className="absolute -top-1 -left-1 w-6 h-6 bg-yellow-400 rounded-br-xl flex items-center justify-center font-bebas text-slate-900 text-xs">
                 #{idx + 1}
               </div>
               <div className="w-14 h-14 rounded-full mx-auto mb-3 border-2 border-slate-600 overflow-hidden shadow-lg bg-slate-900">
                  <img src={p.profilePic} className="w-full h-full object-cover" alt={p.name} />
               </div>
               <p className="text-[9px] font-black text-slate-300 truncate uppercase tracking-tighter mb-1">{p.nickname}</p>
               <p className="text-xs font-bebas text-yellow-400 tracking-widest">{p.career.runs} RUNS</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  </div>
);

const LeaguesView = ({ teams, players, tournaments, onTogglePlayer, onAddPlayer }: { 
  teams: Team[], 
  players: Player[], 
  tournaments: Tournament[],
  onTogglePlayer: (tid: string, pid: string) => void,
  onAddPlayer: (p: Player) => void
}) => {
  const [editingTeam, setEditingTeam] = useState<string | null>(null);
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerNickname, setNewPlayerNickname] = useState('');
  const [newPlayerPhoto, setNewPlayerPhoto] = useState<string | null>(null);

  const filteredPlayers = players.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.nickname.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreatePlayer = () => {
    if (!newPlayerName || !newPlayerNickname) return;
    const player: Player = {
      id: Math.random().toString(36).substr(2, 9),
      name: newPlayerName,
      nickname: newPlayerNickname,
      role: PlayerRole.ALL_ROUNDER,
      battingStyle: 'Right Hand',
      bowlingStyle: 'Right Arm Fast',
      profilePic: newPlayerPhoto || 'https://via.placeholder.com/150',
      career: { matches: 0, runs: 0, wickets: 0, highestScore: 0, bestBowling: '0/0', catches: 0, strikeRate: 0, economy: 0 }
    };
    onAddPlayer(player);
    setNewPlayerName('');
    setNewPlayerNickname('');
    setNewPlayerPhoto(null);
    setShowAddPlayer(false);
  };

  return (
    <div className="p-6 pt-12 pb-32">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bebas tracking-widest text-white">The <span className="text-yellow-400">Leagues</span></h1>
        <button 
          onClick={() => setShowAddPlayer(true)}
          className="bg-yellow-400 text-slate-900 px-4 py-2.5 rounded-2xl flex items-center gap-2 font-black text-[10px] uppercase shadow-lg shadow-yellow-400/10 active:scale-95 transition-all"
        >
          <UserPlus size={16} /> ADD HERO
        </button>
      </div>

      {tournaments.map(tour => (
        <div key={tour.id} className="mb-8 bg-slate-800 rounded-3xl p-6 border border-slate-700/50 shadow-xl overflow-hidden relative">
           <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/5 blur-3xl rounded-full -mr-16 -mt-16"></div>
           <div className="flex justify-between items-center mb-6 relative z-10">
              <h2 className="text-2xl font-bebas text-white tracking-wide flex items-center gap-2 italic">
                <Medal className="text-yellow-400" size={24} /> {tour.name}
              </h2>
              <span className="px-3 py-1 bg-green-500/20 text-green-400 text-[9px] font-black rounded-full uppercase tracking-widest border border-green-500/20">{tour.status}</span>
           </div>
           
           <div className="overflow-x-auto no-scrollbar relative z-10">
              <table className="w-full text-left">
                <thead>
                   <tr className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-700">
                      <th className="pb-3 pr-4">Team</th>
                      <th className="pb-3 px-2">P</th>
                      <th className="pb-3 px-2">W</th>
                      <th className="pb-3 px-2">NRR</th>
                      <th className="pb-3 text-right">Pts</th>
                   </tr>
                </thead>
                <tbody className="text-sm font-medium">
                   {tour.pointsTable.map(entry => {
                      const team = teams.find(t => t.id === entry.teamId);
                      return (
                        <tr key={entry.teamId} className="border-b border-slate-700/30">
                           <td className="py-4 flex items-center gap-3">
                              <span className="text-xl bg-slate-900 w-8 h-8 flex items-center justify-center rounded-lg border border-slate-700">{team?.logo}</span>
                              <span className="text-slate-200 font-bold uppercase text-[11px] truncate w-24 tracking-tight">{team?.name}</span>
                           </td>
                           <td className="py-4 px-2 text-slate-400 font-bebas text-lg">{entry.played}</td>
                           <td className="py-4 px-2 text-slate-400 font-bebas text-lg">{entry.won}</td>
                           <td className="py-4 px-2 text-slate-400 text-[10px] font-bold">{entry.nrr > 0 ? `+${entry.nrr.toFixed(3)}` : entry.nrr.toFixed(3)}</td>
                           <td className="py-4 text-right text-yellow-400 font-bebas text-2xl">{entry.points}</td>
                        </tr>
                      );
                   })}
                </tbody>
              </table>
           </div>
        </div>
      ))}

      <div className="flex items-center justify-between mb-4 px-1">
         <h3 className="font-bebas text-xl text-slate-500 tracking-widest uppercase">Gully Squads</h3>
      </div>

      <div className="space-y-4">
        {teams.map(team => {
          const isManaging = editingTeam === team.id;
          return (
            <div key={team.id} className={`rounded-3xl border transition-all duration-500 shadow-xl overflow-hidden ${isManaging ? 'bg-slate-800 border-yellow-400/40' : 'bg-slate-800 border-slate-700/50'}`}>
              {!isManaging ? (
                <div className="p-6 flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-3xl shadow-inner border border-slate-700">
                      {team.logo}
                    </div>
                    <div>
                      <h3 className="text-xl font-bebas text-white tracking-wide leading-none mb-1.5 uppercase">{team.name}</h3>
                      <div className="flex -space-x-1.5 mt-1">
                        {team.players.map(pid => (
                          <div key={pid} className="w-6 h-6 rounded-full border border-slate-800 overflow-hidden bg-slate-700 shadow-md">
                            <img src={players.find(p => p.id === pid)?.profilePic} className="w-full h-full object-cover" alt="" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setEditingTeam(team.id)} className="w-12 h-12 bg-slate-700/50 rounded-2xl flex items-center justify-center text-yellow-400 border border-slate-600 active:scale-90 transition-all shadow-lg">
                    <Plus size={24} />
                  </button>
                </div>
              ) : (
                <div className="animate-in slide-in-from-top-4 duration-300">
                  <div className="bg-slate-900 p-6 border-b border-slate-700/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{team.logo}</span>
                      <div>
                         <h4 className="text-lg font-bebas text-white tracking-widest uppercase">Squad Draft: {team.name}</h4>
                         <p className="text-[9px] font-black text-yellow-400 uppercase tracking-widest">Select {team.players.length} Heroes to Bench</p>
                      </div>
                    </div>
                    <button onClick={() => { setEditingTeam(null); setSearchQuery(''); }} className="p-2 bg-yellow-400 rounded-xl text-slate-900 shadow-lg">
                      <CheckCircle2 size={24} />
                    </button>
                  </div>

                  <div className="p-5">
                    <div className="relative mb-6">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                      <input 
                        type="text"
                        placeholder="Search heroes to draft..."
                        className="w-full bg-slate-900 border border-slate-700 rounded-2xl py-3 pl-12 pr-4 text-xs font-bold text-white outline-none focus:border-yellow-400 transition-all shadow-inner"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3 max-h-[380px] overflow-y-auto no-scrollbar pb-4 pr-1">
                      {filteredPlayers.map(p => {
                        const isPresent = team.players.includes(p.id);
                        return (
                          <button
                            key={p.id}
                            onClick={() => onTogglePlayer(team.id, p.id)}
                            className={`flex items-center gap-3 p-3 rounded-2xl border transition-all relative ${
                              isPresent ? 'bg-yellow-400/10 border-yellow-400 shadow-xl' : 'bg-slate-900 border-slate-700/50 opacity-50 grayscale'
                            }`}
                          >
                             <div className={`w-10 h-10 rounded-full overflow-hidden border-2 bg-slate-800 shrink-0 ${isPresent ? 'border-yellow-400' : 'border-slate-700'}`}>
                                <img src={p.profilePic} alt="" className="w-full h-full object-cover" />
                             </div>
                             <div className="min-w-0 text-left">
                               <p className={`text-[10px] font-black uppercase truncate tracking-tighter ${isPresent ? 'text-white' : 'text-slate-400'}`}>{p.nickname}</p>
                               <p className="text-[8px] font-bold text-slate-500 uppercase truncate tracking-widest">{p.role}</p>
                             </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showAddPlayer && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-xl z-[100] p-6 flex items-center justify-center">
          <div className="bg-slate-800 w-full max-w-sm rounded-[2.5rem] p-8 border border-slate-700 shadow-2xl relative animate-fade-in">
            <button onClick={() => setShowAddPlayer(false)} className="absolute top-6 right-6 text-slate-500 p-2"><X size={24} /></button>
            <div className="text-center mb-10">
               <h2 className="font-bebas text-4xl text-white tracking-widest mb-1">DRAFT A <span className="text-yellow-400">HERO</span></h2>
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Register for GCA Neighborhood Watch</p>
            </div>
            
            <div className="flex flex-col items-center mb-8">
               <div className="w-24 h-24 rounded-3xl bg-slate-900 border-2 border-slate-700 flex items-center justify-center overflow-hidden relative group">
                  {newPlayerPhoto ? <img src={newPlayerPhoto} className="w-full h-full object-cover" alt="" /> : <Camera className="text-slate-700" size={32} />}
                  <input type="file" accept="image/*" onChange={(e) => {
                    const reader = new FileReader();
                    reader.onload = () => setNewPlayerPhoto(reader.result as string);
                    if(e.target.files?.[0]) reader.readAsDataURL(e.target.files[0]);
                  }} className="absolute inset-0 opacity-0 cursor-pointer" />
               </div>
               <p className="text-[8px] font-black text-slate-500 uppercase mt-2 tracking-widest">Update Photo</p>
            </div>

            <div className="space-y-5">
              <input placeholder="Official Full Name" className="w-full bg-slate-900 border border-slate-700 p-4 rounded-2xl text-white font-bold outline-none focus:border-yellow-400 transition-all text-sm" value={newPlayerName} onChange={e => setNewPlayerName(e.target.value)} />
              <input placeholder="Local Gully Nickname" className="w-full bg-slate-900 border border-slate-700 p-4 rounded-2xl text-white font-bold outline-none focus:border-yellow-400 transition-all text-sm" value={newPlayerNickname} onChange={e => setNewPlayerNickname(e.target.value)} />
              <button onClick={handleCreatePlayer} className="w-full bg-yellow-400 text-slate-900 font-black py-5 rounded-[1.5rem] uppercase tracking-widest shadow-xl active:scale-95 transition-all text-sm mt-4">FINALIZE DRAFT</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
