'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { createChild, fetchSchools } from '@/services/api';
import { School } from '@/types';

export default function AccountDashboardPage() {
  const router = useRouter();
  const { user, activeChild, childrenList, setActiveChild, setActiveSchool, loadUserChildren, logout, showToast } = useApp();

  const [schools, setSchools] = useState<School[]>([]);
  const [showAddChildModal, setShowAddChildModal] = useState(false);
  const [name, setName] = useState('');
  const [grade, setGrade] = useState('Grade 7');
  const [studentId, setStudentId] = useState('');
  const [selectedSchoolId, setSelectedSchoolId] = useState('');

  useEffect(() => {
    fetchSchools()
      .then(data => {
        if (data.schools) {
          setSchools(data.schools);
          if (data.schools.length > 0) setSelectedSchoolId(data.schools[0].id);
        }
      })
      .catch(() => {});
  }, []);

  if (!user) {
    return (
      <main className="max-w-container-max mx-auto px-4 py-16 text-center font-sans">
        <div className="bg-white rounded-3xl border border-gray-200 p-8 max-w-md mx-auto shadow-sm">
          <span className="material-symbols-outlined text-5xl text-[#FF561F] mb-3">account_circle</span>
          <h2 className="text-xl font-black text-[#102a43] mb-2">Authentication Required</h2>
          <p className="text-xs text-gray-500 mb-6">Please sign in to view your account dashboard and manage children.</p>
          <Link href="/auth/login?returnUrl=/account" className="bg-[#FF561F] text-white px-6 py-3 rounded-xl text-xs font-bold inline-block shadow-md">
            Sign In Now
          </Link>
        </div>
      </main>
    );
  }

  const handleAddChild = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const sch = schools.find(s => s.id === selectedSchoolId);
      const res = await createChild({
        name,
        grade,
        studentId: studentId || `${sch?.code || 'SCH'}-${Math.floor(1000 + Math.random() * 9000)}`,
        schoolId: selectedSchoolId,
        schoolName: sch?.name || 'Partner School'
      });

      if (res.child) {
        showToast(`Child profile created for ${name}!`);
        setShowAddChildModal(false);
        setName('');
        setStudentId('');
        await loadUserChildren();
        setActiveChild(res.child);
        if (sch) setActiveSchool(sch);
      }
    } catch (err) {
      showToast('Failed to add child profile');
    }
  };

  const handleSelectChildAndGo = (child: any) => {
    setActiveChild(child);
    if (child.schoolId) {
      const sch = schools.find(s => s.id === child.schoolId);
      if (sch) setActiveSchool(sch);
      router.push(`/student/store?schoolId=${child.schoolId}`);
    } else {
      router.push('/student/store');
    }
  };

  return (
    <main className="max-w-container-max mx-auto px-4 md:px-8 py-8 w-full font-sans">
      <div className="flex items-center justify-between mb-8">
        <div>
          <span className="text-[#FF561F] text-xs font-bold uppercase tracking-wider block mb-1">
            Student & Parent Hub
          </span>
          <h1 className="text-2xl md:text-3xl font-black text-[#102a43]">Parent Account Dashboard</h1>
        </div>

        <button
          onClick={logout}
          className="text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5"
        >
          <span className="material-symbols-outlined text-base">logout</span>
          <span>Sign Out</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Parent User Info */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 text-center">
            <div className="w-20 h-20 rounded-full bg-[#102a43] text-white text-2xl font-black flex items-center justify-center mx-auto mb-4 shadow-md">
              {user.firstName ? user.firstName[0].toUpperCase() : 'U'}
            </div>
            <h2 className="text-lg font-black text-[#102a43]">{user.firstName} {user.lastName}</h2>
            <p className="text-xs text-gray-500 font-medium mb-3">{user.email}</p>
            <span className="inline-block bg-orange-50 text-[#FF561F] border border-orange-200 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
              {user.role.replace('_', ' ')}
            </span>
          </div>

          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-xs font-black text-[#102a43] uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#FF561F] text-base">location_on</span>
              Default Shipping Address
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed mb-4">
              Flat 402, Royal Palms Apartments<br />
              Madhapur, Hyderabad, Telangana 500081<br />
              India • Phone: +91 98765 43210
            </p>
            <span className="text-[11px] font-extrabold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md">
              ✓ Verified Hyderabad Address
            </span>
          </div>
        </div>

        {/* Right 2 Columns: Registered Children Profiles & Quick Links */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-base font-black text-[#102a43] flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-500 text-xl">face</span>
                  Registered Children Profiles ({childrenList.length})
                </h2>
                <p className="text-xs text-gray-400">Click any student profile to switch active shopping context and load their school catalog</p>
              </div>

              <button
                onClick={() => setShowAddChildModal(true)}
                className="bg-[#FF561F] text-white hover:bg-[#E64A1A] font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-md flex items-center gap-1.5 shrink-0"
              >
                <span className="material-symbols-outlined text-base">add</span>
                <span>Add Child</span>
              </button>
            </div>

            {childrenList.length === 0 ? (
              <div className="bg-gray-50 rounded-2xl p-8 text-center text-xs text-gray-500">
                <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">person_add</span>
                <p>No children registered yet.</p>
                <button
                  onClick={() => setShowAddChildModal(true)}
                  className="mt-3 bg-[#FF561F] text-white px-4 py-2 rounded-xl font-bold text-xs shadow-sm"
                >
                  Add Your First Child
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {childrenList.map((child) => {
                  const isSelected = activeChild?.id === child.id;
                  return (
                    <div
                      key={child.id}
                      onClick={() => handleSelectChildAndGo(child)}
                      className={`p-5 rounded-2xl border transition-all cursor-pointer relative group ${
                        isSelected
                          ? 'bg-orange-50/60 border-[#FF561F] shadow-sm ring-2 ring-[#FF561F]/20'
                          : 'bg-white border-gray-200 hover:border-[#FF561F] hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-extrabold text-[#102a43] text-sm group-hover:text-[#FF561F] transition-colors">
                          {child.name}
                        </span>
                        {isSelected ? (
                          <span className="bg-[#FF561F] text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                            Active
                          </span>
                        ) : (
                          <span className="text-[10px] text-gray-400 group-hover:text-[#FF561F] font-bold">
                            Switch &rarr;
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-700 font-bold mb-1 truncate">{child.schoolName}</div>
                      <div className="text-[11px] text-gray-400 font-medium">{child.grade} • ID: {child.studentId}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 md:p-8">
            <h2 className="text-base font-black text-[#102a43] mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600 text-xl">insights</span>
              Portal Quick Actions
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link
                href="/student/store"
                className="bg-gray-50 hover:bg-orange-50 p-5 rounded-2xl border border-gray-200 text-center transition-all group"
              >
                <span className="material-symbols-outlined text-2xl text-[#FF561F] mb-1 block">school</span>
                <span className="text-xs font-extrabold text-[#102a43] group-hover:text-[#FF561F] block">School Store</span>
                <span className="text-[10px] text-gray-400">Browse Uniforms</span>
              </Link>

              <Link
                href="/shop/orders"
                className="bg-gray-50 hover:bg-blue-50 p-5 rounded-2xl border border-gray-200 text-center transition-all group"
              >
                <span className="material-symbols-outlined text-2xl text-blue-600 mb-1 block">package_2</span>
                <span className="text-xs font-extrabold text-[#102a43] group-hover:text-blue-600 block">Orders & Tracking</span>
                <span className="text-[10px] text-gray-400">Live Delhivery Status</span>
              </Link>

              <Link
                href="/wishlist"
                className="bg-gray-50 hover:bg-emerald-50 p-5 rounded-2xl border border-gray-200 text-center transition-all group"
              >
                <span className="material-symbols-outlined text-2xl text-emerald-600 mb-1 block">favorite</span>
                <span className="text-xs font-extrabold text-[#102a43] group-hover:text-emerald-600 block">Saved Wishlist</span>
                <span className="text-[10px] text-gray-400">View Saved Items</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Add Child Modal */}
      {showAddChildModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 md:p-8 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#FF561F] text-xl">person_add</span>
                <h3 className="text-lg font-black text-[#102a43]">Add Child Profile</h3>
              </div>
              <button
                onClick={() => setShowAddChildModal(false)}
                className="text-gray-400 hover:text-gray-600 text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddChild} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Child Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Aarav Sharma"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#FF561F]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Partner School *</label>
                <select
                  required
                  value={selectedSchoolId}
                  onChange={e => setSelectedSchoolId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#FF561F]"
                >
                  {schools.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Grade Level</label>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#FF561F]"
                  >
                    {Array.from({ length: 12 }, (_, i) => `Grade ${i + 1}`).map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Student Roll / ID</label>
                  <input
                    type="text"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    placeholder="e.g. GVPS-2026-7A"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#FF561F]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddChildModal(false)}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#FF561F] text-white font-bold text-xs rounded-xl shadow-md hover:bg-[#E64A1A]"
                >
                  Save Child
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
