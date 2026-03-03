import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// ─── ANIMATIONS ──────────────────────────────────────────────
// const styles = `
//   @keyframes dash { to { stroke-dashoffset: -100; } }
//   @keyframes floatPulse { 0%,100%{opacity:0.3;transform:scale(1);}50%{opacity:0.8;transform:scale(1.2);} }
//   @keyframes fadeInUp { from{opacity:0;transform:translateY(30px);}to{opacity:1;transform:translateY(0);} }
//   .fade-in-up { animation: fadeInUp 0.6s ease forwards; }
// `;

// // ─── WORLD MAP BACKGROUND ────────────────────────────────────
// const WorldMapBackground = () => (
//   <div className="fixed inset-0 z-0 overflow-hidden">
//     <style>{styles}</style>
//     <svg width="100%" height="100%" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
//       <defs>
//         <radialGradient id="bgGradFaq" cx="40%" cy="50%">
//           <stop offset="0%" stopColor="#0d2240" />
//           <stop offset="100%" stopColor="#060f1e" />
//         </radialGradient>
//         <filter id="glowFaq">
//           <feGaussianBlur stdDeviation="3" result="blur" />
//           <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
//         </filter>
//       </defs>
//       <rect width="1200" height="800" fill="url(#bgGradFaq)" />
//       {[...Array(13)].map((_,i) => <line key={`v${i}`} x1={i*100} y1="0" x2={i*100} y2="800" stroke="#1a3a5c" strokeWidth="0.4" opacity="0.25"/>)}
//       {[...Array(9)].map((_,i) => <line key={`h${i}`} x1="0" y1={i*100} x2="1200" y2={i*100} stroke="#1a3a5c" strokeWidth="0.4" opacity="0.25"/>)}
//       {[
//         {x1:180,y1:280,x2:560,y2:180},{x1:560,y1:180,x2:860,y2:220},
//         {x1:180,y1:280,x2:710,y2:370},{x1:560,y1:180,x2:420,y2:420},
//         {x1:860,y1:220,x2:1010,y2:320},{x1:180,y1:280,x2:310,y2:470},
//         {x1:710,y1:370,x2:910,y2:470},
//       ].map((l,i) => (
//         <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
//           stroke="#1a7a6e" strokeWidth="1.2" strokeDasharray="8,6" opacity="0.35"
//           style={{animation:`dash ${3+i*0.4}s linear infinite`}}/>
//       ))}
//       {[
//         {x:180,y:280,label:'🇺🇸',name:'New York'},
//         {x:560,y:180,label:'🇬🇧',name:'London'},
//         {x:860,y:220,label:'🇮🇳',name:'Mumbai'},
//         {x:710,y:370,label:'🇦🇪',name:'Dubai'},
//         {x:420,y:420,label:'🇪🇺',name:'Paris'},
//         {x:1010,y:320,label:'🇸🇬',name:'Singapore'},
//         {x:310,y:470,label:'🇦🇺',name:'Sydney'},
//       ].map((c,i) => (
//         <g key={i}>
//           <circle cx={c.x} cy={c.y} r="22" fill="#0f4c81" opacity="0.15"
//             style={{animation:`floatPulse ${2.5+i*0.4}s ease-in-out infinite`,animationDelay:`${i*0.3}s`}}/>
//           <circle cx={c.x} cy={c.y} r="5" fill="#4ecdc4" filter="url(#glowFaq)" opacity="0.95"/>
//           <text x={c.x} y={c.y-20} textAnchor="middle" fontSize="18">{c.label}</text>
//           <text x={c.x} y={c.y+22} textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.4)" fontFamily="Arial">{c.name}</text>
//         </g>
//       ))}
//     </svg>
//   </div>
// );

// ─── FAQ CARD ─────────────────────────────────────────────────
const FaqCard = ({ question, answer, index }) => {
  const [open, setOpen] = useState(false);
  return (
    <div onClick={() => setOpen(!open)}
      className="rounded-2xl p-5 cursor-pointer transition-all duration-300 fade-in-up"
      style={{
        background: open ? 'rgba(78,205,196,0.08)' : 'rgba(255,255,255,0.04)',
        border: open ? '1px solid rgba(78,205,196,0.3)' : '1px solid rgba(255,255,255,0.07)',
        animationDelay: `${index * 0.05}s`,
        animationFillMode: 'both',
      }}>
      <div className="flex justify-between items-start gap-3">
        <p className="font-bold text-sm m-0 leading-relaxed" style={{color: open ? '#4ecdc4' : 'white'}}>
          {question}
        </p>
        <span className="text-xl font-light flex-shrink-0 transition-all duration-300"
          style={{color:'#4ecdc4', transform: open ? 'rotate(45deg)' : 'rotate(0deg)', display:'block'}}>
          +
        </span>
      </div>
      {open && (
        <p className="text-sm mt-3 m-0 leading-relaxed" style={{color:'rgba(255,255,255,0.55)'}}>
          {answer}
        </p>
      )}
    </div>
  );
};

