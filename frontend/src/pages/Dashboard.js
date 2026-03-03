import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserCircle, FaLinkedin, FaTwitter, FaInstagram } from 'react-icons/fa';
import { getBalance, getLimits, getRecipients, logoutUser, clearAccessToken } from '../services/api';
import AddMoneyModal from '../components/AddMoneyModal';
import AddRecipientModal from '../components/AddRecipientModal';

// ─── CHANGE THIS TO SWITCH MOBILE THEME (1, 2, or 3) ────────
const MOBILE_THEME = 2;

// ─── ANIMATIONS ──────────────────────────────────────────────
const styles = `
  @keyframes floatPulse { 0%,100%{opacity:0.3;transform:scale(1);}50%{opacity:0.6;transform:scale(1.1);} }
  @keyframes fadeInUp { from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:translateY(0);} }
  @keyframes slideUp { from{opacity:0;transform:translateY(40px);}to{opacity:1;transform:translateY(0);} }
  .fade-in { animation: fadeInUp 0.5s ease forwards; }
  .slide-up { animation: slideUp 0.6s ease forwards; }
  .bottom-nav-safe { padding-bottom: env(safe-area-inset-bottom, 16px); }
`;

// ─── CIRCLE PROGRESS ─────────────────────────────────────────
const CircleProgress = ({ percentage, color, size = 60 }) => {
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" className="flex-shrink-0">
      <circle cx="30" cy="30" r={radius} fill="none" stroke="#f0f0f0" strokeWidth="5" />
      <circle cx="30" cy="30" r={radius} fill="none" stroke={color} strokeWidth="5"
        strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
        strokeLinecap="round" transform="rotate(-90 30 30)"
        style={{ transition: 'stroke-dashoffset 0.8s ease' }}/>
    </svg>
  );
};

