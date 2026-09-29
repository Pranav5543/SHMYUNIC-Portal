'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';

export default function Sidebar() {
  const pathname = usePathname();
  const { role } = useApp();

  const menuByRole: Record<UserRole, { label: string; icon: string; path: string }[]> = {
    SCHOOL_ADMIN: [
      { label: 'Dashboard', icon: 'dashboard', path: '/school-admin/dashboard' },
      { label: 'School Store', icon: 'storefront', path: '/student/store' },
      { label: 'Catalog & Margins', icon: 'inventory_2', path: '/school-admin/catalog' },
      { label: 'Orders Stream', icon: 'receipt_long', path: '/school-admin/orders' },
      { label: 'Reports', icon: 'analytics', path: '/school-admin/reports' }
    ],
    INTERNAL_ADMIN: [
      { label: 'Master Executive', icon: 'space_dashboard', path: '/admin/dashboard' },
      { label: 'Cross-Platform Orders', icon: 'orders', path: '/admin/orders' },
      { label: 'AI Operations & Insights', icon: 'psychology', path: '/admin/ai-insights' },
      { label: 'Inventory Control', icon: 'boxes', path: '/operations/inventory' },
      { label: 'Pick & Pack Station', icon: 'fact_check', path: '/operations/pick-pack' }
    ],
    VENDOR: [
      { label: 'Manufacturing Dashboard', icon: 'factory', path: '/vendor/dashboard' },
      { label: 'Purchase Orders', icon: 'description', path: '/vendor/orders' },
      { label: 'Products & Bids', icon: 'inventory', path: '/vendor/products' }
    ],
    WAREHOUSE: [
      { label: 'Fulfillment Operations', icon: 'inventory_2', path: '/operations/dashboard' },
      { label: 'Pick & Pack Station', icon: 'fact_check', path: '/operations/pick-pack' },
      { label: 'Stock & Bin Inventory', icon: 'warehouse', path: '/operations/inventory' }
    ],
    STUDENT_PARENT: [],
    GENERAL_CUSTOMER: [],
    EMPLOYEE: []
  };

  const navList = menuByRole[role] || [];

  if (navList.length === 0) return null;

  return (
    <aside className="w-64 bg-[#102a43] text-white flex flex-col justify-between shrink-0 min-h-[calc(100vh-100px)] border-r border-slate-800 p-4">
      <div>
        <div className="px-3 py-2 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-4">
          Portal Control Menu ({role.replace('_', ' ')})
        </div>

        <nav className="space-y-1">
          {navList.map(item => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.label}
                href={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-[#FF561F] text-white shadow-md font-bold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="pt-4 border-t border-slate-800 text-[10px] text-slate-400 text-center">
        ShopMyUniform RBAC Security Enforced
      </div>
    </aside>
  );
}
