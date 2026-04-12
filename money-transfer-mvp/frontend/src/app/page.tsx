import Link from 'next/link';

/* ── SVG Icons ── */
function TransferIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 16V4m0 0L3 8m4-4l4 4" />
      <path d="M17 8v12m0 0l4-4m-4 4l-4-4" />
    </svg>
  );
}

function AccountsIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
      <path d="M6 15h4" />
    </svg>
  );
}

function PlusCircleIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function LightningIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

function GlobalIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

/* ── Floating hero mockup card ── */
function HeroMockCard() {
  return (
    <div className="animate-card-in relative">
      {/* Glow behind card */}
      <div
        className="absolute inset-0 -z-10 blur-3xl"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, rgba(184,147,42,0.35) 0%, transparent 70%)',
          transform: 'scale(1.3)',
        }}
      />

      {/* The card */}
      <div
        className="animate-float relative rounded-3xl overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 100%)',
          border: '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05) inset',
          width: '300px',
          padding: '24px',
        }}
      >
        {/* Card header */}
        <div className="flex items-center justify-between mb-5">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg font-bold text-xs"
            style={{ background: 'linear-gradient(135deg, #b8932a, #d4a832)', color: '#1a1200' }}
          >
            ت
          </div>
          <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>
            نظام التحويلات
          </span>
        </div>

        {/* Balance */}
        <div className="mb-5">
          <p className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>إجمالي الأرصدة</p>
          <p className="font-bold text-2xl text-white tracking-tight" style={{ fontFamily: 'Cairo, sans-serif' }}>
            202,300.00
          </p>
          <p className="text-xs mt-0.5 text-gold-gradient font-semibold" style={{
            background: 'linear-gradient(90deg, #d4a832, #f0c84a)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            ريال سعودي · SAR
          </p>
        </div>

        {/* Action pills */}
        <div className="flex gap-2 mb-5">
          <Link
            href="/transfer"
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all"
            style={{
              background: 'linear-gradient(135deg, #b8932a, #d4a832)',
              color: '#1a1200',
            }}
          >
            <span>↗</span> تحويل
          </Link>
          <Link
            href="/accounts"
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold"
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: 'rgba(255,255,255,0.7)',
            }}
          >
            <span>☰</span> حساباتي
          </Link>
        </div>

        {/* Divider */}
        <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', marginBottom: '14px' }} />

        {/* Transactions */}
        <p className="text-xs mb-3 font-semibold" style={{ color: 'rgba(255,255,255,0.35)' }}>
          آخر العمليات
        </p>
        {[
          { name: 'أحمد العمري', amount: '+SAR 2,500', positive: true, init: 'أ' },
          { name: 'فاطمة الزهراني', amount: '+SAR 5,000', positive: true, init: 'ف' },
          { name: 'خالد القحطاني', amount: '-SAR 1,200', positive: false, init: 'خ' },
        ].map((tx) => (
          <div key={tx.name} className="flex items-center justify-between mb-2.5">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{ background: 'rgba(184,147,42,0.15)', color: '#d4a832' }}
            >
              {tx.init}
            </div>
            <p className="flex-1 text-xs mx-2.5 truncate" style={{ color: 'rgba(255,255,255,0.7)' }}>
              {tx.name}
            </p>
            <p
              className="text-xs font-bold tabular-nums"
              style={{ color: tx.positive ? '#4ade80' : '#f87171' }}
            >
              {tx.amount}
            </p>
          </div>
        ))}

        {/* Currency badges */}
        <div className="flex gap-1.5 mt-4">
          {['SAR', 'USD', 'EUR', 'GBP'].map((c) => (
            <span
              key={c}
              className="px-2 py-0.5 rounded-md text-xs font-mono font-semibold"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.5)',
              }}
            >
              {c}
            </span>
          ))}
        </div>
      </div>

      {/* Decorative floating mini-badge */}
      <div
        className="absolute -bottom-4 -right-4 rounded-2xl px-4 py-3 shadow-xl"
        style={{
          background: 'linear-gradient(135deg, #1a1f35, #0f1628)',
          border: '1px solid rgba(184,147,42,0.3)',
        }}
      >
        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>العمولة</p>
        <p className="font-bold text-base" style={{ color: '#d4a832', fontFamily: 'Cairo, sans-serif' }}>
          2٪ فقط
        </p>
      </div>
    </div>
  );
}

