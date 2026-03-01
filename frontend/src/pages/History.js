import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getHistory } from '../services/api';

const statusConfig = {
  Completed: { color: '#1a7a6e', bg: '#f0fff8', icon: '✅' },
  Pending:   { color: '#e67e22', bg: '#fff8f0', icon: '⏳' },
  Failed:    { color: '#e74c3c', bg: '#fff0f0', icon: '❌' },
};

function History() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await getHistory();
        setHistory(response.data.history || []);
      } catch (error) {
        if (error.response?.status === 401) navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [navigate]);

  const filteredHistory = history.filter(item => filter === 'all' || item.type === filter);

  const totalSent = history
    .filter(h => h.type === 'transfer' && h.status === 'Completed')
    .reduce((sum, h) => sum + h.amountSent, 0);

  const totalDeposited = history
    .filter(h => h.type === 'deposit')
    .reduce((sum, h) => sum + h.amount, 0);

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' });
  const formatTime = (d) => new Date(d).toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit' });

  return (
    <div className="min-h-screen" style={{background:'#f7f8fc', fontFamily:"'Sora', sans-serif"}}>

      {/* ── HEADER ── */}
      <div style={{background:'linear-gradient(135deg, #0f4c81 0%, #1a7a6e 100%)'}}>
        <div className="max-w-2xl mx-auto px-5 md:px-8 py-5 flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')}
            className="rounded-xl px-3 py-2 text-white text-lg border-none cursor-pointer hover:bg-white/25 transition-all"
            style={{background:'rgba(255,255,255,0.15)'}}>←</button>
          <div>
            <h1 className="text-white font-extrabold text-xl m-0">Transaction History</h1>
            <p className="text-sm m-0" style={{color:'rgba(255,255,255,0.7)'}}>All your transfers and deposits</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-5 md:px-8 py-6 md:py-8">

        {/* ── SUMMARY CARDS ── */}
        <div className="grid grid-cols-3 gap-3 md:gap-4 mb-6">
          {[
            {label:'Total Deposited', value:`+$${totalDeposited.toFixed(2)}`, color:'#1a7a6e'},
            {label:'Total Sent', value:`-$${totalSent.toFixed(2)}`, color:'#0f4c81'},
            {label:'All Transactions', value:history.length, color:'#0f4c81'},
          ].map((card, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 md:p-5 text-center" style={{boxShadow:'0 4px 20px rgba(0,0,0,0.06)'}}>
              <p className="text-xs font-semibold uppercase tracking-wider m-0" style={{color:'#888'}}>{card.label}</p>
              <p className="font-extrabold mt-1.5 m-0" style={{fontSize:'clamp(16px, 2.5vw, 22px)', color:card.color}}>{card.value}</p>
            </div>
          ))}
        </div>

        {/* ── FILTER TABS ── */}
        <div className="bg-white rounded-2xl p-1.5 flex gap-1 mb-5" style={{boxShadow:'0 4px 20px rgba(0,0,0,0.06)'}}>
          {[
            {key:'all', label:'📋 All'},
            {key:'deposit', label:'💰 Deposits'},
            {key:'transfer', label:'💸 Transfers'},
          ].map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className="flex-1 py-2.5 rounded-xl font-semibold text-xs md:text-sm border-none cursor-pointer transition-all duration-200"
              style={{
                background: filter === f.key ? 'linear-gradient(135deg, #0f4c81, #1a7a6e)' : 'transparent',
                color: filter === f.key ? 'white' : '#888',
                fontFamily:"'Sora', sans-serif"
              }}>
              {f.label}
            </button>
          ))}
        </div>

        {/* ── LOADING ── */}
        {loading && (
          <div className="text-center py-16">
            <p className="text-sm" style={{color:'#aaa'}}>Loading transactions...</p>
          </div>
        )}

        {/* ── EMPTY STATE ── */}
        {!loading && filteredHistory.length === 0 && (
          <div className="bg-white rounded-3xl py-16 px-8 text-center" style={{boxShadow:'0 4px 20px rgba(0,0,0,0.06)'}}>
            <p className="text-5xl mb-4">{filter === 'deposit' ? '💰' : '💸'}</p>
            <p className="font-bold text-lg m-0" style={{color:'#1a1a2e'}}>No transactions yet!</p>
            <p className="text-sm mt-2 m-0" style={{color:'#888'}}>
              {filter === 'deposit' ? 'Add money to get started!' : 'Send your first transfer!'}
            </p>
          </div>
        )}

        {/* ── HISTORY LIST ── */}
        <div className="flex flex-col gap-3 md:gap-4">
          {filteredHistory.map((item) => {
            const isDeposit = item.type === 'deposit';
            const status = statusConfig[item.status] || statusConfig.Completed;

            return (
              <div key={item.id}
                className="bg-white rounded-2xl px-5 py-5 flex justify-between items-center transition-all duration-200 hover:-translate-y-0.5"
                style={{boxShadow:'0 4px 20px rgba(0,0,0,0.06)', borderLeft:`4px solid ${isDeposit ? '#1a7a6e' : '#0f4c81'}`}}>

                {/* Left */}
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{background: isDeposit ? '#f0fff8' : '#f7f8fc'}}>
                    {isDeposit ? '💰' : '🌍'}
                  </div>
                  <div>
                    <p className="font-bold text-sm md:text-base m-0 mb-0.5" style={{color:'#1a1a2e'}}>
                      {isDeposit ? 'Money Added' : item.country}
                    </p>
                    <p className="text-xs m-0 mb-1.5" style={{color:'#aaa'}}>
                      {formatDate(item.createdAt)} · {formatTime(item.createdAt)}
                    </p>
                    <div className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5"
                      style={{background: status.bg}}>
                      <span className="text-xs">{status.icon}</span>
                      <span className="text-xs font-semibold" style={{color: isDeposit ? '#1a7a6e' : '#0f4c81'}}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right */}
                <div className="text-right flex-shrink-0 ml-3">
                  {isDeposit ? (
                    <>
                      <p className="font-extrabold text-lg m-0 mb-0.5" style={{color:'#1a7a6e'}}>+${item.amount.toFixed(2)}</p>
                      <p className="text-xs m-0" style={{color:'#aaa'}}>Added to wallet</p>
                    </>
                  ) : (
                    <>
                      <p className="font-extrabold text-lg m-0 mb-0.5" style={{color:'#0f4c81'}}>-${item.amountSent.toFixed(2)}</p>
                      <p className="text-sm font-semibold m-0 mb-0.5" style={{color:'#1a7a6e'}}>+{item.amountReceived.toFixed(2)} {item.currency}</p>
                      <p className="text-xs m-0" style={{color:'#aaa'}}>Rate: {item.exchangeRate}</p>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── BOTTOM BUTTON ── */}
        {!loading && (
          <button onClick={() => navigate('/send')}
            className="w-full mt-6 mb-8 py-5 text-white font-bold text-base border-none rounded-2xl cursor-pointer transition-all hover:-translate-y-0.5"
            style={{background:'linear-gradient(135deg, #0f4c81, #1a7a6e)', fontFamily:"'Sora', sans-serif", boxShadow:'0 8px 24px rgba(15,76,129,0.3)'}}>
            💸 Send Another Transfer
          </button>
        )}
      </div>
    </div>
  );
}

export default History;