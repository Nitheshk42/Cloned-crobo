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
  try {
            const res = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(4000) });
            const data = await res.json();
            console.log('📍 IP Detection result:', data);
            const code = countryCurrencyMap[data.country];
            console.log('💱 Detected currency:', code);
    if (code) return currencies.find(c => c.code === code) || currencies[0];
  } catch (error) {
    console.error('Error detecting user currency:', error);
  }
  // Browser language fallback
  const lang = navigator.language || '';
  if (lang.includes('en-IN')) return currencies.find(c => c.code === 'INR');
  if (lang.includes('en-GB')) return currencies.find(c => c.code === 'GBP');
  if (lang.includes('en-AU')) return currencies.find(c => c.code === 'AUD');
  if (lang.includes('en-CA')) return currencies.find(c => c.code === 'CAD');
  return currencies[0]; // default USD
};