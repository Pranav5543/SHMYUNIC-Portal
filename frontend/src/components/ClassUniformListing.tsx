'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { fetchSchools, fetchSchoolProducts, addToWishlistApi, removeFromWishlistApi } from '@/services/api';
import { Product, School } from '@/types';
import { useApp } from '@/context/AppContext';
import AIUniformAssistant from '@/components/AIUniformAssistant';

export interface ClassDivisionConfig {
  divisionKey: 'primary' | 'middle' | 'senior';
  divisionName: string;
  classRange: string;
  heroBadge: string;
  heroTitle: string;
  heroDescription: string;
  heroImage: string;
  recommendedSizes: string[];
}

export default function ClassUniformListing({ config }: { config: ClassDivisionConfig }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const urlSchoolId = searchParams.get('schoolId');
  const initialCategory = searchParams.get('category') || 'All';
  const initialGender = searchParams.get('gender') || 'All';
  const initialSort = searchParams.get('sort') || 'recommended';

  const { user, activeChild, activeSchool, setActiveSchool, addToCart, showToast } = useApp();

  const [schools, setSchools] = useState<School[]>([]);
  const [activeSchoolId, setActiveSchoolId] = useState<string>(urlSchoolId || activeSchool?.id || '');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [selectedGender, setSelectedGender] = useState<string>(initialGender);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialCategory !== 'All' ? [initialCategory] : []);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>(initialSort);
  const [onlyInStock, setOnlyInStock] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [wishlistedIds, setWishlistedIds] = useState<Record<string, boolean>>({});

  // Fetch schools list
  useEffect(() => {
    fetchSchools()
      .then(data => {
        if (data.schools && data.schools.length > 0) {
          setSchools(data.schools);
          if (!activeSchoolId) {
            const defaultId = activeChild?.schoolId || data.schools[0].id;
            setActiveSchoolId(defaultId);
          }
        }
      })
      .catch(() => {});
  }, [activeChild, activeSchoolId]);

  // Sync active school when child changes
  useEffect(() => {
    if (activeChild?.schoolId) {
      setActiveSchoolId(activeChild.schoolId);
    }
  }, [activeChild]);

  // Fetch school products
  useEffect(() => {
    if (!activeSchoolId) return;
    setLoading(true);
    fetchSchoolProducts(activeSchoolId, {})
      .then(data => {
        if (data.products) {
          setProducts(data.products);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [activeSchoolId]);

  const currentSchool = schools.find(s => s.id === activeSchoolId) || activeSchool || {
    id: activeSchoolId || 'sch-gvps',
    name: 'Green Valley Public School',
    code: 'GVPS-CBSE'
  };

  // Division-specific product matching & filtering
  const divisionProducts = useMemo(() => {
    return products.filter(p => {
      const name = p.name.toLowerCase();
      const desc = (p.description || '').toLowerCase();
      const sku = (p.sku || '').toLowerCase();

      if (config.divisionKey === 'primary') {
        // Exclude blazer or senior specific items
        if (name.includes('blazer') || name.includes('senior') || sku.includes('blz')) return false;
        return true;
      }
      if (config.divisionKey === 'middle') {
        // Exclude primary or junior exclusive items
        if (name.includes('junior') || name.includes('primary')) return false;
        return true;
      }
      if (config.divisionKey === 'senior') {
        // Prioritize blazers, oxford shirts, senior trousers, lab coats, senior sportswear
        if (name.includes('primary') || name.includes('junior')) return false;
        return true;
      }
      return true;
    });
  }, [products, config.divisionKey]);

  // Extracted Available Categories for Division
  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    divisionProducts.forEach(p => {
      if (typeof p.category === 'object' && p.category !== null) {
        cats.add((p.category as any).name);
      } else if (typeof p.category === 'string') {
        cats.add(p.category);
      }
    });
    const arr = Array.from(cats);
    return arr.length > 0 ? arr : ['Shirts', 'Trousers', 'Skirts', 'Blazers', 'Sweaters', 'Sports Gear', 'Accessories'];
  }, [divisionProducts]);

  // Filtered and Sorted Products List
  const filteredProducts = useMemo(() => {
    let list = [...divisionProducts];

    // Gender filter
    if (selectedGender && selectedGender !== 'All') {
      list = list.filter(p => {
        const g = (p.gender || 'UNISEX').toUpperCase();
        return g === selectedGender || g === 'UNISEX' || g === 'ALL';
      });
    }

    // Category filter
    if (selectedCategories.length > 0) {
      list = list.filter(p => {
        const catName = typeof p.category === 'object' && p.category !== null
          ? (p.category as any).name
          : p.category || '';
        return selectedCategories.includes(catName);
      });
    }

    // Size filter
    if (selectedSizes.length > 0) {
      list = list.filter(p => {
        const pSizes = (p.variants || []).map(v => v.size).concat(p.sizes || []);
        return selectedSizes.some(sz => pSizes.includes(sz));
      });
    }

    // In Stock filter
    if (onlyInStock) {
      list = list.filter(p => {
        const st = (p as any).stock || (p.variants || []).reduce((acc: number, v: any) => acc + (v.stock || 0), 0);
        return st > 0;
      });
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q) ||
        (p.sku || '').toLowerCase().includes(q)
      );
    }

    // Sorting
    if (sortBy === 'price_asc') {
      list.sort((a, b) => (a.price || a.basePrice || 0) - (b.price || b.basePrice || 0));
    } else if (sortBy === 'price_desc') {
      list.sort((a, b) => (b.price || b.basePrice || 0) - (a.price || a.basePrice || 0));
    } else if (sortBy === 'newest') {
      list.sort((a, b) => (b.id || '').localeCompare(a.id || ''));
    }

    return list;
  }, [divisionProducts, selectedGender, selectedCategories, selectedSizes, onlyInStock, searchQuery, sortBy]);

  const handleCategoryToggle = (cat: string) => {
    if (selectedCategories.includes(cat)) {
      setSelectedCategories(selectedCategories.filter(c => c !== cat));
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  const handleSizeToggle = (sz: string) => {
    if (selectedSizes.includes(sz)) {
      setSelectedSizes(selectedSizes.filter(s => s !== sz));
    } else {
      setSelectedSizes([...selectedSizes, sz]);
    }
  };

  const handleClearAllFilters = () => {
    setSelectedGender('All');
    setSelectedCategories([]);
    setSelectedSizes([]);
    setOnlyInStock(false);
    setSearchQuery('');
  };

  const handleWishlistToggle = async (productId: string) => {
    const isW = !!wishlistedIds[productId];
    try {
      if (isW) {
        await removeFromWishlistApi(productId);
        setWishlistedIds(prev => ({ ...prev, [productId]: false }));
        showToast('Removed from wishlist');
      } else {
        await addToWishlistApi(productId);
        setWishlistedIds(prev => ({ ...prev, [productId]: true }));
        showToast('Added to wishlist');
      }
    } catch {
      setWishlistedIds(prev => ({ ...prev, [productId]: !isW }));
    }
  };

  const handleQuickAdd = (product: Product, size = '30') => {
    addToCart(product, size, 1);
    showToast(`Added ${product.name} (Size ${size}) to cart!`);
  };

  return (
    <main className="min-h-screen bg-[#F7F9FF] text-[#001D32] font-sans">
      
      {/* 1. CLASS-SPECIFIC HERO SECTION (Stitch-Inspired Architecture) */}
      <section className="relative w-full h-[320px] md:h-[400px] flex items-center justify-center overflow-hidden bg-[#00152A]">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${config.heroImage}')` }}
        />
        <div className="absolute inset-0 bg-[#00152A]/65" />

        <div className="relative z-10 text-center px-4 md:px-8 max-w-3xl">
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center justify-center gap-2 text-xs text-white/70 mb-4 font-semibold">
            <Link href="/student/store" className="hover:text-white transition-colors">School Store</Link>
            <span>/</span>
            <span className="text-white/90">{currentSchool.name}</span>
            <span>/</span>
            <span className="text-[#FFB59F] font-bold">{config.divisionName}</span>
          </nav>

          <span className="inline-block px-4 py-1 mb-3 rounded-full bg-[#FF561F] text-white font-black text-xs uppercase tracking-wider shadow-md">
            {config.heroBadge}
          </span>
          <h1 className="text-3xl md:text-5xl font-black text-white mb-3 tracking-tight">
            {config.heroTitle}
          </h1>
          <p className="text-sm md:text-base text-slate-200 font-medium max-w-2xl mx-auto leading-relaxed">
            {config.heroDescription}
          </p>

          {/* Active Child Context Tag */}
          {activeChild && (
            <div className="mt-4 inline-flex items-center gap-2 bg-white/15 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 text-xs font-bold text-white">
              <span className="material-symbols-outlined text-sm text-[#FFB59F]">face</span>
              <span>Active Profile: {activeChild.name} ({activeChild.grade})</span>
            </div>
          )}
        </div>
      </section>

      {/* 2. MAIN LISTING & FILTER LAYOUT */}
      <div className="max-w-container-max mx-auto px-4 md:px-8 py-10 flex flex-col md:flex-row gap-8">
        
        {/* Left Filter Sidebar */}
        <aside className="w-full md:w-64 lg:w-72 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sticky top-24 space-y-6">
            
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h2 className="text-base font-black text-[#00152A] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#FF561F] text-lg">filter_list</span>
                Filters
              </h2>
              <button
                type="button"
                onClick={handleClearAllFilters}
                className="text-xs font-bold text-[#FF561F] hover:underline"
              >
                Clear All
              </button>
            </div>

            {/* In-Store Search Filter */}
            <div>
              <label className="block text-xs font-black text-[#00152A] uppercase tracking-wider mb-2">Search Uniform</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">search</span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Filter by name, SKU..."
                  className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#FF561F]"
                />
              </div>
            </div>

            {/* Gender / Fit Filter */}
            <div className="border-t border-gray-100 pt-4">
              <h3 className="text-xs font-black text-[#00152A] uppercase tracking-wider mb-3">Gender / Fit</h3>
              <div className="space-y-2">
                {[
                  { label: 'All Genders', val: 'All' },
                  { label: 'Boys Fit', val: 'BOYS' },
                  { label: 'Girls Fit', val: 'GIRLS' },
                  { label: 'Unisex', val: 'UNISEX' }
                ].map(g => (
                  <label key={g.val} className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-gray-700 hover:text-[#FF561F]">
                    <input
                      type="radio"
                      name="gender_filter"
                      checked={selectedGender === g.val}
                      onChange={() => setSelectedGender(g.val)}
                      className="text-[#FF561F] focus:ring-[#FF561F]"
                    />
                    <span>{g.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Category Filter */}
            <div className="border-t border-gray-100 pt-4">
              <h3 className="text-xs font-black text-[#00152A] uppercase tracking-wider mb-3">Category</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {availableCategories.map(cat => {
                  const isChecked = selectedCategories.includes(cat);
                  return (
                    <label key={cat} className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-gray-700 hover:text-[#FF561F]">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleCategoryToggle(cat)}
                        className="rounded text-[#FF561F] focus:ring-[#FF561F]"
                      />
                      <span>{cat}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Division Sizes Filter */}
            <div className="border-t border-gray-100 pt-4">
              <h3 className="text-xs font-black text-[#00152A] uppercase tracking-wider mb-3">Sizes ({config.divisionName})</h3>
              <div className="flex flex-wrap gap-1.5">
                {config.recommendedSizes.map(sz => {
                  const isSelected = selectedSizes.includes(sz);
                  return (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => handleSizeToggle(sz)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-black transition-all border ${
                        isSelected
                          ? 'bg-[#102A43] text-white border-[#102A43]'
                          : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {sz}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* In-Stock Filter */}
            <div className="border-t border-gray-100 pt-4">
              <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-gray-700">
                <input
                  type="checkbox"
                  checked={onlyInStock}
                  onChange={e => setOnlyInStock(e.target.checked)}
                  className="rounded text-[#FF561F] focus:ring-[#FF561F]"
                />
                <span>In-Stock Items Only</span>
              </label>
            </div>

          </div>
        </aside>

        {/* Right Product Grid Area */}
        <div className="flex-1">
          
          {/* Top Bar: Product Count & Sort Selector */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
            <div>
              <p className="text-xs text-gray-500 font-medium">
                Showing <strong className="text-[#00152A] font-black">{filteredProducts.length}</strong> official uniform products for <span className="text-[#FF561F] font-bold">{config.classRange}</span>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="sort-select" className="text-xs font-bold text-gray-500">Sort by:</label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:border-[#FF561F]"
              >
                <option value="recommended">Recommended</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="newest">Newest Arrivals</option>
              </select>
            </div>
          </div>

          {/* Product Grid */}
          {loading ? (
            <div className="py-24 text-center text-xs font-bold text-gray-400">
              Loading {config.divisionName} uniform catalog...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-20 text-center bg-white rounded-3xl border border-gray-200 p-8 shadow-sm">
              <span className="material-symbols-outlined text-5xl text-gray-300 mb-2">checkroom</span>
              <h3 className="text-base font-black text-[#00152A]">No Matching Uniforms Found</h3>
              <p className="text-xs text-gray-400 mt-1 mb-4">Try clearing your filters or changing search keywords.</p>
              <button
                type="button"
                onClick={handleClearAllFilters}
                className="px-5 py-2.5 bg-[#FF561F] text-white rounded-xl text-xs font-bold shadow-md"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map(product => {
                const categoryName = typeof product.category === 'object' && product.category !== null
                  ? (product.category as any).name
                  : product.category || 'Uniform';

                const unitPrice = product.price || product.basePrice || 699;
                const variants = product.variants || [];
                const defaultSize = variants.length > 0 ? variants[0].size : '30';
                const isWishlisted = !!wishlistedIds[product.id];
                const imageSrc = product.images?.[0] || 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=600&q=80';

                return (
                  <div
                    key={product.id}
                    className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col justify-between group hover:shadow-md hover:-translate-y-1 transition-all duration-300"
                  >
                    <div>
                      {/* Product Image Container */}
                      <div className="relative aspect-[4/5] bg-slate-50 overflow-hidden">
                        <Link href={`/student/products/${product.id}`} className="block w-full h-full">
                          <img
                            src={imageSrc}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </Link>

                        {/* Top Badges */}
                        <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
                          <span className="bg-[#102A43] text-white text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider shadow-sm">
                            {categoryName}
                          </span>
                          <span className="bg-white/90 backdrop-blur text-gray-800 text-[9px] font-bold px-2 py-0.5 rounded uppercase shadow-sm">
                            {product.gender || 'UNISEX'} FIT
                          </span>
                        </div>

                        {/* Wishlist Heart Toggle */}
                        <button
                          type="button"
                          onClick={() => handleWishlistToggle(product.id)}
                          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-colors shadow-sm z-10 ${
                            isWishlisted
                              ? 'bg-red-50 text-red-500'
                              : 'bg-white/85 hover:bg-white text-gray-500 hover:text-red-500'
                          }`}
                          title="Save to Wishlist"
                        >
                          <span className="material-symbols-outlined text-base">
                            {isWishlisted ? 'favorite' : 'favorite_border'}
                          </span>
                        </button>
                      </div>

                      {/* Product Content Details */}
                      <div className="p-4">
                        <div className="text-[10px] font-bold text-gray-400 mb-1">
                          {config.classRange} • {product.sku || 'SKU-STD'}
                        </div>

                        <Link
                          href={`/student/products/${product.id}`}
                          className="font-black text-sm text-[#00152A] group-hover:text-[#FF561F] transition-colors line-clamp-1 mb-1.5 block"
                        >
                          {product.name}
                        </Link>

                        <p className="text-[11px] text-gray-500 line-clamp-2 mb-3 leading-relaxed">
                          {product.description}
                        </p>

                        {/* Available Sizes Pills */}
                        <div className="flex flex-wrap gap-1 mb-3">
                          {(variants.length > 0 ? variants.slice(0, 4) : ['28', '30', '32', '34']).map((v: any, idx: number) => {
                            const sz = typeof v === 'object' ? v.size : v;
                            return (
                              <span key={idx} className="text-[10px] font-bold bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                                {sz}
                              </span>
                            );
                          })}
                          {variants.length > 4 && (
                            <span className="text-[9px] font-semibold text-gray-400 self-center">
                              +{variants.length - 4} more
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="p-4 pt-0 border-t border-gray-50 flex items-center justify-between gap-2 mt-auto">
                      <div>
                        <span className="text-base font-black text-[#FF561F] block">
                          ₹{unitPrice.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[9px] font-bold text-emerald-600 block">
                          ✓ Verified Spec
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleQuickAdd(product, defaultSize)}
                        className="px-3.5 py-2 bg-[#FF561F] hover:bg-[#E64A1A] text-white text-xs font-extrabold rounded-xl shadow-md transition-colors flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-sm">shopping_cart</span>
                        <span>Add</span>
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>

      </div>

      {/* Floating Contextual AI Assistant */}
      <AIUniformAssistant currentProducts={divisionProducts} />
    </main>
  );
}
