'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/', label: 'الرئيسية' },
  { href: '/accounts', label: 'الحسابات' },
  { href: '/transfer', label: 'تحويل' },
];

export function Navbar() {
  const pathname = usePathname();

  function isActive(href: string): boolean {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  }

  return (
    <header className="border-b border-border bg-card sticky top-0 z-10 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-lg font-bold text-sm shrink-0"
            style={{
              background: 'linear-gradient(135deg, #b8932a, #d4a832)',
              color: 'hsl(var(--primary-foreground))',
            }}
          >
            ت
          </div>
          <div className="hidden sm:block">
            <p className="font-bold text-foreground text-base leading-none">نظام التحويلات</p>
            <p className="text-xs text-muted-foreground mt-0.5">Money Transfer System</p>
          </div>
        </Link>

        {/* Nav Links */}
        <nav className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isActive(item.href)
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Status Indicator */}
        <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium border border-primary/30 text-primary bg-primary/10 shrink-0">
          <span className="h-1.5 w-1.5 rounded-full inline-block animate-pulse bg-primary" />
          متصل
        </span>
      </div>
    </header>
  );
}
