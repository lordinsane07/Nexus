'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const SECTIONS = ['features', 'calculator', 'pipeline', 'faq'];

export default function HeaderNav() {
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-30% 0px -60% 0px', // Trigger when section occupies the active middle portion of the viewport
      threshold: 0,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, observerOptions);

    SECTIONS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    // Fallback: clear active section if scrolled to top
    const handleScroll = () => {
      if (window.scrollY < 200) {
        setActiveSection('');
      }
    };
    window.addEventListener('scroll', handleScroll);

    return () => {
      SECTIONS.forEach((id) => {
        const el = document.getElementById(id);
        if (el) observer.unobserve(el);
      });
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const getLinkStyle = (id: string) => {
    const isActive = activeSection === id;
    return {
      textDecoration: 'none',
      color: isActive ? '#0F6E56' : '#64748B',
      fontWeight: isActive ? 600 : 500,
      borderBottom: isActive ? '2px solid #0F6E56' : '2px solid transparent',
      paddingBottom: '4px',
      transition: 'all 0.2s ease-in-out',
    };
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#E2E8F0] transition-all" style={{ borderBottom: '1px solid #E2E8F0', position: 'sticky', top: 0, zIndex: 50 }}>
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto', width: '100%', padding: '16px 24px' }}>
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <svg className="w-8 h-8 text-[#0F6E56]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: '32px', height: '32px', color: '#0F6E56' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
          <span className="font-display font-semibold text-xl tracking-tight text-[#0F172A]" style={{ fontSize: '20px', fontWeight: 600, color: '#0F172A', letterSpacing: '-0.02em' }}>
            Nexus
          </span>
        </Link>

        {/* Nav Navigation links with Scroll Spy */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium" style={{ display: 'flex', gap: '32px', fontSize: '14px', alignItems: 'center' }}>
          <a href="#features" style={getLinkStyle('features')}>Features</a>
          <a href="#calculator" style={getLinkStyle('calculator')}>Pricing Demo</a>
          <a href="#pipeline" style={getLinkStyle('pipeline')}>Operational Flow</a>
          <a href="#faq" style={getLinkStyle('faq')}>FAQ</a>
        </nav>

        {/* Action CTAs */}
        <div className="flex items-center gap-4" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link 
            href="/login" 
            className="text-sm font-semibold text-[#64748B] hover:text-[#0F172A] transition-colors"
            style={{ textDecoration: 'none', color: '#64748B', fontSize: '14px', fontWeight: 600 }}
          >
            Sign In
          </Link>
          <Link 
            href="/signup" 
            className="bg-[#0F6E56] hover:bg-[#0A5240] text-white text-sm font-semibold px-4 py-2.5 rounded-lg shadow-sm hover:shadow transition-all"
            style={{ textDecoration: 'none', backgroundColor: '#0F6E56', color: '#ffffff', fontSize: '14px', fontWeight: 600, padding: '10px 18px', borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
          >
            Get Started
          </Link>
        </div>

      </div>
    </header>
  );
}
