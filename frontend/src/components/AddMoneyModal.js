import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { createPaymentIntent, confirmPayment } from '../services/api';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_KEY);

// ─── INNER FORM ──────────────────────────────────────────────
function CheckoutForm({ amount, onSuccess, onClose }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!stripe || !elements) return;

    setLoading(true);
    setError('');

    try {
      // 1. Create payment intent from our backend
      const { data } = await createPaymentIntent({ amount: parseFloat(amount) });
      const clientSecret = data.clientSecret;

      // 2. Confirm payment with Stripe
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        }
      });

      if (result.error) {
        setError(result.error.message);
        setLoading(false);
        return;
      }

      // 3. Tell our backend payment succeeded
      await confirmPayment({ 
        paymentIntentId: result.paymentIntent.id 
      });

      onSuccess(parseFloat(amount));

    } catch (err) {
      setError('Something went wrong. Please try again!');
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Amount Display */}
      <div style={{
        background: 'linear-gradient(135deg, #0f4c81, #1a7a6e)',
        borderRadius: '16px', padding: '20px',
        textAlign: 'center', marginBottom: '24px'
      }}>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>Adding to your wallet</p>
        <p style={{ color: 'white', fontSize: '36px', fontWeight: '800' }}>${amount}</p>
      </div>

      {/* Card Input */}
      <p style={{ fontSize: '13px', fontWeight: '600', color: '#888', marginBottom: '8px' }}>
        CARD DETAILS
      </p>
      <div style={{
        border: '2px solid #e0e0e0', borderRadius: '12px',
        padding: '16px', marginBottom: '16px'
      }}>
        <CardElement options={{
          hidePostalCode: true,
          style: {
            base: {
              fontSize: '16px',
              color: '#1a1a2e',
              fontFamily: 'Sora, sans-serif',
              '::placeholder': { color: '#aaa' }
            }
          }
        }} />
      </div>

      {/* Error */}
      {error && (
        <div style={{
          background: '#fff0f0', borderRadius: '12px',
          padding: '12px', marginBottom: '16px'
        }}>
          <p style={{ color: '#e74c3c', fontSize: '13px' }}>❌ {error}</p>
        </div>
      )}

      {/* Test Card Info */}
      <div style={{
        background: '#f0f7ff', borderRadius: '12px',
        padding: '12px', marginBottom: '20px'
      }}>
        <p style={{ fontSize: '12px', color: '#0f4c81', fontWeight: '600' }}>
          🧪 Test Card: 4242 4242 4242 4242
        </p>
        <p style={{ fontSize: '12px', color: '#888' }}>
          Expiry: any future date · CVV: any 3 digits
        </p>
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: '12px' }}>
        <button
          onClick={onClose}
          style={{
            flex: 1, padding: '14px', border: '2px solid #e0e0e0',
            borderRadius: '12px', background: 'white',
            color: '#888', fontWeight: '600', cursor: 'pointer',
            fontFamily: 'Sora, sans-serif'
          }}
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading || !stripe}
          style={{
            flex: 2, padding: '14px', border: 'none',
            borderRadius: '12px',
            background: loading ? '#ccc' : 'linear-gradient(135deg, #0f4c81, #1a7a6e)',
            color: 'white', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: 'Sora, sans-serif', fontSize: '15px'
          }}
        >
          {loading ? 'Processing...' : `💳 Add $${amount}`}
        </button>
      </div>
    </div>
  );
}

// ─── OUTER MODAL ─────────────────────────────────────────────
function AddMoneyModal({ onClose, onSuccess }) {
  const [amount, setAmount] = useState('');
  const [step, setStep] = useState(1); // 1 = enter amount, 2 = card details

  const quickAmounts = [25, 50, 100, 200, 500];

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center',
      justifyContent: 'center', zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        background: 'white', borderRadius: '24px',
        padding: '32px', width: '100%',
        maxWidth: '420px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontWeight: '800', fontSize: '22px', color: '#1a1a2e' }}>
            💰 Add Money
          </h2>
          <button
            onClick={onClose}
            style={{
              background: '#f7f8fc', border: 'none',
              borderRadius: '50%', width: '36px', height: '36px',
              cursor: 'pointer', fontSize: '18px'
            }}
          >
            ✕
          </button>
        </div>

        {/* Step 1 — Enter Amount */}
        {step === 1 && (
          <div>
            <p style={{ fontSize: '13px', fontWeight: '600', color: '#888', marginBottom: '8px' }}>
              ENTER AMOUNT
            </p>
            <div style={{
              border: '2px solid #e0e0e0', borderRadius: '12px',
              padding: '12px 16px', display: 'flex',
              alignItems: 'center', gap: '8px', marginBottom: '16px'
            }}>
              <span style={{ fontSize: '20px', fontWeight: '700', color: '#0f4c81' }}>$</span>
              <input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                style={{
                  border: 'none', outline: 'none',
                  fontSize: '24px', fontWeight: '700',
                  color: '#1a1a2e', width: '100%',
                  fontFamily: 'Sora, sans-serif'
                }}
              />
            </div>

            {/* Quick Amount Buttons */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
              {quickAmounts.map(q => (
                <button
                  key={q}
                  onClick={() => setAmount(q.toString())}
                  style={{
                    padding: '8px 16px',
                    background: amount === q ? '#0f4c81' : '#f0f7ff',
                    color: amount == q ? 'white' : '#0f4c81',
                    border: 'none', borderRadius: '50px',
                    fontWeight: '600', fontSize: '13px',
                    cursor: 'pointer', fontFamily: 'Sora, sans-serif'
                  }}
                >
                  ${q}
                </button>
              ))}
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!amount || parseFloat(amount) < 10}
              style={{
                width: '100%', padding: '16px', border: 'none',
                borderRadius: '12px',
                background: !amount || parseFloat(amount) < 10
                  ? '#ccc'
                  : 'linear-gradient(135deg, #0f4c81, #1a7a6e)',
                color: 'white', fontWeight: '700',
                fontSize: '16px', cursor: !amount || parseFloat(amount) < 10
                  ? 'not-allowed' : 'pointer',
                fontFamily: 'Sora, sans-serif'
              }}
            >
              Continue →
            </button>
            <p style={{ textAlign: 'center', fontSize: '12px', color: '#aaa', marginTop: '12px' }}>
              Minimum top up: $10
            </p>
          </div>
        )}

        {/* Step 2 — Card Details */}
        {step === 2 && (
          <Elements stripe={stripePromise}>
            <CheckoutForm
              amount={amount}
              onSuccess={onSuccess}
              onClose={onClose}
            />
          </Elements>
        )}
      </div>
    </div>
  );
}

export default AddMoneyModal;