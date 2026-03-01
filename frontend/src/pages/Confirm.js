import { useLocation, useNavigate } from 'react-router-dom';

function Confirm() {
  const navigate = useNavigate();
  const location = useLocation();
  const data = location.state;

  if (!data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{background:'#f7f8fc', fontFamily:"'Sora', sans-serif"}}>
        <span className="text-5xl">⚠️</span>
        <h2 className="font-extrabold text-xl m-0" style={{color:'#1a1a2e'}}>No Transfer Data Found</h2>
        <p className="text-sm m-0" style={{color:'#888'}}>Please start a transfer first.</p>
        <button onClick={() => navigate('/send')}
          className="text-white font-bold text-base px-7 py-3.5 rounded-2xl border-none cursor-pointer transition-all hover:-translate-y-0.5"
          style={{background:'linear-gradient(135deg, #0f4c81, #1a7a6e)', fontFamily:"'Sora', sans-serif"}}>
          Start a Transfer →
        </button>
      </div>
    );
  }

  const handleConfirm = async () => {
    try {
      const { sendMoney } = await import('../services/api');
      await sendMoney({
        amountSent: data.amount,
        amountReceived: parseFloat(data.recipientGets),
        currency: data.country.code,
        country: data.country.name,
        exchangeRate: parseFloat(data.exchangeRate),
      });
      navigate('/history');
    } catch (error) {
      alert(error.response?.data?.message || 'Something went wrong!');
    }
  };

  return (
    <div className="min-h-screen" style={{background:'#f7f8fc', fontFamily:"'Sora', sans-serif"}}>

      {/* ── HEADER ── */}
      <div style={{background:'linear-gradient(135deg, #0f4c81 0%, #1a7a6e 100%)'}}>
        <div className="max-w-xl mx-auto px-5 md:px-8 py-5 flex items-center gap-4">
          <button onClick={() => navigate('/send')}
            className="rounded-xl px-3 py-2 text-white text-lg border-none cursor-pointer hover:bg-white/25 transition-all"
            style={{background:'rgba(255,255,255,0.15)'}}>←</button>
          <div>
            <h1 className="text-white font-extrabold text-xl m-0">Confirm Transfer</h1>
            <p className="text-sm m-0" style={{color:'rgba(255,255,255,0.7)'}}>Review before sending</p>
          </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-5 md:px-8 py-6 md:py-8">

        {/* ── SUMMARY CARD ── */}
        <div className="bg-white rounded-3xl p-7 md:p-8 mb-5" style={{boxShadow:'0 4px 20px rgba(0,0,0,0.06)'}}>
          <p className="text-xs font-bold uppercase tracking-widest mb-5 m-0" style={{color:'#888'}}>Transfer Summary</p>

          {/* You Send */}
          <div className="rounded-2xl p-5 mb-3" style={{background:'#f7f8fc'}}>
            <p className="text-xs m-0 mb-1.5" style={{color:'#888'}}>You Send</p>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🇺🇸</span>
                <span className="font-bold text-base" style={{color:'#1a1a2e'}}>USD</span>
              </div>
              <span className="font-extrabold" style={{fontSize:'clamp(22px, 3vw, 28px)', color:'#1a1a2e'}}>
                ${data.amount.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Arrow */}
          <div className="text-center my-1 text-xl">↓</div>

          {/* Recipient Gets */}
          <div className="rounded-2xl p-5 mb-6" style={{background:'linear-gradient(135deg, #0f4c81, #1a7a6e)'}}>
            <p className="text-xs m-0 mb-1.5" style={{color:'rgba(255,255,255,0.7)'}}>Recipient Gets</p>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{data.country.flag}</span>
                <span className="font-bold text-base text-white">{data.country.code}</span>
              </div>
              <span className="font-extrabold text-white" style={{fontSize:'clamp(22px, 3vw, 28px)'}}>
                {data.recipientGets}
              </span>
            </div>
          </div>

          {/* Breakdown */}
          <div className="pt-5" style={{borderTop:'1.5px solid #f0f0f0'}}>
            <p className="text-xs font-bold uppercase tracking-widest mb-4 m-0" style={{color:'#888'}}>Breakdown</p>
            {[
              {label:'Transfer Amount', value:`$${data.amount.toFixed(2)}`},
              {label:'Transfer Fee', value:`- $${data.fee}`, color:'#e74c3c'},
              {label:'Amount After Fee', value:`$${data.amountAfterFee}`},
              {label:'Exchange Rate', value:`1 USD = ${data.exchangeRate} ${data.country.code}`},
              {label:'Estimated Delivery', value:`⚡ ${data.country.delivery}`, color:'#1a7a6e'},
            ].map((row, i) => (
              <div key={i} className="flex justify-between items-center mb-3">
                <span className="text-sm" style={{color:'#888'}}>{row.label}</span>
                <span className="text-sm font-semibold" style={{color: row.color || '#1a1a2e'}}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── RECIPIENT CARD ── */}
        <div className="bg-white rounded-3xl p-6 md:p-7 mb-5" style={{boxShadow:'0 4px 20px rgba(0,0,0,0.06)'}}>
          <p className="text-xs font-bold uppercase tracking-widest mb-4 m-0" style={{color:'#888'}}>Sending To</p>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl text-white font-extrabold flex-shrink-0"
              style={{background:'linear-gradient(135deg, #0f4c81, #1a7a6e)'}}>
              {data.country.flag}
            </div>
            <div>
              <p className="font-bold text-base m-0" style={{color:'#1a1a2e'}}>{data.country.name}</p>
              <p className="text-sm m-0 mt-0.5" style={{color:'#888'}}>{data.country.currency}</p>
            </div>
          </div>
        </div>

        {/* ── WARNING ── */}
        <div className="rounded-2xl px-5 py-4 mb-6 flex gap-3 items-start"
          style={{background:'#fff8f0', border:'1.5px solid #ffe0b2'}}>
          <span className="text-lg">⚠️</span>
          <p className="text-sm m-0 leading-relaxed" style={{color:'#e67e22'}}>
            Please review all details carefully. Once confirmed, transfers cannot be cancelled.
          </p>
        </div>

        {/* ── BUTTONS ── */}
        <div className="flex gap-3 mb-8">
          <button onClick={() => navigate('/send')}
            className="flex-1 py-4 rounded-2xl font-bold text-base cursor-pointer transition-all hover:-translate-y-0.5"
            style={{background:'white', color:'#0f4c81', border:'2px solid #0f4c81', fontFamily:"'Sora', sans-serif"}}>
            ← Edit
          </button>
          <button onClick={handleConfirm}
            className="text-white font-bold text-base border-none cursor-pointer transition-all hover:-translate-y-0.5 rounded-2xl py-4"
            style={{flex:2, background:'linear-gradient(135deg, #0f4c81, #1a7a6e)', fontFamily:"'Sora', sans-serif", boxShadow:'0 8px 24px rgba(15,76,129,0.3)'}}>
            Confirm & Send 💸
          </button>
        </div>
      </div>
    </div>
  );
}

export default Confirm;