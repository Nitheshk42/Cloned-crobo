import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../services/api';

// ─── ANIMATIONS ──────────────────────────────────────────────
const styles = `
  @keyframes dash { to { stroke-dashoffset: -100; } }
  @keyframes floatPulse { 0%,100%{opacity:0.3;transform:scale(1);}50%{opacity:0.8;transform:scale(1.2);} }
  @keyframes fadeInUp { from{opacity:0;transform:translateY(30px);}to{opacity:1;transform:translateY(0);} }
  .fade-in-up { animation: fadeInUp 0.6s ease forwards; }
`;

// ─── WORLD MAP BACKGROUND ────────────────────────────────────
const WorldMapBackground = () => (
  <div className="fixed inset-0 z-0 overflow-hidden">
    <style>{styles}</style>
    <svg width="100%" height="100%" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
      <defs>
        <radialGradient id="bgGrad2" cx="40%" cy="50%">
          <stop offset="0%" stopColor="#0d2240" />
          <stop offset="100%" stopColor="#060f1e" />
        </radialGradient>
        <filter id="glow2">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <rect width="1200" height="800" fill="url(#bgGrad2)" />
      {[...Array(13)].map((_,i) => <line key={`v${i}`} x1={i*100} y1="0" x2={i*100} y2="800" stroke="#1a3a5c" strokeWidth="0.4" opacity="0.25"/>)}
      {[...Array(9)].map((_,i) => <line key={`h${i}`} x1="0" y1={i*100} x2="1200" y2={i*100} stroke="#1a3a5c" strokeWidth="0.4" opacity="0.25"/>)}
      {[
        {x1:180,y1:280,x2:560,y2:180},{x1:560,y1:180,x2:860,y2:220},
        {x1:180,y1:280,x2:710,y2:370},{x1:560,y1:180,x2:420,y2:420},
        {x1:860,y1:220,x2:1010,y2:320},
      ].map((l,i) => (
        <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
          stroke="#1a7a6e" strokeWidth="1.2" strokeDasharray="8,6" opacity="0.35"
          style={{animation:`dash ${3+i*0.4}s linear infinite`}}/>
      ))}
      {[
        {x:180,y:280,label:'🇺🇸',name:'New York'},
        {x:560,y:180,label:'🇬🇧',name:'London'},
        {x:860,y:220,label:'🇮🇳',name:'Mumbai'},
        {x:710,y:370,label:'🇦🇪',name:'Dubai'},
        {x:1010,y:320,label:'🇸🇬',name:'Singapore'},
      ].map((c,i) => (
        <g key={i}>
          <circle cx={c.x} cy={c.y} r="22" fill="#0f4c81" opacity="0.15"
            style={{animation:`floatPulse ${2.5+i*0.4}s ease-in-out infinite`,animationDelay:`${i*0.3}s`}}/>
          <circle cx={c.x} cy={c.y} r="5" fill="#4ecdc4" filter="url(#glow2)" opacity="0.95"/>
          <text x={c.x} y={c.y-20} textAnchor="middle" fontSize="18">{c.label}</text>
          <text x={c.x} y={c.y+22} textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.4)" fontFamily="Arial">{c.name}</text>
        </g>
      ))}
    </svg>
  </div>
);

