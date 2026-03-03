import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AddAccountModal from '../components/AddAccountModal';
import { getAccounts, deleteAccount } from '../services/api';

const styles = `
  @keyframes fadeInUp { from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:translateY(0);} }
  @keyframes spin { 0%{transform:rotate(0deg);}100%{transform:rotate(360deg);} }
  .fade-in { animation: fadeInUp 0.5s ease forwards; }
  .card-hover { transition: all 0.2s ease; }
  .card-hover:hover { transform: translateY(-2px); }
`;

const countryConfigs = {
  US: { flag: '🇺🇸', name: 'United States' },
  IN: { flag: '🇮🇳', name: 'India' },
  GB: { flag: '🇬🇧', name: 'United Kingdom' },
  EU: { flag: '🇪🇺', name: 'Europe' },
  AU: { flag: '🇦🇺', name: 'Australia' },
  CA: { flag: '🇨🇦', name: 'Canada' },
  SG: { flag: '🇸🇬', name: 'Singapore' },
  AE: { flag: '🇦🇪', name: 'UAE' },
};

const maskAccount = (number) => {
  if (!number) return '—';
  const str = number.toString();
  if (str.length <= 4) return str;
  return '*'.repeat(str.length - 4) + str.slice(-4);
};

// ─── ACCOUNT CARD ─────────────────────────────────────────────
const AccountCard = ({ account, onDelete, index }) => {
  const [showDelete, setShowDelete] = useState(false);
  const config = countryConfigs[account.country] || {};

  const getPrimaryField = () => {
    if (account.iban) return { label: 'IBAN', value: maskAccount(account.iban) };
    if (account.account_no) return { label: 'Account No', value: maskAccount(account.account_no) };
    return { label: 'Account', value: '—' };
  };

  const getSecondaryField = () => {
    if (account.routing_no) return { label: 'Routing', value: account.routing_no };
    if (account.ifsc_code) return { label: 'IFSC', value: account.ifsc_code };
    if (account.sort_code) return { label: 'Sort Code', value: account.sort_code };
    if (account.bic_swift) return { label: 'BIC/SWIFT', value: account.bic_swift };
    if (account.bsb_code) return { label: 'BSB', value: account.bsb_code };
    if (account.bank_code) return { label: 'Bank Code', value: account.bank_code };
    if (account.transit_no) return { label: 'Transit', value: account.transit_no };
    return null;
  };

  const primary = getPrimaryField();
  const secondary = getSecondaryField();

  return (
    <div className="rounded-3xl p-5 md:p-6 card-hover fade-in"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        animationDelay: `${index * 0.08}s`,
        animationFillMode: 'both'
      }}>

      {/* Top row */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
            style={{ background: 'rgba(78,205,196,0.1)', border: '1px solid rgba(78,205,196,0.2)' }}>
            {config.flag || '🏦'}
          </div>
          <div>
            <p className="font-black text-white text-base m-0">{account.bank_name}</p>
            <p className="text-xs mt-0.5 m-0 font-semibold capitalize" style={{ color: '#4ecdc4' }}>
              {account.account_type} · {config.name || account.country}
            </p>
          </div>
        </div>

        {/* Options menu */}
        <div className="relative">
          <button onClick={() => setShowDelete(!showDelete)}
            className="w-8 h-8 rounded-xl flex items-center justify-center border-none cursor-pointer text-lg"
            style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.3)' }}>
            ⋮
          </button>
          {showDelete && (
            <div className="absolute right-0 top-10 rounded-xl overflow-hidden z-10"
              style={{ background: '#0d2240', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}>
              <button onClick={() => onDelete(account.account_id)}
                className="px-4 py-3 text-sm font-bold w-full text-left border-none cursor-pointer"
                style={{ color: '#e74c3c', background: 'transparent', fontFamily: "'Sora', sans-serif" }}>
                🗑️ Delete Account
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Holder name */}
      <p className="text-xs font-semibold uppercase tracking-widest mb-3 m-0"
        style={{ color: 'rgba(255,255,255,0.3)' }}>
        {account.holder_name}
      </p>

      {/* Account details */}
      <div className="flex gap-3 flex-wrap">
        <div className="rounded-xl px-3 py-2"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <p className="text-xs m-0" style={{ color: 'rgba(255,255,255,0.3)' }}>{primary.label}</p>
          <p className="font-bold text-sm text-white m-0 mt-0.5 font-mono">{primary.value}</p>
        </div>
        {secondary && (
          <div className="rounded-xl px-3 py-2"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <p className="text-xs m-0" style={{ color: 'rgba(255,255,255,0.3)' }}>{secondary.label}</p>
            <p className="font-bold text-sm text-white m-0 mt-0.5">{secondary.value}</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── MAIN PAGE ────────────────────────────────────────────────
function MyAccounts() {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // ✅ Fix fetchAccounts
const fetchAccounts = async () => {
  try {
    const response = await getAccounts();
    setAccounts(response.data.accounts || []);
  } catch {
    setAccounts([]);
  } finally {
    setLoading(false);
  }
};
  useEffect(() => { fetchAccounts(); }, []);

  // ✅ Fix handleDelete
const handleDelete = async (accountId) => {
  if (!window.confirm('Are you sure you want to delete this account?')) return;
  try {
    await deleteAccount(accountId);
    setAccounts(prev => prev.filter(a => a.account_id !== accountId));
  } catch {
    alert('Failed to delete account. Please try again.');
  }
};

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #060f1e 0%, #0d2240 100%)', fontFamily: "'Sora', sans-serif" }}>
      <style>{styles}</style>

      {/* Subtle grid background */}
      <div className="fixed inset-0 z-0 opacity-10 pointer-events-none"
        style={{ backgroundImage: 'linear-gradient(rgba(26,58,92,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(26,58,92,0.5) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      {/* ── HEADER ── */}
      <div className="relative z-10" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-4xl mx-auto px-5 md:px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/dashboard')}
              className="rounded-xl px-3 py-2 text-lg border-none cursor-pointer transition-all"
              style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.7)' }}>
              ←
            </button>
            <div>
              <h1 className="text-white font-black text-xl m-0">My Accounts</h1>
              <p className="text-xs mt-0.5 m-0" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Manage your bank accounts
              </p>
            </div>
          </div>
          <button onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white font-bold text-sm border-none cursor-pointer transition-all hover:-translate-y-0.5"
            style={{ background: 'linear-gradient(135deg, #0f4c81, #1a7a6e)', fontFamily: "'Sora', sans-serif" }}>
            + Add Account
          </button>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="relative z-10 max-w-4xl mx-auto px-5 md:px-8 py-8">

        {/* Stats bar */}
        <div className="flex gap-4 mb-8 flex-wrap">
          {[
            { label: 'Total Accounts', value: accounts.length, icon: '🏦' },
            { label: 'Countries', value: [...new Set(accounts.map(a => a.country))].length, icon: '🌍' },
          ].map(stat => (
            <div key={stat.label} className="rounded-2xl px-5 py-4 flex items-center gap-3"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <span className="text-2xl">{stat.icon}</span>
              <div>
                <p className="font-black text-white text-xl m-0">{stat.value}</p>
                <p className="text-xs m-0" style={{ color: 'rgba(255,255,255,0.4)' }}>{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 rounded-full mb-4"
              style={{ border: '3px solid rgba(78,205,196,0.2)', borderTop: '3px solid #4ecdc4', animation: 'spin 1s linear infinite' }} />
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>Loading accounts...</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && accounts.length === 0 && (
          <div className="text-center py-20 fade-in">
            <p className="text-5xl mb-4">🏦</p>
            <h3 className="font-bold text-white text-lg m-0 mb-2">No accounts yet</h3>
            <p className="text-sm mb-6 m-0" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Add your bank account to start receiving transfers
            </p>
            <button onClick={() => setShowAddModal(true)}
              className="px-6 py-3 rounded-xl text-white font-bold text-sm border-none cursor-pointer transition-all hover:-translate-y-0.5"
              style={{ background: 'linear-gradient(135deg, #4ecdc4, #1a7a6e)', fontFamily: "'Sora', sans-serif" }}>
              + Add Your First Account
            </button>
          </div>
        )}

        {/* Accounts grid */}
        {!loading && accounts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {accounts.map((account, i) => (
              <AccountCard
                key={account.account_id}
                account={account}
                onDelete={handleDelete}
                index={i}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── MODAL ── */}
      {showAddModal && (
        <AddAccountModal
          onClose={() => setShowAddModal(false)}
          onSuccess={(account) => {
            setAccounts(prev => [...prev, account]);
            setShowAddModal(false);
            alert('✅ Account added successfully!');
          }}
        />
      )}
    </div>
  );
}

export default MyAccounts;