// ─── FAQ DATA ─────────────────────────────────────────────────
const faqCategories = [
  {
    category: '💸 Fees & Pricing',
    faqs: [
      {
        q: 'How much does Draviṇa charge per transfer?',
        a: 'Just $0.99 flat fee per transfer — no percentage cuts, no hidden charges. Banks charge $25+ and Western Union charges $15+. We keep it simple and transparent.'
      },
      {
        q: 'Are there any hidden fees or exchange rate markups?',
        a: 'Never. We use the live mid-market rate with zero markup — the same rate you see on Google. The only charge is our $0.99 flat fee, shown upfront before you confirm.'
      },
      {
        q: 'Why is Draviṇa so much cheaper than banks?',
        a: "Banks have massive overheads — physical branches, legacy systems, and large staff. We're fully digital, which means we pass those savings directly to you. That's how we can charge just $0.99."
      },
    ]
  },
  {
    category: '⚡ Transfers & Speed',
    faqs: [
      {
        q: 'How long does a transfer take?',
        a: 'Most transfers are instant or within 1-2 hours. India 🇮🇳 and UAE 🇦🇪 transfers are typically instant. UK 🇬🇧, Europe 🇪🇺, Australia 🇦🇺, Canada 🇨🇦, and Singapore 🇸🇬 take 1-3 hours.'
      },
      {
        q: 'Can I cancel or edit a transfer after sending?',
        a: 'Transfers can be cancelled within a few minutes of initiating. Once the transfer is processed and sent, cancellation may not be possible. Contact support immediately at support@bondpay.com if you made an error.'
      },
      {
        q: 'How do I track the status of my transfer?',
        a: "Every transfer appears in your History page with a real-time status update — Pending, Processing, or Completed. You'll receive a confirmation once the transfer reaches your recipient."
      },
      {
        q: 'What happens if my transfer fails?',
        a: 'If a transfer fails for any reason, the full amount including the $0.99 fee is refunded to your Draviṇa wallet within 24 hours. Our support team will also notify you with the reason.'
      },
    ]
  },
  {
    category: '🔒 Security & Safety',
    faqs: [
      {
        q: 'Is my money safe with Draviṇa?',
        a: 'Yes. We use bank-level 256-bit encryption, JWT authentication with secure httpOnly cookies, and never store your card details. Every transfer goes through automated fraud detection before processing.'
      },
      {
        q: 'How does Draviṇa protect my personal data?',
        a: "Your data is encrypted at rest and in transit. We never sell your personal information to third parties. Passwords are hashed using bcrypt — even our team can't see them."
      },
      {
        q: 'What should I do if I notice an unauthorized transfer?',
        a: 'Contact us immediately at support@bondpay.com or use the in-app support. We will investigate and freeze any suspicious activity on your account within minutes.'
      },
    ]
  },
  {
    category: '🌍 Countries & Currencies',
    faqs: [
      {
        q: 'Which countries can I send money to?',
        a: 'Currently we support 7 destinations: India 🇮🇳, United Kingdom 🇬🇧, Europe 🇪🇺, Australia 🇦🇺, Canada 🇨🇦, Singapore 🇸🇬, and UAE 🇦🇪. We are adding more countries every month!'
      },
      {
        q: 'What exchange rate does Draviṇa use?',
        a: 'We use live mid-market rates updated every 30 seconds from global financial markets via multiple rate providers. The rate you see in the calculator is the rate you get — guaranteed.'
      },
      {
        q: 'Can I send money from any country?',
        a: 'Currently Draviṇa is available for senders based in the USA. We auto-detect your location and currency when you open the app. International sender support is coming soon!'
      },
    ]
  },
  {
    category: '👤 Account & Limits',
    faqs: [
      {
        q: 'What are the transfer limits?',
        a: 'You can send up to $5,000 per day and $20,000 per week. These limits are shown in real-time on your dashboard. Need higher limits? Contact support@bondpay.com.'
      },
      {
        q: 'What information do I need to add a recipient?',
        a: "You'll need your recipient's full name, bank account number, and IFSC code (for India) or SWIFT/routing code (for international transfers). You can save recipients for faster future transfers."
      },
      {
        q: 'Can I use Draviṇa without creating an account?',
        a: 'You can use the live rate calculator on our homepage without an account. To send money, you need to create a free account — it takes less than 2 minutes!'
      },
      {
        q: 'How do I add money to my Draviṇa wallet?',
        a: "You can add money to your wallet from your Dashboard using the 'Add Money' button. Funds are added instantly and can be used immediately for transfers."
      },
    ]
  },
];

