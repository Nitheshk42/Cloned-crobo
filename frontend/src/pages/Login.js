import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { loginUser, googleAuth } from '../services/api';
import { setAccessToken } from '../services/api';  

const WorldMapBackground = () => (
  <div style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden' }}>
    <style>{`
      @keyframes dash { to { stroke-dashoffset: -100; } }
      @keyframes floatPulse { 0%,100%{opacity:0.3;transform:scale(1);}50%{opacity:0.8;transform:scale(1.2);} }
      @keyframes fadeInUp { from{opacity:0;transform:translateY(30px);}to{opacity:1;transform:translateY(0);} }
      @keyframes slideIn { from{opacity:0;transform:translateX(40px);}to{opacity:1;transform:translateX(0);} }
    `}</style>
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
      ].map((l,i) => <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke="#1a7a6e" strokeWidth="1.2" strokeDasharray="8,6" opacity="0.45" style={{animation:`dash ${3+i*0.4}s linear infinite`}}/>)}
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
          <circle cx={c.x} cy={c.y} r="22" fill="#0f4c81" opacity="0.15" style={{animation:`floatPulse ${2.5+i*0.4}s ease-in-out infinite`,animationDelay:`${i*0.3}s`}}/>
          <circle cx={c.x} cy={c.y} r="5" fill="#4ecdc4" filter="url(#glow)" opacity="0.95"/>
          <text x={c.x} y={c.y-20} textAnchor="middle" fontSize="18">{c.label}</text>
          <text x={c.x} y={c.y+22} textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.4)" fontFamily="Arial">{c.name}</text>
        </g>
      ))}
    </svg>
  </div>
);

const currencies = [
  {code:'INR',flag:'🇮🇳'},{code:'GBP',flag:'🇬🇧'},{code:'EUR',flag:'🇪🇺'},
  {code:'AUD',flag:'🇦🇺'},{code:'CAD',flag:'🇨🇦'},{code:'SGD',flag:'🇸🇬'},{code:'AED',flag:'🇦🇪'},
];

