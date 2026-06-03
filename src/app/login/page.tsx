'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password');
        setLoading(false);
        return;
      }

      const res = await fetch('/api/auth/session');
      const session = await res.json();
      const role = session?.user?.role;

      if (role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/seller/catalogue');
      }
    } catch {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-6 font-sans text-text-primary" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F7F8FA', padding: '24px', fontFamily: 'var(--font-sans), sans-serif' }}>
      <div className="w-full max-w-[400px]">
        
        {/* Logo / Brand */}
        <div className="text-center mb-10" style={{ marginBottom: '40px', textAlign: 'center' }}>
          <Link href="/" className="inline-flex items-center gap-3 mb-2 hover:opacity-90 transition-opacity" style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', marginBottom: '8px', textDecoration: 'none' }}>
            <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center text-white font-mono font-bold text-xl shadow-sm" style={{ width: '40px', height: '40px', backgroundColor: '#0F6E56', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', fontWeight: 'bold', fontSize: '20px' }}>
              N
            </div>
            <h1 className="text-2xl font-display font-semibold tracking-tight text-text-primary" style={{ fontSize: '24px', fontWeight: 600, color: '#0F172A', letterSpacing: '-0.02em', margin: 0 }}>Nexus</h1>
          </Link>
          <p className="text-text-secondary text-sm" style={{ color: '#64748B', fontSize: '14px', margin: 0 }}>
            Sign in to your account
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-white border border-border rounded-xl shadow-sm p-8" style={{ backgroundColor: '#ffffff', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          {error && (
            <div className="bg-danger-bg border border-danger/20 text-danger text-sm rounded-lg p-3 mb-6 font-medium" style={{ backgroundColor: '#FEF2F2', border: '1px solid rgba(220, 38, 38, 0.2)', color: '#DC2626', fontSize: '14px', borderRadius: '8px', padding: '12px', marginBottom: '24px', fontWeight: 500 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label className="block text-sm font-medium text-text-secondary mb-1.5" htmlFor="login-email" style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#64748B', textAlign: 'left' }}>
                Email
              </label>
              <input
                type="email"
                id="login-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                autoFocus
                className="w-full bg-white border border-border text-text-primary rounded-lg px-3.5 py-2.5 text-sm transition-all outline-none focus:border-accent focus:ring-2 focus:ring-accent/15"
                style={{ width: '100%', backgroundColor: '#ffffff', border: '1px solid #E2E8F0', color: '#0F172A', borderRadius: '8px', padding: '10px 14px', fontSize: '14px', outline: 'none' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label className="block text-sm font-medium text-text-secondary mb-1.5" htmlFor="login-password" style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#64748B', textAlign: 'left' }}>
                Password
              </label>
              <input
                type="password"
                id="login-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-white border border-border text-text-primary rounded-lg px-3.5 py-2.5 text-sm transition-all outline-none focus:border-accent focus:ring-2 focus:ring-accent/15"
                style={{ width: '100%', backgroundColor: '#ffffff', border: '1px solid #E2E8F0', color: '#0F172A', borderRadius: '8px', padding: '10px 14px', fontSize: '14px', outline: 'none' }}
              />
            </div>

            <button
              type="submit"
              id="login-submit"
              disabled={loading}
              className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center justify-center ${
                loading 
                ? 'bg-border text-text-muted cursor-not-allowed' 
                : 'bg-accent hover:bg-accent-hover text-white shadow-sm hover:shadow'
              }`}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: loading ? 'not-allowed' : 'pointer', border: 'none', transition: 'all 0.2s', backgroundColor: loading ? '#E2E8F0' : '#0F6E56', color: loading ? '#94A3B8' : '#ffffff' }}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
          
          <div className="mt-8 pt-6 border-t border-border text-center" style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #E2E8F0', textAlign: 'center' }}>
            <p className="text-sm text-text-secondary" style={{ fontSize: '14px', color: '#64748B', margin: 0 }}>
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-accent hover:text-accent-hover font-medium transition-colors" style={{ color: '#0F6E56', fontWeight: 500, textDecoration: 'none' }}>
                Sign up
              </Link>
            </p>
          </div>
        </div>

        {/* Test Credentials Box */}
        <div className="mt-8 bg-surface border border-border rounded-lg p-5 text-sm shadow-sm" style={{ marginTop: '32px', backgroundColor: '#F7F8FA', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '20px', fontSize: '14px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <p className="font-medium text-text-secondary mb-3" style={{ fontWeight: 500, color: '#64748B', marginBottom: '12px', marginTop: 0, textAlign: 'left' }}>Test Credentials</p>
          <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 font-mono text-xs text-text-muted" style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', columnGap: '16px', rowGap: '8px', fontFamily: 'monospace', fontSize: '12px', color: '#94A3B8' }}>
            <span className="font-medium text-text-primary" style={{ fontWeight: 500, color: '#0F172A', textAlign: 'left' }}>Admin:</span>
            <span style={{ textAlign: 'left' }}>admin@nexus.dev / Admin@1234</span>
            <span className="font-medium text-text-primary" style={{ fontWeight: 500, color: '#0F172A', textAlign: 'left' }}>Seller:</span>
            <span style={{ textAlign: 'left' }}>seller@nexus.dev / Seller@1234</span>
          </div>
        </div>
        
      </div>
    </div>
  );
}
