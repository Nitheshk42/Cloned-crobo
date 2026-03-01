import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { loginUser, googleAuth, setAccessToken } from '../services/api';

// ─── ANIMATIONS ──────────────────────────────────────────────
const styles = `
  @keyframes dash { to { stroke-dashoffset: -100; } }
  @keyframes floatPulse { 0%,100%{opacity:0.3;transform:scale(1);}50%{opacity:0.8;transform:scale(1.2);} }
  @keyframes fadeInUp { from{opacity:0;transform:translateY(30px);}to{opacity:1;transform:translateY(0);} }
  @keyframes slideIn { from{opacity:0;transform:translateX(40px);}to{opacity:1;transform:translateX(0);} }
  @keyframes swapPulse { 0%,100%{box-shadow:0 0 12px rgba(78,205,196,0.3);}50%{box-shadow:0 0 24px rgba(78,205,196,0.7);} }
  .fade-in-up { animation: fadeInUp 0.6s ease forwards; }
  .slide-in { animation: slideIn 0.4s ease forwards; }
  .swap-pulse { animation: swapPulse 2s ease-in-out infinite; }
  input[type=number]::-webkit-inner-spin-button,
  input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; }
  select option { background: #0f2d4a; }
`;

// ─── WORLD MAP BACKGROUND ────────────────────────────────────
const WorldMapBackground = () => (
  <div className="fixed inset-0 z-0 overflow-hidden">
    <style>{styles}</style>
    <svg width="100%" height="100%" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
      <defs>
        <radialGradient id="bgGrad" cx="40%" cy="50%">
          <stop offset="0%" stopColor="#0d2240" />
          <stop offset="100%" stopColor="#060f1e" />
        </radialGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <rect width="1200" height="800" fill="url(#bgGrad)" />
      {[...Array(13)].map((_,i) => <line key={`v${i}`} x1={i*100} y1="0" x2={i*100} y2="800" stroke="#1a3a5c" strokeWidth="0.4" opacity="0.25"/>)}
      {[...Array(9)].map((_,i) => <line key={`h${i}`} x1="0" y1={i*100} x2="1200" y2={i*100} stroke="#1a3a5c" strokeWidth="0.4" opacity="0.25"/>)}
      {[
        {x1:180,y1:280,x2:560,y2:180},{x1:560,y1:180,x2:860,y2:220},
        {x1:180,y1:280,x2:710,y2:370},{x1:560,y1:180,x2:420,y2:420},
        {x1:860,y1:220,x2:1010,y2:320},{x1:180,y1:280,x2:310,y2:470},
        {x1:710,y1:370,x2:910,y2:470},
      ].map((l,i) => (
        <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
          stroke="#1a7a6e" strokeWidth="1.2" strokeDasharray="8,6" opacity="0.45"
          style={{animation:`dash ${3+i*0.4}s linear infinite`}}/>
      ))}
      {[
        {x:180,y:280,label:'🇺🇸',name:'New York'},
        {x:560,y:180,label:'🇬🇧',name:'London'},
        {x:860,y:220,label:'🇮🇳',name:'Mumbai'},
        {x:710,y:370,label:'🇦🇪',name:'Dubai'},
        {x:420,y:420,label:'🇪🇺',name:'Paris'},
        {x:1010,y:320,label:'🇸🇬',name:'Singapore'},
        {x:310,y:470,label:'🇦🇺',name:'Sydney'},
      ].map((c,i) => (
        <g key={i}>
          <circle cx={c.x} cy={c.y} r="22" fill="#0f4c81" opacity="0.15"
            style={{animation:`floatPulse ${2.5+i*0.4}s ease-in-out infinite`,animationDelay:`${i*0.3}s`}}/>
          <circle cx={c.x} cy={c.y} r="5" fill="#4ecdc4" filter="url(#glow)" opacity="0.95"/>
          <text x={c.x} y={c.y-20} textAnchor="middle" fontSize="18">{c.label}</text>
          <text x={c.x} y={c.y+22} textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.4)" fontFamily="Arial">{c.name}</text>
        </g>
      ))}
    </svg>
  </div>
);

