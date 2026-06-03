import Link from 'next/link';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import LandingCalculator from './components/LandingCalculator';
import HeaderNav from './components/HeaderNav';

export default async function HomePage() {
  const session = await auth();

  // If a session exists, route user immediately to their active dashboard path
  if (session?.user) {
    const role = (session.user as { role?: string }).role;
    if (role === 'admin') redirect('/admin');
    else redirect('/seller/catalogue');
  }

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col font-sans text-[#0F172A] selection:bg-[#0F6E56]/20">
      
      {/* ─── Sticky Header (Scroll Spy Enabled) ─────────────────────────────────── */}
      <HeaderNav />

      {/* ─── Hero Section ───────────────────────────────────────────────────────── */}
      <section className="pt-20 pb-16 px-6 text-center max-w-5xl mx-auto flex flex-col items-center" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: '1000px', margin: '0 auto', width: '100%', padding: '80px 24px 64px 24px', textAlign: 'center' }}>
        
        {/* Category Pill Tag */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#E2E8F0] shadow-sm mb-6" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: '#ffffff', border: '1px solid #E2E8F0', padding: '4px 12px', borderRadius: '9999px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', marginBottom: '24px' }}>
          <span className="w-2.5 h-2.5 rounded-full bg-[#0F6E56] animate-pulse" style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#0F6E56' }} />
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B]" style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Precision Commerce for Chemical Distribution
          </span>
        </div>

        {/* Hero Copywriting */}
        <h1 className="font-display text-4xl md:text-6xl font-semibold tracking-tight text-[#0F172A] leading-[1.1] mb-6" style={{ fontSize: '48px', fontWeight: 600, color: '#0F172A', letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: '24px', maxWidth: '800px' }}>
          Clinical Operations for <br/>
          <span className="text-[#0F6E56]" style={{ color: '#0F6E56' }}>Modern Distributors</span>
        </h1>
        
        <p className="text-base md:text-lg text-[#64748B] max-w-2xl mb-8 leading-relaxed" style={{ fontSize: '16px', color: '#64748B', lineHeight: 1.6, marginBottom: '32px', maxWidth: '650px' }}>
          Nexus is the unified operating system designed specifically for chemical and pharmaceutical distributors in India. 
          Automate stock checking, eliminate decimal rounding errors, and accelerate order processing in a secure environment.
        </p>

        {/* Dual Actions CTA */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-16" style={{ display: 'flex', gap: '16px', marginBottom: '64px' }}>
          <Link 
            href="/signup" 
            className="bg-[#0F6E56] hover:bg-[#0A5240] text-white px-8 py-3.5 rounded-lg font-semibold shadow-sm hover:shadow transition-all"
            style={{ textDecoration: 'none', backgroundColor: '#0F6E56', color: '#ffffff', fontSize: '16px', fontWeight: 600, padding: '14px 32px', borderRadius: '8px' }}
          >
            Create Free Account
          </Link>
          <Link 
            href="/login" 
            className="bg-white text-[#0F172A] border border-[#E2E8F0] px-8 py-3.5 rounded-lg font-semibold shadow-sm hover:bg-[#F7F8FA] transition-all"
            style={{ textDecoration: 'none', backgroundColor: '#ffffff', border: '1px solid #E2E8F0', color: '#0F172A', fontSize: '16px', fontWeight: 600, padding: '14px 32px', borderRadius: '8px' }}
          >
            Launch Demo Portal
          </Link>
        </div>

        {/* State Machine Order Tracking Mockup */}
        <div className="w-full bg-white border border-[#E2E8F0] rounded-2xl shadow-sm p-6 text-left max-w-4xl" style={{ backgroundColor: '#ffffff', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '24px', textAlign: 'left', maxWidth: '800px', margin: '0 auto', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4 mb-6" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E2E8F0', paddingBottom: '16px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span className="text-[10px] font-mono text-[#94A3B8]" style={{ fontFamily: 'monospace', fontSize: '10px', color: '#94A3B8' }}>TRANSACTION LEDGER ID: NXS-2026-0081</span>
              <span className="font-semibold text-sm text-[#0F172A]" style={{ fontSize: '14px', fontWeight: 600 }}>Active Procurement Order</span>
            </div>
            <span className="badge badge-processing text-xs font-semibold px-2.5 py-1 rounded" style={{ backgroundColor: '#F3E8FF', color: '#7E22CE', border: '1px solid rgba(126,34,206,0.2)', fontSize: '11px', padding: '4px 10px', borderRadius: '4px', textTransform: 'uppercase', fontWeight: 600 }}>
              Processing
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-xs text-[#64748B]" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '24px', fontSize: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span>Compound</span>
              <strong className="text-sm text-[#0F172A]" style={{ fontSize: '14px', color: '#0F172A', fontWeight: 600 }}>Ibuprofen API</strong>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span>Order Quantity</span>
              <strong className="text-sm text-[#0F172A] font-mono" style={{ fontSize: '14px', color: '#0F172A', fontWeight: 600, fontFamily: 'monospace' }}>2,500.00000000 g</strong>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span>Equiv. Base</span>
              <strong className="text-sm text-[#0F6E56] font-mono" style={{ fontSize: '14px', color: '#0F6E56', fontWeight: 600, fontFamily: 'monospace' }}>2.50000000 kg</strong>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span>Line Total (INR)</span>
              <strong className="text-sm text-[#0F6E56] font-mono" style={{ fontSize: '14px', color: '#0F6E56', fontWeight: 600, fontFamily: 'monospace' }}>₹11,250.00</strong>
            </div>
          </div>

          {/* Stepper progress indicator */}
          <div className="mt-8 pt-6 border-t border-[#E2E8F0] flex items-center justify-between gap-2 text-[11px] font-semibold text-[#94A3B8]" style={{ borderTop: '1px solid #E2E8F0', marginTop: '24px', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', fontWeight: 600 }}>
            <span className="text-[#059669]" style={{ color: '#059669' }}>✓ Quotation</span>
            <span className="text-[#059669]" style={{ color: '#059669' }}>✓ Confirmed</span>
            <span className="text-[#7E22CE]" style={{ color: '#7E22CE' }}>● Processing</span>
            <span>○ Dispatched</span>
            <span>○ Delivered</span>
          </div>
        </div>

      </section>

      {/* ─── Product Features Grid ─────────────────────────────────────────────── */}
      <section id="features" className="py-20 px-6 max-w-7xl mx-auto" style={{ padding: '80px 24px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        
        <div className="text-center mb-16" style={{ textAlign: 'center', marginBottom: '64px' }}>
          <span className="text-xs font-semibold text-[#0F6E56] uppercase tracking-wider" style={{ color: '#0F6E56', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Platform Strengths</span>
          <h2 className="font-display text-3xl font-semibold tracking-tight text-[#0F172A] mt-2" style={{ fontSize: '32px', fontWeight: 600, color: '#0F172A', letterSpacing: '-0.02em', marginTop: '8px' }}>
            Built for Clinical Precision
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '32px' }}>
          
          {/* Card 1 */}
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 text-left" style={{ backgroundColor: '#ffffff', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '24px', textAlign: 'left' }}>
            <div className="w-10 h-10 rounded-lg bg-[#0F6E56]/10 flex items-center justify-center text-[#0F6E56] mb-5" style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'rgba(15,110,86,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0F6E56', marginBottom: '20px' }}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" style={{ width: '20px', height: '20px' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-[#0F172A] mb-2" style={{ fontSize: '16px', fontWeight: 600, color: '#0F172A', marginBottom: '8px' }}>Self-Service Catalogue</h3>
            <p className="text-xs text-[#64748B] leading-relaxed" style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.5 }}>
              Browse active products, filter by chemical categories, and self-serve stock levels (In Stock, Low Stock) directly from the dashboard.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 text-left" style={{ backgroundColor: '#ffffff', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '24px', textAlign: 'left' }}>
            <div className="w-10 h-10 rounded-lg bg-[#0F6E56]/10 flex items-center justify-center text-[#0F6E56] mb-5" style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'rgba(15,110,86,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0F6E56', marginBottom: '20px' }}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" style={{ width: '20px', height: '20px' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="font-semibold text-[#0F172A] mb-2" style={{ fontSize: '16px', fontWeight: 600, color: '#0F172A', marginBottom: '8px' }}>8-Decimal Engine</h3>
            <p className="text-xs text-[#64748B] leading-relaxed" style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.5 }}>
              Strict database constraints ensure 8-decimal precision for all weight-to-volume and quantity conversions with no loss in rounding.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 text-left" style={{ backgroundColor: '#ffffff', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '24px', textAlign: 'left' }}>
            <div className="w-10 h-10 rounded-lg bg-[#0F6E56]/10 flex items-center justify-center text-[#0F6E56] mb-5" style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'rgba(15,110,86,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0F6E56', marginBottom: '20px' }}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" style={{ width: '20px', height: '20px' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="font-semibold text-[#0F172A] mb-2" style={{ fontSize: '16px', fontWeight: 600, color: '#0F172A', marginBottom: '8px' }}>State-Traceable Orders</h3>
            <p className="text-xs text-[#64748B] leading-relaxed" style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.5 }}>
              Track order state machine transitions cleanly (Quotation, Confirmed, Processing, Dispatched, Delivered) with secure role operations.
            </p>
          </div>

          {/* Card 4 */}
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 text-left" style={{ backgroundColor: '#ffffff', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '24px', textAlign: 'left' }}>
            <div className="w-10 h-10 rounded-lg bg-[#0F6E56]/10 flex items-center justify-center text-[#0F6E56] mb-5" style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'rgba(15,110,86,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0F6E56', marginBottom: '20px' }}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" style={{ width: '20px', height: '20px' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-[#0F172A] mb-2" style={{ fontSize: '16px', fontWeight: 600, color: '#0F172A', marginBottom: '8px' }}>Append-Only Auditing</h3>
            <p className="text-xs text-[#64748B] leading-relaxed" style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.5 }}>
              Every stock change, product price revision, or order approval is recorded in an immutable ledger with before and after JSON states.
            </p>
          </div>

        </div>
      </section>

      {/* ─── Interactive Pricing Demo ───────────────────────────────────────────── */}
      <section id="calculator" className="py-20 bg-white border-y border-[#E2E8F0]" style={{ backgroundColor: '#ffffff', borderTop: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0', padding: '80px 24px' }}>
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '48px', maxWidth: '1100px', margin: '0 auto', alignItems: 'center' }}>
          
          <div className="text-left" style={{ textAlign: 'left' }}>
            <div className="text-xs font-semibold text-[#0F6E56] uppercase tracking-wider mb-3" style={{ color: '#0F6E56', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
              Precision Core Math Engine
            </div>
            <h2 className="font-display text-3xl font-semibold tracking-tight text-[#0F172A] mb-6" style={{ fontSize: '32px', fontWeight: 600, color: '#0F172A', letterSpacing: '-0.02em', marginBottom: '24px' }}>
              Multi-Unit Pricing with Zero Rounding Errors
            </h2>
            <p className="text-[#64748B] text-sm leading-relaxed mb-6" style={{ color: '#64748B', fontSize: '14px', lineHeight: 1.6, marginBottom: '24px' }}>
              Procurement professionals routinely operate under distinct metric frameworks. A researcher demands grams, while a manufacturing supervisor orders bulk kilograms. 
            </p>
            <p className="text-[#64748B] text-sm leading-relaxed" style={{ color: '#64748B', fontSize: '14px', lineHeight: 1.6 }}>
              Nexus deploys a specialized decimal arithmetic computation engine (`decimal.js`) combined with database-level constraints supporting up to 8 decimal places. Try entering quantities and converting units in the live preview to test the consistency.
            </p>
          </div>

          <div className="flex justify-center" style={{ display: 'flex', justifyContent: 'center' }}>
            <LandingCalculator />
          </div>

        </div>
      </section>

      {/* ─── Operational Pipeline (How it works) ────────────────────────────────── */}
      <section id="pipeline" className="py-20 bg-[#F7F8FA] border-t border-[#E2E8F0]" style={{ borderTop: '1px solid #E2E8F0', padding: '80px 24px' }}>
        <div className="max-w-6xl mx-auto text-center" style={{ maxWidth: '1100px', margin: '0 auto', width: '100%', paddingLeft: '24px', paddingRight: '24px', textAlign: 'center' }}>
          
          <div className="mb-16" style={{ marginBottom: '64px' }}>
            <span className="text-xs font-semibold text-[#0F6E56] uppercase tracking-wider" style={{ color: '#0F6E56', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>How it Works</span>
            <h2 className="font-display text-3xl font-semibold tracking-tight text-[#0F172A] mt-2" style={{ fontSize: '32px', fontWeight: 600, color: '#0F172A', letterSpacing: '-0.02em', marginTop: '8px' }}>
              B2B Distribution Lifecycle
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-8" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '32px' }}>
            
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center relative" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div className="w-12 h-12 rounded-full bg-[#0F6E56] text-white flex items-center justify-center font-display font-semibold text-lg mb-4" style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#0F6E56', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>
                1
              </div>
              <h3 className="font-semibold text-[#0F172A] mb-2" style={{ fontSize: '16px', fontWeight: 600, color: '#0F172A', marginBottom: '8px' }}>Request & Convert</h3>
              <p className="text-xs text-[#64748B] leading-relaxed max-w-[200px]" style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.5, maxWidth: '200px' }}>
                Buyers draft their requirements directly in grams, kilograms, or litres depending on target dimensions.
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center relative" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div className="w-12 h-12 rounded-full bg-[#0F6E56] text-white flex items-center justify-center font-display font-semibold text-lg mb-4" style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#0F6E56', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>
                2
              </div>
              <h3 className="font-semibold text-[#0F172A] mb-2" style={{ fontSize: '16px', fontWeight: 600, color: '#0F172A', marginBottom: '8px' }}>Auto-Calculate</h3>
              <p className="text-xs text-[#64748B] leading-relaxed max-w-[200px]" style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.5, maxWidth: '200px' }}>
                The mathematical engine computes conversion ratios and snaps the price metrics transparently.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center relative" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div className="w-12 h-12 rounded-full bg-[#0F6E56] text-white flex items-center justify-center font-display font-semibold text-lg mb-4" style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#0F6E56', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>
                3
              </div>
              <h3 className="font-semibold text-[#0F172A] mb-2" style={{ fontSize: '16px', fontWeight: 600, color: '#0F172A', marginBottom: '8px' }}>Verify & Confirm</h3>
              <p className="text-xs text-[#64748B] leading-relaxed max-w-[200px]" style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.5, maxWidth: '200px' }}>
                Internal operations admins review the pricing breakdown, check stock limits, and transition the state.
              </p>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col items-center text-center relative" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div className="w-12 h-12 rounded-full bg-[#0F6E56] text-white flex items-center justify-center font-display font-semibold text-lg mb-4" style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#0F6E56', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>
                4
              </div>
              <h3 className="font-semibold text-[#0F172A] mb-2" style={{ fontSize: '16px', fontWeight: 600, color: '#0F172A', marginBottom: '8px' }}>Audited Delivery</h3>
              <p className="text-xs text-[#64748B] leading-relaxed max-w-[200px]" style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.5, maxWidth: '200px' }}>
                The order status is safely updated through fulfillment, with each log event atomically recorded.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ─── Frequently Asked Questions (FAQ) ───────────────────────────────────── */}
      <section id="faq" className="py-20 bg-white" style={{ backgroundColor: '#ffffff', padding: '80px 24px' }}>
        <div className="max-w-4xl mx-auto" style={{ maxWidth: '800px', margin: '0 auto', width: '100%', paddingLeft: '24px', paddingRight: '24px' }}>
          
          <div className="text-center mb-16" style={{ textAlign: 'center', marginBottom: '64px' }}>
            <span className="text-xs font-semibold text-[#0F6E56] uppercase tracking-wider" style={{ color: '#0F6E56', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Questions & Answers</span>
            <h2 className="font-display text-3xl font-semibold tracking-tight text-[#0F172A] mt-2" style={{ fontSize: '32px', fontWeight: 600, color: '#0F172A', letterSpacing: '-0.02em', marginTop: '8px' }}>
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-6" style={{ display: 'flex', flexDirection: 'column', gap: '24px', textAlign: 'left' }}>
            
            {/* FAQ 1 */}
            <div className="border-b border-[#E2E8F0] pb-6" style={{ borderBottom: '1px solid #E2E8F0', paddingBottom: '24px' }}>
              <h3 className="font-semibold text-[#0F172A] text-sm mb-2" style={{ fontSize: '15px', fontWeight: 600, color: '#0F172A', marginBottom: '8px' }}>
                How does the unit conversion handle floating point errors?
              </h3>
              <p className="text-xs text-[#64748B] leading-relaxed" style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.6 }}>
                We avoid JavaScript's default binary floating-point representation (which introduces issues like `0.1 + 0.2 === 0.30000000000000004`). Instead, Nexus implements `decimal.js` on both the client-side calculator and the server-side API processing engine. Values are stored as strict `NUMERIC(20,8)` database types to maintain absolute mathematical fidelity.
              </p>
            </div>

            {/* FAQ 2 */}
            <div className="border-b border-[#E2E8F0] pb-6" style={{ borderBottom: '1px solid #E2E8F0', paddingBottom: '24px' }}>
              <h3 className="font-semibold text-[#0F172A] text-sm mb-2" style={{ fontSize: '15px', fontWeight: 600, color: '#0F172A', marginBottom: '8px' }}>
                Can a buyer order in one unit when a product is listed in another?
              </h3>
              <p className="text-xs text-[#64748B] leading-relaxed" style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.6 }}>
                Yes! Every product has a defined base unit (e.g. grams or millilitres). If a buyer orders in a different compatible unit (such as kilograms or litres), the system automatically applies the correct multiplication factor during calculations and snapshots the converted numbers inside the line-item model.
              </p>
            </div>

            {/* FAQ 3 */}
            <div className="border-b border-[#E2E8F0] pb-6" style={{ borderBottom: '1px solid #E2E8F0', paddingBottom: '24px' }}>
              <h3 className="font-semibold text-[#0F172A] text-sm mb-2" style={{ fontSize: '15px', fontWeight: 600, color: '#0F172A', marginBottom: '8px' }}>
                Are order price calculations auditable?
              </h3>
              <p className="text-xs text-[#64748B] leading-relaxed" style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.6 }}>
                Absolutely. Every order item stores all calculation variables (ordered unit, ordered quantity, conversion factor, base price, base unit quantity, and final line total). When an operations administrator reviews the order details, they can verify the calculation directly without needing complex code.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ─── Call to Action (CTA) Banner ────────────────────────────────────────── */}
      <section className="py-16 px-6 bg-white" style={{ backgroundColor: '#ffffff', padding: '64px 24px' }}>
        <div className="max-w-5xl mx-auto bg-[#0F6E56] rounded-2xl p-12 text-center text-white relative overflow-hidden" style={{ backgroundColor: '#0F6E56', color: '#ffffff', borderRadius: '16px', padding: '48px 24px', textAlign: 'center', overflow: 'hidden', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
          
          <div className="relative z-10 flex flex-col items-center" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h2 className="font-display text-3xl font-semibold tracking-tight mb-4" style={{ fontSize: '32px', fontWeight: 600, letterSpacing: '-0.02em', marginBottom: '16px', marginTop: 0 }}>
              Upgrade Your Distribution Precision
            </h2>
            <p className="text-white/80 text-sm max-w-xl mb-8 leading-relaxed" style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px', lineHeight: 1.6, marginBottom: '32px', maxWidth: '500px' }}>
              Join pharmaceutical procurement officers and distributors across India who trust Nexus for transaction accuracy and live inventory tracking.
            </p>
            <div className="flex gap-4" style={{ display: 'flex', gap: '16px' }}>
              <Link 
                href="/signup" 
                className="bg-white text-[#0F6E56] hover:bg-[#F7F8FA] px-6 py-3 rounded-lg font-semibold shadow-sm transition-all"
                style={{ textDecoration: 'none', backgroundColor: '#ffffff', color: '#0F6E56', fontSize: '15px', fontWeight: 600, padding: '12px 24px', borderRadius: '8px' }}
              >
                Sign Up Now
              </Link>
              <Link 
                href="/login" 
                className="bg-transparent border border-white hover:bg-white/10 text-white px-6 py-3 rounded-lg font-semibold transition-all"
                style={{ textDecoration: 'none', backgroundColor: 'transparent', border: '1px solid #ffffff', color: '#ffffff', fontSize: '15px', fontWeight: 600, padding: '12px 24px', borderRadius: '8px' }}
              >
                Access Account
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* ─── Footer ─────────────────────────────────────────────────────────────── */}
      <footer className="bg-[#F7F8FA] border-t border-[#E2E8F0] py-12 px-6" style={{ borderTop: '1px solid #E2E8F0', padding: '48px 24px', backgroundColor: '#F7F8FA' }}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-[#64748B]" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '24px', fontSize: '12px', color: '#64748B', maxWidth: '1200px', margin: '0 auto', width: '100%', paddingLeft: '24px', paddingRight: '24px' }}>
          
          <div className="flex items-center gap-2" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="font-display font-semibold text-[#0F172A]" style={{ fontWeight: 600, color: '#0F172A' }}>Nexus</span>
            <span>·</span>
            <span>Precision Commerce for Distributors</span>
          </div>

          <p className="margin-0" style={{ margin: 0 }}>© {new Date().getFullYear()} AasaMedChem. All rights reserved.</p>

        </div>
      </footer>

    </div>
  );
}