/* ── Stats bar ── */
const STATS = [
  { icon: <ShieldIcon />, value: 'آمن 100٪', label: 'تشفير كامل' },
  { icon: <LightningIcon />, value: 'فوري', label: 'تحويل لحظي' },
  { icon: <GlobalIcon />, value: '6 عملات', label: 'SAR · USD · EUR · GBP · AED · +' },
];

/* ── Feature cards ── */
const FEATURES = [
  {
    href: '/transfer',
    icon: <TransferIcon />,
    num: '01',
    title: 'إجراء تحويل',
    desc: 'حوّل الأموال بين الحسابات بضغطة واحدة. يتم احتساب العمولة تلقائياً وتأكيد العملية فوراً.',
    cta: 'ابدأ التحويل',
  },
  {
    href: '/accounts',
    icon: <AccountsIcon />,
    num: '02',
    title: 'عرض الحسابات',
    desc: 'تصفّح جميع الحسابات المسجلة وأرصدتها الحالية بعدة عملات مع إمكانية البحث الفوري.',
    cta: 'عرض الحسابات',
  },
  {
    href: '/accounts/create',
    icon: <PlusCircleIcon />,
    num: '03',
    title: 'إنشاء حساب',
    desc: 'أضف حساباً جديداً للنظام بثوانٍ. حدد العملة والرصيد الافتتاحي واسم الحامل.',
    cta: 'إنشاء حساب',
  },
];

