const express = require('express');
const router = express.Router();

// ─── EXCHANGE RATES ───────────────────────────────────────────
router.get('/rates', async (req, res) => {
  try {
    const response = await fetch('https://api.frankfurter.app/latest?from=USD&to=GBP,EUR,INR,AUD,CAD,SGD,AED');
    if (!response.ok) throw new Error('failed');
    const data = await response.json();
    return res.json({ rates: { ...data.rates, USD: 1 } });
  } catch {}
//   try {
//     const response = await fetch('https://open.er-api.com/v6/latest/USD');
//     if (!response.ok) throw new Error('failed');
//     const data = await response.json();
//     const { GBP, EUR, INR, AUD, CAD, SGD, AED } = data.rates;
//     return res.json({ rates: { GBP, EUR, INR, AUD, CAD, SGD, AED, USD: 1 } });
//   } catch {}
//   try {
//     const response = await fetch('https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json');
//     if (!response.ok) throw new Error('failed');
//     const data = await response.json();
//     const r = data.usd;
//     return res.json({ rates: { GBP: r.gbp, EUR: r.eur, INR: r.inr, AUD: r.aud, CAD: r.cad, SGD: r.sgd, AED: r.aed, USD: 1 } });
//   } catch {}
  // Final fallback
  res.json({ rates: { GBP: 0.79, EUR: 0.92, INR: 83.12, AUD: 1.53, CAD: 1.36, SGD: 1.34, AED: 3.67, USD: 1 }, cached: true });
});

// ─── IP LOCATION ──────────────────────────────────────────────
router.get('/location', async (req, res) => {
  try {
    // Get real IP — works behind proxies/Render
    const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress;
    const response = await fetch(`https://freeipapi.com/api/json/${ip}`);
    if (!response.ok) throw new Error('failed');
    const data = await response.json();
    return res.json({ countryCode: data.countryCode });
  } catch {}
  res.json({ countryCode: 'US' }); // fallback
});

module.exports = router;