import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../services/api';

// ============================================================
// 🎨 BACKGROUND OPTIONS — Comment/uncomment to switch!
// ============================================================

// ─── OPTION 1: Animated floating money/globe particles ───────
const AnimatedParticles = () => {
  const particles = ['💰', '🌍', '💸', '💵', '🌐', '💴', '💶', '💷', '🏦', '📈'];
  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', zIndex: 0 }}>
      <style>{`
        @keyframes float {
          0% { transform: translateY(100vh) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-100px) rotate(360deg); opacity: 0; }
        }
      `}</style>
      {[...Array(20)].map((_, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: `${Math.random() * 100}%`,
          fontSize: `${Math.random() * 20 + 16}px`,
          animation: `float ${Math.random() * 10 + 8}s linear infinite`,
          animationDelay: `${Math.random() * 10}s`,
          opacity: 0
        }}>
          {particles[i % particles.length]}
        </div>
      ))}
    </div>
  );
};

// ─── OPTION 2: World map background with glowing routes ──────
const WorldMapBackground = () => (
  <div style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden' }}>
    <style>{`
      @keyframes dash { to { stroke-dashoffset: -100; } }
      @keyframes pulse { 0%, 100% { opacity: 0.6; } 50% { opacity: 1; } }
      @keyframes glow { 0%, 100% { filter: blur(2px); } 50% { filter: blur(6px); } }
    `}</style>
    <svg width="100%" height="100%" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
      <defs>
        <radialGradient id="bgGrad" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#0f2d4a" />
          <stop offset="100%" stopColor="#0a1628" />
        </radialGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <rect width="1200" height="800" fill="url(#bgGrad)" />

      {/* Grid lines */}
      {[...Array(12)].map((_, i) => (
        <line key={`v${i}`} x1={i * 100} y1="0" x2={i * 100} y2="800"
          stroke="#1a3a5c" strokeWidth="0.5" opacity="0.4" />
      ))}
      {[...Array(8)].map((_, i) => (
        <line key={`h${i}`} x1="0" y1={i * 100} x2="1200" y2={i * 100}
          stroke="#1a3a5c" strokeWidth="0.5" opacity="0.4" />
      ))}

      {/* Transfer routes — dashed animated lines */}
      {[
        { x1: 200, y1: 300, x2: 600, y2: 200 },
        { x1: 600, y1: 200, x2: 900, y2: 250 },
        { x1: 200, y1: 300, x2: 750, y2: 400 },
        { x1: 600, y1: 200, x2: 450, y2: 450 },
        { x1: 900, y1: 250, x2: 1050, y2: 350 },
        { x1: 200, y1: 300, x2: 350, y2: 500 },
        { x1: 750, y1: 400, x2: 950, y2: 500 },
      ].map((line, i) => (
        <line key={i}
          x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2}
          stroke="#1a7a6e" strokeWidth="1.5"
          strokeDasharray="8,6" opacity="0.6"
          style={{ animation: `dash ${3 + i * 0.5}s linear infinite` }}
        />
      ))}

      {/* City dots */}
      {[
        { x: 200, y: 300, label: '🇺🇸' },
        { x: 600, y: 200, label: '🇬🇧' },
        { x: 900, y: 250, label: '🇮🇳' },
        { x: 750, y: 400, label: '🇦🇪' },
        { x: 450, y: 450, label: '🇪🇺' },
        { x: 1050, y: 350, label: '🇸🇬' },
        { x: 350, y: 500, label: '🇦🇺' },
        { x: 950, y: 500, label: '🇨🇦' },
      ].map((city, i) => (
        <g key={i}>
          <circle cx={city.x} cy={city.y} r="16" fill="#0f4c81" opacity="0.3"
            style={{ animation: `pulse ${2 + i * 0.3}s ease-in-out infinite` }} />
          <circle cx={city.x} cy={city.y} r="6" fill="#1a7a6e"
            filter="url(#glow)" opacity="0.9" />
          <text x={city.x} y={city.y - 20} textAnchor="middle" fontSize="18">
            {city.label}
          </text>
        </g>
      ))}
    </svg>
  </div>
);

// ─── OPTION 3: Gradient waves animation ──────────────────────
const GradientWaves = () => (
  <div style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden' }}>
    <style>{`
      @keyframes wave1 { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
      @keyframes wave2 { 0% { transform: translateX(-50%); } 100% { transform: translateX(0); } }
      @keyframes wave3 { 0% { transform: translateX(0) translateY(0); } 
                         50% { transform: translateX(-25%) translateY(20px); }
                         100% { transform: translateX(-50%) translateY(0); } }
    `}</style>
    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #0f4c81, #1a7a6e)' }} />
    <svg style={{ position: 'absolute', bottom: 0, width: '200%', animation: 'wave1 8s linear infinite' }}
      viewBox="0 0 1440 320" preserveAspectRatio="none" height="200">
      <path fill="rgba(255,255,255,0.05)"
        d="M0,160L48,144C96,128,192,96,288,106.7C384,117,480,171,576,186.7C672,203,768,181,864,154.7C960,128,1056,96,1152,90.7C1248,85,1344,107,1392,117.3L1440,128L1440,320L0,320Z" />
    </svg>
    <svg style={{ position: 'absolute', bottom: 0, width: '200%', animation: 'wave2 10s linear infinite' }}
      viewBox="0 0 1440 320" preserveAspectRatio="none" height="250">
      <path fill="rgba(255,255,255,0.04)"
        d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,208C672,213,768,203,864,176C960,149,1056,107,1152,101.3C1248,96,1344,128,1392,144L1440,160L1440,320L0,320Z" />
    </svg>
    <svg style={{ position: 'absolute', bottom: 0, width: '200%', animation: 'wave3 12s linear infinite' }}
      viewBox="0 0 1440 320" preserveAspectRatio="none" height="300">
      <path fill="rgba(255,255,255,0.03)"
        d="M0,256L48,261.3C96,267,192,277,288,261.3C384,245,480,203,576,197.3C672,192,768,224,864,234.7C960,245,1056,235,1152,213.3C1248,192,1344,160,1392,144L1440,128L1440,320L0,320Z" />
    </svg>
  </div>
);

