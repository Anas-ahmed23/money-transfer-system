import Link from 'next/link';

/* ── SVG Icons ── */
function TransferIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 16V4m0 0L3 8m4-4l4 4" />
      <path d="M17 8v12m0 0l4-4m-4 4l-4-4" />
    </svg>
  );
}

function AccountsIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20M6 15h4" />
    </svg>
  );
}

function PlusCircleIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  );
}

function ArrowLeftIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

/* ── Hero mockup card — light version ── */
function HeroMockCard() {
  return (
    <div className="animate-card-in relative">
      {/* Soft glow behind */}
      <div
        className="absolute inset-0 -z-10 blur-3xl rounded-full"
        style={{
          background: 'radial-gradient(ellipse, rgba(184,147,42,0.18) 0%, transparent 70%)',
          transform: 'scale(1.4)',
        }}
      />

      {/* Card */}
      <div
        className="animate-float relative rounded-3xl overflow-hidden"
        style={{
          background: '#ffffff',
          border: '1px solid rgba(184,147,42,0.2)',
          boxShadow: '0 24px 64px rgba(184,147,42,0.12), 0 4px 16px rgba(0,0,0,0.08)',
          width: '300px',
          padding: '24px',
          transform: 'rotate(2deg)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg font-bold text-xs"
            style={{ background: 'linear-gradient(135deg, #b8932a, #d4a832)', color: '#1a1200' }}
          >
            ت
          </div>
          <span className="text-xs font-medium text-muted-foreground">نظام التحويلات</span>
        </div>

        {/* Balance */}
        <div className="mb-5">
          <p className="text-xs text-muted-foreground mb-1">إجمالي الأرصدة</p>
          <p className="font-extrabold text-2xl text-foreground tracking-tight" style={{ fontFamily: 'Cairo, sans-serif' }}>
            202,300.00
          </p>
          <p
            className="text-xs mt-0.5 font-semibold"
            style={{
              background: 'linear-gradient(90deg, #b8932a, #d4a832)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            ريال سعودي · SAR
          </p>
        </div>

        {/* Action pills */}
        <div className="flex gap-2 mb-5">
          <span
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold"
            style={{ background: 'linear-gradient(135deg, #b8932a, #d4a832)', color: '#1a1200' }}
          >
            ↗ تحويل
          </span>
          <span
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold border border-border text-muted-foreground bg-secondary"
          >
            ☰ حساباتي
          </span>
        </div>

        {/* Divider */}
        <div className="border-t border-border mb-4" />

        {/* Transactions */}
        <p className="text-xs font-semibold text-muted-foreground mb-3">آخر العمليات</p>
        {[
          { name: 'أحمد العمري', amount: '+SAR 2,500', positive: true, init: 'أ' },
          { name: 'فاطمة الزهراني', amount: '+SAR 5,000', positive: true, init: 'ف' },
          { name: 'خالد القحطاني', amount: '-SAR 1,200', positive: false, init: 'خ' },
        ].map((tx) => (
          <div key={tx.name} className="flex items-center justify-between mb-2.5">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{ background: 'rgba(184,147,42,0.12)', color: '#b8932a' }}
            >
              {tx.init}
            </div>
            <p className="flex-1 text-xs mx-2.5 truncate text-foreground">{tx.name}</p>
            <p
              className="text-xs font-bold tabular-nums"
              style={{ color: tx.positive ? '#16a34a' : '#dc2626' }}
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
              className="px-2 py-0.5 rounded-md text-xs font-mono font-semibold border border-border bg-secondary text-muted-foreground"
            >
              {c}
            </span>
          ))}
        </div>
      </div>

      {/* Floating badge */}
      <div
        className="absolute -bottom-4 -right-4 rounded-2xl px-4 py-3 shadow-lg border border-primary/20"
        style={{ background: '#ffffff' }}
      >
        <p className="text-xs text-muted-foreground">العمولة</p>
        <p
          className="font-bold text-base"
          style={{
            fontFamily: 'Cairo, sans-serif',
            background: 'linear-gradient(135deg, #b8932a, #d4a832)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          2٪ فقط
        </p>
      </div>
    </div>
  );
}

/* ── Stats ── */
const STATS = [
  { value: '6', unit: 'عملات', label: 'SAR · USD · EUR · GBP · AED' },
  { value: '2٪', unit: 'عمولة', label: 'فقط على كل عملية' },
  { value: '100٪', unit: 'آمن', label: 'تشفير وحماية كاملة' },
];

/* ── Features ── */
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
    <div className="min-h-screen bg-background">

      {/* ═══════════════════ HERO ═══════════════════ */}
      <section className="relative overflow-hidden border-b border-border">
        {/* Subtle gold gradient blob — top right */}
        <div
          className="absolute pointer-events-none -z-0"
          style={{
            width: '700px', height: '700px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(184,147,42,0.07) 0%, transparent 65%)',
            top: '-200px', right: '-150px',
          }}
        />
        {/* Bottom-left accent */}
        <div
          className="absolute pointer-events-none -z-0"
          style={{
            width: '400px', height: '400px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(212,168,50,0.05) 0%, transparent 70%)',
            bottom: '-80px', left: '5%',
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Right: text (RTL first = right side) */}
            <div>
              {/* Badge */}
              <div className="animate-fade-up inline-flex items-center gap-2 mb-7">
                <span
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold border"
                  style={{
                    background: 'rgba(184,147,42,0.08)',
                    borderColor: 'rgba(184,147,42,0.25)',
                    color: '#b8932a',
                  }}
                >
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-60" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary" />
                  </span>
                  نظام التحويلات · 2026
                </span>
              </div>

              {/* Headline */}
              <h1
                className="animate-fade-up-delay-1 font-extrabold leading-tight mb-5 text-foreground"
                style={{
                  fontFamily: 'Cairo, sans-serif',
                  fontSize: 'clamp(2.4rem, 5vw, 3.8rem)',
                  letterSpacing: '-0.02em',
                }}
              >
                الطريقة الأذكى
                <br />
                <span style={{
                  background: 'linear-gradient(135deg, #b8932a 0%, #d4a832 50%, #b8932a 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>
                  لتحويل الأموال
                </span>
              </h1>

              {/* Subtitle */}
              <p className="animate-fade-up-delay-2 text-lg leading-relaxed mb-10 text-muted-foreground max-w-md">
                إدارة الحسابات والتحويلات ومتابعة الحركة المالية بسهولة تامة وأمان عالٍ
              </p>

              {/* CTAs */}
              <div className="animate-fade-up-delay-3 flex flex-wrap gap-3 mb-12">
                <Link
                  href="/transfer"
                  className="btn-gold inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold text-sm transition-all hover:scale-[1.02] cursor-pointer shadow-md"
                >
                  ابدأ التحويل الآن
                  <ArrowLeftIcon />
                </Link>
                <Link
                  href="/accounts"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold text-sm transition-all border border-border text-foreground hover:bg-secondary cursor-pointer"
                >
                  عرض الحسابات
                </Link>
              </div>

              {/* Stats */}
              <div className="animate-fade-up-delay-4 flex flex-wrap gap-8 pt-6 border-t border-border">
                {STATS.map((s) => (
                  <div key={s.label}>
                    <p
                      className="font-extrabold text-2xl leading-none"
                      style={{
                        fontFamily: 'Cairo, sans-serif',
                        background: 'linear-gradient(135deg, #b8932a, #d4a832)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                      }}
                    >
                      {s.value} <span className="text-base">{s.unit}</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Left: mockup card (RTL second = left side) */}
            <div className="hidden lg:flex items-center justify-center py-8">
              <HeroMockCard />
            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════ FEATURES ═══════════════════ */}
      <section className="py-20 px-6 bg-secondary/40">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="text-center mb-14">
            <p
              className="text-xs font-bold tracking-widest uppercase mb-3"
              style={{ color: '#b8932a', letterSpacing: '0.18em' }}
            >
              الميزات الرئيسية
            </p>
            <h2
              className="font-extrabold text-foreground"
              style={{
                fontFamily: 'Cairo, sans-serif',
                fontSize: 'clamp(1.7rem, 3vw, 2.4rem)',
                letterSpacing: '-0.02em',
              }}
            >
              كل ما تحتاجه في مكان واحد
            </h2>
            <p className="mt-3 text-base text-muted-foreground max-w-lg mx-auto">
              منصة متكاملة لإدارة الحسابات وتنفيذ التحويلات بكل سهولة
            </p>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {FEATURES.map((f) => (
              <Link
                key={f.href}
                href={f.href}
                className="group relative rounded-2xl p-7 bg-card border border-border transition-all duration-300 hover:shadow-lg hover:border-primary/30 hover:scale-[1.01] cursor-pointer block"
              >
                {/* Number watermark */}
                <span
                  className="absolute top-5 left-5 font-black text-4xl leading-none select-none text-foreground/4"
                  style={{ fontFamily: 'Cairo, sans-serif' }}
                >
                  {f.num}
                </span>

                {/* Icon */}
                <div
                  className="mb-5 w-12 h-12 rounded-xl flex items-center justify-center transition-colors group-hover:bg-primary/20"
                  style={{
                    background: 'rgba(184,147,42,0.1)',
                    color: '#b8932a',
                    border: '1px solid rgba(184,147,42,0.2)',
                  }}
                >
                  {f.icon}
                </div>

                {/* Content */}
                <h3
                  className="font-bold text-lg mb-2 text-foreground"
                  style={{ fontFamily: 'Cairo, sans-serif' }}
                >
                  {f.title}
                </h3>
                <p className="text-sm leading-relaxed mb-6 text-muted-foreground">
                  {f.desc}
                </p>

                {/* CTA */}
                <span
                  className="inline-flex items-center gap-1.5 text-sm font-semibold transition-all group-hover:gap-2.5"
                  style={{ color: '#b8932a' }}
                >
                  {f.cta}
                  <ArrowLeftIcon />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ FOOTER ═══════════════════ */}
      <footer className="border-t border-border bg-card">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div
              className="flex h-7 w-7 items-center justify-center rounded-lg font-bold text-xs"
              style={{ background: 'linear-gradient(135deg, #b8932a, #d4a832)', color: 'hsl(var(--primary-foreground))' }}
            >
              ت
            </div>
            <span className="text-sm font-semibold text-foreground">نظام التحويلات</span>
          </div>
          <p className="text-xs text-muted-foreground">
            © 2026 نظام تحويل الأموال · جميع الحقوق محفوظة
          </p>
        </div>
      </footer>

    </div>
  );
}
