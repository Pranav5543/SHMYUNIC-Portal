'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import { fetchProducts } from '@/services/api';
import { Product } from '@/types';
import { useApp } from '@/context/AppContext';

function GeneralShopContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useApp();

  useEffect(() => {
    if (user?.role === 'STUDENT_PARENT') {
      router.replace('/student/store');
    }
  }, [user, router]);

  // URL state variables
  const category = searchParams.get('category') || 'All';
  const productType = searchParams.get('type') || 'All';
  const gender = searchParams.get('gender') || 'All';
  const color = searchParams.get('color') || 'All';
  const sort = searchParams.get('sort') || 'recommended';

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Helper to update URL query parameters seamlessly
  const updateQuery = (updates: Record<string, string>) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    Object.entries(updates).forEach(([key, val]) => {
      if (!val || val === 'All' || val === 'recommended') {
        current.delete(key);
      } else {
        current.set(key, val);
      }
    });
    router.push(`/shop?${current.toString()}`);
  };

  useEffect(() => {
    setLoading(true);
    fetchProducts({
      role: 'GENERAL_CUSTOMER',
      category,
      productType,
      gender,
      color,
      sort
    })
      .then(data => {
        if (data.products) setProducts(data.products);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [category, productType, gender, color, sort]);

  const categories = [
    'All',
    'Shirts',
    'Trousers',
    'Blazers',
    'School Shoes',
    'Sports Shoes',
    'Sports Uniforms',
    'House T-Shirts',
    'Bags',
    'Corporate Workwear',
    'Healthcare & Scrubs',
    'Industrial & Safety PPE',
    'Hospitality & Culinary'
  ];

  const productTypes = [
    { label: 'All Product Types', value: 'All' },
    { label: 'Shirts', value: 'Shirts' },
    { label: 'Trousers', value: 'Trousers' },
    { label: 'Shorts', value: 'Shorts' },
    { label: 'Skirts', value: 'Skirts' },
    { label: 'Blazers', value: 'Blazers' },
    { label: 'Sweaters', value: 'Sweaters' },
    { label: 'Jackets', value: 'Jackets' },
    { label: 'Ties', value: 'Ties' },
    { label: 'Belts', value: 'Belts' },
    { label: 'Socks', value: 'Socks' },
    { label: 'School Shoes', value: 'School Shoes' },
    { label: 'Sports Shoes', value: 'Sports Shoes' },
    { label: 'Sports Uniforms', value: 'Sports Uniforms' },
    { label: 'House T-Shirts', value: 'House T-Shirts' },
    { label: 'Bags & Backpacks', value: 'Bags' },
    { label: 'Medical Scrubs', value: 'Healthcare & Scrubs' },
    { label: 'Corporate Oxford Shirts', value: 'Corporate Workwear' },
    { label: 'Safety Steel Boots', value: 'Industrial & Safety PPE' }
  ];

  const genders = [
    { label: 'All Fits', value: 'All' },
    { label: 'Boys', value: 'BOYS' },
    { label: 'Girls', value: 'GIRLS' },
    { label: 'Men', value: 'MEN' },
    { label: 'Women', value: 'WOMEN' },
    { label: 'Unisex', value: 'UNISEX' }
  ];

  const colors = ['All', 'White', 'Black', 'Navy Blue', 'Grey', 'Blue', 'Yellow'];

  return (
    <main className="flex-1 py-8 px-4 md:px-8 max-w-container-max mx-auto w-full">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#102a43] to-[#1f3a52] text-white rounded-2xl p-6 md:p-8 mb-8 shadow-lg">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-orange-500/20 text-[#FF561F] text-[11px] font-extrabold uppercase tracking-wider mb-2">
          General Uniform & Workwear Marketplace
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold">Complete Multi-Vertical Catalog</h1>
        <p className="text-xs text-slate-300 mt-1">Browse school apparel, corporate businesswear, medical scrubs, hospitality & safety gear</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <aside className="lg:col-span-1 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm h-fit">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
            <h2 className="text-sm font-black text-[#102a43] uppercase tracking-wider flex items-center gap-2">
              <span className="material-symbols-outlined text-[#FF561F]">filter_alt</span>
              Filter Catalog
            </h2>
            {(category !== 'All' || productType !== 'All' || gender !== 'All' || color !== 'All') && (
              <button
                onClick={() => router.push('/shop')}
                className="text-[11px] font-extrabold text-[#FF561F] hover:underline"
              >
                Clear All
              </button>
            )}
          </div>

          {/* Industry Category Filter */}
          <div className="mb-6">
            <label className="block text-xs font-extrabold text-[#102a43] uppercase tracking-wider mb-2.5">
              Category
            </label>
            <div className="space-y-1">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => updateQuery({ category: cat })}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-between ${
                    category === cat
                      ? 'bg-[#102a43] text-white shadow-sm'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span>{cat}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Product Type Filter */}
          <div className="mb-6 border-t border-gray-100 pt-6">
            <label className="block text-xs font-extrabold text-[#102a43] uppercase tracking-wider mb-2.5">
              Product Type
            </label>
            <div className="space-y-1">
              {productTypes.map(pt => (
                <button
                  key={pt.value}
                  onClick={() => updateQuery({ type: pt.value })}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-between ${
                    productType === pt.value
                      ? 'bg-[#FF561F] text-white shadow-sm'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span>{pt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Gender / Fit Filter */}
          <div className="mb-6 border-t border-gray-100 pt-6">
            <label className="block text-xs font-extrabold text-[#102a43] uppercase tracking-wider mb-2.5">
              Gender / Fit
            </label>
            <div className="flex flex-wrap gap-1.5">
              {genders.map(g => (
                <button
                  key={g.value}
                  onClick={() => updateQuery({ gender: g.value })}
                  className={`px-3 py-1 rounded-md text-xs font-bold border transition-all ${
                    gender === g.value
                      ? 'bg-[#102a43] text-white border-[#102a43]'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          {/* Color Filter */}
          <div className="border-t border-gray-100 pt-6">
            <label className="block text-xs font-extrabold text-[#102a43] uppercase tracking-wider mb-2.5">
              Color
            </label>
            <div className="flex flex-wrap gap-1.5">
              {colors.map(c => (
                <button
                  key={c}
                  onClick={() => updateQuery({ color: c })}
                  className={`px-3 py-1 rounded-md text-xs font-bold border transition-all ${
                    color === c
                      ? 'bg-[#102a43] text-white border-[#102a43]'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Product Catalog Display */}
        <section className="lg:col-span-3">
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs font-bold text-gray-600">
              Showing <span className="font-extrabold text-[#102a43]">{products.length}</span> verified products
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-gray-500">Sort by:</label>
              <select
                value={sort}
                onChange={(e) => updateQuery({ sort: e.target.value })}
                className="bg-gray-50 border border-gray-200 text-xs font-extrabold text-[#102a43] px-3 py-1.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF561F]"
              >
                <option value="recommended">Recommended</option>
                <option value="price_low_high">Price: Low to High</option>
                <option value="price_high_low">Price: High to Low</option>
                <option value="newest">Newest Arrivals</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="py-20 text-center text-xs text-gray-400 font-bold">
              Loading catalog from database...
            </div>
          ) : products.length === 0 ? (
            <div className="py-20 text-center bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
              <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">filter_alt_off</span>
              <p className="text-sm font-bold text-gray-700">No products match this filter combination</p>
              <button
                onClick={() => router.push('/shop')}
                className="mt-4 px-4 py-2 bg-[#FF561F] text-white text-xs font-extrabold rounded-xl shadow-md"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default function GeneralShopPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-xs text-gray-400">Loading Catalog...</div>}>
      <GeneralShopContent />
    </Suspense>
  );
}
