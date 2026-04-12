'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const NAV_ITEMS = [
  { href: '/', label: 'الرئيسية' },
  { href: '/accounts', label: 'الحسابات' },
  { href: '/transfer', label: 'تحويل' },
];

export function Navbar() {
  const pathname = usePathname();
  const isHome = pathname === '/';
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!isHome) return;
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isHome]);

  function isActive(href: string): boolean {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  }

  /* ── Visual variants ── */
  const headerBase = 'sticky top-0 z-40 transition-all duration-300';

  const headerStyle = isHome
    ? scrolled
      ? 'bg-[#080D18]/95 backdrop-blur-xl border-b border-white/8 shadow-lg shadow-black/30'
      : 'bg-transparent border-b border-transparent'
    : 'border-b border-border bg-card shadow-sm';

  const brandNameColor = isHome ? 'text-white' : 'text-foreground';
  const brandSubColor  = isHome ? 'text-white/40' : 'text-muted-foreground';

  function linkClass(href: string) {
    const active = isActive(href);
    if (isHome) {
      return active
        ? 'px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors bg-white/10 text-[#d4a832] border border-white/10'
        : 'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors text-white/60 hover:text-white hover:bg-white/8';
    }
    return active
      ? 'px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors bg-primary/10 text-primary'
      : 'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors text-muted-foreground hover:text-foreground hover:bg-muted';
  }

  return (
    <header className={`${headerBase} ${headerStyle}`}>
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-4">

        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-lg font-bold text-sm shrink-0 shadow-md"
            style={{
              background: 'linear-gradient(135deg, #b8932a, #d4a832)',
              color: '#1a1200',
            }}
          >
            ت
          </div>
          <div className="hidden sm:block">
            <p className={`font-bold text-base leading-none ${brandNameColor}`}>نظام التحويلات</p>
            <p className={`text-xs mt-0.5 ${brandSubColor}`}>Money Transfer System</p>
          </div>
        </Link>

        {/* Nav links */}
        <nav className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <Link key={item.href} href={item.href} className={linkClass(item.href)}>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Status indicator */}
        <div className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${
          isHome
            ? 'border border-white/15 text-white/70 bg-white/5'
            : 'border border-primary/30 text-primary bg-primary/10'
        }`}>
          <span className="relative flex h-1.5 w-1.5">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-60 ${isHome ? 'bg-[#d4a832]' : 'bg-primary'}`} />
            <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${isHome ? 'bg-[#d4a832]' : 'bg-primary'}`} />
          </span>
          متصل
        </div>

      </div>
    </header>
  );
}
