import { useState } from 'react';
import { addAccount } from '../services/api';

// ─── COUNTRY FIELDS CONFIG ────────────────────────────────────
const countryConfigs = {
  US: {
    flag: '🇺🇸', name: 'United States',
    fields: [
      { key: 'account_no', label: 'Account Number', placeholder: 'e.g. 123456789012' },
      { key: 'routing_no', label: 'Routing Number', placeholder: 'e.g. 021000021' },
    ]
  },
  IN: {
    flag: '🇮🇳', name: 'India',
    fields: [
      { key: 'account_no', label: 'Account Number', placeholder: 'e.g. 9876543210123456' },
      { key: 'ifsc_code', label: 'IFSC Code', placeholder: 'e.g. HDFC0001234' },
    ]
  },
  GB: {
    flag: '🇬🇧', name: 'United Kingdom',
    fields: [
      { key: 'account_no', label: 'Account Number', placeholder: 'e.g. 12345678' },
      { key: 'sort_code', label: 'Sort Code', placeholder: 'e.g. 20-00-00' },
    ]
  },
  EU: {
    flag: '🇪🇺', name: 'Europe',
    fields: [
      { key: 'iban', label: 'IBAN', placeholder: 'e.g. DE89370400440532013000' },
      { key: 'bic_swift', label: 'BIC / SWIFT', placeholder: 'e.g. COBADEFFXXX' },
    ]
  },
  AU: {
    flag: '🇦🇺', name: 'Australia',
    fields: [
      { key: 'bsb_code', label: 'BSB Code', placeholder: 'e.g. 062-000' },
      { key: 'account_no', label: 'Account Number', placeholder: 'e.g. 12345678' },
    ]
  },
  CA: {
    flag: '🇨🇦', name: 'Canada',
    fields: [
      { key: 'transit_no', label: 'Transit Number', placeholder: 'e.g. 12345' },
      { key: 'institution_no', label: 'Institution Number', placeholder: 'e.g. 001' },
      { key: 'account_no', label: 'Account Number', placeholder: 'e.g. 1234567' },
    ]
  },
  SG: {
    flag: '🇸🇬', name: 'Singapore',
    fields: [
      { key: 'bank_code', label: 'Bank Code', placeholder: 'e.g. 7171' },
      { key: 'account_no', label: 'Account Number', placeholder: 'e.g. 1234567890' },
    ]
  },
  AE: {
    flag: '🇦🇪', name: 'UAE',
    fields: [
      { key: 'iban', label: 'IBAN', placeholder: 'e.g. AE070331234567890123456' },
    ]
  },
};