// ─── BOTTOM NAV (shared by all mobile themes) ─────────────────
const BottomNav = ({ active, navigate, setShowAddRecipient }) => {
  const items = [
    { key:'home', icon:'🏠', label:'Home', action: () => {} },
    { key:'send', icon:'💸', label:'Send', action: () => navigate('/send') },
    { key:'history', icon:'📋', label:'History', action: () => navigate('/history') },
    { key:'recipients', icon:'👥', label:'People', action: () => navigate('/recipients') },
  ];
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center px-2 pt-3 pb-5 bottom-nav-safe"
      style={{background:'rgba(6,15,30,0.95)', backdropFilter:'blur(20px)', borderTop:'1px solid rgba(78,205,196,0.15)'}}>
      {items.map(item => (
        <button key={item.key} onClick={item.action}
          className="flex flex-col items-center gap-1 border-none bg-transparent cursor-pointer px-4 py-1 rounded-xl transition-all"
          style={{fontFamily:"'Sora', sans-serif"}}>
          <span className="text-xl">{item.icon}</span>
          <span className="text-xs font-semibold" style={{color: active === item.key ? '#4ecdc4' : 'rgba(255,255,255,0.4)'}}>
            {item.label}
          </span>
          {active === item.key && (
            <div className="w-1 h-1 rounded-full" style={{background:'#4ecdc4'}}/>
          )}
        </button>
      ))}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════
// MOBILE THEME 1 — Dark Glass (same feel as desktop)
// ══════════════════════════════════════════════════════════════
const MobileTheme1 = ({ user, balance, limits, rates, loading, lastUpdated, currencies, navigate, setShowAddMoney, setShowAddRecipient, showProfile, setShowProfile }) => (
  <div className="min-h-screen pb-24" style={{background:'linear-gradient(135deg, #060f1e 0%, #0d2240 100%)', fontFamily:"'Sora', sans-serif"}}>

    {/* Subtle grid background */}
    <div className="fixed inset-0 z-0 opacity-20"
      style={{backgroundImage:'linear-gradient(rgba(26,58,92,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(26,58,92,0.5) 1px, transparent 1px)', backgroundSize:'40px 40px'}}/>

    {/* Header */}
    <div className="relative z-10 px-5 pt-12 pb-6">
      <div className="flex justify-between items-start">
        <div className="fade-in">
          <p className="text-xs font-bold uppercase tracking-widest m-0" style={{color:'#4ecdc4'}}>🌍 Draviṇa</p>
          <h1 className="font-extrabold text-white mt-1 m-0" style={{fontSize:'clamp(22px, 5vw, 28px)'}}>
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'} 👋
          </h1>
          <p className="font-bold text-lg mt-0.5 m-0" style={{color:'rgba(255,255,255,0.7)'}}>{user?.name || '...'}</p>
        </div>
        <div className="relative">
          <button onClick={() => setShowProfile(!showProfile)}
            className="w-12 h-12 rounded-full flex items-center justify-center border-none cursor-pointer"
            style={{background:'rgba(78,205,196,0.15)', border:'2px solid rgba(78,205,196,0.3)'}}>
            <FaUserCircle size={24} color="#4ecdc4" />
          </button>
          {showProfile && (
            <div className="absolute right-0 top-14 w-64 rounded-2xl p-5 z-50"
              style={{background:'rgba(13,34,64,0.98)', border:'1px solid rgba(78,205,196,0.2)', backdropFilter:'blur(20px)', boxShadow:'0 20px 60px rgba(0,0,0,0.5)'}}>
              <p className="font-bold text-base m-0 text-white">{user?.name}</p>
              <p className="text-xs m-0 mt-0.5" style={{color:'rgba(255,255,255,0.5)'}}>{user?.email}</p>
              <hr className="my-3" style={{borderColor:'rgba(255,255,255,0.1)'}}/>
              <button onClick={() => navigate('/accounts')}
                  className="w-full py-2.5 rounded-xl font-bold text-sm border-none cursor-pointer mb-2 bg-teal-500/10 text-teal-400">
                  🏦 Manage Bank Accounts
                </button>
              <button onClick={() => navigate('/faq')}
              className="w-full py-2.5 rounded-xl font-bold text-sm border-none cursor-pointer mb-2 bg-teal-500/10 text-teal-400">
              ❓ FAQ
            </button>
              <button onClick={async () => { await logoutUser(); clearAccessToken(); localStorage.removeItem('user'); navigate('/'); }}
                className="w-full py-2.5 rounded-xl font-bold text-sm border-none cursor-pointer"
                style={{background:'rgba(231,76,60,0.15)', color:'#e74c3c'}}>
                🚪 Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>

    {/* Balance Card */}
    <div className="relative z-10 px-5 mb-5 fade-in">
      <div className="rounded-3xl p-6 relative overflow-hidden"
        style={{background:'rgba(255,255,255,0.07)', backdropFilter:'blur(20px)', border:'1px solid rgba(78,205,196,0.2)'}}>
        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full" style={{background:'rgba(78,205,196,0.06)'}}/>
        <p className="text-xs font-semibold uppercase tracking-widest m-0" style={{color:'rgba(255,255,255,0.5)'}}>Total Balance</p>
        <h2 className="font-black text-white my-2 m-0" style={{fontSize:'clamp(36px, 8vw, 48px)', letterSpacing:'-2px'}}>
          ${balance.toFixed(2)}
        </h2>
        <p className="text-xs m-0" style={{color:'rgba(255,255,255,0.4)'}}>🇺🇸 United States Dollar</p>
        <div className="flex items-center gap-1.5 mt-3">
          <div className="w-1.5 h-1.5 rounded-full" style={{background:'#4ecdc4', boxShadow:'0 0 6px #4ecdc4'}}/>
          <span className="text-xs font-semibold" style={{color:'#4ecdc4'}}>Account Active</span>
        </div>
      </div>
    </div>

    {/* Quick Actions */}
    <div className="relative z-10 px-5 mb-5">
      <p className="text-xs font-bold uppercase tracking-widest mb-3 m-0" style={{color:'rgba(255,255,255,0.4)'}}>Quick Actions</p>
      <div className="grid grid-cols-2 gap-3">
        {[
          {icon:'💸', label:'Send Money', action:() => navigate('/send'), primary:true},
          {icon:'💰', label:'Add Money', action:() => setShowAddMoney(true), primary:false},
          {icon:'📋', label:'History', action:() => navigate('/history'), primary:false},
          {icon:'👥', label:'Recipients', action:() => navigate('/recipients'), primary:false},
        ].map(btn => (
          <button key={btn.label} onClick={btn.action}
            className="py-4 rounded-2xl font-bold text-sm border-none cursor-pointer transition-all duration-200 active:scale-95"
            style={{
              background: btn.primary ? 'linear-gradient(135deg, #4ecdc4, #1a7a6e)' : 'rgba(255,255,255,0.07)',
              color: btn.primary ? 'white' : 'rgba(255,255,255,0.7)',
              border: btn.primary ? 'none' : '1px solid rgba(255,255,255,0.1)',
              fontFamily:"'Sora', sans-serif"
            }}>
            <span className="text-xl block mb-1">{btn.icon}</span>
            {btn.label}
          </button>
        ))}
      </div>
    </div>

    {/* Transfer Limits */}
    <div className="relative z-10 px-5 mb-5">
      <p className="text-xs font-bold uppercase tracking-widest mb-3 m-0" style={{color:'rgba(255,255,255,0.4)'}}>Transfer Limits</p>
      <div className="rounded-2xl p-5" style={{background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)'}}>
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-xs m-0" style={{color:'rgba(255,255,255,0.4)'}}>Daily</p>
            <p className="font-bold text-base m-0 text-white">${limits.daily.used.toFixed(2)} <span className="text-xs font-normal" style={{color:'rgba(255,255,255,0.3)'}}>/ ${limits.daily.limit.toLocaleString()}</span></p>
          </div>
          <CircleProgress percentage={limits.daily.percentage} color="#4ecdc4" size={50}/>
        </div>
        <div className="h-px mb-4" style={{background:'rgba(255,255,255,0.06)'}}/>
        <div className="flex justify-between items-center">
          <div>
            <p className="text-xs m-0" style={{color:'rgba(255,255,255,0.4)'}}>Weekly</p>
            <p className="font-bold text-base m-0 text-white">${limits.weekly.used.toFixed(2)} <span className="text-xs font-normal" style={{color:'rgba(255,255,255,0.3)'}}>/ ${limits.weekly.limit.toLocaleString()}</span></p>
          </div>
          <CircleProgress percentage={limits.weekly.percentage} color="#1a7a6e" size={50}/>
        </div>
      </div>
    </div>

    {/* Live Rates */}
    <div className="relative z-10 px-5 mb-5">
      <div className="flex justify-between items-center mb-3">
        <p className="text-xs font-bold uppercase tracking-widest m-0" style={{color:'rgba(255,255,255,0.4)'}}>Live Rates</p>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full" style={{background:'#4ecdc4', boxShadow:'0 0 6px #4ecdc4'}}/>
          <span className="text-xs font-semibold" style={{color:'#4ecdc4'}}>Live</span>
        </div>
      </div>
      {loading ? (
        <p className="text-sm text-center py-8" style={{color:'rgba(255,255,255,0.3)'}}>Loading rates...</p>
      ) : (
        <div className="flex flex-col gap-2">
          {currencies.map(c => (
            <div key={c.code} className="flex justify-between items-center rounded-2xl px-4 py-3"
              style={{background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.07)'}}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{c.flag}</span>
                <div>
                  <p className="font-bold text-sm m-0 text-white">{c.code}</p>
                  <p className="text-xs m-0" style={{color:'rgba(255,255,255,0.3)'}}>{c.name}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-extrabold text-base m-0" style={{color:'#4ecdc4'}}>{rates[c.code]?.toFixed(4) || 'N/A'}</p>
                <p className="text-xs m-0" style={{color:'rgba(255,255,255,0.3)'}}>↑ Live</p>
              </div>
            </div>
          ))}
        </div>
      )}
      {!loading && <p className="text-xs text-center mt-3 m-0" style={{color:'rgba(255,255,255,0.2)'}}>🕐 {lastUpdated} · Auto-refreshes every 30s</p>}
    </div>
  </div>
);

// ══════════════════════════════════════════════════════════════
// MOBILE THEME 2 — Gradient Hero (bold gradient top, white bottom)
// ══════════════════════════════════════════════════════════════
const MobileTheme2 = ({ user, balance, limits, rates, loading, lastUpdated, currencies, navigate, setShowAddMoney, setShowAddRecipient, showProfile, setShowProfile }) => (
  <div className="min-h-screen pb-24" style={{fontFamily:"'Sora', sans-serif"}}>

    {/* Gradient Hero Top */}
    <div className="relative overflow-hidden px-5 pt-12 pb-20"
      style={{background:'linear-gradient(160deg, #0f4c81 0%, #1a7a6e 60%, #4ecdc4 100%)'}}>
      <div className="absolute inset-0 opacity-10"
        style={{backgroundImage:'radial-gradient(circle at 30% 50%, white 1px, transparent 1px)', backgroundSize:'30px 30px'}}/>
      <div className="flex justify-between items-start relative z-10">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest m-0" style={{color:'rgba(255,255,255,0.7)'}}>🌍 Draviṇa</p>
          <h1 className="font-extrabold text-white mt-1 m-0" style={{fontSize:'clamp(20px, 5vw, 26px)'}}>
            {new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening'} 👋
          </h1>
          <p className="font-semibold mt-0.5 m-0" style={{color:'rgba(255,255,255,0.8)'}}>{user?.name || '...'}</p>
        </div>
        <div className="relative">
          <button onClick={() => setShowProfile(!showProfile)}
            className="w-12 h-12 rounded-full flex items-center justify-center border-none cursor-pointer"
            style={{background:'rgba(255,255,255,0.2)', backdropFilter:'blur(10px)'}}>
            <FaUserCircle size={24} color="white" />
          </button>
          {showProfile && (
            <div className="absolute right-0 top-14 w-64 bg-white rounded-2xl p-5 z-50"
              style={{boxShadow:'0 20px 60px rgba(0,0,0,0.2)'}}>
              <p className="font-bold text-base m-0" style={{color:'#1a1a2e'}}>{user?.name}</p>
              <p className="text-xs m-0 mt-0.5" style={{color:'#888'}}>{user?.email}</p>
              <hr className="my-3" style={{borderColor:'#f0f0f0'}}/>
              <button onClick={() => navigate('/accounts')}
                className="w-full py-2.5 rounded-xl font-bold text-sm border-none cursor-pointer mb-2 bg-teal-500/10 text-teal-400">
                🏦 Manage Bank Accounts
              </button>
              <button onClick={() => navigate('/faq')}
                className="w-full py-2.5 rounded-xl font-bold text-sm border-none cursor-pointer mb-2 bg-teal-500/10 text-teal-400">
                ❓ FAQ
              </button>
              <button onClick={async () => { await logoutUser(); clearAccessToken(); localStorage.removeItem('user'); navigate('/'); }}
                className="w-full py-2.5 rounded-xl font-bold text-sm border-none cursor-pointer"
                style={{background:'#fff0f0', color:'#e74c3c'}}>
                🚪 Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Balance - floats over gradient */}
      <div className="relative z-10 mt-6">
        <p className="text-xs font-semibold uppercase tracking-widest m-0" style={{color:'rgba(255,255,255,0.7)'}}>Total Balance</p>
        <h2 className="font-black text-white my-1 m-0" style={{fontSize:'clamp(40px, 10vw, 56px)', letterSpacing:'-2px'}}>
          ${balance.toFixed(2)}
        </h2>
        <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1" style={{background:'rgba(255,255,255,0.15)'}}>
          <div className="w-1.5 h-1.5 rounded-full bg-white"/>
          <span className="text-xs font-semibold text-white">Account Active</span>
        </div>
      </div>
    </div>

    {/* White Bottom Sheet - slides up over gradient */}
    <div className="relative -mt-10 rounded-t-3xl px-5 pt-6" style={{background:'#f7f8fc', minHeight:'60vh'}}>

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-2 mb-6">
        {[
          {icon:'💸', label:'Send', action:() => navigate('/send')},
          {icon:'💰', label:'Add', action:() => setShowAddMoney(true)},
          {icon:'📋', label:'History', action:() => navigate('/history')},
          {icon:'👥', label:'People', action:() => navigate('/recipients')},
        ].map(btn => (
          <button key={btn.label} onClick={btn.action}
            className="flex flex-col items-center gap-1.5 bg-white rounded-2xl py-3 border-none cursor-pointer transition-all active:scale-95"
            style={{boxShadow:'0 4px 12px rgba(0,0,0,0.06)', fontFamily:"'Sora', sans-serif"}}>
            <span className="text-2xl">{btn.icon}</span>
            <span className="text-xs font-semibold" style={{color:'#888'}}>{btn.label}</span>
          </button>
        ))}
      </div>

      {/* Limits */}
      <div className="bg-white rounded-2xl p-5 mb-4" style={{boxShadow:'0 4px 20px rgba(0,0,0,0.06)'}}>
        <p className="text-xs font-bold uppercase tracking-widest mb-4 m-0" style={{color:'#888'}}>Transfer Limits</p>
        <div className="flex justify-between items-center mb-3">
          <div>
            <p className="text-xs m-0" style={{color:'#888'}}>Daily</p>
            <p className="font-bold text-base m-0" style={{color:'#0f4c81'}}>${limits.daily.used.toFixed(2)} <span className="text-xs font-normal" style={{color:'#aaa'}}>/ ${limits.daily.limit.toLocaleString()}</span></p>
          </div>
          <CircleProgress percentage={limits.daily.percentage} color="#0f4c81" size={50}/>
        </div>
        <hr style={{borderColor:'#f5f5f5', marginBottom:'12px'}}/>
        <div className="flex justify-between items-center">
          <div>
            <p className="text-xs m-0" style={{color:'#888'}}>Weekly</p>
            <p className="font-bold text-base m-0" style={{color:'#1a7a6e'}}>${limits.weekly.used.toFixed(2)} <span className="text-xs font-normal" style={{color:'#aaa'}}>/ ${limits.weekly.limit.toLocaleString()}</span></p>
          </div>
          <CircleProgress percentage={limits.weekly.percentage} color="#1a7a6e" size={50}/>
        </div>
      </div>

      {/* Live Rates */}
      <div className="bg-white rounded-2xl p-5 mb-4" style={{boxShadow:'0 4px 20px rgba(0,0,0,0.06)'}}>
        <div className="flex justify-between items-center mb-4">
          <p className="font-extrabold text-base m-0" style={{color:'#1a1a2e'}}>Live Rates</p>
          <div className="flex items-center gap-1.5 rounded-full px-2.5 py-1" style={{background:'#f0fff8'}}>
            <div className="w-1.5 h-1.5 rounded-full" style={{background:'#1a7a6e'}}/>
            <span className="text-xs font-semibold" style={{color:'#1a7a6e'}}>Live</span>
          </div>
        </div>
        {loading ? <p className="text-sm text-center py-4" style={{color:'#aaa'}}>Loading...</p> : (
          <div className="flex flex-col gap-2">
            {currencies.map(c => (
              <div key={c.code} className="flex justify-between items-center rounded-xl px-3 py-2.5"
                style={{background:'#f7f8fc'}}>
                <div className="flex items-center gap-2">
                  <span className="text-xl">{c.flag}</span>
                  <p className="font-bold text-sm m-0" style={{color:'#1a1a2e'}}>{c.code}</p>
                </div>
                <p className="font-extrabold text-sm m-0" style={{color:'#0f4c81'}}>{rates[c.code]?.toFixed(4) || 'N/A'}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  </div>
);

// ══════════════════════════════════════════════════════════════
// MOBILE THEME 3 — Floating Cards (full dark like landing page)
// ══════════════════════════════════════════════════════════════
const MobileTheme3 = ({ user, balance, limits, rates, loading, lastUpdated, currencies, navigate, setShowAddMoney, setShowAddRecipient, showProfile, setShowProfile }) => (
  <div className="min-h-screen pb-24 relative overflow-hidden" style={{background:'#060f1e', fontFamily:"'Sora', sans-serif"}}>

    {/* Animated background dots */}
    <div className="fixed inset-0 z-0">
      {[
        {x:'15%',y:'20%'},{x:'75%',y:'15%'},{x:'85%',y:'50%'},
        {x:'20%',y:'70%'},{x:'60%',y:'80%'}
      ].map((pos, i) => (
        <div key={i} className="absolute rounded-full"
          style={{left:pos.x, top:pos.y, width:'6px', height:'6px', background:'#4ecdc4',
            boxShadow:'0 0 12px #4ecdc4', opacity:0.6,
            animation:`floatPulse ${2+i*0.5}s ease-in-out infinite`, animationDelay:`${i*0.4}s`}}/>
      ))}
      <svg className="absolute inset-0 w-full h-full opacity-10">
        <line x1="15%" y1="20%" x2="75%" y2="15%" stroke="#1a7a6e" strokeWidth="1" strokeDasharray="6,4"/>
        <line x1="75%" y1="15%" x2="85%" y2="50%" stroke="#1a7a6e" strokeWidth="1" strokeDasharray="6,4"/>
        <line x1="85%" y1="50%" x2="60%" y2="80%" stroke="#1a7a6e" strokeWidth="1" strokeDasharray="6,4"/>
        <line x1="20%" y1="70%" x2="60%" y2="80%" stroke="#1a7a6e" strokeWidth="1" strokeDasharray="6,4"/>
      </svg>
    </div>

    {/* Header */}
    <div className="relative z-10 px-5 pt-12 pb-4 flex justify-between items-center">
      <div>
        <h1 className="font-black text-white m-0" style={{fontSize:'24px', letterSpacing:'-0.5px'}}>🌍 Draviṇa</h1>
        <p className="text-xs m-0 mt-0.5" style={{color:'rgba(255,255,255,0.35)', letterSpacing:'2px', textTransform:'uppercase'}}>Send Money. Make Happy.</p>
      </div>
      <div className="relative">
        <button onClick={() => setShowProfile(!showProfile)}
          className="w-11 h-11 rounded-full flex items-center justify-center border-none cursor-pointer"
          style={{background:'rgba(78,205,196,0.1)', border:'1px solid rgba(78,205,196,0.3)'}}>
          <FaUserCircle size={22} color="#4ecdc4" />
        </button>
        {showProfile && (
          <div className="absolute right-0 top-14 w-60 rounded-2xl p-5 z-50"
            style={{background:'rgba(13,34,64,0.98)', backdropFilter:'blur(20px)', border:'1px solid rgba(78,205,196,0.2)', boxShadow:'0 20px 60px rgba(0,0,0,0.6)'}}>
            <p className="font-bold text-sm m-0 text-white">{user?.name}</p>
            <p className="text-xs m-0 mt-0.5" style={{color:'rgba(255,255,255,0.4)'}}>{user?.email}</p>
            <div className="my-3 h-px" style={{background:'rgba(255,255,255,0.1)'}}/>
            <button onClick={() => navigate('/accounts')}
              className="w-full py-2.5 rounded-xl font-bold text-sm border-none cursor-pointer mb-2 bg-teal-500/10 text-teal-400">
              🏦 Manage Bank Accounts
            </button>
            <button onClick={() => navigate('/faq')}
                className="w-full py-2.5 rounded-xl font-bold text-sm border-none cursor-pointer mb-2 bg-teal-500/10 text-teal-400">
                ❓ FAQ
              </button>
            <button onClick={async () => { await logoutUser(); clearAccessToken(); localStorage.removeItem('user'); navigate('/'); }}
              className="w-full py-2.5 rounded-xl font-bold text-xs border-none cursor-pointer"
              style={{background:'rgba(231,76,60,0.15)', color:'#e74c3c', fontFamily:"'Sora', sans-serif"}}>
              🚪 Logout
            </button>
          </div>
        )}
      </div>
    </div>

    {/* Greeting */}
    <div className="relative z-10 px-5 mb-4">
      <p className="m-0" style={{color:'rgba(255,255,255,0.5)', fontSize:'14px'}}>
        {new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening'} 👋
      </p>
      <h2 className="font-extrabold text-white m-0" style={{fontSize:'clamp(22px, 5vw, 26px)'}}>{user?.name || '...'}</h2>
    </div>

    {/* Floating Balance Card */}
    <div className="relative z-10 px-5 mb-5">
      <div className="rounded-3xl p-6 relative overflow-hidden"
        style={{background:'rgba(255,255,255,0.05)', backdropFilter:'blur(24px)', border:'1px solid rgba(255,255,255,0.09)'}}>
        <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full" style={{background:'rgba(78,205,196,0.05)'}}/>
        <p className="text-xs font-semibold uppercase tracking-widest m-0" style={{color:'rgba(255,255,255,0.4)'}}>Total Balance</p>
        <h2 className="font-black text-white my-2 m-0" style={{fontSize:'clamp(38px, 9vw, 50px)', letterSpacing:'-2px'}}>
          ${balance.toFixed(2)}
        </h2>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full" style={{background:'#4ecdc4', boxShadow:'0 0 8px #4ecdc4'}}/>
            <span className="text-xs font-semibold" style={{color:'#4ecdc4'}}>Account Active</span>
          </div>
          <button onClick={() => setShowAddMoney(true)}
            className="text-xs font-bold px-3 py-1.5 rounded-xl border-none cursor-pointer"
            style={{background:'rgba(78,205,196,0.15)', color:'#4ecdc4', border:'1px solid rgba(78,205,196,0.3)'}}>
            + Add Money
          </button>
        </div>
      </div>
    </div>

    {/* Currency Mini Cards — horizontal scroll */}
    <div className="relative z-10 mb-5">
      <p className="text-xs font-bold uppercase tracking-widest mb-3 px-5 m-0" style={{color:'rgba(255,255,255,0.35)'}}>Live Rates · 1 USD =</p>
      <div className="flex gap-3 overflow-x-auto px-5 pb-2" style={{scrollbarWidth:'none', WebkitOverflowScrolling:'touch'}}>
        {currencies.map(c => (
          <div key={c.code} className="flex-shrink-0 rounded-2xl p-4 text-center"
            style={{width:'90px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', backdropFilter:'blur(10px)'}}>
            <p className="text-2xl m-0">{c.flag}</p>
            <p className="font-bold text-xs text-white m-0 mt-1">{c.code}</p>
            <p className="font-extrabold text-sm m-0 mt-0.5" style={{color:'#4ecdc4'}}>{rates[c.code]?.toFixed(2) || '...'}</p>
          </div>
        ))}
      </div>
    </div>

    {/* Quick Actions */}
    <div className="relative z-10 px-5 mb-5">
      <p className="text-xs font-bold uppercase tracking-widest mb-3 m-0" style={{color:'rgba(255,255,255,0.35)'}}>Quick Actions</p>
      <div className="grid grid-cols-2 gap-3">
        {[
          {icon:'💸', label:'Send Money', sub:'Fast & secure', action:() => navigate('/send'), primary:true},
          {icon:'📋', label:'History', sub:'All transactions', action:() => navigate('/history'), primary:false},
        ].map(btn => (
          <button key={btn.label} onClick={btn.action}
            className="text-left rounded-2xl p-5 border-none cursor-pointer transition-all active:scale-95"
            style={{
              background: btn.primary ? 'linear-gradient(135deg, rgba(78,205,196,0.3), rgba(26,122,110,0.3))' : 'rgba(255,255,255,0.05)',
              border: btn.primary ? '1px solid rgba(78,205,196,0.3)' : '1px solid rgba(255,255,255,0.08)',
              fontFamily:"'Sora', sans-serif"
            }}>
            <span className="text-2xl block mb-2">{btn.icon}</span>
            <p className="font-bold text-sm m-0" style={{color: btn.primary ? '#4ecdc4' : 'white'}}>{btn.label}</p>
            <p className="text-xs m-0 mt-0.5" style={{color:'rgba(255,255,255,0.4)'}}>{btn.sub}</p>
          </button>
        ))}
      </div>
    </div>

    {/* Transfer Limits */}
    <div className="relative z-10 px-5 mb-5">
      <p className="text-xs font-bold uppercase tracking-widest mb-3 m-0" style={{color:'rgba(255,255,255,0.35)'}}>Transfer Limits</p>
      <div className="rounded-2xl p-5" style={{background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)'}}>
        {[
          {label:'Daily', used:limits.daily.used, limit:limits.daily.limit, pct:limits.daily.percentage, color:'#4ecdc4'},
          {label:'Weekly', used:limits.weekly.used, limit:limits.weekly.limit, pct:limits.weekly.percentage, color:'#1a7a6e'},
        ].map((item, i) => (
          <div key={item.label}>
            {i > 0 && <div className="h-px my-4" style={{background:'rgba(255,255,255,0.06)'}}/>}
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs m-0" style={{color:'rgba(255,255,255,0.4)'}}>{item.label}</p>
                <p className="font-bold text-base m-0 text-white">${item.used.toFixed(2)} <span className="text-xs font-normal" style={{color:'rgba(255,255,255,0.3)'}}>/ ${item.limit.toLocaleString()}</span></p>
              </div>
              <CircleProgress percentage={item.pct} color={item.color} size={48}/>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ══════════════════════════════════════════════════════════════
// DESKTOP DASHBOARD (unchanged)
// ══════════════════════════════════════════════════════════════
const DesktopDashboard = ({ user, balance, limits, rates, loading, lastUpdated, currencies, navigate, setShowAddMoney, setShowAddRecipient, showProfile, setShowProfile }) => (
  <div className="min-h-screen" style={{background:'#f7f8fc'}}>

    {/* Header */}
    <div className="relative overflow-visible" style={{background:'linear-gradient(135deg, #0f4c81 0%, #1a7a6e 100%)'}}>
      <div className="absolute inset-0 opacity-10"
        style={{backgroundImage:`radial-gradient(circle at 20% 50%, white 1px, transparent 1px)`, backgroundSize:'60px 60px'}}/>
      <div className="max-w-6xl mx-auto px-8 py-6">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-2xl font-extrabold text-white m-0" style={{letterSpacing:'-0.5px'}}>🌍 Draviṇa</p>
            <p className="text-xs mt-1 m-0" style={{color:'rgba(255,255,255,0.7)'}}>Welcome back 👋</p>
            <h1 className="text-xl font-bold text-white mt-0.5 m-0">{user?.name || 'Loading...'}</h1>
          </div>
          <div className="relative">
            <button onClick={() => setShowProfile(!showProfile)}
              className="flex items-center gap-2 rounded-full px-4 py-2 border-none cursor-pointer hover:bg-white/25 transition-all"
              style={{background:'rgba(255,255,255,0.15)', border:'2px solid rgba(255,255,255,0.3)', backdropFilter:'blur(10px)'}}>
              <FaUserCircle size={24} color="white" />
              <span className="text-white font-semibold text-sm">Profile</span>
            </button>
            {showProfile && (
              <div className="absolute right-0 top-14 w-80 bg-white rounded-2xl p-6 z-50"
                style={{boxShadow:'0 20px 60px rgba(0,0,0,0.15)'}}>
                <div className="flex items-center gap-3 mb-5">
                  <div className="rounded-full p-2.5" style={{background:'linear-gradient(135deg, #0f4c81, #1a7a6e)'}}>
                    <FaUserCircle size={32} color="white"/>
                  </div>
                  <div>
                    <p className="font-bold text-base m-0" style={{color:'#1a1a2e'}}>{user?.name || '...'}</p>
                    <p className="text-sm m-0" style={{color:'#888'}}>{user?.email || '...'}</p>
                  </div>
                </div>
                <hr className="mb-4" style={{borderColor:'#f0f0f0'}}/>
                <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{color:'#888'}}>Transfer Limits</p>
                <div className="rounded-2xl p-4 mb-3" style={{background:'#f0f7ff'}}>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs m-0" style={{color:'#888'}}>Daily Limit</p>
                      <p className="font-bold text-lg m-0" style={{color:'#0f4c81'}}>${limits.daily.used.toFixed(2)}</p>
                      <p className="text-xs m-0" style={{color:'#aaa'}}>of ${limits.daily.limit.toLocaleString()} used</p>
                    </div>
                    <CircleProgress percentage={limits.daily.percentage} color="#0f4c81"/>
                  </div>
                </div>
                <div className="rounded-2xl p-4 mb-4" style={{background:'#f0fff8'}}>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs m-0" style={{color:'#888'}}>Weekly Limit</p>
                      <p className="font-bold text-lg m-0" style={{color:'#1a7a6e'}}>${limits.weekly.used.toFixed(2)}</p>
                      <p className="text-xs m-0" style={{color:'#aaa'}}>of ${limits.weekly.limit.toLocaleString()} used</p>
                    </div>
                    <CircleProgress percentage={limits.weekly.percentage} color="#1a7a6e"/>
                  </div>
                </div>
                <button onClick={() => navigate('/accounts')}
                  className="w-full py-2.5 rounded-xl font-bold text-sm border-none cursor-pointer mb-2 bg-teal-500/10 text-teal-400">
                  🏦 Manage Bank Accounts
                </button>
                <button onClick={async () => { await logoutUser(); clearAccessToken(); localStorage.removeItem('user'); navigate('/'); }}
                  className="w-full py-3 rounded-xl font-bold text-sm border-none cursor-pointer hover:opacity-80 transition-all"
                  style={{background:'#fff0f0', color:'#e74c3c', fontFamily:"'Sora', sans-serif"}}>
                  🚪 Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>

    {/* Main */}
    <div className="max-w-6xl mx-auto px-8 py-8">
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-1 flex flex-col gap-5">
          {/* Balance */}
          <div className="rounded-3xl p-7 relative overflow-hidden" style={{background:'linear-gradient(135deg, #0f4c81 0%, #1a7a6e 100%)'}}>
            <div className="absolute -top-5 -right-5 w-28 h-28 rounded-full" style={{background:'rgba(255,255,255,0.08)'}}/>
            <p className="text-xs font-medium m-0" style={{color:'rgba(255,255,255,0.7)'}}>Total Balance</p>
            <h2 className="font-extrabold text-white my-2 m-0" style={{fontSize:'42px', letterSpacing:'-1px'}}>${balance.toFixed(2)}</h2>
            <p className="text-xs m-0" style={{color:'rgba(255,255,255,0.6)'}}>🇺🇸 United States Dollar</p>
            <div className="inline-block mt-5 px-4 py-2 rounded-xl" style={{background:'rgba(255,255,255,0.15)'}}>
              <span className="text-white text-xs font-semibold">● Account Active</span>
            </div>
          </div>
          {/* Limits */}
          <div className="bg-white rounded-3xl p-6" style={{boxShadow:'0 4px 20px rgba(0,0,0,0.06)'}}>
            <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{color:'#888'}}>Transfer Limits</p>
            <div className="flex justify-between items-center mb-4">
              <div><p className="text-sm m-0" style={{color:'#888'}}>Daily</p><p className="font-bold text-xl m-0" style={{color:'#0f4c81'}}>${limits.daily.used.toFixed(2)} <span className="text-sm font-normal" style={{color:'#aaa'}}>/ ${limits.daily.limit.toLocaleString()}</span></p></div>
              <CircleProgress percentage={limits.daily.percentage} color="#0f4c81"/>
            </div>
            <hr style={{borderColor:'#f5f5f5', marginBottom:'16px'}}/>
            <div className="flex justify-between items-center">
              <div><p className="text-sm m-0" style={{color:'#888'}}>Weekly</p><p className="font-bold text-xl m-0" style={{color:'#1a7a6e'}}>${limits.weekly.used.toFixed(2)} <span className="text-sm font-normal" style={{color:'#aaa'}}>/ ${limits.weekly.limit.toLocaleString()}</span></p></div>
              <CircleProgress percentage={limits.weekly.percentage} color="#1a7a6e"/>
            </div>
          </div>
          {/* Actions */}
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => navigate('/send')} className="py-4 rounded-2xl text-white font-bold text-sm border-none cursor-pointer hover:-translate-y-0.5 transition-all" style={{background:'linear-gradient(135deg, #0f4c81, #1a7a6e)', fontFamily:"'Sora', sans-serif"}}>💸 Send Money</button>
            <button onClick={() => navigate('/history')} className="py-4 rounded-2xl font-bold text-sm cursor-pointer hover:-translate-y-0.5 transition-all" style={{background:'white', color:'#0f4c81', border:'2px solid #0f4c81', fontFamily:"'Sora', sans-serif"}}>📋 History</button>
          </div>
          <button onClick={() => setShowAddMoney(true)} className="w-full py-4 rounded-2xl text-white font-bold text-sm border-none cursor-pointer hover:-translate-y-0.5 transition-all" style={{background:'linear-gradient(135deg, #1a7a6e, #0f4c81)', fontFamily:"'Sora', sans-serif"}}>💰 Add Money</button>
          <div className="bg-white rounded-2xl p-5 flex justify-between items-center" style={{boxShadow:'0 4px 20px rgba(0,0,0,0.06)'}}>
            <div>
              <p className="font-bold text-base m-0" style={{color:'#1a1a2e'}}>👥 Recipients</p>
              <p onClick={() => navigate('/recipients')} className="text-sm mt-1 m-0 cursor-pointer underline font-medium" style={{color:'#0f4c81'}}>View all →</p>
            </div>
            <button onClick={() => setShowAddRecipient(true)} className="px-4 py-2.5 rounded-xl text-white font-semibold text-sm border-none cursor-pointer" style={{background:'linear-gradient(135deg, #0f4c81, #1a7a6e)', fontFamily:"'Sora', sans-serif"}}>+ Add</button>
          </div>
        </div>

        {/* Live Rates */}
        <div className="col-span-2">
          <div className="bg-white rounded-3xl p-7 h-full" style={{boxShadow:'0 4px 20px rgba(0,0,0,0.06)'}}>
            <div className="flex justify-between items-center mb-6">
              <div><h3 className="font-extrabold text-xl m-0" style={{color:'#1a1a2e'}}>Live Exchange Rates</h3><p className="text-sm mt-1 m-0" style={{color:'#888'}}>1 USD equals</p></div>
              <div className="flex items-center gap-2 rounded-full px-3 py-1.5" style={{background:'#f0fff8'}}>
                <span className="w-2 h-2 rounded-full" style={{background:'#1a7a6e'}}/>
                <span className="text-xs font-semibold" style={{color:'#1a7a6e'}}>Live</span>
              </div>
            </div>
            {loading ? <div className="flex items-center justify-center h-64"><p style={{color:'#aaa'}}>Fetching rates...</p></div> : (
              <div className="grid grid-cols-2 gap-4">
                {currencies.map((c, i) => (
                  <div key={c.code} className="flex justify-between items-center rounded-2xl p-5 transition-all hover:-translate-y-0.5 cursor-default"
                    style={{background: i % 2 === 0 ? '#f7f8fc' : 'white', border:'1.5px solid #f0f0f0'}}
                    onMouseOver={e => { e.currentTarget.style.borderColor='#0f4c81'; e.currentTarget.style.boxShadow='0 8px 20px rgba(15,76,129,0.1)'; }}
                    onMouseOut={e => { e.currentTarget.style.borderColor='#f0f0f0'; e.currentTarget.style.boxShadow='none'; }}>
                    <div className="flex items-center gap-3"><span className="text-3xl">{c.flag}</span><div><p className="font-bold text-sm m-0" style={{color:'#1a1a2e'}}>{c.code}</p><p className="text-xs m-0" style={{color:'#aaa'}}>{c.name}</p></div></div>
                    <div className="text-right"><p className="font-extrabold text-lg m-0" style={{color:'#0f4c81'}}>{rates[c.code]?.toFixed(4) || 'N/A'}</p><p className="text-xs font-medium m-0" style={{color:'#1a7a6e'}}>↑ Live</p></div>
                  </div>
                ))}
              </div>
            )}
            {!loading && <p className="text-xs text-center mt-5 m-0" style={{color:'#bbb'}}>🕐 {lastUpdated} · Auto-refreshes every 30s</p>}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 bg-white rounded-3xl px-8 py-6 flex flex-wrap justify-between items-center gap-4" style={{boxShadow:'0 4px 20px rgba(0,0,0,0.06)'}}>
        <div><p className="font-bold text-base m-0" style={{color:'#1a1a2e'}}>🌍 Draviṇa</p><p className="text-sm mt-1 m-0" style={{color:'#888'}}>Send money globally, effortlessly.</p></div>
        <div className="text-center"><p className="text-sm m-0" style={{color:'#888'}}>Write to us</p><p className="font-semibold text-sm m-0" style={{color:'#0f4c81'}}>support@crobo.com</p></div>
        <div className="text-center">
        <p className="text-sm m-0 text-gray-400">Help Center</p>
        <p onClick={() => navigate('/faq')}
          className="font-semibold text-sm m-0 cursor-pointer hover:underline text-blue-700">
          ❓ FAQ →
        </p>
      </div>
        <div className="flex items-center gap-5">
          <FaLinkedin size={24} style={{color:'#0077b5', cursor:'pointer'}} onClick={() => window.open('#', '_blank')}/>
          <FaTwitter size={24} style={{color:'#1da1f2', cursor:'pointer'}} onClick={() => window.open('#', '_blank')}/>
          <FaInstagram size={24} style={{color:'#e1306c', cursor:'pointer'}} onClick={() => window.open('#', '_blank')}/>
        </div>
      </div>
    </div>
  </div>
);

// ══════════════════════════════════════════════════════════════
// MAIN DASHBOARD
// ══════════════════════════════════════════════════════════════
function Dashboard() {
  const navigate = useNavigate();
  const [rates, setRates] = useState({});
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState('');
  const [showProfile, setShowProfile] = useState(false);
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState(0);
  const [showAddRecipient, setShowAddRecipient] = useState(false);
  const [showAddMoney, setShowAddMoney] = useState(false);
  const [limits, setLimits] = useState({
    daily: { used: 0, limit: 5000, percentage: 0 },
    weekly: { used: 0, limit: 20000, percentage: 0 }
  });

  const fetchRates = async () => {
    try {
      const r = await fetch('https://api.frankfurter.app/latest?from=USD&to=GBP,EUR,INR,AUD,CAD,SGD,AED', { signal: AbortSignal.timeout(5000) });
      if (!r.ok) throw new Error();
      const d = await r.json(); setRates(d.rates); setLastUpdated(new Date().toLocaleTimeString()); setLoading(false); return;
    } catch {}
    try {
      const r = await fetch('https://open.er-api.com/v6/latest/USD', { signal: AbortSignal.timeout(5000) });
      if (!r.ok) throw new Error();
      const d = await r.json(); const { GBP, EUR, INR, AUD, CAD, SGD, AED } = d.rates;
      setRates({ GBP, EUR, INR, AUD, CAD, SGD, AED }); setLastUpdated(new Date().toLocaleTimeString()); setLoading(false); return;
    } catch {}
    setRates({ GBP:0.79, EUR:0.92, INR:83.12, AUD:1.53, CAD:1.36, SGD:1.34, AED:3.67 });
    setLastUpdated('Cached'); setLoading(false);
  };

  useEffect(() => { fetchRates(); const i = setInterval(fetchRates, 30000); return () => clearInterval(i); }, []);
  useEffect(() => {
    const fetchBalance = async () => {
      try { const r = await getBalance(); setUser(r.data.user); setBalance(r.data.user.balance); }
      catch (e) { if (e.response?.status === 401) navigate('/'); }
    };
    fetchBalance();
  }, [navigate]);
  useEffect(() => { const f = async () => { try { const r = await getLimits(); setLimits(r.data); } catch {} }; f(); }, []);

  const currencies = [
    {code:'GBP',name:'British Pound',flag:'🇬🇧'},{code:'EUR',name:'Euro',flag:'🇪🇺'},
    {code:'INR',name:'Indian Rupee',flag:'🇮🇳'},{code:'AUD',name:'Australian Dollar',flag:'🇦🇺'},
    {code:'CAD',name:'Canadian Dollar',flag:'🇨🇦'},{code:'SGD',name:'Singapore Dollar',flag:'🇸🇬'},
    {code:'AED',name:'UAE Dirham',flag:'🇦🇪'},
  ];

  const sharedProps = { user, balance, limits, rates, loading, lastUpdated, currencies, navigate, setShowAddMoney, setShowAddRecipient, showProfile, setShowProfile };

  const MobileThemes = { 1: MobileTheme1, 2: MobileTheme2, 3: MobileTheme3 };
  const ActiveMobileTheme = MobileThemes[MOBILE_THEME];

  return (
    <>
      <style>{styles}</style>

      {/* ── MOBILE ── */}
      <div className="block lg:hidden">
        <ActiveMobileTheme {...sharedProps}/>
        <BottomNav active="home" navigate={navigate} setShowAddRecipient={setShowAddRecipient}/>
      </div>

      {/* ── DESKTOP ── */}
      <div className="hidden lg:block">
        <DesktopDashboard {...sharedProps}/>
      </div>

      {/* ── MODALS ── */}
      {showAddMoney && (
        <AddMoneyModal onClose={() => setShowAddMoney(false)}
          onSuccess={(amount) => { setBalance(prev => prev + amount); setShowAddMoney(false); alert(`✅ $${amount} added!`); }}/>
      )}
      {showAddRecipient && (
        <AddRecipientModal onClose={() => setShowAddRecipient(false)}
          onSuccess={(recipient) => { setShowAddRecipient(false); alert(`✅ ${recipient.fullName} added!`); }}/>
      )}
    </>
  );
}

export default Dashboard;