/* ── Page ── */
export default function HomePage() {
  return (
    <div className="min-h-screen" style={{ background: '#080D18' }}>

      {/* ═══════════════════════════════════════
          HERO SECTION
      ═══════════════════════════════════════ */}
      <section
        className="hero-bg grid-overlay relative overflow-hidden"
        style={{ minHeight: 'calc(100vh - 57px)' }}
      >
        {/* Decorative orbs */}
        <div
          className="absolute pointer-events-none"
          style={{
            width: '600px', height: '600px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(184,147,42,0.08) 0%, transparent 70%)',
            top: '-100px', right: '-100px',
          }}
        />
        <div
          className="absolute pointer-events-none"
          style={{
            width: '400px', height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(212,168,50,0.06) 0%, transparent 70%)',
            bottom: '0', left: '10%',
          }}
        />

        <div className="max-w-7xl mx-auto px-6 py-16 lg:py-0 flex items-center" style={{ minHeight: 'inherit' }}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center w-full py-20">

            {/* ── Right: Text block (RTL = first in DOM = appears right) ── */}
            <div>
              {/* Badge */}
              <div className="animate-fade-up inline-flex items-center gap-2 mb-8">
                <span
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold"
                  style={{
                    background: 'rgba(184,147,42,0.12)',
                    border: '1px solid rgba(184,147,42,0.3)',
                    color: '#d4a832',
                  }}
                >
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#d4a832] opacity-60" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#d4a832]" />
                  </span>
                  نظام التحويلات · 2026
                </span>
              </div>

              {/* Headline */}
              <h1
                className="animate-fade-up-delay-1 font-extrabold leading-tight mb-6"
                style={{
                  fontFamily: 'Cairo, sans-serif',
                  fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                  color: '#ffffff',
                  letterSpacing: '-0.02em',
                }}
              >
                الطريقة الأذكى
                <br />
                <span style={{
                  background: 'linear-gradient(135deg, #d4a832 0%, #f0c84a 40%, #b8932a 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>
                  لتحويل الأموال
                </span>
              </h1>

              {/* Subheading */}
              <p
                className="animate-fade-up-delay-2 text-lg leading-relaxed mb-10 max-w-md"
                style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Cairo, sans-serif' }}
              >
                إدارة الحسابات والتحويلات ومتابعة الحركة المالية بسهولة تامة وأمان عالٍ
              </p>

              {/* CTAs */}
              <div className="animate-fade-up-delay-3 flex flex-wrap gap-3 mb-12">
                <Link
                  href="/transfer"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold text-sm transition-all hover:scale-[1.02] cursor-pointer"
                  style={{
                    background: 'linear-gradient(135deg, #b8932a 0%, #d4a832 60%, #b8932a 100%)',
                    backgroundSize: '200% auto',
                    color: '#1a1200',
                    boxShadow: '0 8px 32px rgba(184,147,42,0.3)',
                  }}
                >
                  ابدأ التحويل الآن
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
                <Link
                  href="/accounts"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold text-sm transition-all hover:bg-white/10 cursor-pointer"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    color: 'rgba(255,255,255,0.8)',
                  }}
                >
                  عرض الحسابات
                </Link>
              </div>

              {/* Trust stats */}
              <div className="animate-fade-up-delay-4 flex flex-wrap gap-6">
                {STATS.map((s) => (
                  <div key={s.label} className="flex items-center gap-2">
                    <span style={{ color: '#d4a832' }}>{s.icon}</span>
                    <div>
                      <p className="text-sm font-bold text-white leading-none">{s.value}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{s.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Left: Mockup card (RTL = second in DOM = appears left) ── */}
            <div className="hidden lg:flex items-center justify-center">
              <HeroMockCard />
            </div>

          </div>
        </div>

        {/* Bottom fade */}
        <div
          className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, transparent, #080D18)' }}
        />
      </section>

      {/* ═══════════════════════════════════════
          FEATURES SECTION
      ═══════════════════════════════════════ */}
      <section className="py-24 px-6" style={{ background: '#080D18' }}>
        <div className="max-w-7xl mx-auto">

          {/* Section header */}
          <div className="text-center mb-16">
            <p
              className="text-xs font-bold tracking-widest uppercase mb-3"
              style={{ color: '#d4a832', letterSpacing: '0.2em' }}
            >
              الميزات الرئيسية
            </p>
            <h2
              className="font-extrabold"
              style={{
                fontFamily: 'Cairo, sans-serif',
                fontSize: 'clamp(1.8rem, 3vw, 2.5rem)',
                color: '#ffffff',
                letterSpacing: '-0.02em',
              }}
            >
              كل ما تحتاجه في مكان واحد
            </h2>
            <p className="mt-3 text-base max-w-lg mx-auto" style={{ color: 'rgba(255,255,255,0.4)' }}>
              منصة متكاملة لإدارة الحسابات وتنفيذ التحويلات بكل سهولة
            </p>
          </div>

          {/* Feature cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {FEATURES.map((f) => (
              <Link
                key={f.href}
                href={f.href}
                className="card-gradient-border group relative rounded-2xl p-7 block transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl cursor-pointer"
                style={{
                  boxShadow: '0 8px 40px rgba(0,0,0,0.3)',
                }}
              >
                {/* Number */}
                <span
                  className="absolute top-6 left-6 font-black text-4xl leading-none select-none"
                  style={{ color: 'rgba(255,255,255,0.04)', fontFamily: 'Cairo, sans-serif' }}
                >
                  {f.num}
                </span>

                {/* Icon */}
                <div
                  className="mb-5 w-12 h-12 rounded-xl flex items-center justify-center transition-colors group-hover:bg-[rgba(184,147,42,0.25)]"
                  style={{
                    background: 'rgba(184,147,42,0.12)',
                    color: '#d4a832',
                    border: '1px solid rgba(184,147,42,0.2)',
                  }}
                >
                  {f.icon}
                </div>

                {/* Content */}
                <h3
                  className="font-bold text-lg mb-2 text-white"
                  style={{ fontFamily: 'Cairo, sans-serif' }}
                >
                  {f.title}
                </h3>
                <p className="text-sm leading-relaxed mb-6" style={{ color: 'rgba(255,255,255,0.45)' }}>
                  {f.desc}
                </p>

                {/* CTA */}
                <span
                  className="inline-flex items-center gap-1.5 text-sm font-semibold transition-all group-hover:gap-2.5"
                  style={{ color: '#d4a832' }}
                >
                  {f.cta}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          FOOTER
      ═══════════════════════════════════════ */}
      <footer
        className="border-t py-8 px-6"
        style={{ borderColor: 'rgba(255,255,255,0.06)', background: '#060A14' }}
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div
              className="flex h-7 w-7 items-center justify-center rounded-lg font-bold text-xs"
              style={{ background: 'linear-gradient(135deg, #b8932a, #d4a832)', color: '#1a1200' }}
            >
              ت
            </div>
            <span className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.5)' }}>
              نظام التحويلات
            </span>
          </div>

          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
            © 2026 نظام تحويل الأموال · جميع الحقوق محفوظة
          </p>

          {/* Nav links */}
          <div className="flex items-center gap-5">
            {NAV_ITEMS_FOOTER.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-xs transition-colors hover:text-white"
                style={{ color: 'rgba(255,255,255,0.35)' }}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}

const NAV_ITEMS_FOOTER = [
  { href: '/', label: 'الرئيسية' },
  { href: '/accounts', label: 'الحسابات' },
  { href: '/transfer', label: 'تحويل' },
];
