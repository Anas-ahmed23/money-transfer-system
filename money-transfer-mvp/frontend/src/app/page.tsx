import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
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
            className="flex flex-col gap-3 p-6 rounded-xl border border-border bg-card transition-all hover:shadow-md hover:border-primary/30 hover:scale-[1.01]"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-lg text-xl bg-primary/10 border border-primary/20">
              ↔
            </div>
            <div>
              <p className="font-bold text-foreground text-base mb-1">إجراء تحويل</p>
              <p className="text-sm text-muted-foreground">تحويل الأموال بين الحسابات</p>
            </div>
            <span className="mt-auto text-xs font-semibold text-primary">الانتقال →</span>
          </Link>

          {/* Accounts */}
          <Link
            href="/accounts"
            className="flex flex-col gap-3 p-6 rounded-xl border border-border bg-card transition-all hover:shadow-md hover:border-primary/30 hover:scale-[1.01]"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-lg text-xl bg-primary/10 border border-primary/20">
              ☰
            </div>
            <div>
              <p className="font-bold text-foreground text-base mb-1">عرض الحسابات</p>
              <p className="text-sm text-muted-foreground">قائمة الحسابات وأرصدتها</p>
            </div>
            <span className="mt-auto text-xs font-semibold text-primary">الانتقال →</span>
          </Link>

          {/* Create Account */}
          <Link
            href="/accounts/create"
            className="flex flex-col gap-3 p-6 rounded-xl border border-border bg-card transition-all hover:shadow-md hover:border-primary/30 hover:scale-[1.01]"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-lg text-xl bg-primary/10 border border-primary/20">
              +
            </div>
            <div>
              <p className="font-bold text-foreground text-base mb-1">إنشاء حساب جديد</p>
              <p className="text-sm text-muted-foreground">إضافة حساب للنظام</p>
            </div>
            <span className="mt-auto text-xs font-semibold text-primary">الانتقال →</span>
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
