'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, SessionProvider } from 'next-auth/react';
import { Search, ShoppingCart, FileText, LogOut } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/seller/catalogue', label: 'Catalogue', icon: Search },
  { href: '/seller/cart', label: 'Cart', icon: ShoppingCart },
  { href: '/seller/orders', label: 'My Orders', icon: FileText },
];

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <SessionProvider>
      <div style={{ minHeight: '100vh' }}>
        {/* Top Navigation */}
        <header style={{
          background: 'var(--color-surface)',
          borderBottom: '1px solid var(--color-border)',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}>
          <div style={{
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '0 24px',
            height: '56px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            {/* Left: Brand + Nav */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
              <Link href="/seller/catalogue" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  background: 'linear-gradient(135deg, var(--color-accent), #00897B)',
                  borderRadius: '5px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  fontSize: '12px',
                  color: '#fff',
                }}>N</div>
                <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-primary)' }}>Nexus</span>
              </Link>

              <nav style={{ display: 'flex', gap: '4px' }}>
                {NAV_ITEMS.map((item) => {
                  const isActive = pathname.startsWith(item.href);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 14px',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: 500,
                        color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                        background: isActive ? 'var(--color-surface-raised)' : 'transparent',
                        textDecoration: 'none',
                        transition: 'all 150ms ease-out',
                      }}
                    >
                      <Icon size={14} />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Right: Logout */}
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 500,
                color: 'var(--color-text-secondary)',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'var(--font-sans)',
              }}
            >
              <LogOut size={14} />
              Sign out
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '24px',
        }}>
          {children}
        </main>
      </div>
    </SessionProvider>
  );
}