function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async () => {
    try {
      setError('');
      if (!name || !email || !password || !confirmPassword) {
        setError('All fields are required!'); return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match!'); return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters!'); return;
      }
      setLoading(true);
      const response = await registerUser({ name, email, password });
      alert(`Account created successfully! Welcome ${response.data.user.name}!`);
      navigate('/');
    } catch (error) {
      setError(error.response?.data?.message || 'Something went wrong!');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-3 rounded-2xl text-base outline-none transition-all";
  const inputStyle = {border:'2px solid #ebebeb', color:'#1a1a2e', fontFamily:"'Sora', sans-serif", boxSizing:'border-box'};

  return (
    <div className="min-h-screen relative" style={{fontFamily:"'Sora', sans-serif"}}>
      <WorldMapBackground />

      {/* ── NAVBAR ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-5 md:px-12 py-4"
        style={{background:'rgba(6,15,30,0.7)', backdropFilter:'blur(20px)', borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
        <div onClick={() => navigate('/')} className="cursor-pointer">
          <h1 className="text-xl md:text-2xl font-black text-white m-0" style={{letterSpacing:'-0.5px'}}>🌍 Draviṇa</h1>
          <p className="hidden sm:block text-xs m-0" style={{color:'rgba(255,255,255,0.35)', letterSpacing:'2px', textTransform:'uppercase'}}>Transfer Money, Across Worlds</p>
        </div>
        <div className="flex gap-2 md:gap-3 items-center">
          <button onClick={() => navigate('/', {state: {openLogin: true}})}
            className="text-white text-sm font-semibold px-4 md:px-6 py-2 rounded-xl transition-all duration-200 hover:bg-white/10"
            style={{background:'transparent', border:'1.5px solid rgba(255,255,255,0.25)'}}>
            Login
          </button>
        </div>
      </nav>

      {/* ── MAIN CONTENT ── */}
      <div className="min-h-screen flex items-center justify-center relative z-10 px-5 pt-20 pb-10">
        <div className="w-full max-w-md fade-in-up">
          <div className="rounded-3xl p-8 md:p-10 relative"
            style={{background:'rgba(255,255,255,0.97)', boxShadow:'0 32px 80px rgba(0,0,0,0.5)'}}>

            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 mb-4"
                style={{background:'rgba(78,205,196,0.1)', border:'1px solid rgba(78,205,196,0.25)'}}>
                <div className="w-1.5 h-1.5 rounded-full" style={{background:'#4ecdc4', boxShadow:'0 0 6px #4ecdc4'}}/>
                <span className="text-xs font-bold uppercase tracking-widest" style={{color:'#4ecdc4'}}>
                  Join Draviṇa today
                </span>
              </div>
              <h2 className="font-black text-2xl md:text-3xl m-0" style={{color:'#0f1f3a'}}>Create your account 🚀</h2>
              <p className="text-sm mt-2 m-0" style={{color:'#999'}}>Start sending money globally in minutes</p>
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-xl px-4 py-3 mb-5 text-sm"
                style={{background:'#fff0f0', border:'1px solid #fcc', color:'#e74c3c'}}>
                ⚠️ {error}
              </div>
            )}

            {/* Full Name */}
            <div className="mb-4">
              <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{color:'#888'}}>Full Name</label>
              <input type="text" placeholder="John Doe" value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSignup()}
                onFocus={e => e.target.style.borderColor='#0f4c81'}
                onBlur={e => e.target.style.borderColor='#ebebeb'}
                className={inputClass} style={inputStyle}/>
            </div>

            {/* Email */}
            <div className="mb-4">
              <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{color:'#888'}}>Email</label>
              <input type="email" placeholder="your@email.com" value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSignup()}
                onFocus={e => e.target.style.borderColor='#0f4c81'}
                onBlur={e => e.target.style.borderColor='#ebebeb'}
                className={inputClass} style={inputStyle}/>
            </div>

            {/* Password */}
            <div className="mb-4">
              <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{color:'#888'}}>Password</label>
              <input type="password" placeholder="••••••••" value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSignup()}
                onFocus={e => e.target.style.borderColor='#0f4c81'}
                onBlur={e => e.target.style.borderColor='#ebebeb'}
                className={inputClass} style={inputStyle}/>
            </div>

            {/* Confirm Password */}
            <div className="mb-7">
              <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{color:'#888'}}>Confirm Password</label>
              <input type="password" placeholder="••••••••" value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSignup()}
                onFocus={e => e.target.style.borderColor='#0f4c81'}
                onBlur={e => e.target.style.borderColor='#ebebeb'}
                className={inputClass} style={inputStyle}/>
            </div>

            {/* Signup Button */}
            <button onClick={handleSignup} disabled={loading}
              className="w-full py-4 rounded-2xl text-white font-bold text-base mb-4 transition-all duration-200 hover:-translate-y-0.5"
              style={{
                background: loading ? '#ccc' : 'linear-gradient(135deg, #0f4c81, #1a7a6e)',
                cursor: loading ? 'not-allowed' : 'pointer',
                border:'none',
                boxShadow:'0 8px 24px rgba(15,76,129,0.25)',
                fontFamily:"'Sora', sans-serif"
              }}>
              {loading ? 'Creating Account...' : 'Create Account →'}
            </button>

            {/* Feature pills */}
            <div className="flex justify-center gap-2 flex-wrap mb-6">
              {['⚡ Instant','🔒 Secure','💸 $0.99 fee'].map(f => (
                <div key={f} className="rounded-full px-3 py-1 text-xs font-semibold"
                  style={{background:'rgba(15,76,129,0.08)', color:'#0f4c81', border:'1px solid rgba(15,76,129,0.15)'}}>
                  {f}
                </div>
              ))}
            </div>

            {/* Login Link */}
            <p className="text-center text-sm m-0" style={{color:'#999'}}>
              Already have an account?{' '}
              <span onClick={() => navigate('/', {state: {openLogin: true}})} className="font-bold cursor-pointer" style={{color:'#0f4c81'}}>
                Login →
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;