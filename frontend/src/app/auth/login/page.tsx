'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useApp } from '../../../context/AppContext';
import { UserRole } from '../../../types';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl');
  const queryRole = searchParams.get('role');
  const oauthToken = searchParams.get('token');
  const oauthUserStr = searchParams.get('user');

  const { login, showToast, setAuthSession } = useApp();

  const roleCardData: { role: UserRole; slug: string; title: string; defaultEmail: string; desc: string; icon: string; badge: string }[] = [
    { role: 'STUDENT_PARENT', slug: 'student', title: 'Student / Parent', defaultEmail: 'student.parent@test.shopmyuniform.com', desc: 'School uniform stores, grade filters & size exchange requests.', icon: 'school', badge: 'B2C Institutional' },
    { role: 'GENERAL_CUSTOMER', slug: 'general', title: 'General Customer', defaultEmail: 'customer@test.shopmyuniform.com', desc: 'Public catalog for scrubs, chef wear, safety boots & accessories.', icon: 'shopping_bag', badge: 'Public Retail' },
    { role: 'EMPLOYEE', slug: 'employee', title: 'Corporate Employee', defaultEmail: 'employee@test.shopmyuniform.com', desc: 'Company workwear, safety PPE & team embroidery orders.', icon: 'badge', badge: 'B2B Enterprise' }
  ];

  // Map incoming URL query param to valid UserRole
  const normalizeRole = (param: string | null): UserRole => {
    if (!param) return 'STUDENT_PARENT';
    const lower = param.toLowerCase();
    if (lower.includes('employee')) return 'EMPLOYEE';
    if (lower.includes('general') || lower.includes('customer')) return 'GENERAL_CUSTOMER';
    if (lower.includes('student') || lower.includes('parent')) return 'STUDENT_PARENT';
    return 'STUDENT_PARENT';
  };

  const selectedRole = normalizeRole(queryRole);
  const currentRoleInfo = roleCardData.find(r => r.role === selectedRole) || roleCardData[0];

  const [email, setEmail] = useState(currentRoleInfo.defaultEmail);
  const [password, setPassword] = useState('Password123!');
  const [userHasCustomizedEmail, setUserHasCustomizedEmail] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync email & password when selectedRole changes, unless user manually edited email
  useEffect(() => {
    if (!userHasCustomizedEmail) {
      setEmail(currentRoleInfo.defaultEmail);
      setPassword('Password123!');
    }
  }, [selectedRole, currentRoleInfo, userHasCustomizedEmail]);

  // Handle Google OAuth callback parameters if returning from backend redirect
  useEffect(() => {
    if (oauthToken && oauthUserStr) {
      try {
        const parsedUser = JSON.parse(oauthUserStr);
        setAuthSession(oauthToken, parsedUser);
        showToast(`Welcome ${parsedUser.firstName || 'User'}! Authenticated via Google.`);
        const roleRedirects: Record<string, string> = {
          STUDENT_PARENT: '/student/store',
          GENERAL_CUSTOMER: '/shop',
          EMPLOYEE: '/employee/store',
          SCHOOL_ADMIN: '/school-admin/dashboard',
          INTERNAL_ADMIN: '/admin/dashboard',
          VENDOR: '/vendor/dashboard',
          WAREHOUSE: '/operations/dashboard'
        };
        router.push(returnUrl || roleRedirects[parsedUser.role] || '/shop');
      } catch (err) {
        console.error('Failed to parse OAuth return user:', err);
      }
    }
  }, [oauthToken, oauthUserStr, returnUrl, router, showToast, setAuthSession]);

  const handleCardClick = () => {
    setUserHasCustomizedEmail(false);
    setErrorMessage(null);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const res = await login(email, password, selectedRole);
      setLoading(false);

      if (res.error) {
        setErrorMessage(res.message || res.error);
        return;
      }

      if (res.user) {
        const actualRole = res.user.role;
        const roleRedirects: Record<string, string> = {
          STUDENT_PARENT: '/student/store',
          GENERAL_CUSTOMER: '/shop',
          EMPLOYEE: '/employee/store',
          SCHOOL_ADMIN: '/school-admin/dashboard',
          INTERNAL_ADMIN: '/admin/dashboard',
          VENDOR: '/vendor/dashboard',
          WAREHOUSE: '/operations/dashboard'
        };

        const targetPath = returnUrl || roleRedirects[actualRole] || '/shop';
        router.push(targetPath);
      }
    } catch (err: any) {
      setLoading(false);
      setErrorMessage('Login failed. Please verify your credentials and try again.');
    }
  };

  const handleGoogleSignIn = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
    window.location.href = `${apiUrl}/auth/google?role=${selectedRole}`;
  };

  return (
    <main className="min-h-[85vh] bg-[#FCFCFB] flex items-center justify-center py-12 px-4 md:px-8 font-sans">
      <div className="max-w-4xl w-full bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">

        {/* Left Column: STEP 1 - Selectable Account Type Cards */}
        <div className="lg:col-span-5 bg-[#F4F5F7] p-6 md:p-8 border-r border-gray-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-extrabold uppercase tracking-wider bg-[#FF561F] text-white px-2.5 py-1 rounded">
                Step 1
              </span>
              <span className="text-[11px] font-bold text-gray-500">Select Access Role</span>
            </div>

            <h2 className="text-xl font-black text-[#111827] mb-2">Choose Your Portal</h2>
            <p className="text-xs text-gray-500 mb-6 leading-relaxed">
              Select your account type to configure shopping portal permissions:
            </p>

            <div className="space-y-3" role="radiogroup" aria-label="Select Account Type">
              {roleCardData.map(item => {
                const isSelected = selectedRole === item.role;
                return (
                  <Link
                    key={item.role}
                    href={`/auth/login?role=${item.slug}`}
                    scroll={false}
                    onClick={handleCardClick}
                    className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-3.5 focus:outline-none focus:ring-2 focus:ring-[#FF561F]/50 block ${
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
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="pt-4 text-[10px] text-gray-400 text-center border-t border-gray-200 mt-6">
            ShopMyUniform Secure Sign In
          </div>
        </div>

        {/* Right Column: Dynamic Form Section */}
        <div className="lg:col-span-7 p-6 md:p-10 flex flex-col justify-between bg-white">
          <div>
            <div className="mb-6">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#FF561F] block mb-1">
                Portal Authentication
              </span>
              <h1 className="text-2xl font-black text-[#111827]">Sign In to ShopMyUniform</h1>
              <p className="text-xs text-gray-500 mt-1">
                Authenticating for <span className="font-bold text-[#102a43]">{currentRoleInfo.title}</span>
              </p>
            </div>

            {returnUrl && (
              <div className="mb-4 bg-amber-50 border border-amber-200 text-amber-800 px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2">
                <span className="material-symbols-outlined text-base text-amber-600">info</span>
                <span>Sign in required to continue with your selected product.</span>
              </div>
            )}

            {errorMessage && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-base">error</span>
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Google Sign-In Hyperlink */}
            <div className="mb-6">
              <a
                href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/auth/google?role=${selectedRole}`}
                className="w-full bg-white hover:bg-gray-50 text-gray-700 font-bold py-3 px-4 rounded-xl border-2 border-gray-200 hover:border-gray-300 transition-all flex items-center justify-center gap-3 text-xs shadow-sm cursor-pointer block text-center"
              >
                <svg className="w-5 h-5 inline-block" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.15C3.26 21.3 7.35 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.28 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.39l3.99-3.15z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.7 1.29 6.61l3.99 3.15c.95-2.85 3.6-4.96 6.72-4.96z"/>
                </svg>
                <span>Continue with Google ({currentRoleInfo.title})</span>
              </a>

              <div className="flex items-center my-4">
                <div className="flex-1 border-t border-gray-200"></div>
                <span className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">or with credentials</span>
                <div className="flex-1 border-t border-gray-200"></div>
              </div>
            </div>

            {/* Email / Password Credentials Form */}
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Email Address</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">mail</span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => {
                      setEmail(e.target.value);
                      setUserHasCustomizedEmail(true);
                    }}
                    placeholder={currentRoleInfo.defaultEmail}
                    className="w-full pl-10 pr-4 py-3 bg-[#F4F5F7] border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#FF561F] transition-all font-medium text-[#111827]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">lock</span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 bg-[#F4F5F7] border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#FF561F] transition-all font-medium text-[#111827]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <span className="material-symbols-outlined text-lg">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Dynamic Sign In Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#FF561F] hover:bg-[#E64A1A] text-[#ffffff] font-bold py-3.5 px-4 rounded-xl transition-all shadow-lg shadow-[#FF561F]/20 text-xs flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
              >
                {loading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-base">login</span>
                    <span>Sign in as {currentRoleInfo.title}</span>
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="mt-8 text-center text-xs text-gray-500 pt-4 border-t border-gray-100">
            Don't have an account?{' '}
            <Link href={`/auth/signup?role=${currentRoleInfo.slug}`} className="font-bold text-[#FF561F] hover:underline">
              Create New Account
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-xs font-bold text-gray-400">Loading Sign In...</div>}>
      <LoginContent />
    </Suspense>
  );
}
