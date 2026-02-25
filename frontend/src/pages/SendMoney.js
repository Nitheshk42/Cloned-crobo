//import { parse } from 'postcss';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const FLAT_FEE = 2.99;

const countires = [
    {code:'GBP', name: 'United Kingdom', flag: '🇬🇧', currency: 'British Pound', delivery:'1-2 hours'},
    { code: 'EUR', name: 'Europe', flag: '🇪🇺', currency: 'Euro', delivery: '1-2 hours' },
  { code: 'INR', name: 'India', flag: '🇮🇳', currency: 'Indian Rupee', delivery: 'Instant' },
  { code: 'AUD', name: 'Australia', flag: '🇦🇺', currency: 'Australian Dollar', delivery: '2-3 hours' },
  { code: 'CAD', name: 'Canada', flag: '🇨🇦', currency: 'Canadian Dollar', delivery: '2-3 hours' },
  { code: 'SGD', name: 'Singapore', flag: '🇸🇬', currency: 'Singapore Dollar', delivery: '1-2 hours' },
  { code: 'AED', name: 'UAE', flag: '🇦🇪', currency: 'UAE Dirham', delivery: 'Instant' },
];


function SendMoney() {
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(countires[0]);
  const [rates, setRates] = useState({});
  const [loading, setLoading] = useState(true);

  //Fetch live rates
   useEffect(() => {
    const fetchRates = async () => {
      try {
        const response = await fetch('https://api.frankfurter.app/latest?from=USD&to=GBP,EUR,INR,AUD,CAD,SGD,AED');
        const data = await response.json();
        setRates(data.rates);
        setLoading(false);
      } catch (error) {
        console.log('Error:', error);
        setLoading(false);
      }
    };
    fetchRates();
  }, []);

  //calculation logic
  const amountNumber = parseFloat(amount) || 0;
  const amountAfterFee = amountNumber - FLAT_FEE;
  const recipientGets = amountAfterFee > 0 ? (amountAfterFee * rates[selectedCountry.code] || 0).toFixed(2): '0.00';
  const exchangeRate = rates[selectedCountry.code] ? rates[selectedCountry.code].toFixed(4) : '...';

  // Handle continue
  const handleContinue = () => {
    if (!amount || amountNumber <= FLAT_FEE) {
      alert(`Amount must be greater than $${FLAT_FEE} to cover the fee!`);
      return;
    }
    navigate('/confirm', {
      state: {
        amount: amountNumber,
        fee: FLAT_FEE,
        amountAfterFee: amountAfterFee.toFixed(2),
        recipientGets,
        exchangeRate,
        country: selectedCountry,
      }
    });
  };

  return (
    <div style={{ background: '#f7f8fc', minHeight: '100vh' }}>

      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #0f4c81 0%, #1a7a6e 100%)',
        padding: '24px 32px',
      }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              background: 'rgba(255,255,255,0.15)', border: 'none',
              borderRadius: '12px', padding: '8px 14px',
              color: 'white', cursor: 'pointer', fontSize: '18px'
            }}
          >
            ←
          </button>
          <div>
            <h1 style={{ color: 'white', fontWeight: '800', fontSize: '22px', margin: 0 }}>Send Money</h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', margin: 0 }}>Fast & secure international transfers</p>
          </div>
        </div>
      </div>

      {/* Main Card */}
      <div style={{ maxWidth: '600px', margin: '32px auto', padding: '0 24px' }}>
        <div style={{
          background: 'white', borderRadius: '24px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)', padding: '32px'
        }}>

          {/* You Send */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>
              You Send
            </label>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              border: '2px solid #f0f0f0', borderRadius: '16px',
              padding: '16px 20px', marginTop: '8px',
              transition: 'border-color 0.2s'
            }}
              onFocus={() => {}}
            >
              <span style={{ fontSize: '22px', fontWeight: '800', color: '#0f4c81' }}>🇺🇸</span>
              <span style={{ fontWeight: '700', color: '#0f4c81', fontSize: '16px' }}>USD</span>
              <span style={{ color: '#ddd', fontSize: '20px' }}>|</span>
              <input
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                style={{
                  border: 'none', outline: 'none', fontSize: '24px',
                  fontWeight: '800', color: '#1a1a2e', width: '100%',
                  fontFamily: 'Sora, sans-serif', background: 'transparent'
                }}
              />
            </div>
          </div>

          {/* Fee Info */}
          <div style={{
            background: '#f7f8fc', borderRadius: '14px',
            padding: '14px 18px', marginBottom: '24px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', color: '#888' }}>Transfer Fee</span>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#1a1a2e' }}>- ${FLAT_FEE}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', color: '#888' }}>Exchange Rate</span>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#1a1a2e' }}>
                1 USD = {loading ? '...' : exchangeRate} {selectedCountry.code}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '13px', color: '#888' }}>Estimated Delivery</span>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#1a7a6e' }}>
                ⚡ {selectedCountry.delivery}
              </span>
            </div>
          </div>

          {/* Swap Arrow */}
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{
              display: 'inline-block', background: 'linear-gradient(135deg, #0f4c81, #1a7a6e)',
              borderRadius: '50%', padding: '10px 14px',
              fontSize: '20px', cursor: 'default'
            }}>
              ↕️
            </div>
          </div>

          {/* Recipient Gets */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Recipient Gets
            </label>

            {/* Country Selector */}
            <div style={{
              border: '2px solid #f0f0f0', borderRadius: '16px',
              padding: '16px 20px', marginTop: '8px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <span style={{ fontSize: '22px' }}>{selectedCountry.flag}</span>
                <select
                  value={selectedCountry.code}
                  onChange={(e) => setSelectedCountry(countires.find(c => c.code === e.target.value))}
                  style={{
                    border: 'none', outline: 'none', fontSize: '16px',
                    fontWeight: '700', color: '#1a1a2e',
                    fontFamily: 'Sora, sans-serif', background: 'transparent',
                    cursor: 'pointer', width: '100%'
                  }}
                >
                  {countires.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.flag} {country.name} — {country.currency}
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount recipient gets */}
              <div style={{
                background: 'linear-gradient(135deg, #0f4c81, #1a7a6e)',
                borderRadius: '12px', padding: '14px 18px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}>
                <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px' }}>They receive</span>
                <span style={{ color: 'white', fontWeight: '800', fontSize: '24px' }}>
                  {recipientGets} {selectedCountry.code}
                </span>
              </div>
            </div>
          </div>

          {/* Continue Button */}
          <button
            onClick={handleContinue}
            style={{
              width: '100%', padding: '18px',
              background: 'linear-gradient(135deg, #0f4c81, #1a7a6e)',
              color: 'white', border: 'none', borderRadius: '16px',
              fontSize: '16px', fontWeight: '700', cursor: 'pointer',
              fontFamily: 'Sora, sans-serif', transition: 'transform 0.2s',
              letterSpacing: '0.5px'
            }}
            onMouseOver={e => e.target.style.transform = 'translateY(-2px)'}
            onMouseOut={e => e.target.style.transform = 'translateY(0)'}
          >
            Continue →
          </button>

        </div>
      </div>
    </div>
  );
}
export default SendMoney;