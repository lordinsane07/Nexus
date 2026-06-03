'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      password: formData.get('password'),
      role: 'seller',
    };

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || 'Failed to sign up');
      }

      router.push('/login?registered=true');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to sign up');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-6 font-sans text-text-primary" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F7F8FA', padding: '24px', fontFamily: 'var(--font-sans), sans-serif' }}>
      <div className="w-full max-w-[400px]">
        
        {/* Header */}
        <div className="text-center mb-10" style={{ marginBottom: '40px', textAlign: 'center' }}>
          <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center text-white font-mono font-bold text-xl shadow-sm mx-auto mb-4" style={{ width: '40px', height: '40px', backgroundColor: '#0F6E56', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', fontWeight: 'bold', fontSize: '20px', marginLeft: 'auto', marginRight: 'auto', marginBottom: '16px' }}>
            N
          </div>
          <h1 className="text-2xl font-display font-semibold tracking-tight text-text-primary mb-1" style={{ fontSize: '24px', fontWeight: 600, color: '#0F172A', letterSpacing: '-0.02em', margin: 0, marginBottom: '4px' }}>
            Create an Account
          </h1>
          <p className="text-text-secondary text-sm" style={{ color: '#64748B', fontSize: '14px', margin: 0 }}>
            Join the Nexus marketplace
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
              <label className="block text-sm font-medium text-text-secondary mb-1.5" style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#64748B', textAlign: 'left' }}>
                Full Name
              </label>
              <input
                type="text"
                name="name"
                required
                placeholder="John Doe"
                className="w-full bg-white border border-border text-text-primary rounded-lg px-3.5 py-2.5 text-sm transition-all outline-none focus:border-accent focus:ring-2 focus:ring-accent/15"
                style={{ width: '100%', backgroundColor: '#ffffff', border: '1px solid #E2E8F0', color: '#0F172A', borderRadius: '8px', padding: '10px 14px', fontSize: '14px', outline: 'none' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label className="block text-sm font-medium text-text-secondary mb-1.5" style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#64748B', textAlign: 'left' }}>
                Email Address
              </label>
              <input
                type="email"
                name="email"
                required
                placeholder="you@company.com"
                className="w-full bg-white border border-border text-text-primary rounded-lg px-3.5 py-2.5 text-sm transition-all outline-none focus:border-accent focus:ring-2 focus:ring-accent/15"
                style={{ width: '100%', backgroundColor: '#ffffff', border: '1px solid #E2E8F0', color: '#0F172A', borderRadius: '8px', padding: '10px 14px', fontSize: '14px', outline: 'none' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label className="block text-sm font-medium text-text-secondary mb-1.5" style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#64748B', textAlign: 'left' }}>
                Password
              </label>
              <input
                type="password"
                name="password"
                required
                minLength={6}
                placeholder="••••••••"
                className="w-full bg-white border border-border text-text-primary rounded-lg px-3.5 py-2.5 text-sm transition-all outline-none focus:border-accent focus:ring-2 focus:ring-accent/15"
                style={{ width: '100%', backgroundColor: '#ffffff', border: '1px solid #E2E8F0', color: '#0F172A', borderRadius: '8px', padding: '10px 14px', fontSize: '14px', outline: 'none' }}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center justify-center mt-2 ${
                isLoading 
                ? 'bg-border text-text-muted cursor-not-allowed' 
                : 'bg-accent hover:bg-accent-hover text-white shadow-sm hover:shadow'
              }`}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: isLoading ? 'not-allowed' : 'pointer', border: 'none', transition: 'all 0.2s', backgroundColor: isLoading ? '#E2E8F0' : '#0F6E56', color: isLoading ? '#94A3B8' : '#ffffff' }}
            >
              {isLoading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-border text-center" style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #E2E8F0', textAlign: 'center' }}>
            <p className="text-sm text-text-secondary" style={{ fontSize: '14px', color: '#64748B', margin: 0 }}>
              Already have an account?{' '}
              <Link href="/login" className="text-accent hover:text-accent-hover font-medium transition-colors" style={{ color: '#0F6E56', fontWeight: 500, textDecoration: 'none' }}>
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