// ─── OPTION 4: Moving currency symbols background ─────────────
const CurrencySymbols = () => {
  const symbols = ['$', '€', '£', '¥', '₹', '₿', '₣', '₩', '฿', '₴'];
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden',
      background: 'linear-gradient(135deg, #0f4c81, #1a7a6e)' }}>
      <style>{`
        @keyframes moveSymbol {
          0% { transform: translateY(100vh) translateX(0) rotate(0deg); opacity: 0; }
          10% { opacity: 0.15; }
          90% { opacity: 0.15; }
          100% { transform: translateY(-150px) translateX(30px) rotate(180deg); opacity: 0; }
        }
      `}</style>
      {[...Array(30)].map((_, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: `${(i * 7 + Math.random() * 10) % 100}%`,
          color: 'white',
          fontSize: `${Math.random() * 40 + 20}px`,
          fontWeight: '900',
          animation: `moveSymbol ${Math.random() * 15 + 10}s linear infinite`,
          animationDelay: `${Math.random() * 15}s`,
          opacity: 0,
          fontFamily: 'Arial'
        }}>
          {symbols[i % symbols.length]}
        </div>
      ))}
    </div>
  );
};

// ============================================================

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      setError('');
      setLoading(true);
      const response = await loginUser({ email, password });
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      navigate('/dashboard');
    } catch (error) {
      setError(error.response?.data?.message || 'Something went wrong!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>

      {/* ============================================================ */}
      {/* 🎨 SWITCH BACKGROUND HERE — comment/uncomment one option!    */}
      {/* ============================================================ */}

      {/* OPTION 1 — Floating money/globe particles */}
      {/* <AnimatedParticles /> */}

      {/* OPTION 2 — World map with glowing routes ✅ ACTIVE */}
      {/*<WorldMapBackground />*/}

      {/* OPTION 3 — Gradient waves */}
      {/* <GradientWaves /> */}

      {/* OPTION 4 — Moving currency symbols */}
      /* <CurrencySymbols /> */

      {/* ============================================================ */}

      {/* Login Card */}
      <div style={{
        position: 'relative', zIndex: 10,
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(20px)',
        padding: '40px', borderRadius: '28px',
        width: '100%', maxWidth: '420px',
        margin: '20px',
        boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
        border: '1px solid rgba(255,255,255,0.3)'
      }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '36px', fontWeight: '900', color: '#0f4c81', margin: 0 }}>🌍 Crobo</h1>
          <p style={{ color: '#888', marginTop: '8px', fontSize: '14px' }}>Send money across the world</p>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: '#fff0f0', border: '1px solid #fcc',
            color: '#e74c3c', padding: '12px 16px',
            borderRadius: '12px', marginBottom: '16px', fontSize: '14px'
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Email */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '13px', fontWeight: '600', color: '#555', display: 'block', marginBottom: '6px' }}>
            Email
          </label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            style={{
              width: '100%', padding: '12px 16px',
              border: '2px solid #e0e0e0', borderRadius: '12px',
              fontSize: '15px', outline: 'none',
              fontFamily: 'Sora, sans-serif', boxSizing: 'border-box',
              transition: 'border-color 0.2s'
            }}
            onFocus={e => e.target.style.borderColor = '#0f4c81'}
            onBlur={e => e.target.style.borderColor = '#e0e0e0'}
          />
        </div>

        {/* Password */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ fontSize: '13px', fontWeight: '600', color: '#555', display: 'block', marginBottom: '6px' }}>
            Password
          </label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            style={{
              width: '100%', padding: '12px 16px',
              border: '2px solid #e0e0e0', borderRadius: '12px',
              fontSize: '15px', outline: 'none',
              fontFamily: 'Sora, sans-serif', boxSizing: 'border-box',
              transition: 'border-color 0.2s'
            }}
            onFocus={e => e.target.style.borderColor = '#0f4c81'}
            onBlur={e => e.target.style.borderColor = '#e0e0e0'}
          />
        </div>

        {/* Login Button */}
        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            width: '100%', padding: '14px',
            background: loading ? '#ccc' : 'linear-gradient(135deg, #0f4c81, #1a7a6e)',
            color: 'white', border: 'none', borderRadius: '14px',
            fontSize: '16px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: 'Sora, sans-serif', transition: 'transform 0.2s',
            marginBottom: '16px'
          }}
          onMouseOver={e => !loading && (e.target.style.transform = 'translateY(-2px)')}
          onMouseOut={e => e.target.style.transform = 'translateY(0)'}
        >
          {loading ? 'Logging in...' : 'Login →'}
        </button>

        {/* Signup Link */}
        <p style={{ textAlign: 'center', color: '#888', fontSize: '14px', margin: 0 }}>
          Don't have an account?{' '}
          <span
            onClick={() => navigate('/signup')}
            style={{ color: '#0f4c81', fontWeight: '700', cursor: 'pointer' }}
          >
            Sign up
          </span>
        </p>

      </div>
    </div>
  );
}

export default Login;