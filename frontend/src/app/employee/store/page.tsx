'use client';

import React, { useState, useEffect } from 'react';
import RoleGuard from '@/components/RoleGuard';
import ProductCard from '@/components/ProductCard';
import { useApp } from '@/context/AppContext';
import { fetchCompanies, fetchCompanyProducts } from '@/services/api';
import { Product, Company } from '@/types';

export default function EmployeeStorePage() {
  const { user } = useApp();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch available corporate companies on mount from PostgreSQL
  useEffect(() => {
    fetchCompanies()
      .then(data => {
        if (data.companies && data.companies.length > 0) {
          setCompanies(data.companies);
          setSelectedCompanyId(user?.companyId || data.companies[0].id);
        }
      })
      .catch(() => {});
  }, [user]);

  // Re-fetch corporate products when selected company or category changes
  useEffect(() => {
    if (!selectedCompanyId) return;
    setLoading(true);
    fetchCompanyProducts(selectedCompanyId, { category: selectedCategory })
      .then(data => {
        if (data.products) setProducts(data.products);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [selectedCompanyId, selectedCategory]);

  const activeCompany = companies.find(c => c.id === selectedCompanyId) || {
    name: 'TechNova Solutions India Pvt Ltd',
    code: 'TN-HYD'
  };

  const categories = ['All', 'Corporate Workwear', 'Healthcare & Scrubs', 'Hospitality & Culinary', 'Industrial & Safety PPE'];

  return (
    <RoleGuard allowedRoles={['EMPLOYEE', 'INTERNAL_ADMIN']}>
      <main className="flex-1 py-8 px-4 md:px-8 max-w-container-max mx-auto w-full font-sans">
        {/* Header Banner with Interactive Corporate Company Switcher */}
        <div className="bg-gradient-to-r from-slate-900 to-emerald-950 text-white rounded-2xl p-6 md:p-8 mb-8 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[11px] font-extrabold uppercase tracking-wider mb-2">
              Corporate Procurement Portal (/employee/store)
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold">{activeCompany.name}</h1>
            <p className="text-xs text-slate-300 mt-1">Approved executive business apparel, workwear & corporate uniform catalog</p>
          </div>

          {/* Interactive Company Switcher Dropdown */}
          {companies.length > 0 && (
            <div className="bg-white/10 p-3 rounded-xl backdrop-blur-md border border-white/15 min-w-[280px]">
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-emerald-300 mb-1">
                Select Corporate Account:
              </label>
              <select
                value={selectedCompanyId}
                onChange={(e) => setSelectedCompanyId(e.target.value)}
                className="w-full bg-slate-900 text-white text-xs font-bold px-3 py-2 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              >
                {companies.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 border-b border-gray-200">
          <span className="text-xs font-bold text-gray-500 mr-2">Category:</span>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all border ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="py-20 text-center text-xs font-bold text-gray-400">
            Loading corporate catalog for {activeCompany.name}...
          </div>
        ) : products.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-2xl border border-gray-200 p-8">
            <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">business_center</span>
            <p className="text-sm font-bold text-gray-600">No approved products found</p>
            <p className="text-xs text-gray-400 mt-1">Select "All" categories or switch corporate accounts.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>
    </RoleGuard>
  );
}
