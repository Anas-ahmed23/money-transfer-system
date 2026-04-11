import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-lg font-bold text-sm"
              style={{
                background: 'linear-gradient(135deg, #c9a84c, #f0c040)',
                color: '#0a0f1e',
              }}
            >
              ت
            </div>
            <div>
              <h1 className="font-bold text-foreground text-lg leading-none">
                نظام التحويلات
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Money Transfer System
              </p>
            </div>
          </div>
          <span
            className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium"
            style={{
              border: '1px solid #c9a84c',
              color: '#c9a84c',
              background: 'rgba(201,168,76,0.08)',
            }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full inline-block animate-pulse"
              style={{ background: '#c9a84c' }}
            />
            متصل
          </span>
        </div>
      </header>

      {/* Hero */}
      <div className="max-w-5xl mx-auto px-4 pt-14 pb-10 text-center">
        <h2 className="text-3xl font-extrabold text-foreground mb-3">
          نظام التحويلات
        </h2>
        <p className="text-muted-foreground text-base max-w-xl mx-auto">
          إدارة الحسابات والتحويلات ومتابعة الحركة المالية بسهولة
        </p>
      </div>

      {/* Navigation Cards */}
      <div className="max-w-5xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Transfer */}
          <Link
            href="/transfer"
            className="group flex flex-col gap-3 p-6 rounded-xl border transition-all hover:scale-[1.02]"
            style={{
              background: 'hsl(224 44% 9%)',
              borderColor: 'hsl(221 42% 17%)',
            }}
          >
            <div
              className="flex h-11 w-11 items-center justify-center rounded-lg text-xl"
              style={{
                background: 'rgba(201,168,76,0.12)',
                border: '1px solid rgba(201,168,76,0.25)',
              }}
            >
              ↔
            </div>
            <div>
              <p className="font-bold text-foreground text-base mb-1">
                إجراء تحويل
              </p>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
                تحويل الأموال بين الحسابات
              </p>
            </div>
            <span
              className="mt-auto text-xs font-semibold"
              style={{ color: '#c9a84c' }}
            >
              الانتقال ←
            </span>
          </Link>

          {/* Accounts */}
          <Link
            href="/accounts"
            className="group flex flex-col gap-3 p-6 rounded-xl border transition-all hover:scale-[1.02]"
            style={{
              background: 'hsl(224 44% 9%)',
              borderColor: 'hsl(221 42% 17%)',
            }}
          >
            <div
              className="flex h-11 w-11 items-center justify-center rounded-lg text-xl"
              style={{
                background: 'rgba(201,168,76,0.12)',
                border: '1px solid rgba(201,168,76,0.25)',
              }}
            >
              ☰
            </div>
            <div>
              <p className="font-bold text-foreground text-base mb-1">
                عرض الحسابات
              </p>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
                قائمة الحسابات وأرصدتها
              </p>
            </div>
            <span
              className="mt-auto text-xs font-semibold"
              style={{ color: '#c9a84c' }}
            >
              الانتقال ←
            </span>
          </Link>

          {/* Create Account */}
          <Link
            href="/accounts/create"
            className="group flex flex-col gap-3 p-6 rounded-xl border transition-all hover:scale-[1.02]"
            style={{
              background: 'hsl(224 44% 9%)',
              borderColor: 'hsl(221 42% 17%)',
            }}
          >
            <div
              className="flex h-11 w-11 items-center justify-center rounded-lg text-xl"
              style={{
                background: 'rgba(201,168,76,0.12)',
                border: '1px solid rgba(201,168,76,0.25)',
              }}
            >
              +
            </div>
            <div>
              <p className="font-bold text-foreground text-base mb-1">
                إنشاء حساب جديد
              </p>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
                إضافة حساب للنظام
              </p>
            </div>
            <span
              className="mt-auto text-xs font-semibold"
              style={{ color: '#c9a84c' }}
            >
              الانتقال ←
            </span>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="max-w-5xl mx-auto px-4 py-4 text-center">
          <p className="text-xs text-muted-foreground">
            © 2026 نظام تحويل الأموال · جميع الحقوق محفوظة
          </p>
        </div>
      </footer>
    </main>
  );
}
