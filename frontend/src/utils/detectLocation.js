import API from '../services/api';

const currencies = [
  {code:'USD',flag:'🇺🇸'},{code:'INR',flag:'🇮🇳'},{code:'GBP',flag:'🇬🇧'},
  {code:'EUR',flag:'🇪🇺'},{code:'AUD',flag:'🇦🇺'},{code:'CAD',flag:'🇨🇦'},
  {code:'SGD',flag:'🇸🇬'},{code:'AED',flag:'🇦🇪'},
];

const countryCurrencyMap = {
  US:'USD', IN:'INR', GB:'GBP', AU:'AUD', CA:'CAD',
  SG:'SGD', AE:'AED', DE:'EUR', FR:'EUR', IT:'EUR',
  ES:'EUR', NL:'EUR', IE:'EUR', NZ:'AUD',
};

export const detectUserCurrency = async () => {
  // Check cache first — instant on repeat visits!
  const cached = localStorage.getItem('userCurrency');
  const cachedTime = localStorage.getItem('userCurrencyTime');
  const isExpired = !cachedTime || (Date.now() - cachedTime) > 86400000; // 24hrs
  if (cached && !isExpired) return JSON.parse(cached);

  try {
    // ✅ Call your own backend — no CORS issues!
    const res = await API.get('/utils/location');
    const code = countryCurrencyMap[res.data.countryCode];
    if (code) {
      const currency = currencies.find(c => c.code === code) || currencies[0];
      // Save to cache
      localStorage.setItem('userCurrency', JSON.stringify(currency));
      localStorage.setItem('userCurrencyTime', Date.now().toString());
      return currency;
    }
  } catch (error) {
    console.error('Error detecting user currency:', error);
  }

  // Browser language fallback
  const lang = navigator.language || '';
  if (lang.includes('en-IN')) return currencies.find(c => c.code === 'INR');
  if (lang.includes('en-GB')) return currencies.find(c => c.code === 'GBP');
  if (lang.includes('en-AU')) return currencies.find(c => c.code === 'AUD');
  if (lang.includes('en-CA')) return currencies.find(c => c.code === 'CAD');
  return currencies[0];
};