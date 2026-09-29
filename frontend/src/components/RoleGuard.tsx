'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

export default function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const pathname = usePathname();
  const { user } = useApp();

  // If unauthenticated, prompt user to sign in
  if (!user) {
    return (
      <main className="flex-1 min-h-[70vh] flex items-center justify-center p-6 bg-[#FCFCFB] font-sans">
        <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-xl max-w-md w-full text-center">
          <div className="w-16 h-16 bg-orange-50 text-[#FF561F] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-orange-100">
            <span className="material-symbols-outlined text-3xl">lock</span>
          </div>

          <span className="text-[10px] font-extrabold uppercase tracking-wider bg-[#FF561F] text-white px-2.5 py-1 rounded">
            Sign In Required
          </span>

          <h1 className="text-xl font-black text-[#102a43] mt-3 mb-2">Authentication Required</h1>
          <p className="text-xs text-gray-500 mb-6 leading-relaxed">
            Please sign in to access your authorized portal.
          </p>

          <Link
            href={`/auth/login?returnUrl=${encodeURIComponent(pathname)}`}
            className="w-full bg-[#FF561F] hover:bg-[#E64A1A] text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-xs"
          >
            <span className="material-symbols-outlined text-base">login</span>
            <span>Sign In to Continue</span>
          </Link>
        </div>
      </main>
    );
  }

  // Authoritative check against user's PostgreSQL database role
  const isAuthorized = allowedRoles.includes(user.role);

  if (!isAuthorized) {
    const roleRedirects: Record<UserRole, { path: string; label: string }> = {
      STUDENT_PARENT: { path: '/student/store', label: 'Go to Student / Parent Store' },
      GENERAL_CUSTOMER: { path: '/shop', label: 'Go to General Shop' },
      EMPLOYEE: { path: '/employee/store', label: 'Go to Corporate Store' },
      SCHOOL_ADMIN: { path: '/school-admin/dashboard', label: 'Go to School Admin Portal' },
      INTERNAL_ADMIN: { path: '/admin/dashboard', label: 'Go to Master Admin Dashboard' },
      VENDOR: { path: '/vendor/dashboard', label: 'Go to Vendor Operations Portal' },
      WAREHOUSE: { path: '/operations/dashboard', label: 'Go to Logistics Station' }
    };

    const targetRedirect = roleRedirects[user.role] || { path: '/shop', label: 'Go to Shopping Portal' };

    return (
      <main className="flex-1 min-h-[70vh] flex items-center justify-center p-6 bg-[#FCFCFB] font-sans">
        <div className="bg-white rounded-3xl p-8 border border-red-200 shadow-xl max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-100">
            <span className="material-symbols-outlined text-3xl">gpp_maybe</span>
          </div>

          <span className="text-[10px] font-extrabold uppercase tracking-wider bg-red-100 text-red-800 px-3 py-1 rounded border border-red-200">
            403 Forbidden Access
          </span>

          <h1 className="text-xl font-black text-[#102a43] mt-3 mb-2">Restricted Portal Route</h1>
          <p className="text-xs text-gray-500 mb-6 leading-relaxed">
            Your account (<span className="font-bold text-[#102a43]">{user.email}</span>) is registered as{' '}
            <span className="font-bold text-[#FF561F]">{user.role.replace('_', ' ')}</span> and does not have permission to access this route.
          </p>

          <Link
            href={targetRedirect.path}
            className="w-full bg-[#FF561F] hover:bg-[#E64A1A] text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-xs"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
            <span>{targetRedirect.label}</span>
          </Link>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}
