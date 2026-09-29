'use client';

import React, { useState, useEffect } from 'react';
import RoleGuard from '@/components/RoleGuard';
import Sidebar from '@/components/Sidebar';
import { useApp } from '@/context/AppContext';
import { fetchSchoolAdminMetrics } from '@/services/api';

export default function SchoolAdminDashboardPage() {
  const { activeSchool } = useApp();
  const [metrics, setMetrics] = useState<any>({
    schoolName: activeSchool?.name || 'Partner School Campus',
    totalOrders: 142,
    deliveredOrders: 128,
    grossRevenue: 32450.00,
    totalStudents: 1250,
    recentOrders: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSchoolAdminMetrics(activeSchool?.id)
      .then(data => {
        if (data && !data.error) {
          setMetrics(data);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [activeSchool]);

  return (
    <RoleGuard allowedRoles={['SCHOOL_ADMIN', 'INTERNAL_ADMIN']}>
      <div className="flex-1 flex bg-[#FAFAFA] font-sans">
        <Sidebar />
        <main className="flex-1 p-6 md:p-8">
          <div className="mb-6">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-800 px-2.5 py-0.5 rounded">
              School B2B Admin (/school-admin/dashboard)
            </span>
            <h1 className="text-2xl font-bold text-[#102a43] mt-1">{metrics.schoolName}</h1>
            <p className="text-xs text-gray-500">Catalog Margins, Student Roster & Parent Communication</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-5 mb-8">
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
              <span className="text-xs font-bold text-gray-400">Total School Orders</span>
              <div className="text-2xl font-black text-[#102a43]">{loading ? '...' : metrics.totalOrders}</div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
              <span className="text-xs font-bold text-gray-400">Delivered Orders</span>
              <div className="text-2xl font-black text-emerald-600">{loading ? '...' : metrics.deliveredOrders}</div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
              <span className="text-xs font-bold text-gray-400">Gross School Revenue</span>
              <div className="text-2xl font-black text-[#FF561F]">₹{loading ? '...' : metrics.grossRevenue?.toLocaleString('en-IN')}</div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
              <span className="text-xs font-bold text-gray-400">Active Students</span>
              <div className="text-2xl font-black text-blue-600">{loading ? '...' : metrics.totalStudents}</div>
            </div>
          </div>
        </main>
      </div>
    </RoleGuard>
  );
}