function Login() {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState('1000');
  const [selectedCurrency, setSelectedCurrency] = useState(currencies[0]);
  const [rates, setRates] = useState({});
  const [ratesLoading, setRatesLoading] = useState(true);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const res = await fetch('https://api.frankfurter.app/latest?from=USD&to=GBP,EUR,INR,AUD,CAD,SGD,AED');
        const data = await res.json();
        setRates(data.rates);
      } catch {
        setRates({INR:83.12,GBP:0.79,EUR:0.92,AUD:1.53,CAD:1.36,SGD:1.34,AED:3.67});
      }
      setRatesLoading(false);
    };
    fetchRates();
  }, []);

  const handleLogin = async () => {
    try {
      setError(''); setLoading(true);
      const response = await loginUser({email, password});
      console.log('Login response:', response.data);
      const {accessToken, user} = response.data;
      setAccessToken(accessToken);
      localStorage.removeItem('token');       // ← clear old token if exists
      localStorage.setItem('user', JSON.stringify(user));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong!');
    } finally {
      setLoading(false);
    }
  };

  const recipientGets = rates[selectedCurrency.code]
    ? ((parseFloat(amount)||0) * rates[selectedCurrency.code] - 0.99).toFixed(2)
    : '...';
  const exchangeRate = rates[selectedCurrency.code]
    ? rates[selectedCurrency.code].toFixed(4) : '...';

  const inputStyle = {
    width:'100%', padding:'13px 16px', border:'2px solid #ebebeb',
    borderRadius:'14px', fontSize:'15px', outline:'none',
    fontFamily:'Sora, sans-serif', boxSizing:'border-box',
    color:'#1a1a2e', transition:'border-color 0.2s', background:'white'
  };

  const openForm = () => { setShowForm(true); setError(''); };

  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <div style={{minHeight:'100vh', position:'relative', fontFamily:"'Sora', sans-serif"}}>

        <WorldMapBackground />

        {/* ── NAVBAR ── */}
        <nav style={{
          position:'fixed', top:0, left:0, right:0, zIndex:100,
          display:'flex', justifyContent:'space-between', alignItems:'center',
          padding:'20px 48px',
          background:'rgba(6,15,30,0.7)', backdropFilter:'blur(20px)',
          borderBottom:'1px solid rgba(255,255,255,0.06)'
        }}>
          <div onClick={() => setShowForm(false)} style={{cursor:'pointer'}}>
            <h1 style={{fontSize:'24px', fontWeight:'900', color:'white', margin:0, letterSpacing:'-0.5px'}}>🌍 Crobo</h1>
            <p style={{color:'rgba(255,255,255,0.35)', fontSize:'10px', margin:0, letterSpacing:'2px', textTransform:'uppercase'}}>Send Money. Make Happy.</p>
          </div>
          <div style={{display:'flex', gap:'12px', alignItems:'center'}}>
            <button onClick={openForm} style={{
              background:'transparent', border:'1.5px solid rgba(255,255,255,0.25)',
              borderRadius:'12px', padding:'10px 24px', color:'white',
              fontWeight:'600', fontSize:'14px', cursor:'pointer',
              fontFamily:'Sora, sans-serif', transition:'all 0.2s'
            }}
              onMouseOver={e=>{e.currentTarget.style.borderColor='rgba(255,255,255,0.6)';e.currentTarget.style.background='rgba(255,255,255,0.08)';}}
              onMouseOut={e=>{e.currentTarget.style.borderColor='rgba(255,255,255,0.25)';e.currentTarget.style.background='transparent';}}
            >Login</button>
            <button onClick={() => navigate('/signup')} style={{
              background:'linear-gradient(135deg, #0f4c81, #1a7a6e)',
              border:'none', borderRadius:'12px', padding:'10px 24px',
              color:'white', fontWeight:'700', fontSize:'14px',
              cursor:'pointer', fontFamily:'Sora, sans-serif',
              boxShadow:'0 4px 16px rgba(15,76,129,0.4)', transition:'transform 0.2s'
            }}
              onMouseOver={e=>e.currentTarget.style.transform='translateY(-2px)'}
              onMouseOut={e=>e.currentTarget.style.transform='translateY(0)'}
            >Sign Up →</button>
          </div>
        </nav>

        {/* ── MAIN — Two columns ── */}
        <div style={{
          minHeight:'100vh', display:'flex', flexDirection:'row',
          alignItems:'center', position:'relative', zIndex:10,
          padding:'100px 60px 60px 80px', gap:'60px'
        }}>

          {/* ══ LEFT — Branding (always visible) ══ */}
          <div style={{flex:1, animation:'fadeInUp 0.6s ease forwards'}}>

            <div style={{
              display:'inline-flex', alignItems:'center', gap:'8px',
              background:'rgba(78,205,196,0.1)', border:'1px solid rgba(78,205,196,0.25)',
              borderRadius:'50px', padding:'7px 18px', marginBottom:'28px'
            }}>
              <div style={{width:'6px', height:'6px', borderRadius:'50%', background:'#4ecdc4', boxShadow:'0 0 6px #4ecdc4'}}/>
              <span style={{color:'#4ecdc4', fontSize:'12px', fontWeight:'700', letterSpacing:'1px', textTransform:'uppercase'}}>
                Live rates • 7+ countries
              </span>
            </div>

            <h2 style={{
              fontSize:'62px', fontWeight:'900', color:'white',
              margin:'0 0 24px', lineHeight:1.0, letterSpacing:'-3px'
            }}>
              Money moves<br/>
              <span style={{background:'linear-gradient(135deg, #4ecdc4 0%, #1a7a6e 100%)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent'}}>
                at the speed
              </span><br/>
              of trust.
            </h2>

            <p style={{
              color:'rgba(255,255,255,0.5)', fontSize:'18px',
              marginBottom:'40px', maxWidth:'420px', lineHeight:1.7
            }}>
              Send money internationally with real exchange rates.<br/>
              Just <strong style={{color:'rgba(255,255,255,0.8)'}}>$0.99 flat fee</strong>. No hidden charges. Ever.
            </p>

            <button onClick={openForm} style={{
              background:'linear-gradient(135deg, #4ecdc4, #1a7a6e)',
              border:'none', borderRadius:'18px', padding:'18px 40px',
              color:'white', fontWeight:'800', fontSize:'18px',
              cursor:'pointer', fontFamily:'Sora, sans-serif',
              boxShadow:'0 8px 32px rgba(78,205,196,0.3)',
              transition:'transform 0.2s, box-shadow 0.2s',
              marginBottom:'28px', letterSpacing:'-0.5px'
            }}
              onMouseOver={e=>{e.currentTarget.style.transform='translateY(-3px)';e.currentTarget.style.boxShadow='0 16px 48px rgba(78,205,196,0.4)';}}
              onMouseOut={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='0 8px 32px rgba(78,205,196,0.3)';}}
            >Start Transfer →</button>

            <div style={{display:'flex', gap:'10px', flexWrap:'wrap'}}>
              {['⚡ Instant transfers','🔒 Bank-level security','🌍 7+ countries'].map(f => (
                <div key={f} style={{
                  background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.09)',
                  borderRadius:'50px', padding:'8px 18px',
                  color:'rgba(255,255,255,0.55)', fontSize:'13px', fontWeight:'600'
                }}>{f}</div>
              ))}
            </div>
          </div>

          {/* ══ RIGHT — Calculator OR Login Form ══ */}
          <div style={{flex:1, maxWidth:'500px'}}>

            {!showForm ? (
              /* ── CALCULATOR ── */
              <div style={{
                background:'rgba(255,255,255,0.05)', backdropFilter:'blur(24px)',
                borderRadius:'28px', padding:'36px',
                border:'1px solid rgba(255,255,255,0.09)',
                animation:'slideIn 0.4s ease forwards'
              }}>
                <div style={{display:'flex', alignItems:'center', gap:'8px', marginBottom:'24px'}}>
                  <div style={{width:'7px', height:'7px', borderRadius:'50%', background:'#4ecdc4', boxShadow:'0 0 8px #4ecdc4'}}/>
                  <p style={{color:'rgba(255,255,255,0.55)', fontSize:'11px', fontWeight:'700', margin:0, letterSpacing:'2px', textTransform:'uppercase'}}>
                    Live Rate Calculator
                  </p>
                </div>

                {/* You Send */}
                <div style={{
                  background:'rgba(255,255,255,0.07)', borderRadius:'18px',
                  padding:'20px 24px', marginBottom:'12px',
                  display:'flex', justifyContent:'space-between', alignItems:'center'
                }}>
                  <div>
                    <p style={{color:'rgba(255,255,255,0.35)', fontSize:'10px', fontWeight:'700', textTransform:'uppercase', letterSpacing:'1.5px', margin:0}}>You Send</p>
                    <div style={{display:'flex', alignItems:'center', gap:'10px', marginTop:'8px'}}>
                      <span style={{fontSize:'24px'}}>🇺🇸</span>
                      <input type="number" value={amount} onChange={e=>setAmount(e.target.value)}
                        style={{background:'none', border:'none', outline:'none', color:'white', fontSize:'36px', fontWeight:'900', width:'150px', fontFamily:'Sora, sans-serif'}}
                      />
                      <span style={{color:'rgba(255,255,255,0.35)', fontWeight:'700', fontSize:'15px'}}>USD</span>
                    </div>
                  </div>
                  <div style={{background:'rgba(78,205,196,0.1)', border:'1px solid rgba(78,205,196,0.2)', borderRadius:'14px', padding:'12px 18px', textAlign:'right'}}>
                    <p style={{color:'rgba(255,255,255,0.4)', fontSize:'10px', margin:0, textTransform:'uppercase', letterSpacing:'1px'}}>Fee</p>
                    <p style={{color:'#4ecdc4', fontWeight:'900', fontSize:'22px', margin:'4px 0 0'}}>$0.99</p>
                  </div>
                </div>

                <div style={{textAlign:'center', margin:'8px 0', fontSize:'22px', opacity:0.5}}>⬇️</div>

                {/* They Receive */}
                <div style={{
                  background:'linear-gradient(135deg, rgba(26,122,110,0.3), rgba(15,76,129,0.3))',
                  borderRadius:'18px', padding:'20px 24px',
                  display:'flex', justifyContent:'space-between', alignItems:'center',
                  border:'1px solid rgba(78,205,196,0.15)', marginBottom:'16px'
                }}>
                  <div>
                    <p style={{color:'rgba(255,255,255,0.35)', fontSize:'10px', fontWeight:'700', textTransform:'uppercase', letterSpacing:'1.5px', margin:0}}>They Receive</p>
                    <p style={{color:'white', fontWeight:'900', fontSize:'36px', margin:'8px 0 0', letterSpacing:'-1px'}}>
                      {ratesLoading ? '...' : recipientGets}
                    </p>
                  </div>
                  <select value={selectedCurrency.code}
                    onChange={e=>setSelectedCurrency(currencies.find(c=>c.code===e.target.value))}
                    style={{background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:'14px', padding:'12px 16px', color:'white', fontSize:'18px', fontWeight:'700', fontFamily:'Sora, sans-serif', cursor:'pointer', outline:'none'}}
                  >
                    {currencies.map(c=>(
                      <option key={c.code} value={c.code} style={{background:'#0f2d4a'}}>{c.flag} {c.code}</option>
                    ))}
                  </select>
                </div>

                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
                  <p style={{color:'rgba(255,255,255,0.3)', fontSize:'13px', margin:0}}>1 USD = {exchangeRate} {selectedCurrency.code}</p>
                  <p style={{color:'#4ecdc4', fontSize:'13px', fontWeight:'700', margin:0}}>✅ Best rate guaranteed</p>
                </div>

                {/* Fee comparison */}
                <div style={{borderTop:'1px solid rgba(255,255,255,0.06)', paddingTop:'20px'}}>
                  <p style={{color:'rgba(255,255,255,0.3)', fontSize:'10px', fontWeight:'700', textTransform:'uppercase', letterSpacing:'1.5px', margin:'0 0 12px'}}>
                    Fee Comparison
                  </p>
                  {[
                    {name:'🌍 Crobo', fee:'$0.99', color:'#4ecdc4', best:true},
                    {name:'🏦 Banks', fee:'$25+', color:'rgba(255,255,255,0.3)', best:false},
                    {name:'💸 Western Union', fee:'$15+', color:'rgba(255,255,255,0.3)', best:false},
                  ].map(item=>(
                    <div key={item.name} style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px'}}>
                      <span style={{color:'rgba(255,255,255,0.5)', fontSize:'13px'}}>{item.name}</span>
                      <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                        <span style={{color:item.color, fontWeight:'700', fontSize:'14px'}}>{item.fee}</span>
                        {item.best && (
                          <span style={{background:'rgba(78,205,196,0.15)', border:'1px solid rgba(78,205,196,0.3)', borderRadius:'50px', padding:'2px 8px', color:'#4ecdc4', fontSize:'10px', fontWeight:'700'}}>BEST</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* ── LOGIN FORM ── */
              <div style={{animation:'slideIn 0.4s ease forwards'}}>
                <div style={{
                  background:'rgba(255,255,255,0.97)', borderRadius:'28px',
                  padding:'40px', boxShadow:'0 32px 80px rgba(0,0,0,0.5)',
                  position:'relative'
                }}>
                  {/* Close → back to calculator */}
                  <button onClick={()=>setShowForm(false)} style={{
                    position:'absolute', top:'20px', right:'20px',
                    background:'#f5f5f5', border:'none', borderRadius:'50%',
                    width:'32px', height:'32px', cursor:'pointer',
                    fontSize:'14px', color:'#888', display:'flex',
                    alignItems:'center', justifyContent:'center'
                  }}>✕</button>

                  <div style={{marginBottom:'28px'}}>
                    <h2 style={{fontWeight:'900', fontSize:'24px', color:'#0f1f3a', margin:0}}>Welcome back 👋</h2>
                    <p style={{color:'#999', fontSize:'14px', margin:'6px 0 0'}}>Login to send money globally</p>
                  </div>

                  {error && (
                    <div style={{background:'#fff0f0', border:'1px solid #fcc', color:'#e74c3c', padding:'12px 16px', borderRadius:'12px', marginBottom:'20px', fontSize:'14px'}}>
                      ⚠️ {error}
                    </div>
                  )}

                  <div style={{marginBottom:'16px'}}>
                    <label style={{fontSize:'11px', fontWeight:'700', color:'#888', display:'block', marginBottom:'7px', textTransform:'uppercase', letterSpacing:'1px'}}>Email</label>
                    <input type="email" placeholder="your@email.com" value={email}
                      onChange={e=>setEmail(e.target.value)}
                      onKeyDown={e=>e.key==='Enter'&&handleLogin()}
                      style={inputStyle}
                      onFocus={e=>e.target.style.borderColor='#0f4c81'}
                      onBlur={e=>e.target.style.borderColor='#ebebeb'}
                    />
                  </div>

                  <div style={{marginBottom:'24px'}}>
                    <label style={{fontSize:'11px', fontWeight:'700', color:'#888', display:'block', marginBottom:'7px', textTransform:'uppercase', letterSpacing:'1px'}}>Password</label>
                    <input type="password" placeholder="••••••••" value={password}
                      onChange={e=>setPassword(e.target.value)}
                      onKeyDown={e=>e.key==='Enter'&&handleLogin()}
                      style={inputStyle}
                      onFocus={e=>e.target.style.borderColor='#0f4c81'}
                      onBlur={e=>e.target.style.borderColor='#ebebeb'}
                    />
                  </div>

                  <button onClick={handleLogin} disabled={loading} style={{
                    width:'100%', padding:'15px',
                    background:loading?'#ccc':'linear-gradient(135deg, #0f4c81, #1a7a6e)',
                    color:'white', border:'none', borderRadius:'14px',
                    fontSize:'16px', fontWeight:'700',
                    cursor:loading?'not-allowed':'pointer',
                    fontFamily:'Sora, sans-serif', marginBottom:'16px',
                    transition:'transform 0.2s', boxShadow:'0 8px 24px rgba(15,76,129,0.25)'
                  }}
                    onMouseOver={e=>!loading&&(e.currentTarget.style.transform='translateY(-2px)')}
                    onMouseOut={e=>e.currentTarget.style.transform='translateY(0)'}
                  >{loading?'Logging in...':'Login →'}</button>

                  <div style={{display:'flex', alignItems:'center', gap:'12px', margin:'16px 0'}}>
                    <div style={{flex:1, height:'1px', background:'#ebebeb'}}/>
                    <span style={{color:'#ccc', fontSize:'12px', fontWeight:'700'}}>OR</span>
                    <div style={{flex:1, height:'1px', background:'#ebebeb'}}/>
                  </div>

                  <div style={{display:'flex', justifyContent:'center', marginBottom:'24px'}}>
                    <GoogleLogin
                      onSuccess={async(credentialResponse)=>{
                        try {
                          const response = await googleAuth({credential:credentialResponse.credential});
                          const {accesstoken,user} = response.data;
                          setAccessToken(accesstoken);
                          localStorage.setItem('user',JSON.stringify(user));
                          navigate('/dashboard');
                        } catch(err){
                          setError('Google login failed. Please try again!');
                        }
                      }}
                      onError={()=>setError('Google login failed. Please try again!')}
                      width="340" text="continue_with" shape="rectangular" theme="outline"
                    />
                  </div>

                  <p style={{textAlign:'center', color:'#999', fontSize:'14px', margin:0}}>
                    New to Crobo?{' '}
                    <span onClick={()=>navigate('/signup')} style={{color:'#0f4c81', fontWeight:'700', cursor:'pointer'}}>
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