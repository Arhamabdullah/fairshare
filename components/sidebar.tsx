'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from './theme-toggle';
import { useTheme } from './theme-provider';

const links = [
  { href: '/', label: 'Dashboard', hint: 'Pulse' },
  { href: '/expenses', label: 'Expenses', hint: 'Track' },
  { href: '/settlements', label: 'Settlements', hint: 'Split' },
  { href: '/cooking', label: 'Cooking', hint: 'Chef' },
  { href: '/cleaning', label: 'Cleaning', hint: 'Ops' },
  { href: '/admin', label: 'Admin Console', hint: 'Control' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { resolvedTheme } = useTheme();

  return (
    <aside className="glass card h-fit p-4 lg:sticky lg:top-6">
      <div
        className="mb-5 rounded-[24px] border p-5"
        style={{ borderColor: 'var(--line)', background: 'var(--surface-soft)' }}
      >
        <div className="helper-row justify-between">
          <span className="pill">Flat Manager OS</span>
          <span className="pill-secondary">{resolvedTheme} mode</span>
        </div>
        <h1 className="mt-4 text-3xl font-black tracking-tight gradient-title">Fair Share</h1>
        <p className="mt-3 text-sm leading-6 text-muted">
          Groceries, settlements, cooking duty, cleaning ops, and Firebase-backed admin control in one
          futuristic command center.
        </p>
      </div>

      <div className="mb-5">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-muted">Theme</p>
        <ThemeToggle />
      </div>

      <nav className="space-y-2">
        {links.map((link) => {
          const active = pathname === link.href;
          return (
            <Link key={link.href} href={link.href} className={`group nav-link ${active ? 'active' : ''}`}>
              <span>{link.label}</span>
              <span className="badge">{link.hint}</span>
            </Link>
          );
        })}
      </nav>

      <div
        className="dot-grid mt-5 rounded-[24px] border p-4"
        style={{ borderColor: 'var(--line)', background: 'var(--surface-soft)' }}
      >
        <p className="text-sm font-semibold text-main">Admin credentials</p>
        <p className="mt-2 text-sm text-muted">Username: 420_manager</p>
        <p className="text-sm text-muted">Password: Admin42069</p>
      </div>
    </aside>
  );
}
