'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '../context/AppContext';

export function ShopMyUniformLogo({ isDark = false }: { isDark?: boolean }) {
  return (
    <div className="flex flex-col text-left leading-none select-none py-0.5">
      <div className="text-[22px] font-black tracking-tight font-sans">
        <span className="text-[#FF561F]">Shop</span>
        <span className={isDark ? 'text-white' : 'text-[#102a43]'}>My</span>
        <span className="text-[#FF561F]">Uniform</span>
      </div>
      <span className={`text-[8.5px] font-extrabold uppercase tracking-widest mt-0.5 ${isDark ? 'text-slate-400' : 'text-gray-400'}`}>
        Enterprise Marketplace
      </span>
    </div>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout, activeSchool, activeCompany, cartCount, childrenList, activeChild, setActiveChild } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isAuthPage = pathname.startsWith('/auth');
  const isCheckoutPage = pathname.startsWith('/shop/checkout');
  const isOperationalPortal =
    pathname.startsWith('/admin') ||
    pathname.startsWith('/vendor') ||
    pathname.startsWith('/operations') ||
    pathname.startsWith('/school-admin') ||
    pathname.startsWith('/superadmin') ||
    pathname.startsWith('/masteradmin') ||
    pathname.startsWith('/logistics');

  // Dynamic context-aware Home path
  let homePath = '/';
  if (mounted && user) {
    if (user.role === 'STUDENT_PARENT') homePath = '/student/store';
    else if (user.role === 'EMPLOYEE') homePath = '/employee/store';
    else if (user.role === 'SCHOOL_ADMIN') homePath = '/school-admin/dashboard';
    else if (user.role === 'INTERNAL_ADMIN') homePath = '/admin/dashboard';
    else if (user.role === 'VENDOR') homePath = '/vendor/dashboard';
    else if (user.role === 'WAREHOUSE') homePath = '/operations/dashboard';
    else if (user.role === 'GENERAL_CUSTOMER') homePath = '/shop';
  }

  // 1. MINIMAL AUTHENTICATION HEADER FOR /auth/login AND /auth/signup
  if (isAuthPage) {
    return (
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 font-sans shadow-sm">
        <div className="max-w-container-max mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <ShopMyUniformLogo />
          </Link>

          <Link
            href="/"
            className="text-xs font-bold text-[#FF561F] hover:text-[#E64A1A] flex items-center gap-1 bg-[#FF561F]/10 hover:bg-[#FF561F]/20 px-4 py-2 rounded-xl transition-all"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            <span>Back to ShopMyUniform</span>
          </Link>
        </div>
      </header>
    );
  }

  // 2. CHECKOUT HEADER
  if (isCheckoutPage) {
    return (
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 font-sans shadow-sm">
        <div className="max-w-container-max mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <Link href={homePath} className="flex items-center gap-2 group shrink-0">
            <ShopMyUniformLogo />
          </Link>

          <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
            <span className="material-symbols-outlined text-emerald-600 text-sm">lock</span>
            <span>256-Bit SSL Encrypted Checkout</span>
          </div>
        </div>
      </header>
    );
  }

  // 3. OPERATIONAL PORTAL HEADER (For Internal Admins, Vendors, School Admins, Warehouse)
  if (isOperationalPortal) {
    return (
      <header className="bg-[#102a43] text-white border-b border-slate-700 sticky top-0 z-50 font-sans shadow-md">
        <div className="max-w-container-max mx-auto px-4 md:px-8 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href={homePath} className="flex items-center gap-2 group shrink-0">
              <ShopMyUniformLogo isDark={true} />
            </Link>
            <span className="bg-amber-400/20 text-amber-300 font-extrabold text-[10px] uppercase px-2.5 py-0.5 rounded tracking-wider border border-amber-400/30">
              Operations Portal
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={homePath}
              className="text-xs font-bold text-slate-300 hover:text-white flex items-center gap-1 bg-white/10 px-3 py-1.5 rounded-lg transition-colors"
            >
              <span className="material-symbols-outlined text-sm">storefront</span>
              <span>Back to Portal Home</span>
            </Link>

            {mounted && user && (
              <button
                onClick={logout}
                className="text-xs font-bold text-red-300 hover:text-white flex items-center gap-1 bg-red-500/20 hover:bg-red-500/40 px-3 py-1.5 rounded-lg transition-colors border border-red-500/30"
              >
                <span className="material-symbols-outlined text-sm">logout</span>
                <span>Sign Out</span>
              </button>
            )}
          </div>
        </div>
      </header>
    );
  }

  // 4. ROLE-BASED NAVIGATION ITEMS
  const isHomePage = pathname === '/';

  // Dedicated Student/Parent Navigation (Strictly excludes Corporate, Retail Marketplace & Bulk Quotes)
  const studentNavItems = [
    { label: 'School Store', path: '/student/store', icon: 'school' },
    { label: 'Find / Change School', path: '/student/find-school', icon: 'explore' },
    { label: 'Saved Wishlist', path: '/wishlist', icon: 'favorite' },
    { label: 'Shopping Cart', path: '/shop/cart', icon: 'shopping_cart' },
    { label: 'My Orders & Tracking', path: '/shop/orders', icon: 'package_2' },
    { label: 'Manage Children', path: '/account', icon: 'face' }
  ];

  // Corporate Employee Navigation
  const employeeNavItems = [
    { label: 'Corporate Store', path: '/employee/store', icon: 'badge' },
    { label: 'Saved Wishlist', path: '/wishlist', icon: 'favorite' },
    { label: 'Shopping Cart', path: '/shop/cart', icon: 'shopping_cart' },
    { label: 'My Orders & Tracking', path: '/shop/orders', icon: 'package_2' }
  ];

  // Public / Unauthenticated Navigation
  const publicNavItems = [
    { label: 'Home', path: '/' },
    { label: 'School Stores (B2C)', path: '/student/find-school' },
    { label: 'Public Retail Catalog', path: '/shop' },
    { label: 'Corporate Workwear (B2B)', path: '/employee/store' },
    { label: 'Bulk Institutional Quote', path: '/quote' },
    { label: 'Track Order', path: '/orders' }
  ];

  // Student navigation lives in the student account menu, keeping the school
  // storefront header focused on the active school and child.
  const currentNavItems = (mounted && user?.role === 'STUDENT_PARENT')
    ? []
    : (mounted && user?.role === 'EMPLOYEE')
    ? employeeNavItems
    : publicNavItems;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    if (mounted && user?.role === 'STUDENT_PARENT') {
      window.location.href = `/student/store?search=${encodeURIComponent(searchQuery.trim())}`;
    } else {
      window.location.href = `/shop?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm font-sans">
      {/* Top Notice Banner */}
      <div className="bg-[#102a43] text-white text-xs py-1.5 px-4 text-center flex items-center justify-center gap-2">
        <span className="bg-[#FF561F] text-white font-bold px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider">
          {mounted && user?.role === 'STUDENT_PARENT' ? 'Student / Parent Portal' : 'Enterprise Platform'}
        </span>
        <span>
          {mounted && user?.role === 'STUDENT_PARENT'
            ? `${activeSchool?.name || activeChild?.schoolName || 'Official School Uniform Store'}`
            : 'ShopMyUniform Multi-Vertical Marketplace'}
        </span>
        <span className="hidden md:inline text-gray-400">
          | {mounted && user?.role === 'STUDENT_PARENT' ? 'Verified Institutional Apparel' : 'Standardized B2C & B2B Institutional Uniforms'}
        </span>
      </div>

      <div className="max-w-container-max mx-auto px-4 md:px-8 py-3.5 flex items-center justify-between gap-4">
        {/* Brand Logo - Routes to Student Store when logged in as Student/Parent */}
        <Link href={homePath} className="flex items-center gap-2 group shrink-0">
          <ShopMyUniformLogo />
        </Link>

        {/* Center Search Input */}
        <div className="hidden lg:flex items-center gap-3 flex-1 max-w-xl">
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl">search</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={mounted && user?.role === 'STUDENT_PARENT'
                ? `Search ${activeSchool?.name?.split(' ')[0] || 'school'} shirts, skirts, blazers, PE gear...`
                : 'Search scrubs, school uniforms, workwear or SKUs...'}
              className="w-full pl-10 pr-4 py-2 bg-[#F4F5F7] border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#FF561F] focus:ring-1 focus:ring-[#FF561F] transition-all"
            />
          </form>

          {/* Active Child & School Selector for Student/Parent */}
          {mounted && user && user.role === 'STUDENT_PARENT' && childrenList.length > 0 && (
            <div className="relative group">
              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-900 rounded-lg border border-blue-200 text-xs font-semibold whitespace-nowrap hover:bg-blue-100 transition-colors">
                <span className="material-symbols-outlined text-sm text-blue-600">face</span>
                <span>{activeChild ? `${activeChild.name} (${activeChild.schoolName || activeSchool?.name || 'School'})` : 'Select Child'}</span>
                {childrenList.length > 1 && <span className="material-symbols-outlined text-xs">expand_more</span>}
              </button>
              {childrenList.length > 1 && (
                <div className="absolute left-0 mt-1 w-64 bg-white border border-gray-200 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-2 z-50">
                  <div className="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 mb-1">
                    Select Child Context
                  </div>
                  {childrenList.map((child) => (
                    <button
                      key={child.id}
                      type="button"
                      onClick={() => setActiveChild(child)}
                      className={`w-full text-left px-4 py-2 text-xs font-bold flex items-center justify-between transition-colors ${
                        activeChild?.id === child.id ? 'bg-orange-50 text-[#FF561F]' : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <div>
                        <div>{child.name}</div>
                        <div className="text-[10px] text-gray-400 font-normal">{child.schoolName || 'School'} ({child.grade})</div>
                      </div>
                      {activeChild?.id === child.id && (
                        <span className="material-symbols-outlined text-sm text-[#FF561F]">check</span>
                      )}
                    </button>
                  ))}
                  <div className="border-t border-gray-100 mt-1 pt-1 px-3">
                    <Link
                      href="/student/store"
                      className="text-[10px] font-bold text-[#FF561F] hover:underline flex items-center gap-1 py-1"
                    >
                      <span className="material-symbols-outlined text-xs">add</span>
                      <span>Manage / Add Children</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeCompany && !activeSchool && (!user || user.role !== 'STUDENT_PARENT') && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200 text-xs font-semibold whitespace-nowrap">
              <span className="material-symbols-outlined text-sm text-emerald-600">badge</span>
              <span>{activeCompany.name}</span>
            </div>
          )}
        </div>

        {/* Right Navigation Actions */}
        <div className="flex items-center gap-3">
          {/* Cart Icon */}
          <Link
            href="/shop/cart"
            className="relative p-2 text-gray-700 hover:text-[#FF561F] hover:bg-gray-100 rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined text-2xl">shopping_cart</span>
            {mounted && cartCount > 0 && (
              <span className="absolute top-1 right-1 bg-[#FF561F] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                {cartCount}
              </span>
            )}
          </Link>

          {mounted && user ? (
            /* Authenticated User Header Dropdown */
            <div className="relative group">
              <button
                type="button"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 bg-[#F4F5F7] hover:bg-gray-200 rounded-xl border border-gray-200 transition-all text-left shadow-sm focus:outline-none"
              >
                <div className="w-7 h-7 rounded-full bg-[#102a43] text-white flex items-center justify-center text-xs font-black shadow-sm">
                  {user.firstName ? user.firstName[0].toUpperCase() : 'U'}
                </div>
                <div className="leading-tight text-left">
                  <div className="text-xs font-black text-[#111827]">{user.firstName} {user.lastName}</div>
                  <div className="text-[9px] font-bold text-[#FF561F] uppercase tracking-wide">{user.role.replace('_', ' ')}</div>
                </div>
                <span className="material-symbols-outlined text-xs text-gray-500">expand_more</span>
              </button>

              {/* User Account Dropdown Menu */}
              <div className={`absolute right-0 mt-1 w-60 bg-white border border-gray-200 rounded-2xl shadow-2xl transition-all duration-200 py-2 z-50 ${
                isUserMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible group-hover:opacity-100 group-hover:visible'
              }`}>
                <div className="px-4 py-3 border-b border-gray-100 mb-1 bg-gray-50/50 rounded-t-2xl">
                  <div className="text-xs font-black text-[#111827]">{user.firstName} {user.lastName}</div>
                  <div className="text-[11px] text-gray-500 font-medium truncate mt-0.5">{user.email}</div>
                  <span className="inline-block mt-1.5 text-[9px] font-extrabold px-2 py-0.5 bg-[#FF561F]/10 text-[#FF561F] border border-[#FF561F]/20 rounded-md uppercase">
                    {user.role.replace('_', ' ')}
                  </span>
                </div>

                <Link
                  href="/account"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="px-4 py-2.5 hover:bg-gray-50 text-xs font-bold text-[#111827] flex items-center gap-2.5 transition-colors"
                >
                  <span className="material-symbols-outlined text-base text-[#FF561F]">account_circle</span>
                  <span>Account Dashboard</span>
                </Link>

                <Link
                  href="/shop/orders"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="px-4 py-2.5 hover:bg-gray-50 text-xs font-bold text-[#111827] flex items-center gap-2.5 transition-colors"
                >
                  <span className="material-symbols-outlined text-base text-blue-600">receipt_long</span>
                  <span>My Orders & Tracking</span>
                </Link>

                <Link
                  href="/wishlist"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="px-4 py-2.5 hover:bg-gray-50 text-xs font-bold text-[#111827] flex items-center gap-2.5 transition-colors"
                >
                  <span className="material-symbols-outlined text-base text-emerald-600">favorite</span>
                  <span>Saved Wishlist</span>
                </Link>

                {user.role === 'STUDENT_PARENT' && (
                  <>
                    <div className="border-t border-gray-100 my-1" />
                    <div className="px-4 py-1 text-[9px] font-extrabold text-gray-400 uppercase tracking-wider">
                      Student portal
                    </div>
                    <Link
                      href="/student/store"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="px-4 py-2.5 hover:bg-gray-50 text-xs font-bold text-[#111827] flex items-center gap-2.5 transition-colors"
                    >
                      <span className="material-symbols-outlined text-base text-amber-500">school</span>
                      <span>School Uniform Store</span>
                    </Link>
                    <Link
                      href="/student/find-school"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="px-4 py-2.5 hover:bg-gray-50 text-xs font-bold text-[#111827] flex items-center gap-2.5 transition-colors"
                    >
                      <span className="material-symbols-outlined text-base text-blue-600">explore</span>
                      <span>Find / Change School</span>
                    </Link>
                    <Link
                      href="/shop/cart"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="px-4 py-2.5 hover:bg-gray-50 text-xs font-bold text-[#111827] flex items-center gap-2.5 transition-colors"
                    >
                      <span className="material-symbols-outlined text-base text-[#FF561F]">shopping_cart</span>
                      <span>Shopping Cart</span>
                    </Link>
                    <Link
                      href="/account"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="px-4 py-2.5 hover:bg-gray-50 text-xs font-bold text-[#111827] flex items-center gap-2.5 transition-colors"
                    >
                      <span className="material-symbols-outlined text-base text-purple-600">face</span>
                      <span>Manage Children</span>
                    </Link>
                  </>
                )}

                <div className="border-t border-gray-100 my-1"></div>

                <button
                  type="button"
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    logout();
                  }}
                  className="w-full text-left px-4 py-2.5 hover:bg-red-50 text-xs font-bold text-red-600 flex items-center gap-2.5 transition-colors"
                >
                  <span className="material-symbols-outlined text-base">logout</span>
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          ) : (
            /* Public Sign In Button */
            <div className="relative group">
              <Link
                href="/auth/login"
                className="flex items-center gap-1.5 px-4 py-2 bg-[#FF561F] text-white hover:bg-[#E64A1A] rounded-xl text-xs font-bold transition-all shadow-md"
              >
                <span className="material-symbols-outlined text-base">account_circle</span>
                <span>Account / Sign In</span>
                <span className="material-symbols-outlined text-xs">expand_more</span>
              </Link>

              {/* Hover Dropdown with 3 Account Type Options */}
              <div className="absolute right-0 mt-1 w-56 bg-white border border-gray-200 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-2 z-50">
                <div className="px-4 py-1.5 text-[10px] font-extrabold text-gray-400 uppercase tracking-wider border-b border-gray-100 mb-1">
                  Select Access Role
                </div>
                <Link
                  href="/auth/login?role=student"
                  className="px-4 py-2.5 hover:bg-orange-50 text-xs font-bold text-[#111827] hover:text-[#FF561F] flex items-center gap-2.5 transition-colors"
                >
                  <span className="material-symbols-outlined text-base text-[#FF561F]">school</span>
                  <span>Student / Parent</span>
                </Link>
                <Link
                  href="/auth/login?role=general"
                  className="px-4 py-2.5 hover:bg-blue-50 text-xs font-bold text-[#111827] hover:text-[#FF561F] flex items-center gap-2.5 transition-colors"
                >
                  <span className="material-symbols-outlined text-base text-blue-600">shopping_bag</span>
                  <span>General Customer</span>
                </Link>
                <Link
                  href="/auth/login?role=employee"
                  className="px-4 py-2.5 hover:bg-emerald-50 text-xs font-bold text-[#111827] hover:text-[#FF561F] flex items-center gap-2.5 transition-colors"
                >
                  <span className="material-symbols-outlined text-base text-emerald-600">badge</span>
                  <span>Corporate Employee</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Clean Navigation Bar - Hidden on Landing Page for Public, Visible in Portals */}
      {(!isHomePage || (mounted && user)) && currentNavItems.length > 0 && (
        <nav className="bg-[#FCFCFB] border-t border-gray-200 px-4 md:px-8 py-2 overflow-x-auto">
          <div className="max-w-container-max mx-auto flex items-center gap-6 text-xs font-semibold text-gray-700 whitespace-nowrap">
            {currentNavItems.map((item) => {
              const isActive = pathname === item.path || (item.path !== '/' && item.path !== '/student/store' && pathname.startsWith(item.path));
              const isStoreActive = item.path === '/student/store' && (pathname === '/student/store' || pathname.startsWith('/student/products'));
              const highlight = isActive || isStoreActive;

              return (
                <Link
                  key={item.label}
                  href={item.path}
                  className={`pb-1 transition-all flex items-center gap-1.5 border-b-2 ${
                    highlight
                      ? 'border-[#FF561F] text-[#FF561F] font-bold'
                      : 'border-transparent hover:text-[#FF561F] hover:border-[#FF561F]/40'
                  }`}
                >
                  {(item as any).icon && (
                    <span className="material-symbols-outlined text-sm">{(item as any).icon}</span>
                  )}
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </header>
  );
}
