'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { fetchSchools, createChild } from '@/services/api';
import { School } from '@/types';
import { useApp } from '@/context/AppContext';
import RoleGuard from '@/components/RoleGuard';

function FindSchoolContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, setActiveChild, setActiveSchool, loadUserChildren, showToast } = useApp();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [schools, setSchools] = useState<School[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Selection states
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [selectedGrade, setSelectedGrade] = useState<string>('Grade 7');
  const [selectedGender, setSelectedGender] = useState<'BOYS' | 'GIRLS' | 'UNISEX'>('BOYS');
  const [childName, setChildName] = useState<string>('');
  const [studentId, setStudentId] = useState<string>('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSchools()
      .then(data => {
        if (data.schools) setSchools(data.schools);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredSchools = schools.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const gradeOptions = [
    { label: 'Primary (Grades 1 – 5)', grades: ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5'] },
    { label: 'Middle School (Grades 6 – 8)', grades: ['Grade 6', 'Grade 7', 'Grade 8'] },
    { label: 'High School (Grades 9 – 10)', grades: ['Grade 9', 'Grade 10'] },
    { label: 'Senior Secondary (Grades 11 – 12)', grades: ['Grade 11', 'Grade 12'] }
  ];

  const handleSchoolSelect = (school: School) => {
    setSelectedSchool(school);
    setStep(2);
  };

  const handleGradeSelect = (grade: string) => {
    setSelectedGrade(grade);
    setStep(3);
  };

  const handleCompleteOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSchool) return;

    setSaving(true);
    const finalChildName = childName.trim() || `${user?.firstName || 'My'} Student`;
    const finalStudentId = studentId.trim() || `${selectedSchool.code}-${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      const res = await createChild({
        name: finalChildName,
        grade: selectedGrade,
        studentId: finalStudentId,
        schoolId: selectedSchool.id,
        schoolName: selectedSchool.name
      });

      setSaving(false);
      if (res.child) {
        showToast(`Welcome! Shopping context set for ${finalChildName} at ${selectedSchool.name}`);
        await loadUserChildren();
        setActiveChild(res.child);
        setActiveSchool(selectedSchool);
        router.push(`/student/store?schoolId=${selectedSchool.id}&gender=${selectedGender}&grade=${encodeURIComponent(selectedGrade)}`);
      } else {
        // Fallback navigation
        setActiveSchool(selectedSchool);
        router.push(`/student/store?schoolId=${selectedSchool.id}&gender=${selectedGender}`);
      }
    } catch (err) {
      setSaving(false);
      // Even if API errors out, navigate smoothly
      setActiveSchool(selectedSchool);
      router.push(`/student/store?schoolId=${selectedSchool.id}&gender=${selectedGender}`);
    }
  };

  return (
    <main className="min-h-[85vh] bg-[#FCFCFB] py-12 px-4 md:px-8 font-sans">
      <div className="max-w-3xl mx-auto">

        {/* Progress Stepper */}
        <div className="mb-8">
          <div className="flex items-center justify-between max-w-md mx-auto relative mb-3">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 -translate-y-1/2 z-0" />
            <div
              className="absolute top-1/2 left-0 h-0.5 bg-[#FF561F] -translate-y-1/2 z-0 transition-all duration-300"
              style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}
            />

            {[
              { num: 1, label: 'Find School' },
              { num: 2, label: 'Select Class' },
              { num: 3, label: 'Select Gender' }
            ].map((s) => (
              <div key={s.num} className="relative z-10 flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                  step >= s.num
                    ? 'bg-[#FF561F] text-white shadow-md ring-4 ring-orange-100'
                    : 'bg-white text-gray-400 border border-gray-200'
                }`}>
                  {step > s.num ? '✓' : s.num}
                </div>
                <span className={`text-[10px] font-bold mt-1 uppercase tracking-wider ${
                  step >= s.num ? 'text-[#102a43]' : 'text-gray-400'
                }`}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* STEP 1: FIND YOUR SCHOOL */}
        {/* ========================================================================= */}
        {step === 1 && (
          <div className="bg-white rounded-3xl border border-gray-200 shadow-xl p-6 md:p-10 animate-fade-in">
            <div className="text-center mb-8">
              <span className="text-[10px] font-extrabold uppercase tracking-wider bg-[#FF561F]/10 text-[#FF561F] px-3 py-1 rounded-full border border-[#FF561F]/20 inline-block mb-2">
                Step 1 of 3
              </span>
              <h1 className="text-2xl md:text-3xl font-black text-[#102a43]">Find Your School</h1>
              <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
                Search or select your institution to access the verified uniform catalog, approved house colors & grade packages.
              </p>
            </div>

            {/* School Search Input */}
            <div className="relative mb-6">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">search</span>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by school name, board, or school code (e.g. Green Valley, CBSE, CHIREC)..."
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-semibold focus:outline-none focus:border-[#FF561F] focus:ring-2 focus:ring-[#FF561F]/20 transition-all"
              />
            </div>

            {/* Popular Partner Schools List */}
            <div>
              <div className="text-xs font-extrabold text-[#102a43] uppercase tracking-wider mb-3">
                Partner Educational Institutions
              </div>

              {loading ? (
                <div className="py-12 text-center text-xs font-bold text-gray-400">Loading partner schools...</div>
              ) : filteredSchools.length === 0 ? (
                <div className="py-12 text-center bg-gray-50 rounded-2xl p-6 border border-gray-200">
                  <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">school</span>
                  <h3 className="text-sm font-bold text-gray-700">No schools matching &quot;{searchQuery}&quot;</h3>
                  <p className="text-xs text-gray-400 mt-1">Please try another search keyword or contact our school support desk.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredSchools.map((sch) => (
                    <button
                      key={sch.id}
                      type="button"
                      onClick={() => handleSchoolSelect(sch)}
                      className="w-full text-left p-4 rounded-2xl border border-gray-200 hover:border-[#FF561F] hover:bg-orange-50/40 transition-all flex items-center justify-between group cursor-pointer shadow-sm hover:shadow-md"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden border border-gray-200 shrink-0">
                          <img
                            src={sch.logoUrl || 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=100&q=80'}
                            alt={sch.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-black text-[#102a43] group-hover:text-[#FF561F] transition-colors">
                              {sch.name}
                            </h3>
                            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-gray-100 text-gray-600 border border-gray-200">
                              {sch.code}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 truncate max-w-md mt-0.5">
                            {sch.address}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-xs font-bold text-[#FF561F] opacity-0 group-hover:opacity-100 transition-opacity">
                        <span>Select</span>
                        <span className="material-symbols-outlined text-sm">&rarr;</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Can't Find Your School Help Box */}
            <div className="mt-8 border-t border-gray-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500 bg-gray-50 p-4 rounded-2xl border border-gray-200">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#FF561F]">help</span>
                <span>Can&apos;t find your child&apos;s school in the list?</span>
              </div>
              <Link
                href="/quote"
                className="text-xs font-bold text-[#FF561F] hover:underline"
              >
                Contact School Support &rarr;
              </Link>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: SELECT YOUR CLASS / GRADE */}
        {/* ========================================================================= */}
        {step === 2 && selectedSchool && (
          <div className="bg-white rounded-3xl border border-gray-200 shadow-xl p-6 md:p-10 animate-fade-in">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs font-bold text-gray-500 hover:text-[#102a43] flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">arrow_back</span>
                <span>Change School</span>
              </button>
              <div className="text-right">
                <span className="text-[10px] font-bold text-gray-400 uppercase block">Selected Institution</span>
                <span className="text-xs font-black text-[#102a43]">{selectedSchool.name}</span>
              </div>
            </div>

            <div className="text-center mb-8">
              <span className="text-[10px] font-extrabold uppercase tracking-wider bg-[#FF561F]/10 text-[#FF561F] px-3 py-1 rounded-full border border-[#FF561F]/20 inline-block mb-2">
                Step 2 of 3
              </span>
              <h2 className="text-2xl md:text-3xl font-black text-[#102a43]">Select Your Class / Grade</h2>
              <p className="text-xs text-gray-500 mt-1">
                Uniform specifications, crests, and house categories are customized for each grade wing.
              </p>
            </div>

            <div className="space-y-6">
              {gradeOptions.map((group) => (
                <div key={group.label}>
                  <h3 className="text-xs font-extrabold text-gray-700 uppercase tracking-wider mb-2.5">
                    {group.label}
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
                    {group.grades.map((gr) => (
                      <button
                        key={gr}
                        type="button"
                        onClick={() => handleGradeSelect(gr)}
                        className={`py-3 px-4 rounded-xl text-xs font-bold border transition-all text-center ${
                          selectedGrade === gr
                            ? 'bg-[#102a43] text-white border-[#102a43] shadow-md ring-2 ring-[#FF561F]'
                            : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-orange-50 hover:border-orange-200 hover:text-[#FF561F]'
                        }`}
                      >
                        {gr}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: SELECT GENDER & CHILD PROFILE */}
        {/* ========================================================================= */}
        {step === 3 && selectedSchool && (
          <div className="bg-white rounded-3xl border border-gray-200 shadow-xl p-6 md:p-10 animate-fade-in">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="text-xs font-bold text-gray-500 hover:text-[#102a43] flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">arrow_back</span>
                <span>Back to Class</span>
              </button>
              <div className="text-right">
                <span className="text-[10px] font-bold text-gray-400 uppercase block">{selectedSchool.name}</span>
                <span className="text-xs font-black text-[#FF561F]">{selectedGrade}</span>
              </div>
            </div>

            <div className="text-center mb-8">
              <span className="text-[10px] font-extrabold uppercase tracking-wider bg-[#FF561F]/10 text-[#FF561F] px-3 py-1 rounded-full border border-[#FF561F]/20 inline-block mb-2">
                Step 3 of 3
              </span>
              <h2 className="text-2xl md:text-3xl font-black text-[#102a43]">Student Fit & Details</h2>
              <p className="text-xs text-gray-500 mt-1">
                Configure student fit preference and profile details to launch your personalized school store.
              </p>
            </div>

            <form onSubmit={handleCompleteOnboarding} className="space-y-6">
              {/* Gender Fit Cards */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">
                  Select Uniform Fit *
                </label>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { key: 'BOYS' as const, label: 'Boys Fit', icon: 'face', desc: 'Shirts, Trousers & Shorts' },
                    { key: 'GIRLS' as const, label: 'Girls Fit', icon: 'face_3', desc: 'Blouses, Skirts & Trousers' },
                    { key: 'UNISEX' as const, label: 'Unisex Fit', icon: 'group', desc: 'Polos, Sweaters & Sportswear' }
                  ].map((g) => (
                    <button
                      key={g.key}
                      type="button"
                      onClick={() => setSelectedGender(g.key)}
                      className={`p-4 rounded-2xl border text-center transition-all flex flex-col items-center justify-between ${
                        selectedGender === g.key
                          ? 'bg-orange-50/50 border-[#FF561F] shadow-md ring-2 ring-[#FF561F]/20'
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <span className={`material-symbols-outlined text-3xl mb-2 ${
                        selectedGender === g.key ? 'text-[#FF561F]' : 'text-gray-400'
                      }`}>
                        {g.icon}
                      </span>
                      <div className="text-xs font-black text-[#102a43]">{g.label}</div>
                      <div className="text-[10px] text-gray-400 mt-0.5">{g.desc}</div>
                      <div className={`w-4 h-4 rounded-full border mt-3 flex items-center justify-center ${
                        selectedGender === g.key ? 'bg-[#FF561F] border-[#FF561F]' : 'border-gray-300'
                      }`}>
                        {selectedGender === g.key && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Child Profile Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Student Full Name</label>
                  <input
                    type="text"
                    value={childName}
                    onChange={e => setChildName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#FF561F]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Student Roll / Admission ID (Optional)</label>
                  <input
                    type="text"
                    value={studentId}
                    onChange={e => setStudentId(e.target.value)}
                    placeholder="e.g. GVPS-2026-7A"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#FF561F]"
                  />
                </div>
              </div>

              {/* Complete Action Button */}
              <div className="border-t border-gray-100 pt-6">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-4 bg-[#FF561F] hover:bg-[#E64A1A] text-white font-extrabold rounded-2xl text-sm transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-base">storefront</span>
                  <span>{saving ? 'Opening School Store...' : `Enter ${selectedSchool.name.split(' ')[0]} Store`}</span>
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </main>
  );
}

export default function FindSchoolPage() {
  return (
    <RoleGuard allowedRoles={['STUDENT_PARENT', 'GENERAL_CUSTOMER', 'INTERNAL_ADMIN']}>
      <Suspense fallback={<div className="py-20 text-center text-xs font-bold text-gray-400">Loading School Finder...</div>}>
        <FindSchoolContent />
      </Suspense>
    </RoleGuard>
  );
}
