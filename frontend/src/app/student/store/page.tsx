'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import RoleGuard from '@/components/RoleGuard';
import { fetchSchools, fetchSchoolProducts, createChild } from '@/services/api';
import { Product, School, Child } from '@/types';
import { useApp } from '@/context/AppContext';
import AIUniformAssistant from '@/components/AIUniformAssistant';

function StudentStoreContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const urlSchoolId = searchParams.get('schoolId');
  const category = searchParams.get('category') || 'All';
  const productType = searchParams.get('type') || 'All';
  const gender = searchParams.get('gender') || 'All';
  const color = searchParams.get('color') || 'All';
  const sort = searchParams.get('sort') || 'recommended';
  const searchQuery = searchParams.get('search') || '';
  const selectedGradeWing = searchParams.get('gradeWing') || 'All';

  const { user, activeChild, childrenList, setActiveChild, setActiveSchool, loadUserChildren, showToast } = useApp();

  const [schools, setSchools] = useState<School[]>([]);
  const [activeSchoolId, setActiveSchoolId] = useState<string>(urlSchoolId || '');
  const [products, setProducts] = useState<Product[]>([]);

  // Add Child Modal State
  const [showAddChildModal, setShowAddChildModal] = useState(false);
  const [newChildName, setNewChildName] = useState('');
  const [newChildGrade, setNewChildGrade] = useState('Grade 7');
  const [newChildSection, setNewChildSection] = useState('A');
  const [newChildStudentId, setNewChildStudentId] = useState('');
  const [newChildSchoolId, setNewChildSchoolId] = useState('');

  // Helper to update URL query parameters seamlessly
  const updateQuery = (updates: Record<string, string>) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    Object.entries(updates).forEach(([key, val]) => {
      if (!val || val === 'All' || val === 'recommended') {
        current.delete(key);
      } else {
        current.set(key, val);
      }
    });
    router.push(`/student/store?${current.toString()}`);
  };

  // Fetch partner schools list from PostgreSQL
  useEffect(() => {
    fetchSchools()
      .then(data => {
        if (data.schools && data.schools.length > 0) {
          setSchools(data.schools);
          if (!urlSchoolId) {
            const initialId = activeChild?.schoolId || data.schools[0].id;
            setActiveSchoolId(initialId);
          } else {
            setActiveSchoolId(urlSchoolId);
          }
        }
      })
      .catch(() => {});
  }, [urlSchoolId, activeChild]);

  // Sync active school when child changes
  useEffect(() => {
    if (activeChild?.schoolId) {
      setActiveSchoolId(activeChild.schoolId);
    }
  }, [activeChild]);

  // Fetch school products from PostgreSQL
  useEffect(() => {
    if (!activeSchoolId) return;
    fetchSchoolProducts(activeSchoolId, {
      category,
      productType,
      gender,
      color,
      sort,
      search: searchQuery
    })
      .then(data => {
        if (data.products) setProducts(data.products);
      })
      .catch(() => {});
  }, [activeSchoolId, category, productType, gender, color, sort, searchQuery]);

  const activeSchool = schools.find(s => s.id === activeSchoolId) || {
    id: activeSchoolId || 'sch-gvps',
    name: 'Green Valley Public School',
    code: 'GVPS-CBSE',
    address: 'Banjara Hills, Hyderabad, Telangana'
  };

  const handleAddChildSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const sch = schools.find(s => s.id === newChildSchoolId) || activeSchool;
      const res = await createChild({
        name: newChildName,
        grade: newChildSection ? `${newChildGrade} (${newChildSection})` : newChildGrade,
        studentId: newChildStudentId || `${sch.code || 'SCH'}-${Math.floor(1000 + Math.random() * 9000)}`,
        schoolId: newChildSchoolId || activeSchool.id,
        schoolName: sch.name
      });

      if (res.child) {
        showToast(`Child profile created for ${newChildName}!`);
        setShowAddChildModal(false);
        setNewChildName('');
        setNewChildStudentId('');
        await loadUserChildren();
        setActiveChild(res.child);
        setActiveSchoolId(res.child.schoolId);
        updateQuery({ schoolId: res.child.schoolId });
      }
    } catch (err) {
      showToast('Failed to add child profile');
    }
  };

  return (
    <main className="min-h-screen bg-[#F7F9FF] text-[#001D32] font-sans">
      
      {/* 1. STITCH-INSPIRED HERO BANNER WITH SCHOOL BRANDING & PRE-ORDER NOTICE */}
      <section className="relative w-full overflow-hidden bg-[#102A43] text-white">
        {/* Background Image Reference Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-overlay"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1600&q=80')`
          }}
        />

        <div className="relative z-10 max-w-container-max mx-auto px-4 md:px-8 py-8 md:py-12 flex flex-col items-center text-center">
          {/* School Crest / Logo */}
          <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-full p-1 mb-3 shadow-lg flex items-center justify-center ring-4 ring-white/20">
            <div className="w-full h-full rounded-full border-2 border-gray-200 flex items-center justify-center bg-[#EDF4FF] text-[#102A43]">
              <span className="material-symbols-outlined text-3xl text-[#FF561F]">school</span>
            </div>
          </div>

          {/* School Name & Institutional Tag */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white text-[11px] font-extrabold uppercase tracking-widest mb-2 border border-white/20">
            <span>{activeSchool.code || 'CBSE / ICSE / IB'}</span>
            <span>•</span>
            <span>Official Uniform Partner</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-2">
            {activeSchool.name}
          </h1>

          <p className="text-sm md:text-base text-slate-200 max-w-2xl mb-6 font-medium leading-relaxed">
            Official uniform store for the 2024–2025 Academic Session. Shop required daily attire, PE sportswear, blazers, and crested accessories.
          </p>

          {/* Banner Alert Pill + Active Child Quick Context */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <div className="bg-white/15 backdrop-blur-md border border-white/30 rounded-xl px-4 py-2 flex items-center gap-2 text-xs font-bold text-white shadow-sm">
              <span className="material-symbols-outlined text-[#FFB59F] text-base">campaign</span>
              <span>Pre-order for Academic Session • 7-Day Doorstep Size Exchange Guaranteed</span>
            </div>

            {activeChild && (
              <div className="bg-[#FF561F] text-white border border-white/30 rounded-xl px-4 py-2 flex items-center gap-2 text-xs font-black shadow-md">
                <span className="material-symbols-outlined text-base">face</span>
                <span>Shopping for: {activeChild.name} ({activeChild.grade})</span>
              </div>
            )}
          </div>

          {/* Child Switcher Dropdown in Hero Banner */}
          {childrenList.length > 0 && (
            <div className="mt-6 flex items-center gap-2 bg-white/10 backdrop-blur-md p-1.5 rounded-2xl border border-white/20">
              <span className="text-[11px] font-bold text-slate-300 px-2.5">Switch Child:</span>
              <div className="flex flex-wrap gap-1.5">
                {childrenList.map(c => {
                  const isSelected = activeChild?.id === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setActiveChild(c)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-[#FF561F] text-white shadow-md'
                          : 'bg-white/20 text-white hover:bg-white/30'
                      }`}
                    >
                      <span>{c.name}</span>
                      <span className="text-[10px] opacity-80">({c.grade})</span>
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => setShowAddChildModal(true)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white/15 text-white hover:bg-white/30 transition-all flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-sm">add</span>
                  <span>Add Child</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 2. "BROWSE BY GRADE" CLASS-WISE FILTERS SECTION */}
      <section className="max-w-container-max mx-auto px-4 md:px-8 py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-[#00152A] tracking-tight">Browse by Grade</h2>
            <p className="text-xs text-gray-500 mt-0.5">Explore grade-appropriate uniforms for {activeSchool.name}</p>
          </div>

          {selectedGradeWing !== 'All' && (
            <button
              onClick={() => updateQuery({ gradeWing: 'All' })}
              className="text-xs font-bold text-[#FF561F] hover:underline flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">close</span>
              <span>Clear Grade Filter</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Primary (Classes 1-5) */}
          <div
            onClick={() => router.push('/student/store/primary')}
            className="group relative rounded-2xl overflow-hidden shadow-sm bg-white block transition-all duration-300 hover:-translate-y-1 cursor-pointer border border-gray-200 hover:border-[#FF561F] hover:shadow-md"
          >
            <div className="h-44 w-full bg-slate-100 relative overflow-hidden">
              <img
                alt="Primary School Uniforms"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                src="https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=600&q=80"
              />
              <div className="absolute inset-0 bg-[#00152A]/10 group-hover:bg-transparent transition-colors" />
              <span className="absolute top-3 left-3 bg-[#102A43] text-white text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider">
                Primary Wing
              </span>
            </div>
            <div className="p-4 flex items-center justify-between bg-white">
              <div>
                <h3 className="text-sm font-black text-[#00152A] uppercase tracking-wide group-hover:text-[#FF561F] transition-colors">Primary</h3>
                <p className="text-xs text-gray-500 font-semibold">Classes 1 – 5</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 group-hover:bg-[#FF561F] group-hover:text-white flex items-center justify-center transition-colors">
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </div>
            </div>
          </div>

          {/* Middle (Classes 6-8) */}
          <div
            onClick={() => router.push('/student/store/middle')}
            className="group relative rounded-2xl overflow-hidden shadow-sm bg-white block transition-all duration-300 hover:-translate-y-1 cursor-pointer border border-gray-200 hover:border-[#FF561F] hover:shadow-md"
          >
            <div className="h-44 w-full bg-slate-100 relative overflow-hidden">
              <img
                alt="Middle School Uniforms"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                src="https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=600&q=80"
              />
              <div className="absolute inset-0 bg-[#00152A]/10 group-hover:bg-transparent transition-colors" />
              <span className="absolute top-3 left-3 bg-[#102A43] text-white text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider">
                Middle Wing
              </span>
            </div>
            <div className="p-4 flex items-center justify-between bg-white">
              <div>
                <h3 className="text-sm font-black text-[#00152A] uppercase tracking-wide group-hover:text-[#FF561F] transition-colors">Middle</h3>
                <p className="text-xs text-gray-500 font-semibold">Classes 6 – 8</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 group-hover:bg-[#FF561F] group-hover:text-white flex items-center justify-center transition-colors">
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </div>
            </div>
          </div>

          {/* Senior (Classes 9-12) */}
          <div
            onClick={() => router.push('/student/store/senior')}
            className="group relative rounded-2xl overflow-hidden shadow-sm bg-white block transition-all duration-300 hover:-translate-y-1 cursor-pointer border border-gray-200 hover:border-[#FF561F] hover:shadow-md"
          >
            <div className="h-44 w-full bg-slate-100 relative overflow-hidden">
              <img
                alt="Senior School Uniforms"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=600&q=80"
              />
              <div className="absolute inset-0 bg-[#00152A]/10 group-hover:bg-transparent transition-colors" />
              <span className="absolute top-3 left-3 bg-[#102A43] text-white text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider">
                Senior Wing
              </span>
            </div>
            <div className="p-4 flex items-center justify-between bg-white">
              <div>
                <h3 className="text-sm font-black text-[#00152A] uppercase tracking-wide group-hover:text-[#FF561F] transition-colors">Senior</h3>
                <p className="text-xs text-gray-500 font-semibold">Classes 9 – 12</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 group-hover:bg-[#FF561F] group-hover:text-white flex items-center justify-center transition-colors">
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. "SHOP BY CATEGORY" BENTO GRID SECTION */}
      <section className="max-w-container-max mx-auto px-4 md:px-8 pb-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-[#00152A] tracking-tight">Shop by Category</h2>
            <p className="text-xs text-gray-500 mt-0.5">Quickly jump into dedicated uniform categories</p>
          </div>
          <button
            onClick={() => updateQuery({ category: 'All' })}
            className="text-xs font-extrabold text-[#FF561F] hover:underline flex items-center gap-1 group"
          >
            <span>View All Uniforms</span>
            <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </button>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Full Uniform Kit Bundle (Featured - Spans 2 rows on desktop) */}
          <div
            onClick={() => updateQuery({ category: 'All' })}
            className="group relative md:row-span-2 rounded-2xl overflow-hidden shadow-sm bg-white block transition-all duration-300 hover:-translate-y-1 border border-gray-200 cursor-pointer flex flex-col justify-between"
          >
            <div className="absolute top-4 left-4 z-20 bg-[#FF561F] text-white font-extrabold text-[11px] px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
              Save 15% Bundle
            </div>
            <div className="aspect-square md:aspect-auto md:h-[60%] w-full bg-slate-50 relative overflow-hidden">
              <img
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                alt="Full Uniform Kit Bundle"
                src="https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80"
              />
            </div>
            <div className="p-6 md:h-[40%] flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-black text-[#00152A] mb-1.5">Full Uniform Kit Bundle</h3>
                <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                  Complete official set includes formal shirt, trousers/skirt, tie, and belt. The easiest way to get completely ready for the new academic year.
                </p>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-lg font-black text-[#FF561F]">From ₹1,499</span>
                <div className="w-10 h-10 rounded-full bg-[#EDF4FF] flex items-center justify-center text-[#102A43] group-hover:bg-[#102A43] group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-base">arrow_forward</span>
                </div>
              </div>
            </div>
          </div>

          {/* Boys Uniforms */}
          <div
            onClick={() => updateQuery({ gender: 'BOYS' })}
            className={`group relative rounded-2xl overflow-hidden shadow-sm bg-white block transition-all duration-300 hover:-translate-y-1 border cursor-pointer ${
              gender === 'BOYS' ? 'border-[#FF561F] ring-2 ring-[#FF561F]/30' : 'border-gray-200'
            }`}
          >
            <div className="h-44 w-full bg-slate-50 relative overflow-hidden">
              <img
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                alt="Boys Uniforms"
                src="https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=600&q=80"
              />
            </div>
            <div className="p-4 flex items-center justify-between bg-white">
              <h3 className="text-xs font-black text-[#00152A] uppercase tracking-wide">Boys Uniforms</h3>
              <span className="material-symbols-outlined text-gray-400 group-hover:text-[#FF561F] transition-colors">chevron_right</span>
            </div>
          </div>

          {/* Girls Uniforms */}
          <div
            onClick={() => updateQuery({ gender: 'GIRLS' })}
            className={`group relative rounded-2xl overflow-hidden shadow-sm bg-white block transition-all duration-300 hover:-translate-y-1 border cursor-pointer ${
              gender === 'GIRLS' ? 'border-[#FF561F] ring-2 ring-[#FF561F]/30' : 'border-gray-200'
            }`}
          >
            <div className="h-44 w-full bg-slate-50 relative overflow-hidden">
              <img
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                alt="Girls Uniforms"
                src="https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=600&q=80"
              />
            </div>
            <div className="p-4 flex items-center justify-between bg-white">
              <h3 className="text-xs font-black text-[#00152A] uppercase tracking-wide">Girls Uniforms</h3>
              <span className="material-symbols-outlined text-gray-400 group-hover:text-[#FF561F] transition-colors">chevron_right</span>
            </div>
          </div>

          {/* Sportswear & PE */}
          <div
            onClick={() => updateQuery({ category: 'PE Uniforms' })}
            className={`group relative rounded-2xl overflow-hidden shadow-sm bg-white block transition-all duration-300 hover:-translate-y-1 border cursor-pointer ${
              category === 'PE Uniforms' ? 'border-[#FF561F] ring-2 ring-[#FF561F]/30' : 'border-gray-200'
            }`}
          >
            <div className="h-44 w-full bg-slate-50 relative overflow-hidden">
              <img
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                alt="PE & Sportswear"
                src="https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=600&q=80"
              />
            </div>
            <div className="p-4 flex items-center justify-between bg-white">
              <h3 className="text-xs font-black text-[#00152A] uppercase tracking-wide">P.E. & Sportswear</h3>
              <span className="material-symbols-outlined text-gray-400 group-hover:text-[#FF561F] transition-colors">chevron_right</span>
            </div>
          </div>

          {/* Accessories & Bags */}
          <div
            onClick={() => updateQuery({ category: 'Accessories' })}
            className={`group relative rounded-2xl overflow-hidden shadow-sm bg-white block transition-all duration-300 hover:-translate-y-1 border cursor-pointer ${
              category === 'Accessories' ? 'border-[#FF561F] ring-2 ring-[#FF561F]/30' : 'border-gray-200'
            }`}
          >
            <div className="h-44 w-full bg-slate-50 relative overflow-hidden">
              <img
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                alt="Accessories"
                src="https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80"
              />
            </div>
            <div className="p-4 flex items-center justify-between bg-white">
              <h3 className="text-xs font-black text-[#00152A] uppercase tracking-wide">Accessories & Bags</h3>
              <span className="material-symbols-outlined text-gray-400 group-hover:text-[#FF561F] transition-colors">chevron_right</span>
            </div>
          </div>
        </div>
      </section>

      {/* Add Child Modal */}
      {showAddChildModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 md:p-8 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#FF561F] text-xl">person_add</span>
                <h3 className="text-lg font-black text-[#00152A]">Add Child Profile</h3>
              </div>
              <button
                onClick={() => setShowAddChildModal(false)}
                className="text-gray-400 hover:text-gray-600 text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddChildSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Child Full Name *</label>
                <input
                  type="text"
                  required
                  value={newChildName}
                  onChange={e => setNewChildName(e.target.value)}
                  placeholder="e.g. Aarav Sharma"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#FF561F]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Select School *</label>
                <select
                  required
                  value={newChildSchoolId}
                  onChange={e => setNewChildSchoolId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#FF561F]"
                >
                  <option value="">-- Choose school --</option>
                  {schools.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Grade / Class *</label>
                  <select
                    value={newChildGrade}
                    onChange={e => setNewChildGrade(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#FF561F]"
                  >
                    {Array.from({ length: 12 }, (_, i) => `Grade ${i + 1}`).map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Section</label>
                  <select
                    value={newChildSection}
                    onChange={e => setNewChildSection(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#FF561F]"
                  >
                    {['A', 'B', 'C', 'D', 'E'].map(sec => (
                      <option key={sec} value={sec}>Section {sec}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Student Roll / ID (Optional)</label>
                <input
                  type="text"
                  value={newChildStudentId}
                  onChange={e => setNewChildStudentId(e.target.value)}
                  placeholder="e.g. GVPS-2026-7A"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#FF561F]"
                />
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddChildModal(false)}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#FF561F] text-white font-bold rounded-xl text-xs shadow-md hover:bg-[#E64A1A]"
                >
                  Save Child Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Contextual AI Assistant */}
      <AIUniformAssistant currentProducts={products} />
    </main>
  );
}

export default function StudentStorePage() {
  return (
    <RoleGuard allowedRoles={['STUDENT_PARENT', 'INTERNAL_ADMIN']}>
      <Suspense fallback={<div className="py-20 text-center text-xs font-bold text-gray-400">Loading Student Store...</div>}>
        <StudentStoreContent />
      </Suspense>
    </RoleGuard>
  );
}
