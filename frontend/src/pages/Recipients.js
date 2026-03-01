import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRecipients, deleteRecipient } from '../services/api';
import AddRecipientModal from '../components/AddRecipientModal';

const transferIcon = { 'Myself':'🙋', 'My Family':'👨‍👩‍👧', 'Someone Else':'👤' };

function Recipients() {
  const navigate = useNavigate();
  const [recipients, setRecipients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [editRecipient, setEditRecipient] = useState(null);

  useEffect(() => {
    const fetchRecipients = async () => {
      try {
        const response = await getRecipients();
        setRecipients(response.data.recipients);
      } catch (error) {
        if (error.response?.status === 401) navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchRecipients();
  }, [navigate]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Remove ${name} from recipients?`)) return;
    setDeletingId(id);
    try {
      await deleteRecipient(id);
      setRecipients(prev => prev.filter(r => r.id !== id));
    } catch {
      alert('Something went wrong!');
    }
    setDeletingId(null);
  };

  return (
    <div className="min-h-screen" style={{background:'#f7f8fc', fontFamily:"'Sora', sans-serif"}}>

      {/* ── HEADER ── */}
      <div style={{background:'linear-gradient(135deg, #0f4c81 0%, #1a7a6e 100%)'}}>
        <div className="max-w-2xl mx-auto px-5 md:px-8 py-5 flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')}
            className="rounded-xl px-3 py-2 text-white text-lg border-none cursor-pointer hover:bg-white/25 transition-all"
            style={{background:'rgba(255,255,255,0.15)'}}>←</button>
          <div>
            <h1 className="text-white font-extrabold text-xl m-0">👥 Manage Recipients</h1>
            <p className="text-sm m-0" style={{color:'rgba(255,255,255,0.7)'}}>
              {recipients.length} saved recipient{recipients.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-5 md:px-8 py-6 md:py-8">

        {/* ── LOADING ── */}
        {loading && (
          <div className="text-center py-16">
            <p className="text-sm" style={{color:'#aaa'}}>Loading recipients...</p>
          </div>
        )}

        {/* ── EMPTY STATE ── */}
        {!loading && recipients.length === 0 && (
          <div className="bg-white rounded-3xl py-16 px-8 text-center" style={{boxShadow:'0 4px 20px rgba(0,0,0,0.06)'}}>
            <p className="text-5xl mb-4">👥</p>
            <p className="font-bold text-lg m-0" style={{color:'#1a1a2e'}}>No recipients yet!</p>
            <p className="text-sm mt-2 m-0" style={{color:'#888'}}>Add recipients from the dashboard</p>
            <button onClick={() => navigate('/dashboard')}
              className="mt-6 px-8 py-3.5 text-white font-bold text-sm border-none rounded-2xl cursor-pointer transition-all hover:-translate-y-0.5"
              style={{background:'linear-gradient(135deg, #0f4c81, #1a7a6e)', fontFamily:"'Sora', sans-serif"}}>
              ← Go to Dashboard
            </button>
          </div>
        )}

        {/* ── RECIPIENTS LIST ── */}
        <div className="flex flex-col gap-4">
          {recipients.map(r => (
            <div key={r.id}
              className="bg-white rounded-2xl p-5 md:p-6 transition-all duration-200 hover:-translate-y-0.5"
              style={{boxShadow:'0 4px 20px rgba(0,0,0,0.06)', borderLeft:'4px solid #0f4c81'}}>

              {/* Top Row */}
              <div className="flex justify-between items-start gap-3">
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                    style={{background:'linear-gradient(135deg, #0f4c81, #1a7a6e)'}}>
                    {r.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-base m-0" style={{color:'#1a1a2e'}}>{r.fullName}</p>
                    <p className="text-xs m-0 mt-0.5" style={{color:'#888'}}>
                      {transferIcon[r.transferringTo] || '👤'} {r.transferringTo} · {r.country}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => navigate('/send', { state: { recipient: r } })}
                    className="text-white font-semibold text-xs px-3 py-2 rounded-xl border-none cursor-pointer"
                    style={{background:'linear-gradient(135deg, #0f4c81, #1a7a6e)', fontFamily:"'Sora', sans-serif"}}>
                    💸 Send
                  </button>
                  <button onClick={() => setEditRecipient(r)}
                    className="font-semibold text-xs px-3 py-2 rounded-xl border-none cursor-pointer"
                    style={{background:'#f0f7ff', color:'#0f4c81', fontFamily:"'Sora', sans-serif"}}>
                    ✏️ Edit
                  </button>
                  <button onClick={() => handleDelete(r.id, r.fullName)} disabled={deletingId === r.id}
                    className="font-semibold text-xs px-3 py-2 rounded-xl border-none cursor-pointer"
                    style={{background:'#fff0f0', color:'#e74c3c', fontFamily:"'Sora', sans-serif"}}>
                    {deletingId === r.id ? '...' : '🗑️'}
                  </button>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-3 mt-4 rounded-xl p-3 md:p-4" style={{background:'#f7f8fc'}}>
                {[
                  {label:'Bank Account', value:r.bankAccount},
                  {label:'IFSC Code', value:r.ifscCode},
                  {label:'Email', value:r.email},
                  {label:'Phone', value:r.phone},
                ].map((detail, i) => (
                  <div key={i}>
                    <p className="text-xs font-semibold uppercase tracking-wider m-0" style={{color:'#aaa'}}>{detail.label}</p>
                    <p className="text-sm font-semibold m-0 mt-0.5 truncate" style={{color:'#1a1a2e'}}>{detail.value}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* ── BOTTOM BUTTON ── */}
        {!loading && recipients.length > 0 && (
          <button onClick={() => navigate('/dashboard')}
            className="w-full mt-6 mb-8 py-5 text-white font-bold text-base border-none rounded-2xl cursor-pointer transition-all hover:-translate-y-0.5"
            style={{background:'linear-gradient(135deg, #0f4c81, #1a7a6e)', fontFamily:"'Sora', sans-serif", boxShadow:'0 8px 24px rgba(15,76,129,0.3)'}}>
            ← Back to Dashboard
          </button>
        )}

        {/* ── EDIT MODAL ── */}
        {editRecipient && (
          <AddRecipientModal
            onClose={() => setEditRecipient(null)}
            editRecipient={editRecipient}
            onSuccess={(updated) => {
              setRecipients(prev => prev.map(r => r.id === updated.id ? updated : r));
              setEditRecipient(null);
              alert(`✅ ${updated.fullName} updated successfully!`);
            }}
          />
        )}
      </div>
    </div>
  );
}

export default Recipients;