// ─── MAIN FAQ PAGE ────────────────────────────────────────────
function FAQ() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState(null);

  const allFaqs = faqCategories.flatMap(cat => cat.faqs);
  const displayFaqs = activeCategory !== null
    ? faqCategories[activeCategory].faqs
    : allFaqs;

  return (
    <div className="min-h-screen" style={{background:'linear-gradient(135deg, #060f1e 0%, #0d2240 100%)', fontFamily:"'Sora', sans-serif"}}>
      {/* ── NAVBAR ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-5 md:px-12 py-4"
        style={{background:'rgba(6,15,30,0.7)', backdropFilter:'blur(20px)', borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
        <div onClick={() => navigate('/')} className="cursor-pointer">
          <h1 className="text-xl md:text-2xl font-black text-white m-0" style={{letterSpacing:'-0.5px'}}>🌍 Draviṇa</h1>
          <p className="hidden sm:block text-xs m-0" style={{color:'rgba(255,255,255,0.35)', letterSpacing:'2px', textTransform:'uppercase'}}>Transfer Money, Across Worlds.</p>
        </div>
        <div className="flex gap-2 md:gap-3 items-center">
          <button onClick={() => navigate('/')}
            className="text-white text-sm font-semibold px-4 md:px-6 py-2 rounded-xl transition-all duration-200 hover:bg-white/10"
            style={{background:'transparent', border:'1.5px solid rgba(255,255,255,0.25)'}}>
            Login
          </button>
          <button onClick={() => navigate('/signup')}
            className="text-white text-sm font-bold px-4 md:px-6 py-2 rounded-xl transition-all duration-200 hover:-translate-y-0.5"
            style={{background:'linear-gradient(135deg, #0f4c81, #1a7a6e)', boxShadow:'0 4px 16px rgba(15,76,129,0.4)'}}>
            Sign Up →
          </button>
        </div>
      </nav>

      {/* ── MAIN CONTENT ── */}
      <div className="relative z-10 max-w-4xl mx-auto px-5 md:px-12 pt-32 pb-20">

        {/* Hero */}
        <div className="text-center mb-12 fade-in-up">
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 mb-5"
            style={{background:'rgba(78,205,196,0.1)', border:'1px solid rgba(78,205,196,0.25)'}}>
            <div className="w-1.5 h-1.5 rounded-full" style={{background:'#4ecdc4', boxShadow:'0 0 6px #4ecdc4'}}/>
            <span className="text-xs font-bold uppercase tracking-widest" style={{color:'#4ecdc4'}}>Help Center</span>
          </div>
          <h1 className="font-black text-white m-0" style={{fontSize:'clamp(28px, 5vw, 52px)', letterSpacing:'-2px'}}>
            Frequently Asked<br/>
            <span style={{background:'linear-gradient(135deg, #4ecdc4 0%, #1a7a6e 100%)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent'}}>
              Questions
            </span>
          </h1>
          <p className="mt-3 m-0" style={{color:'rgba(255,255,255,0.4)', fontSize:'clamp(14px, 1.5vw, 17px)'}}>
            Everything you need to know about sending money with Draviṇa
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          <button onClick={() => setActiveCategory(null)}
            className="rounded-full px-4 py-2 text-xs font-bold cursor-pointer border-none transition-all"
            style={{
              background: activeCategory === null ? 'linear-gradient(135deg, #0f4c81, #1a7a6e)' : 'rgba(255,255,255,0.06)',
              color: activeCategory === null ? 'white' : 'rgba(255,255,255,0.5)',
              border: activeCategory === null ? 'none' : '1px solid rgba(255,255,255,0.1)',
              fontFamily:"'Sora', sans-serif"
            }}>
            All Questions
          </button>
          {faqCategories.map((cat, i) => (
            <button key={i} onClick={() => setActiveCategory(i)}
              className="rounded-full px-4 py-2 text-xs font-bold cursor-pointer border-none transition-all"
              style={{
                background: activeCategory === i ? 'linear-gradient(135deg, #0f4c81, #1a7a6e)' : 'rgba(255,255,255,0.06)',
                color: activeCategory === i ? 'white' : 'rgba(255,255,255,0.5)',
                border: activeCategory === i ? 'none' : '1px solid rgba(255,255,255,0.1)',
                fontFamily:"'Sora', sans-serif"
              }}>
              {cat.category}
            </button>
          ))}
        </div>

        {/* FAQ Cards */}
        <div className="flex flex-col gap-3">
          {displayFaqs.map((faq, i) => (
            <FaqCard key={i} question={faq.q} answer={faq.a} index={i} />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 rounded-3xl p-8 text-center"
          style={{background:'rgba(255,255,255,0.04)', border:'1px solid rgba(78,205,196,0.15)'}}>
          <p className="text-2xl mb-3">🤔</p>
          <h3 className="font-bold text-white text-lg m-0 mb-2">Still have questions?</h3>
          <p className="text-sm m-0 mb-5" style={{color:'rgba(255,255,255,0.4)'}}>
            Our support team is here to help you 24/7
          </p>
          <button onClick={() => window.location.href = 'mailto:support@bondpay.com'}
            className="px-6 py-3 rounded-xl text-white font-bold text-sm border-none cursor-pointer transition-all hover:-translate-y-0.5"
            style={{background:'linear-gradient(135deg, #4ecdc4, #1a7a6e)', fontFamily:"'Sora', sans-serif"}}>
            📧 support@bondpay.com
          </button>
        </div>
      </div>
    </div>
  );
}

export default FAQ;