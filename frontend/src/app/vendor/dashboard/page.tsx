'use client';

import React, { useState, useEffect } from 'react';
import RoleGuard from '@/components/RoleGuard';
import Sidebar from '@/components/Sidebar';
import { fetchVendorPurchaseOrders } from '@/services/api';

export default function VendorDashboardPage() {
  const [data, setData] = useState<any>({
    vendorName: 'StitchCraft Apparel Mills',
    capacityPerMonth: 25000,
    activePOsCount: 14,
    totalContractValue: 128450.00,
    purchaseOrders: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVendorPurchaseOrders()
      .then(res => {
        if (res && !res.error) {
          setData(res);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <RoleGuard allowedRoles={['VENDOR', 'INTERNAL_ADMIN']}>
      <div className="flex-1 flex bg-[#FAFAFA] font-sans">
        <Sidebar />
        <main className="flex-1 p-6 md:p-8">
          <div className="mb-6">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded">
              Vendor Manufacturing Portal (/vendor/dashboard)
            </span>
            <h1 className="text-2xl font-bold text-[#102a43] mt-1">{data.vendorName}</h1>
            <p className="text-xs text-gray-500">Purchase Orders, RFQs & Production Tracking</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
              <span className="text-xs font-bold text-gray-400">Active POs</span>
              <div className="text-2xl font-black text-[#102a43]">{loading ? '...' : data.activePOsCount}</div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
              <span className="text-xs font-bold text-gray-400">Monthly Capacity</span>
              <div className="text-2xl font-black text-emerald-600">{loading ? '...' : data.capacityPerMonth?.toLocaleString('en-IN')} units</div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
              <span className="text-xs font-bold text-gray-400">Contract Value</span>
              <div className="text-2xl font-black text-[#FF561F]">₹{loading ? '...' : data.totalContractValue?.toLocaleString('en-IN')}</div>
            </div>
          </div>
        </main>
      </div>
    </RoleGuard>
  );
}
