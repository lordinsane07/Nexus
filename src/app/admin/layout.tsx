'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  Package,
  ShoppingCart,
  FileText,
  BarChart3,
  LogOut,
  ClipboardList,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: BarChart3, exact: true },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/admin/audit', label: 'Audit Log', icon: ClipboardList },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{
        width: '220px',
        minWidth: '220px',
        background: 'var(--color-surface)',
        borderRight: '1px solid var(--color-border)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        zIndex: 50,
      }}>
        {/* Brand */}
        <div style={{
          padding: '20px 16px',
          borderBottom: '1px solid var(--color-border)',
        }}>
          <Link href="/admin" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              background: 'linear-gradient(135deg, var(--color-accent), #00897B)',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              fontSize: '14px',
              color: '#fff',
            }}>N</div>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-primary)', letterSpacing: '-0.01em' }}>Nexus</div>
              <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Admin Panel</div>
            </div>
          </Link>
        </div>

        {/* Nav Items */}
        <nav style={{ padding: '12px 8px', flex: 1 }}>
          {NAV_ITEMS.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                  background: isActive ? 'var(--color-surface-raised)' : 'transparent',
                  textDecoration: 'none',
                  marginBottom: '2px',
                  transition: 'all 150ms ease-out',
                  borderLeft: isActive ? '2px solid var(--color-accent)' : '2px solid transparent',
                }}
              >
                <Icon size={16} style={{ opacity: isActive ? 1 : 0.6 }} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div style={{ padding: '12px 8px', borderTop: '1px solid var(--color-border)' }}>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '8px 12px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 500,
              color: 'var(--color-text-secondary)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              width: '100%',
              fontFamily: 'var(--font-sans)',
              transition: 'color 150ms ease-out',
            }}
          >
            <LogOut size={16} style={{ opacity: 0.6 }} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{
        flex: 1,
        marginLeft: '220px',
        padding: '24px 32px',
        minHeight: '100vh',
      }}>
        {children}
      </main>
    </div>
  );
}