function AddAccountModal({ onClose, onSuccess }) {
  const [step, setStep] = useState(1);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const config = countryConfigs[selectedCountry];

  const inputStyle = {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: 'white',
    fontFamily: "'Sora', sans-serif"
  };
  const focusStyle = {
    border: '1px solid rgba(78,205,196,0.5)',
    background: 'rgba(78,205,196,0.05)'
  };

  const handleSubmit = async () => {
  try {
    setError('');
    if (!formData.holder_name || !formData.bank_name || !formData.account_type) {
      setError('Please fill in all required fields!'); return;
    }
    if (config) {
      for (const field of config.fields) {
        if (!formData[field.key]) {
          setError(`Please fill in ${field.label}!`); return;
        }
      }
    }
    setLoading(true);
    const response = await addAccount({ ...formData, country: selectedCountry });
    onSuccess(response.data.account);
  } catch (err) {
    setError(err.response?.data?.message || 'Something went wrong!');
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)' }}>
      <div className="w-full max-w-md rounded-3xl p-6 md:p-8"
        style={{
          background: 'linear-gradient(135deg, #0d2240 0%, #060f1e 100%)',
          border: '1px solid rgba(78,205,196,0.2)',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}>

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="font-black text-white text-xl m-0">
              {step === 1 ? '🌍 Select Country' : `${config?.flag} Add Account`}
            </h2>
            <p className="text-xs mt-1 m-0" style={{ color: 'rgba(255,255,255,0.4)' }}>
              {step === 1 ? 'Where is your bank located?' : `${config?.name} bank details`}
            </p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center border-none cursor-pointer text-sm"
            style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }}>
            ✕
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex gap-2 mb-6">
          {[1, 2].map(s => (
            <div key={s} className="h-1 flex-1 rounded-full transition-all duration-300"
              style={{ background: s <= step ? '#4ecdc4' : 'rgba(255,255,255,0.1)' }} />
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-xl px-4 py-3 mb-4 text-sm"
            style={{ background: 'rgba(231,76,60,0.15)', border: '1px solid rgba(231,76,60,0.3)', color: '#e74c3c' }}>
            ⚠️ {error}
          </div>
        )}

        {/* Step 1 — Country Selection */}
        {step === 1 && (
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(countryConfigs).map(([code, cfg]) => (
              <button key={code}
                onClick={() => { setSelectedCountry(code); setStep(2); setFormData({}); }}
                className="flex items-center gap-3 rounded-2xl p-4 cursor-pointer border-none text-left transition-all"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  fontFamily: "'Sora', sans-serif"
                }}>
                <span className="text-2xl">{cfg.flag}</span>
                <span className="text-xs font-bold text-white">{cfg.name}</span>
              </button>
            ))}
          </div>
        )}

        {/* Step 2 — Account Details */}
        {step === 2 && config && (
          <div className="flex flex-col gap-4">

            {/* Back */}
            <button onClick={() => setStep(1)}
              className="flex items-center gap-2 text-xs font-semibold border-none bg-transparent cursor-pointer mb-2 w-fit"
              style={{ color: 'rgba(255,255,255,0.4)' }}>
              ← Back to countries
            </button>

            {/* Holder Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-2"
                style={{ color: 'rgba(255,255,255,0.4)' }}>Account Holder Name *</label>
              <input type="text" placeholder="Full name as on bank account"
                value={formData.holder_name || ''}
                onChange={e => setFormData({ ...formData, holder_name: e.target.value })}
                onFocus={e => Object.assign(e.target.style, focusStyle)}
                onBlur={e => Object.assign(e.target.style, inputStyle)}
                className="w-full px-4 py-3 rounded-2xl text-sm outline-none transition-all"
                style={inputStyle} />
            </div>

            {/* Bank Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-2"
                style={{ color: 'rgba(255,255,255,0.4)' }}>Bank Name *</label>
              <input type="text" placeholder="e.g. HDFC Bank, Chase, Barclays"
                value={formData.bank_name || ''}
                onChange={e => setFormData({ ...formData, bank_name: e.target.value })}
                onFocus={e => Object.assign(e.target.style, focusStyle)}
                onBlur={e => Object.assign(e.target.style, inputStyle)}
                className="w-full px-4 py-3 rounded-2xl text-sm outline-none transition-all"
                style={inputStyle} />
            </div>

            {/* Account Type */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-2"
                style={{ color: 'rgba(255,255,255,0.4)' }}>Account Type *</label>
              <div className="flex gap-3">
                {['Checking', 'Savings'].map(type => (
                  <button key={type}
                    onClick={() => setFormData({ ...formData, account_type: type.toLowerCase() })}
                    className="flex-1 py-3 rounded-2xl text-sm font-bold border-none cursor-pointer transition-all"
                    style={{
                      background: formData.account_type === type.toLowerCase()
                        ? 'linear-gradient(135deg, #0f4c81, #1a7a6e)'
                        : 'rgba(255,255,255,0.05)',
                      color: formData.account_type === type.toLowerCase()
                        ? 'white'
                        : 'rgba(255,255,255,0.4)',
                      border: formData.account_type === type.toLowerCase()
                        ? 'none'
                        : '1px solid rgba(255,255,255,0.1)',
                      fontFamily: "'Sora', sans-serif"
                    }}>
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Dynamic country-specific fields */}
            {config.fields.map(field => (
              <div key={field.key}>
                <label className="block text-xs font-bold uppercase tracking-widest mb-2"
                  style={{ color: 'rgba(255,255,255,0.4)' }}>{field.label} *</label>
                <input type="text" placeholder={field.placeholder}
                  value={formData[field.key] || ''}
                  onChange={e => setFormData({ ...formData, [field.key]: e.target.value })}
                  onFocus={e => Object.assign(e.target.style, focusStyle)}
                  onBlur={e => Object.assign(e.target.style, inputStyle)}
                  className="w-full px-4 py-3 rounded-2xl text-sm outline-none transition-all"
                  style={inputStyle} />
              </div>
            ))}

            {/* Submit */}
            <button onClick={handleSubmit} disabled={loading}
              className="w-full py-4 rounded-2xl text-white font-bold text-sm border-none cursor-pointer transition-all mt-2 hover:-translate-y-0.5"
              style={{
                background: loading ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #4ecdc4, #1a7a6e)',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: "'Sora', sans-serif"
              }}>
              {loading ? 'Saving Account...' : '+ Add Account'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default AddAccountModal;