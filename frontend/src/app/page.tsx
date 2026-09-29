'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useApp } from '../context/AppContext';
import { fetchProducts, fetchSchools } from '../services/api';
import { UserRole, Product, School } from '../types';
import ProductCard from '../components/ProductCard';

export default function HomePage() {
  const { setRole } = useApp();
  const [activeFilter, setActiveFilter] = useState('All');
  const [products, setProducts] = useState<Product[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchProducts({ role: 'GENERAL_CUSTOMER' }),
      fetchSchools()
    ]).then(([prodData, schoolData]) => {
      if (prodData.products) setProducts(prodData.products);
      if (schoolData.schools) setSchools(schoolData.schools);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const shoppingPortals: {
    role: UserRole;
    title: string;
    headline: string;
    desc: string;
    icon: string;
    badge: string;
    loginRoute: string;
    storeRoute: string;
    bgGradient: string;
    accentColor: string;
  }[] = [
    {
      role: 'STUDENT_PARENT',
      title: 'Student / Parent',
      headline: 'Shop school uniforms for your child',
      desc: 'Official institutional uniforms, grade-wise apparel, house t-shirts, crested blazers & footwear for partner schools.',
      icon: 'school',
      badge: 'B2C Institutional',
      loginRoute: '/auth/login?role=STUDENT_PARENT',
      storeRoute: '/student/store',
      bgGradient: 'from-orange-500/10 via-amber-500/5 to-white',
      accentColor: '#FF561F'
    },
    {
      role: 'GENERAL_CUSTOMER',
      title: 'General Customer',
      headline: 'Shop uniforms and workwear',
      desc: 'Public retail catalog for medical scrubs, chef coats, lab jackets, heavy-duty safety boots & workplace accessories.',
      icon: 'shopping_bag',
      badge: 'B2C Retail',
      loginRoute: '/auth/login?role=GENERAL_CUSTOMER',
      storeRoute: '/shop',
      bgGradient: 'from-blue-500/10 via-indigo-500/5 to-white',
      accentColor: '#2563EB'
    },
    {
      role: 'EMPLOYEE',
      title: 'Corporate Employee',
      headline: 'Shop your company\'s uniforms',
      desc: 'Approved corporate business apparel, executive oxford shirts, industrial safety PPE & embroidered team uniforms.',
      icon: 'badge',
      badge: 'B2B Corporate',
      loginRoute: '/auth/login?role=EMPLOYEE',
      storeRoute: '/employee/store',
      bgGradient: 'from-emerald-500/10 via-teal-500/5 to-white',
      accentColor: '#059669'
    }
  ];

  const industries = [
    { title: 'Education & Schools', desc: 'School Blazers, Polos, Physical Education & House Colors', icon: 'school', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuClIMkNv-kacOZoPq6iUgjMcDEI5iVnaTGqxRcvJ3xgKTESyZszWbs2QWkcA-oWKKV7aKMVsorQ19aGoOiy7q49Nyo3d_FXNGQ-pOgEOIEHpiHp4g2o3DGWHIg2bK6g3TGjfXf9_1y9zeJaw1zXiKHKGra_WuEmKQgxn7vOW1oyNDL52QKOHe4V5BbXV6WpbcXmxI6gdiwIhThqR658DHdNCzx6rUYYEswcYOLqyJK0ylqrKjuJz2nTSxvQtpyRp00jCJuc1Mpm1m45', route: '/student/store' },
    { title: 'Healthcare & Medical', desc: 'Antimicrobial Scrubs, Doctor Lab Coats & Nursing Tops', icon: 'medical_services', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB5Zo7KFTR80hSUH1i_Nzh5FRp7hplAnTB2-HZ94XhHnKLR8149oyfe7IfLPici81wuqDXsG0TaPh2LEh7As2lRx4F5Te0xja6car5X-1iFvPLhxSZanmppdnjfemnTMm7eXdUuAc5oZd_s-Ttl5D0yfUlEth3J1Td5mN4odSX5KgAEbCKD6_lw3XBjKi5-hQD6yaSYos1DgOs9zYM-h2yujHTBtfNmaCj5dQomQTqGp2ms5Fv22iJoHXghpMH9az0H6BFoV2GrkI8y', route: '/shop' },
    { title: 'Industrial & Safety PPE', desc: 'Flame-Resistant Jackets, High-Vis Vests & Steel-Toe Boots', icon: 'engineering', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBbWefAkb9fWCk4N102YQTzupFUVbafUmV9SvXEu_GFtFc-hzxVppgGPYCbRMjktKQHjfaf04ChKvuzpHiQAjtNMMVTs9Lehzry9cztoUGFrh64SM6nxlr6WkJeaxdIdmGLRqKrNs3xzC1MwwsH59L7VShdDYbgSGpY_ntvcESmXK0_jlOCaohWMqoDy1ZaGuA1VOeYmkDqb1roMs76PoiPG7xGTRI3LtRoi2_ToGXim6u1cV_N2JFzUOv-CPnR-Jj6vhiwF1J90mpx', route: '/employee/store' },
    { title: 'Corporate & Office', desc: 'Non-Iron Oxford Shirts, Executive Trousers & Blazers', icon: 'business_center', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDEPFTzZxIHgj-qIAJW013ag_OFgbtnBvRet84lsNxhKVEShQyPBTm8duzJExf1lK_YvvULlHNTUvaJXcgHYJxooBNiMuNWm5_XvJmgtodnZJ0TDDLv6Us7hW0fa4Zk_aX0RauNSgROwja-kyIx22qkouXsHZwFIPeeby335P59vvYkI3ed3FKiAVqmMhmnvPZ-KFdj6FS9gMIjULf8FUjOYsL3RDLu3AdLO_guA0mhd13rHTJhEnC8tATrcLXI5rEEWt7NfHSBgP-h', route: '/employee/store' }
  ];

  const quickFilterTabs = ['All', 'Healthcare', 'Industrial', 'Corporate', 'Hospitality', 'Education'];

  const filteredProducts = activeFilter === 'All'
    ? products
    : products.filter(p => {
        const cat = p.category.toLowerCase();
        const filt = activeFilter.toLowerCase();
        if (filt === 'healthcare') return cat.includes('scrub') || cat.includes('medical') || cat.includes('lab');
        if (filt === 'industrial') return cat.includes('safety') || cat.includes('ppe') || cat.includes('boot');
        if (filt === 'corporate') return cat.includes('shirt') || cat.includes('trouser') || cat.includes('blazer');
        if (filt === 'education') return cat.includes('school') || cat.includes('polo') || cat.includes('skirt');
        return cat.includes(filt);
      });

  return (
    <main className="min-h-screen bg-[#FCFCFB] text-[#4B5563] font-sans selection:bg-[#FF561F]/20 selection:text-[#FF561F]">
      {/* 1. Stitch Animated Hero Section */}
      <section className="relative bg-[#FCFCFB] overflow-hidden border-b border-gray-200">
        <div className="max-w-container-max mx-auto px-4 md:px-8 py-16 md:py-24 grid md:grid-cols-2 items-center gap-16 relative z-10">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 bg-[#FF561F]/10 text-[#FF561F] px-4 py-1.5 rounded-full text-xs font-extrabold border border-[#FF561F]/20 shadow-sm">
              <span className="material-symbols-outlined text-sm animate-pulse">verified</span>
              <span>Enterprise Solution • B2C & B2B Uniform Marketplace</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-[#111827] leading-tight tracking-tight">
              Everything related to uniforms{' '}
              <span className="text-[#FF561F] relative inline-block after:content-[''] after:absolute after:w-full after:h-2.5 after:bg-[#FF561F]/20 after:bottom-2 after:left-0 after:-z-10 after:transform after:-skew-x-12">
                in one place.
              </span>
            </h1>

            <p className="text-base md:text-lg text-[#4B5563] max-w-lg leading-relaxed">
              The definitive marketplace for high-performance uniforms. From institutional school attire to corporate workwear and hospital-grade scrubs, we streamline procurement for individuals and organizations.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/shop"
                className="bg-[#FF561F] text-white px-8 py-4 rounded-xl font-black text-xs shadow-lg shadow-[#FF561F]/25 hover:bg-[#E64A1A] hover:-translate-y-0.5 transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-base">shopping_cart</span>
                <span>Explore Catalog</span>
              </Link>
              <Link
                href="/account"
                className="bg-[#102a43] text-white px-8 py-4 rounded-xl font-black text-xs shadow-lg hover:bg-[#243b53] hover:-translate-y-0.5 transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-base">account_circle</span>
                <span>My Account</span>
              </Link>
              <Link
                href="/employee/store"
                className="bg-white border-2 border-gray-200 text-[#111827] px-8 py-4 rounded-xl font-black text-xs hover:bg-gray-50 hover:border-[#FF561F]/50 transition-all flex items-center gap-2"
              >
                <span>View B2B Corporate Pricing</span>
              </Link>
            </div>

            <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
              <div className="flex -space-x-3">
                <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80" alt="Trust avatar" className="w-10 h-10 rounded-full border-2 border-white object-cover shadow-sm" />
                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80" alt="Trust avatar" className="w-10 h-10 rounded-full border-2 border-white object-cover shadow-sm" />
                <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80" alt="Trust avatar" className="w-10 h-10 rounded-full border-2 border-white object-cover shadow-sm" />
              </div>
              <p className="text-xs text-[#4B5563]">
                <span className="font-bold text-[#111827]">1,200+</span> Institutions & Enterprises trust ShopMyUniform daily
              </p>
            </div>
          </div>

          {/* Right Visual Imagery Grid */}
          <div className="relative grid grid-cols-2 gap-4">
            <div className="space-y-4 pt-12">
              <div className="rounded-2xl overflow-hidden shadow-xl aspect-[3/4] hover:shadow-2xl transition-all group border border-gray-200 relative">
                <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuClIMkNv-kacOZoPq6iUgjMcDEI5iVnaTGqxRcvJ3xgKTESyZszWbs2QWkcA-oWKKV7aKMVsorQ19aGoOiy7q49Nyo3d_FXNGQ-pOgEOIEHpiHp4g2o3DGWHIg2bK6g3TGjfXf9_1y9zeJaw1zXiKHKGra_WuEmKQgxn7vOW1oyNDL52QKOHe4V5BbXV6WpbcXmxI6gdiwIhThqR658DHdNCzx6rUYYEswcYOLqyJK0ylqrKjuJz2nTSxvQtpyRp00jCJuc1Mpm1m45" alt="Student Uniforms" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/35 transition-colors flex items-center justify-center">
                  <span className="bg-white/95 text-[#FF561F] px-4 py-2 rounded-full font-extrabold text-xs shadow-lg group-hover:scale-105 transition-all">Student Uniforms</span>
                </div>
              </div>
              <div className="rounded-2xl overflow-hidden shadow-xl aspect-square hover:shadow-2xl transition-all group border border-gray-200 relative">
                <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBbWefAkb9fWCk4N102YQTzupFUVbafUmV9SvXEu_GFtFc-hzxVppgGPYCbRMjktKQHjfaf04ChKvuzpHiQAjtNMMVTs9Lehzry9cztoUGFrh64SM6nxlr6WkJeaxdIdmGLRqKrNs3xzC1MwwsH59L7VShdDYbgSGpY_ntvcESmXK0_jlOCaohWMqoDy1ZaGuA1VOeYmkDqb1roMs76PoiPG7xGTRI3LtRoi2_ToGXim6u1cV_N2JFzUOv-CPnR-Jj6vhiwF1J90mpx" alt="Industrial Safety PPE" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
            </div>
            <div className="space-y-4">
              <div className="rounded-2xl overflow-hidden shadow-xl aspect-square hover:shadow-2xl transition-all group border border-gray-200 relative">
                <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuB5Zo7KFTR80hSUH1i_Nzh5FRp7hplAnTB2-HZ94XhHnKLR8149oyfe7IfLPici81wuqDXsG0TaPh2LEh7As2lRx4F5Te0xja6car5X-1iFvPLhxSZanmppdnjfemnTMm7eXdUuAc5oZd_s-Ttl5D0yfUlEth3J1Td5mN4odSX5KgAEbCKD6_lw3XBjKi5-hQD6yaSYos1DgOs9zYM-h2yujHTBtfNmaCj5dQomQTqGp2ms5Fv22iJoHXghpMH9az0H6BFoV2GrkI8y" alt="Hospitality & Healthcare" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
              <div className="rounded-2xl overflow-hidden shadow-xl aspect-[3/4] hover:shadow-2xl transition-all group border border-gray-200 relative">
                <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDEPFTzZxIHgj-qIAJW013ag_OFgbtnBvRet84lsNxhKVEShQyPBTm8duzJExf1lK_YvvULlHNTUvaJXcgHYJxooBNiMuNWm5_XvJmgtodnZJ0TDDLv6Us7hW0fa4Zk_aX0RauNSgROwja-kyIx22qkouXsHZwFIPeeby335P59vvYkI3ed3FKiAVqmMhmnvPZ-KFdj6FS9gMIjULf8FUjOYsL3RDLu3AdLO_guA0mhd13rHTJhEnC8tATrcLXI5rEEWt7NfHSBgP-h" alt="Students in Uniforms" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THE THREE PUBLIC COMMERCIAL SHOPPING ENTRY CARDS */}
      <section className="py-16 bg-[#F4F5F7] border-b border-gray-200">
        <div className="max-w-container-max mx-auto px-4 md:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-[#FF561F] text-xs font-black uppercase tracking-widest block mb-2">Shopping Portals</span>
            <h2 className="text-2xl md:text-3xl font-black text-[#111827]">Choose Your Shopping Experience</h2>
            <p className="text-xs text-gray-600 mt-1">Select your account type to access specialized school stores, general retail, or corporate procurement.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {shoppingPortals.map((p) => (
              <div
                key={p.role}
                className={`bg-white rounded-3xl p-8 border border-gray-200 shadow-sm hover:border-[#FF561F] hover:shadow-2xl hover:-translate-y-1.5 transition-all flex flex-col justify-between relative overflow-hidden bg-gradient-to-b ${p.bgGradient}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-[#FF561F] text-white flex items-center justify-center shadow-lg shadow-[#FF561F]/20">
                      <span className="material-symbols-outlined text-2xl">{p.icon}</span>
                    </div>
                    <span className="text-[10px] font-extrabold px-3 py-1 rounded-full bg-white text-gray-800 border border-gray-200 shadow-sm uppercase tracking-wider">{p.badge}</span>
                  </div>

                  <h3 className="font-black text-xl text-[#111827] mb-1">{p.title}</h3>
                  <div className="text-xs font-bold text-[#FF561F] mb-3">{p.headline}</div>
                  <p className="text-xs text-gray-500 leading-relaxed mb-8">{p.desc}</p>
                </div>

                <div className="space-y-3 pt-4 border-t border-gray-100">
                  <Link
                    href={p.loginRoute}
                    onClick={() => setRole(p.role)}
                    className="w-full text-center py-3.5 bg-[#FF561F] hover:bg-[#E64A1A] text-white rounded-2xl font-extrabold text-xs shadow-md flex items-center justify-center gap-2 transition-all"
                  >
                    <span>Sign in as {p.title}</span>
                    <span className="material-symbols-outlined text-sm">login</span>
                  </Link>

                  <Link
                    href={p.storeRoute}
                    onClick={() => setRole(p.role)}
                    className="w-full text-center py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl font-bold text-[11px] transition-all block"
                  >
                    Browse {p.title} Store &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Stitch Quick Filter Bar */}
      <section className="bg-white border-b border-gray-200 py-6">
        <div className="max-w-container-max mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center gap-6">
          <span className="text-xs font-black text-[#111827] uppercase tracking-wider whitespace-nowrap flex items-center gap-1.5">
            <span className="material-symbols-outlined text-base text-[#FF561F]">filter_alt</span>
            <span>Quick Category Filter:</span>
          </span>

          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
            {quickFilterTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                className={`px-5 py-2 rounded-full text-xs font-extrabold transition-all shrink-0 ${
                  activeFilter === tab
                    ? 'bg-[#102a43] text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Shop By Industry Section */}
      <section className="py-16 max-w-container-max mx-auto px-4 md:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-[#FF561F] text-xs font-black uppercase tracking-widest block mb-2">Multi-Industry Marketplace</span>
          <h2 className="text-2xl md:text-3xl font-black text-[#111827]">Tailored for Every Sector</h2>
          <p className="text-xs text-gray-600 mt-1">High-performance uniforms engineered for durability, compliance, and professional appearance.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {industries.map((ind) => (
            <Link
              key={ind.title}
              href={ind.route}
              className="group bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm hover:border-[#FF561F] hover:shadow-xl transition-all duration-300 flex flex-col"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                <img src={ind.img} alt={ind.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-4">
                  <span className="text-white font-black text-sm flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base text-[#FF561F]">{ind.icon}</span>
                    <span>{ind.title}</span>
                  </span>
                </div>
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between">
                <p className="text-xs text-gray-500 leading-relaxed mb-4">{ind.desc}</p>
                <div className="text-xs font-bold text-[#FF561F] group-hover:translate-x-1 transition-transform flex items-center gap-1">
                  <span>Explore Industry</span>
                  <span>&rarr;</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 5. Partner Schools Discovery */}
      {schools.length > 0 && (
        <section className="py-12 bg-white border-y border-gray-200">
          <div className="max-w-container-max mx-auto px-4 md:px-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#FF561F] block mb-0.5">Partner Schools</span>
                <h3 className="text-lg font-black text-[#111827]">Institutional Partner Catalogs</h3>
              </div>
              <Link href="/student/store" className="text-xs font-bold text-[#FF561F] hover:underline">
                View All Partner Schools &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {schools.map((sch) => (
                <Link
                  key={sch.id}
                  href={`/student/store?schoolId=${sch.id}`}
                  onClick={() => setRole('STUDENT_PARENT')}
                  className="p-4 rounded-2xl border border-gray-200 hover:border-[#FF561F] transition-all bg-gray-50/50 hover:bg-white hover:shadow-md flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#102a43] text-white flex items-center justify-center shrink-0 text-xs font-black">
                    {sch.code || 'SCH'}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-xs text-[#111827] truncate">{sch.name}</div>
                    <div className="text-[10px] text-gray-400">Official Uniform Store</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 6. Trending Marketplace Products Loaded from PostgreSQL */}
      <section className="py-16 max-w-container-max mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-[#FF561F] text-xs font-bold uppercase tracking-wider block mb-1">Featured Marketplace Collections</span>
            <h2 className="text-3xl font-black text-[#111827]">Trending Apparel & Gear</h2>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-gray-400 font-bold">Loading marketplace products...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-12 text-center text-xs text-gray-400 font-bold bg-white rounded-2xl border border-gray-200 p-8">
            No products match the selected category filter.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* 7. Enterprise Bulk Quote & Embroidery CTA */}
      <section className="bg-[#102a43] text-white py-16">
        <div className="max-w-container-max mx-auto px-4 md:px-8 grid md:grid-cols-2 items-center gap-12">
          <div className="space-y-6">
            <span className="bg-[#FF561F] text-white text-[10px] font-extrabold uppercase px-3 py-1 rounded-full tracking-wider">
              B2B Enterprise Customization
            </span>
            <h2 className="text-3xl md:text-4xl font-black leading-tight">
              Need Bulk Quotes or Custom Embroidery?
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              We provide end-to-end custom embroidery, screen printing, and volume-tiered discounts for schools, hospitals, and corporate workforces.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                href="/employee/store"
                className="bg-[#FF561F] hover:bg-[#E64A1A] text-white font-bold px-8 py-3.5 rounded-xl text-xs shadow-lg transition-all"
              >
                Request Enterprise Quote
              </Link>
              <Link
                href="/shop"
                className="bg-white/10 hover:bg-white/20 text-white font-bold px-8 py-3.5 rounded-xl text-xs border border-white/20 transition-all"
              >
                Explore Public Catalog
              </Link>
            </div>
          </div>

          <div className="relative bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-sm space-y-4">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-3xl text-[#FF561F]">verified_user</span>
              <div>
                <h4 className="font-bold text-base">Guaranteed Delivery & Fit Guarantee</h4>
                <p className="text-xs text-slate-300">100% Size replacement guarantee for all registered schools & corporate clients.</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-3xl text-[#FF561F]">local_shipping</span>
              <div>
                <h4 className="font-bold text-base">Express Dispatch & Warehousing</h4>
                <p className="text-xs text-slate-300">Direct shipment from Hyderabad centralized fulfillment warehouse.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
