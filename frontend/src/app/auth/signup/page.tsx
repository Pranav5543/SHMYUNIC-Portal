'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useApp } from '../../../context/AppContext';
import { fetchSchools, fetchCompanies } from '../../../services/api';
import { UserRole } from '../../../types';

function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryRole = searchParams.get('role');
  const { register, showToast } = useApp();

  const normalizeRole = (param: string | null): UserRole => {
    if (!param) return 'STUDENT_PARENT';
    const lower = param.toLowerCase();
    if (lower.includes('employee')) return 'EMPLOYEE';
    if (lower.includes('general') || lower.includes('customer')) return 'GENERAL_CUSTOMER';
    if (lower.includes('student') || lower.includes('parent')) return 'STUDENT_PARENT';
    return 'STUDENT_PARENT';
  };

  const initialRole = normalizeRole(queryRole);
  const [selectedRole, setSelectedRole] = useState<UserRole>(initialRole);

  // Form Fields (Preserved across role switching)
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Data-Driven School & Company Selection Lists
  const [schoolsList, setSchoolsList] = useState<any[]>([]);
  const [companiesList, setCompaniesList] = useState<any[]>([]);

  // Student / Parent Specific State
  const [studentName, setStudentName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [selectedSchoolId, setSelectedSchoolId] = useState('');
  const [schoolName, setSchoolName] = useState('');

  // Employee Specific State
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [employeeId, setEmployeeId] = useState('');

  const [agreedTerms, setAgreedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load Schools & Companies dynamically from database
  useEffect(() => {
    fetchSchools()
      .then(res => {
        if (res.schools && res.schools.length > 0) {
          setSchoolsList(res.schools);
        }
      })
      .catch(() => {});

    fetchCompanies()
      .then(res => {
        if (res.companies && res.companies.length > 0) {
          setCompaniesList(res.companies);
        }
      })
      .catch(() => {});
  }, []);

  // Seamless client-side account-type switcher
  const handleRoleChange = (newRole: UserRole) => {
    setSelectedRole(newRole);
    setErrorMessage(null);

    const roleParamMap: Record<UserRole, string> = {
      STUDENT_PARENT: 'student',
      GENERAL_CUSTOMER: 'general',
      EMPLOYEE: 'employee',
      SCHOOL_ADMIN: 'school-admin',
      INTERNAL_ADMIN: 'admin',
      VENDOR: 'vendor',
      WAREHOUSE: 'logistics'
    };

    const roleSlug = roleParamMap[newRole] || 'student';
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('role', roleSlug);
      window.history.pushState({}, '', url.pathname + url.search);
    }
  };

  const handleSchoolChange = (id: string) => {
    setSelectedSchoolId(id);
    const found = schoolsList.find(s => s.id === id);
    if (found) {
      setSchoolName(found.name);
    }
  };

  const handleCompanyChange = (id: string) => {
    setSelectedCompanyId(id);
    const found = companiesList.find(c => c.name === id || c.id === id);
    if (found) {
      setCompanyName(found.name);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    if (!agreedTerms) {
      setErrorMessage('You must accept Terms & Conditions');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        email,
        password,
        role: selectedRole,
        firstName,
        lastName,
        phone,
        ...(selectedRole === 'STUDENT_PARENT' && {
          studentName,
          studentId,
          schoolId: selectedSchoolId,
          schoolName: schoolName || 'Partner School'
        }),
        ...(selectedRole === 'EMPLOYEE' && {
          companyId: selectedCompanyId,
          companyName: companyName || 'Partner Organization',
          employeeId
        })
      };

      const res = await register(payload);
      setLoading(false);

      if (res.error) {
        setErrorMessage(res.message || res.error);
        return;
      }

      showToast(`Account created successfully! Welcome, ${firstName}.`);

      const redirectPath = selectedRole === 'STUDENT_PARENT'
        ? '/student/store'
        : selectedRole === 'EMPLOYEE'
        ? '/employee/store'
        : '/shop';

      router.push(redirectPath);
    } catch (err: any) {
      setLoading(false);
      setErrorMessage('Registration failed. Please check your information and try again.');
    }
  };

  const publicRoles = [
    { key: 'STUDENT_PARENT' as const, title: 'Student / Parent', desc: 'School uniforms & grade accessories', icon: 'school', badge: 'B2C Institutional' },
    { key: 'GENERAL_CUSTOMER' as const, title: 'General Customer', desc: 'Medical scrubs, footwear & retail', icon: 'shopping_bag', badge: 'Public Retail' },
    { key: 'EMPLOYEE' as const, title: 'Corporate Employee', desc: 'Company workwear & safety PPE', icon: 'badge', badge: 'B2B Enterprise' }
  ];

  return (
    <main className="min-h-[85vh] bg-[#FCFCFB] flex items-center justify-center py-12 px-4 md:px-8 font-sans">
      <div className="max-w-4xl w-full bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-12">

        {/* Left Column: STEP 1 - Selectable Account Type Cards */}
        <div className="md:col-span-4 bg-[#F4F5F7] p-6 border-r border-gray-200 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider bg-[#FF561F] text-white px-2.5 py-1 rounded inline-block mb-3">
              Step 1
            </span>
            <h2 className="text-xl font-black text-[#111827] mb-2">Account Type</h2>
            <p className="text-xs text-gray-500 mb-6 leading-relaxed">
              Select your shopping category to create your account:
            </p>

            <div className="space-y-3" role="radiogroup" aria-label="Select Account Type">
              {publicRoles.map(item => {
                const isSelected = selectedRole === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => handleRoleChange(item.key)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-3.5 focus:outline-none focus:ring-2 focus:ring-[#FF561F]/50 ${
                      isSelected
                        ? 'bg-[#102a43] text-white border-[#102a43] shadow-md scale-[1.01]'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-[#FF561F]/40'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                      isSelected ? 'bg-[#FF561F] text-white' : 'bg-gray-100 text-[#FF561F]'
                    }`}>
                      <span className="material-symbols-outlined text-xl">{item.icon}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-xs truncate">{item.title}</span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {item.badge}
                        </span>
                      </div>
                      <p className={`text-[10px] truncate mt-0.5 ${isSelected ? 'text-slate-300' : 'text-gray-400'}`}>
                        {item.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-4 text-[10px] text-gray-400 text-center border-t border-gray-200 mt-6">
            ShopMyUniform Secure Registration
          </div>
        </div>

        {/* Right Form Section */}
        <div className="md:col-span-8 p-6 md:p-8 flex flex-col justify-between">
          <div>
            <div className="mb-6">
              <span className="text-[11px] font-bold text-[#FF561F] uppercase tracking-wider block mb-1">
                Self-Service Registration
              </span>
              <h1 className="text-2xl font-black text-[#111827]">
                Create {selectedRole === 'STUDENT_PARENT' ? 'Student / Parent' : selectedRole === 'EMPLOYEE' ? 'Corporate Employee' : 'General Customer'} Account
              </h1>
            </div>

            {errorMessage && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-base">error</span>
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              {/* Common Basic Information (Preserved across role switches) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    placeholder="Jane"
                    className="w-full px-4 py-2.5 bg-[#F4F5F7] border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#FF561F]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    placeholder="Sharma"
                    className="w-full px-4 py-2.5 bg-[#F4F5F7] border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#FF561F]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="jane.sharma@example.com"
                    className="w-full px-4 py-2.5 bg-[#F4F5F7] border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#FF561F]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Mobile Phone *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-4 py-2.5 bg-[#F4F5F7] border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#FF561F]"
                  />
                </div>
              </div>

              {/* Data-Driven Student & School Selection */}
              {selectedRole === 'STUDENT_PARENT' && (
                <div className="p-4 bg-orange-50/50 rounded-2xl border border-orange-100 space-y-4">
                  <div className="text-xs font-bold text-[#FF561F] border-b border-orange-100 pb-2">School & Student Details</div>
                  
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Select Your School *</label>
                    <select
                      required
                      value={selectedSchoolId}
                      onChange={e => handleSchoolChange(e.target.value)}
                      className="w-full px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#FF561F] font-semibold text-[#111827]"
                    >
                      <option value="">-- Choose your school --</option>
                      {schoolsList.map(school => (
                        <option key={school.id} value={school.id}>
                          {school.name} ({school.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Student Name *</label>
                      <input
                        type="text"
                        required
                        value={studentName}
                        onChange={e => setStudentName(e.target.value)}
                        placeholder="Aarav Sharma"
                        className="w-full px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#FF561F]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Student Roll / ID *</label>
                      <input
                        type="text"
                        required
                        value={studentId}
                        onChange={e => setStudentId(e.target.value)}
                        placeholder="GWH-2026-7B"
                        className="w-full px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#FF561F]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Data-Driven Corporate Company Selection */}
              {selectedRole === 'EMPLOYEE' && (
                <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 space-y-4">
                  <div className="text-xs font-bold text-emerald-900 border-b border-emerald-100 pb-2">Corporate Organization Details</div>
                  
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Select Your Company / Organization *</label>
                    <select
                      required
                      value={selectedCompanyId}
                      onChange={e => handleCompanyChange(e.target.value)}
                      className="w-full px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-emerald-600 font-semibold text-[#111827]"
                    >
                      <option value="">-- Choose your organization --</option>
                      {companiesList.map(comp => (
                        <option key={comp.id} value={comp.id}>
                          {comp.name} ({comp.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Employee ID *</label>
                    <input
                      type="text"
                      required
                      value={employeeId}
                      onChange={e => setEmployeeId(e.target.value)}
                      placeholder="TN-HYD-4092"
                      className="w-full px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>
              )}

              {/* Password Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Password *</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 bg-[#F4F5F7] border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#FF561F]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Confirm Password *</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 bg-[#F4F5F7] border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#FF561F]"
                  />
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={agreedTerms}
                    onChange={e => setAgreedTerms(e.target.checked)}
                    className="rounded text-[#FF561F] focus:ring-[#FF561F]"
                  />
                  <label htmlFor="terms" className="text-xs text-gray-600">
                    I agree to the Terms & Conditions and Privacy Policy
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#FF561F] hover:bg-[#E64A1A] text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-lg shadow-[#FF561F]/20 text-xs flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <span>Creating Account...</span>
                ) : (
                  <>
                    <span>Create {selectedRole === 'STUDENT_PARENT' ? 'Student / Parent' : selectedRole === 'EMPLOYEE' ? 'Corporate Employee' : 'Customer'} Account</span>
                    <span className="material-symbols-outlined text-base">arrow_forward</span>
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="mt-6 text-center text-xs text-gray-500">
            Already have an account?{' '}
            <Link href={`/auth/login?role=${selectedRole === 'STUDENT_PARENT' ? 'student' : selectedRole === 'EMPLOYEE' ? 'employee' : 'general'}`} className="font-bold text-[#FF561F] hover:underline">
              Sign In Instead
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-xs font-bold text-gray-400">Loading Registration...</div>}>
      <SignupContent />
    </Suspense>
  );
}
