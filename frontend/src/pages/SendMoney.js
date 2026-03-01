import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getRecipients } from '../services/api';
import WorldMap from '../components/WorldMap';

const FLAT_FEE = 0.99;

const styles = `
  @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
  .spinner { animation: spin 1s linear infinite; }
`;

const countries = [
  { code:'GBP', name:'United Kingdom', flag:'🇬🇧', currency:'British Pound', delivery:'1-2 hours' },
  { code:'EUR', name:'Europe', flag:'🇪🇺', currency:'Euro', delivery:'1-2 hours' },
  { code:'INR', name:'India', flag:'🇮🇳', currency:'Indian Rupee', delivery:'Instant' },
  { code:'AUD', name:'Australia', flag:'🇦🇺', currency:'Australian Dollar', delivery:'2-3 hours' },
  { code:'CAD', name:'Canada', flag:'🇨🇦', currency:'Canadian Dollar', delivery:'2-3 hours' },
  { code:'SGD', name:'Singapore', flag:'🇸🇬', currency:'Singapore Dollar', delivery:'1-2 hours' },
  { code:'AED', name:'UAE', flag:'🇦🇪', currency:'UAE Dirham', delivery:'Instant' },
];

function SendMoney() {
  const navigate = useNavigate();
  const location = useLocation();
  const preselectedRecipient = location.state?.recipient || null;

  const [amount, setAmount] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [rates, setRates] = useState({});
  const [loading, setLoading] = useState(true);
  const [apiStatus, setApiStatus] = useState('Getting best exchange rates for you...');
  const [selectedRecipient, setSelectedRecipient] = useState(preselectedRecipient);
  const [recipients, setRecipients] = useState([]);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        setApiStatus('Getting best exchange rates for you...');
        const response = await fetch('https://api.frankfurter.app/latest?from=USD&to=GBP,EUR,INR,AUD,CAD,SGD,AED', { signal: AbortSignal.timeout(5000) });
        if (!response.ok) throw new Error('failed');
        const data = await response.json();
        setRates(data.rates); setLoading(false); return;
      } catch {}
      try {
        setApiStatus('Checking backup rate provider...');
        const response = await fetch('https://open.er-api.com/v6/latest/USD', { signal: AbortSignal.timeout(5000) });
        if (!response.ok) throw new Error('failed');
        const data = await response.json();
        const { GBP, EUR, INR, AUD, CAD, SGD, AED } = data.rates;
        setRates({ GBP, EUR, INR, AUD, CAD, SGD, AED }); setLoading(false); return;
      } catch {}
      try {
        setApiStatus('Almost there...');
        const response = await fetch('https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json', { signal: AbortSignal.timeout(5000) });
        if (!response.ok) throw new Error('failed');
        const data = await response.json();
        const r = data.usd;
        setRates({ GBP:r.gbp, EUR:r.eur, INR:r.inr, AUD:r.aud, CAD:r.cad, SGD:r.sgd, AED:r.aed });
        setLoading(false); return;
      } catch {}
      setApiStatus('Using cached rates');
      setRates({ GBP:0.79, EUR:0.92, INR:83.12, AUD:1.53, CAD:1.36, SGD:1.34, AED:3.67 });
      setLoading(false);
    };
    fetchRates();
  }, []);

  useEffect(() => {
    const fetchRecipients = async () => {
      try {
        const response = await getRecipients();
        setRecipients(response.data.recipients);
      } catch {}
    };
    fetchRecipients();
  }, []);

  const amountNumber = parseFloat(amount) || 0;
  const amountAfterFee = amountNumber - FLAT_FEE;
  const recipientGets = amountAfterFee > 0
    ? (amountAfterFee * (rates[selectedCountry.code] || 0)).toFixed(2) : '0.00';
  const exchangeRate = rates[selectedCountry.code]
    ? rates[selectedCountry.code].toFixed(4) : '...';

  const handleContinue = () => {
    if (!amount || amountNumber <= FLAT_FEE) {
      alert(`Amount must be greater than $${FLAT_FEE} to cover the fee!`); return;
    }
    navigate('/confirm', {
      state: {
        amount: amountNumber, fee: FLAT_FEE,
        amountAfterFee: amountAfterFee.toFixed(2),
        recipientGets, exchangeRate,
        country: selectedCountry, recipient: selectedRecipient,
      }
    });
  };

  return (
    <div className="min-h-screen" style={{background:'#f7f8fc', fontFamily:"'Sora', sans-serif"}}>
      <style>{styles}</style>

      {/* ── LOADING ── */}
      {loading && (
        <div className="fixed inset-0 flex flex-col items-center justify-center z-50"
          style={{background:'linear-gradient(135deg, #0f4c81, #1a7a6e)'}}>
          <div className="w-16 h-16 rounded-full mb-6 spinner"
            style={{border:'4px solid rgba(255,255,255,0.2)', borderTop:'4px solid white'}}/>
          <p className="text-5xl mb-3">🌍</p>
          <p className="text-white font-bold text-lg mb-2 text-center px-8">{apiStatus}</p>
          <p className="text-sm" style={{color:'rgba(255,255,255,0.6)'}}>Powered by live market data</p>
        </div>
      )}

      {/* ── HEADER ── */}
      <div style={{background:'linear-gradient(135deg, #0f4c81 0%, #1a7a6e 100%)'}}>
        <div className="max-w-6xl mx-auto px-5 md:px-8 py-5 flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')}
            className="rounded-xl px-3 py-2 text-white text-lg border-none cursor-pointer hover:bg-white/25 transition-all"
            style={{background:'rgba(255,255,255,0.15)'}}>←</button>
          <div>
            <h1 className="text-white font-extrabold text-xl m-0">Send Money</h1>
            <p className="text-sm m-0" style={{color:'rgba(255,255,255,0.7)'}}>Fast & secure international transfers</p>
          </div>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="max-w-6xl mx-auto px-5 md:px-8 py-6 md:py-8 grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

        {/* World Map — desktop only */}
        <div className="hidden lg:block">
          <WorldMap selectedCountry={selectedCountry?.name} recipientCountry={selectedRecipient?.country}/>
        </div>

        {/* Form */}
        <div className="flex flex-col gap-4">

          {/* Recipient */}
          <div className="bg-white rounded-2xl p-5" style={{boxShadow:'0 4px 20px rgba(0,0,0,0.06)'}}>
            <p className="font-bold text-base m-0 mb-3" style={{color:'#1a1a2e'}}>👤 Send To</p>
            <select value={selectedRecipient?.id || ''}
              onChange={e => setSelectedRecipient(recipients.find(r => r.id === e.target.value) || null)}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none mb-3"
              style={{border:'2px solid #e0e0e0', color:'#1a1a2e', fontFamily:"'Sora', sans-serif", boxSizing:'border-box'}}>
              <option value="">Select a recipient...</option>
              {recipients.map(r => <option key={r.id} value={r.id}>{r.fullName} — {r.country}</option>)}
            </select>

            {selectedRecipient && (
              <div className="rounded-2xl p-4 flex items-center gap-3" style={{background:'#f0f7ff'}}>
                <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
                  style={{background:'linear-gradient(135deg, #0f4c81, #1a7a6e)'}}>
                  {selectedRecipient.fullName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-sm m-0" style={{color:'#1a1a2e'}}>{selectedRecipient.fullName}</p>
                  <p className="text-xs m-0 mt-0.5" style={{color:'#888'}}>{selectedRecipient.country} · {selectedRecipient.bankAccount} · {selectedRecipient.ifscCode}</p>
                  <p className="text-xs font-semibold m-0 mt-0.5" style={{color:'#0f4c81'}}>{selectedRecipient.transferringTo}</p>
                </div>
              </div>
            )}
          </div>

          {/* You Send */}
          <div className="bg-white rounded-2xl p-5" style={{boxShadow:'0 4px 20px rgba(0,0,0,0.06)'}}>
            <label className="text-xs font-semibold uppercase tracking-widest" style={{color:'#888'}}>You Send</label>
            <div className="flex items-center gap-3 rounded-2xl px-5 py-4 mt-2" style={{border:'2px solid #f0f0f0'}}>
              <span className="text-2xl">🇺🇸</span>
              <span className="font-bold text-base" style={{color:'#0f4c81'}}>USD</span>
              <span style={{color:'#ddd', fontSize:'20px'}}>|</span>
              <input type="number" placeholder="Enter amount" value={amount}
                onChange={e => setAmount(e.target.value)}
                className="border-none outline-none font-extrabold flex-1 bg-transparent"
                style={{fontSize:'clamp(18px, 3vw, 24px)', color:'#1a1a2e', fontFamily:"'Sora', sans-serif"}}/>
            </div>
          </div>

          {/* Fee Info */}
          <div className="bg-white rounded-2xl p-5" style={{boxShadow:'0 4px 20px rgba(0,0,0,0.06)'}}>
            {[
              {label:'Transfer Fee', value:`- $${FLAT_FEE}`},
              {label:'Exchange Rate', value:`1 USD = ${loading ? '...' : exchangeRate} ${selectedCountry.code}`},
              {label:'Estimated Delivery', value:`⚡ ${selectedCountry.delivery}`, teal:true},
            ].map((item, i) => (
              <div key={i} className={`flex justify-between ${i < 2 ? 'mb-3' : ''}`}>
                <span className="text-sm" style={{color:'#888'}}>{item.label}</span>
                <span className="text-sm font-semibold" style={{color: item.teal ? '#1a7a6e' : '#1a1a2e'}}>{item.value}</span>
              </div>
            ))}
          </div>

          {/* Arrow */}
          <div className="flex justify-center">
            <div className="rounded-full px-4 py-2.5 text-xl" style={{background:'linear-gradient(135deg, #0f4c81, #1a7a6e)'}}>↕️</div>
          </div>

          {/* Recipient Gets */}
          <div className="bg-white rounded-2xl p-5" style={{boxShadow:'0 4px 20px rgba(0,0,0,0.06)'}}>
            <label className="text-xs font-semibold uppercase tracking-widest" style={{color:'#888'}}>Recipient Gets</label>
            <div className="rounded-2xl px-5 py-4 mt-2" style={{border:'2px solid #f0f0f0'}}>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{selectedCountry.flag}</span>
                <select value={selectedCountry.code}
                  onChange={e => setSelectedCountry(countries.find(c => c.code === e.target.value))}
                  className="border-none outline-none font-bold text-base flex-1 bg-transparent cursor-pointer"
                  style={{color:'#1a1a2e', fontFamily:"'Sora', sans-serif"}}>
                  {countries.map(c => <option key={c.code} value={c.code}>{c.flag} {c.name} — {c.currency}</option>)}
                </select>
              </div>
              <div className="rounded-xl px-4 py-3 flex justify-between items-center"
                style={{background:'linear-gradient(135deg, #0f4c81, #1a7a6e)'}}>
                <span className="text-sm" style={{color:'rgba(255,255,255,0.8)'}}>They receive</span>
                <span className="text-white font-extrabold" style={{fontSize:'clamp(18px, 2.5vw, 24px)'}}>
                  {recipientGets} {selectedCountry.code}
                </span>
              </div>
            </div>
          </div>

          {/* Continue */}
          <button onClick={handleContinue}
            className="w-full py-5 rounded-2xl text-white font-bold text-base border-none cursor-pointer transition-all duration-200 hover:-translate-y-0.5 mb-8"
            style={{background:'linear-gradient(135deg, #0f4c81, #1a7a6e)', fontFamily:"'Sora', sans-serif", boxShadow:'0 8px 24px rgba(15,76,129,0.3)'}}>
            Continue →
          </button>
        </div>
      </div>
    </div>
  );
}

export default SendMoney;