// ─── CURRENCIES ──────────────────────────────────────────────
const currencies = [
  {code:'USD',flag:'🇺🇸'},{code:'INR',flag:'🇮🇳'},{code:'GBP',flag:'🇬🇧'},
  {code:'EUR',flag:'🇪🇺'},{code:'AUD',flag:'🇦🇺'},{code:'CAD',flag:'🇨🇦'},
  {code:'SGD',flag:'🇸🇬'},{code:'AED',flag:'🇦🇪'},
];

function Login() {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState('1000');
  const [selectedCurrency, setSelectedCurrency] = useState(currencies[1]);
  const [fromCurrency, setFromCurrency] = useState(currencies[0]);
  const [swapped, setSwapped] = useState(false);
  const [rates, setRates] = useState({});
  const [ratesLoading, setRatesLoading] = useState(true);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const res = await fetch('https://api.frankfurter.app/latest?from=USD&to=GBP,EUR,INR,AUD,CAD,SGD,AED');
        const data = await res.json();
        setRates({...data.rates, USD: 1});
      } catch {
        setRates({INR:83.12,GBP:0.79,EUR:0.92,AUD:1.53,CAD:1.36,SGD:1.34,AED:3.67,USD:1});
      }
      setRatesLoading(false);
    };
    fetchRates();
  }, []);

  const handleLogin = async () => {
    try {
      setError(''); setLoading(true);
      const response = await loginUser({email, password});
      const {accessToken, user} = response.data;
      setAccessToken(accessToken);
      localStorage.removeItem('token');
      localStorage.setItem('user', JSON.stringify(user));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong!');
    } finally {
      setLoading(false);
    }
  };

  const fromRate = fromCurrency.code === 'USD' ? 1 : (rates[fromCurrency.code] ? 1 / rates[fromCurrency.code] : 1);
  const toRate = selectedCurrency.code === 'USD' ? 1 : (rates[selectedCurrency.code] || 1);
  const crossRate = fromRate * toRate;
  const recipientGets = rates[selectedCurrency.code]
    ? ((parseFloat(amount) || 0) * crossRate - 0.99).toFixed(2) : '...';
  const exchangeRate = crossRate ? crossRate.toFixed(4) : '...';

  const openForm = () => { setShowForm(true); setError(''); };

  const handleSwap = () => {
    const temp = fromCurrency;
    setFromCurrency(swapped ? temp : selectedCurrency);
    setSelectedCurrency(swapped ? selectedCurrency : temp);
    setSwapped(!swapped);
  };

  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <div className="min-h-screen relative" style={{fontFamily:"'Sora', sans-serif"}}>
        <WorldMapBackground />

        {/* ── NAVBAR ── */}
        <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-5 md:px-12 py-4"
          style={{background:'rgba(6,15,30,0.7)', backdropFilter:'blur(20px)', borderBottom:'1px solid rgba(255,255,255,0.06)'}}>

          <div onClick={() => setShowForm(false)} className="cursor-pointer">
            <h1 className="text-xl md:text-2xl font-black text-white m-0" style={{letterSpacing:'-0.5px'}}>🌍 Crobo</h1>
            <p className="hidden sm:block text-xs m-0" style={{color:'rgba(255,255,255,0.35)', letterSpacing:'2px', textTransform:'uppercase'}}>Send Money. Make Happy.</p>
          </div>

          <div className="flex gap-2 md:gap-3 items-center">
            <button onClick={openForm}
              className="text-white text-sm font-semibold px-4 md:px-6 py-2 rounded-xl transition-all duration-200 hover:bg-white/10"
              style={{background:'transparent', border:'1.5px solid rgba(255,255,255,0.25)'}}>
              Login
            </button>
            <button onClick={() => navigate('/signup')}
              className="text-white text-sm font-bold px-4 md:px-6 py-2 rounded-xl transition-all duration-200 hover:-translate-y-0.5"
              style={{background:'linear-gradient(135deg, #0f4c81, #1a7a6e)', boxShadow:'0 4px 16px rgba(15,76,129,0.4)'}}>
              Sign Up →
            </button>
          </div>
        </nav>

        {/* ── MAIN CONTENT ── */}
        <div className="min-h-screen flex flex-col lg:flex-row items-center relative z-10 px-5 md:px-12 lg:px-20 pt-24 pb-10 gap-8 lg:gap-16">

          {/* ══ LEFT — Branding ══ */}
          <div className="flex-1 w-full fade-in-up">

            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 mb-6"
              style={{background:'rgba(78,205,196,0.1)', border:'1px solid rgba(78,205,196,0.25)'}}>
              <div className="w-1.5 h-1.5 rounded-full" style={{background:'#4ecdc4', boxShadow:'0 0 6px #4ecdc4'}}/>
              <span className="text-xs font-bold uppercase tracking-widest" style={{color:'#4ecdc4'}}>
                Live rates • 7+ countries
              </span>
            </div>

            {/* Hero */}
            <h2 className="font-black text-white mb-6 leading-none"
              style={{fontSize:'clamp(32px, 5vw, 62px)', letterSpacing:'-2px', margin:'0 0 24px'}}>
              Money moves<br/>
              <span style={{background:'linear-gradient(135deg, #4ecdc4 0%, #1a7a6e 100%)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent'}}>
                at the speed
              </span><br/>
              of trust.
            </h2>

            <p className="mb-8 leading-relaxed" style={{color:'rgba(255,255,255,0.5)', fontSize:'clamp(14px, 1.5vw, 18px)', maxWidth:'420px'}}>
              Send money internationally with real exchange rates.<br/>
              Just <strong style={{color:'rgba(255,255,255,0.8)'}}>$0.99 flat fee</strong>. No hidden charges. Ever.
            </p>

            <button onClick={openForm}
              className="text-white font-extrabold rounded-2xl mb-7 transition-all duration-200 hover:-translate-y-1"
              style={{
                background:'linear-gradient(135deg, #4ecdc4, #1a7a6e)',
                padding:'clamp(12px, 1.5vw, 18px) clamp(24px, 3vw, 40px)',
                fontSize:'clamp(14px, 1.5vw, 18px)',
                border:'none', cursor:'pointer',
                boxShadow:'0 8px 32px rgba(78,205,196,0.3)',
                fontFamily:"'Sora', sans-serif"
              }}>
              Start Transfer →
            </button>

            <div className="flex flex-wrap gap-2">
              {['⚡ Instant transfers','🔒 Bank-level security','🌍 7+ countries'].map(f => (
                <div key={f} className="rounded-full px-4 py-2 text-xs font-semibold"
                  style={{background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.09)', color:'rgba(255,255,255,0.55)'}}>
                  {f}
                </div>
              ))}
            </div>
          </div>

          {/* ══ RIGHT — Calculator OR Login Form ══ */}
          <div className="w-full lg:flex-1 lg:max-w-lg">

            {!showForm ? (
              <div className="slide-in rounded-3xl p-6 md:p-9"
                style={{background:'rgba(255,255,255,0.05)', backdropFilter:'blur(24px)', border:'1px solid rgba(255,255,255,0.09)'}}>

                {/* Calculator Header */}
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-2 h-2 rounded-full" style={{background:'#4ecdc4', boxShadow:'0 0 8px #4ecdc4'}}/>
                  <p className="text-xs font-bold uppercase tracking-widest m-0" style={{color:'rgba(255,255,255,0.55)'}}>
                    Live Rate Calculator
                  </p>
                </div>

                {/* You Send */}
                <div className="rounded-2xl p-4 md:p-5 mb-3" style={{background:'rgba(255,255,255,0.07)'}}>
                  <p className="text-xs font-bold uppercase tracking-widest m-0 mb-2" style={{color:'rgba(255,255,255,0.35)'}}>You Send</p>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{swapped ? selectedCurrency.flag : fromCurrency.flag}</span>
                    <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
                      className="bg-transparent border-none outline-none text-white font-black flex-1 min-w-0"
                      style={{fontSize:'clamp(22px, 3vw, 36px)', fontFamily:"'Sora', sans-serif"}}/>
                    {swapped ? (
                      <span className="font-bold text-sm" style={{color:'rgba(255,255,255,0.5)'}}>{selectedCurrency.code}</span>
                    ) : (
                      <select value={fromCurrency.code}
                        onChange={e => setFromCurrency(currencies.find(c => c.code === e.target.value) || currencies[0])}
                        className="bg-transparent border-none outline-none font-bold cursor-pointer text-sm"
                        style={{color:'rgba(255,255,255,0.6)', fontFamily:"'Sora', sans-serif"}}>
                        {currencies.map(c => <option key={c.code} value={c.code}>{c.flag} {c.code}</option>)}
                      </select>
                    )}
                  </div>
                </div>

                {/* Swap */}
                <div className="flex justify-center my-3">
                  <button onClick={handleSwap}
                    className="inline-flex items-center gap-2 rounded-full px-4 py-2 cursor-pointer transition-all duration-300 border-none swap-pulse"
                    style={{background:'rgba(78,205,196,0.1)', border:'1px solid rgba(78,205,196,0.3)'}}>
                    <span style={{color:'#4ecdc4', fontSize:'18px', display:'inline-block', transition:'transform 0.3s', transform: swapped ? 'rotate(180deg)' : 'rotate(0deg)'}}>⇅</span>
                    <span className="text-xs font-bold uppercase tracking-widest" style={{color:'#4ecdc4'}}>Swap</span>
                  </button>
                </div>

                {/* They Receive */}
                <div className="rounded-2xl p-4 md:p-5 flex justify-between items-center mb-4"
                  style={{background:'linear-gradient(135deg, rgba(26,122,110,0.3), rgba(15,76,129,0.3))', border:'1px solid rgba(78,205,196,0.15)'}}>
                  <div className="flex-1 min-w-0 mr-3">
                    <p className="text-xs font-bold uppercase tracking-widest m-0 mb-2" style={{color:'rgba(255,255,255,0.35)'}}>They Receive</p>
                    <p className="text-white font-black m-0 truncate" style={{fontSize:'clamp(22px, 3vw, 36px)', letterSpacing:'-1px'}}>
                      {ratesLoading ? '...' : recipientGets}
                    </p>
                  </div>
                  {swapped ? (
                    <div className="rounded-xl px-3 py-2 text-white font-bold text-base flex-shrink-0"
                      style={{background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.15)'}}>
                      🇺🇸 USD
                    </div>
                  ) : (
                    <select value={selectedCurrency.code}
                      onChange={e => setSelectedCurrency(currencies.find(c => c.code === e.target.value) || currencies[1])}
                      className="rounded-xl px-3 py-2 text-white font-bold cursor-pointer outline-none flex-shrink-0"
                      style={{background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.15)', fontFamily:"'Sora', sans-serif", fontSize:'clamp(13px, 1.5vw, 18px)'}}>
                      {currencies.map(c => <option key={c.code} value={c.code}>{c.flag} {c.code}</option>)}
                    </select>
                  )}
                </div>

                {/* Rate */}
                <div className="flex justify-between items-center mb-5 flex-wrap gap-2">
                  <p className="text-xs m-0" style={{color:'rgba(255,255,255,0.3)'}}>
                    1 {swapped ? selectedCurrency.code : fromCurrency.code} = {exchangeRate} {swapped ? fromCurrency.code : selectedCurrency.code}
                  </p>
                  <p className="text-xs font-bold m-0" style={{color:'#4ecdc4'}}>✅ Best rate guaranteed</p>
                </div>

                {/* Fee Comparison */}
                <div className="pt-5" style={{borderTop:'1px solid rgba(255,255,255,0.06)'}}>
                  <p className="text-xs font-bold uppercase tracking-widest mb-3 m-0" style={{color:'rgba(255,255,255,0.3)'}}>
                    Fee Comparison
                  </p>
                  {[
                    {name:'🌍 Crobo', fee:'$0.99', color:'#4ecdc4', best:true},
                    {name:'🏦 Banks', fee:'$25+', color:'rgba(255,255,255,0.3)', best:false},
                    {name:'💸 Western Union', fee:'$15+', color:'rgba(255,255,255,0.3)', best:false},
                  ].map(item => (
                    <div key={item.name} className="flex justify-between items-center mb-2.5">
                      <span className="text-sm" style={{color:'rgba(255,255,255,0.5)'}}>{item.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm" style={{color:item.color}}>{item.fee}</span>
                        {item.best && (
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                            style={{color:'#4ecdc4', background:'rgba(78,205,196,0.15)', border:'1px solid rgba(78,205,196,0.3)'}}>
                            BEST
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            ) : (
              /* ── LOGIN FORM ── */
              <div className="slide-in">
                <div className="rounded-3xl p-8 md:p-10 relative"
                  style={{background:'rgba(255,255,255,0.97)', boxShadow:'0 32px 80px rgba(0,0,0,0.5)'}}>

                  <button onClick={() => setShowForm(false)}
                    className="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center text-sm cursor-pointer border-none"
                    style={{background:'#f5f5f5', color:'#888'}}>
                    ✕
                  </button>

                  <div className="mb-7">
                    <h2 className="font-black text-2xl m-0" style={{color:'#0f1f3a'}}>Welcome back 👋</h2>
                    <p className="text-sm mt-1.5 m-0" style={{color:'#999'}}>Login to send money globally</p>
                  </div>

                  {error && (
                    <div className="rounded-xl px-4 py-3 mb-5 text-sm"
                      style={{background:'#fff0f0', border:'1px solid #fcc', color:'#e74c3c'}}>
                      ⚠️ {error}
                    </div>
                  )}

                  <div className="mb-4">
                    <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{color:'#888'}}>Email</label>
                    <input type="email" placeholder="your@email.com" value={email}
                      onChange={e => setEmail(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleLogin()}
                      onFocus={e => e.target.style.borderColor='#0f4c81'}
                      onBlur={e => e.target.style.borderColor='#ebebeb'}
                      className="w-full px-4 py-3 rounded-2xl text-base outline-none transition-all"
                      style={{border:'2px solid #ebebeb', color:'#1a1a2e', fontFamily:"'Sora', sans-serif", boxSizing:'border-box'}}/>
                  </div>

                  <div className="mb-6">
                    <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{color:'#888'}}>Password</label>
                    <input type="password" placeholder="••••••••" value={password}
                      onChange={e => setPassword(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleLogin()}
                      onFocus={e => e.target.style.borderColor='#0f4c81'}
                      onBlur={e => e.target.style.borderColor='#ebebeb'}
                      className="w-full px-4 py-3 rounded-2xl text-base outline-none transition-all"
                      style={{border:'2px solid #ebebeb', color:'#1a1a2e', fontFamily:"'Sora', sans-serif", boxSizing:'border-box'}}/>
                  </div>

                  <button onClick={handleLogin} disabled={loading}
                    className="w-full py-4 rounded-2xl text-white font-bold text-base mb-4 transition-all duration-200 hover:-translate-y-0.5"
                    style={{
                      background: loading ? '#ccc' : 'linear-gradient(135deg, #0f4c81, #1a7a6e)',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      border:'none',
                      boxShadow:'0 8px 24px rgba(15,76,129,0.25)',
                      fontFamily:"'Sora', sans-serif"
                    }}>
                    {loading ? 'Logging in...' : 'Login →'}
                  </button>

                  <div className="flex items-center gap-3 my-4">
                    <div className="flex-1 h-px" style={{background:'#ebebeb'}}/>
                    <span className="text-xs font-bold" style={{color:'#ccc'}}>OR</span>
                    <div className="flex-1 h-px" style={{background:'#ebebeb'}}/>
                  </div>

                  <div className="flex justify-center mb-6">
                    <GoogleLogin
                      onSuccess={async credentialResponse => {
                        try {
                          const response = await googleAuth({credential: credentialResponse.credential});
                          const {accessToken, user} = response.data;
                          setAccessToken(accessToken);
                          localStorage.setItem('user', JSON.stringify(user));
                          navigate('/dashboard');
                        } catch(err) {
                          setError('Google login failed. Please try again!');
                        }
                      }}
                      onError={() => setError('Google login failed. Please try again!')}
                      width="340" text="continue_with" shape="rectangular" theme="outline"
                    />
                  </div>

                  <p className="text-center text-sm m-0" style={{color:'#999'}}>
                    New to Crobo?{' '}
                    <span onClick={() => navigate('/signup')} className="font-bold cursor-pointer" style={{color:'#0f4c81'}}>
                      Create account →
                    </span>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}

export default Login;