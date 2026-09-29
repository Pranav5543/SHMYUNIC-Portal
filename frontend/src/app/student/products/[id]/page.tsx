'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchProductById, fetchSchoolProducts, addToWishlistApi, removeFromWishlistApi } from '@/services/api';
import { useApp } from '@/context/AppContext';
import { Product, ProductVariant } from '@/types';
import AIUniformAssistant from '@/components/AIUniformAssistant';

export default function StudentProductDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user, activeChild, activeSchool, addToCart, showToast } = useApp();

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [activeImageIdx, setActiveImageIdx] = useState<number>(0);
  const [isWishlisted, setIsWishlisted] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  // AI Size Modal State
  const [showSizeModal, setShowSizeModal] = useState<boolean>(false);
  const [calcAge, setCalcAge] = useState<string>('12');
  const [calcHeight, setCalcHeight] = useState<string>('148');
  const [calcWeight, setCalcWeight] = useState<string>('40');
  const [calcFit, setCalcFit] = useState<'SLIM' | 'REGULAR' | 'RELAXED'>('REGULAR');
  const [recommendedSize, setRecommendedSize] = useState<string | null>(null);

  useEffect(() => {
    fetchProductById(params.id)
      .then(data => {
        if (data.product) {
          const p: Product = data.product;
          setProduct(p);
          const vars = p.variants || [];
          if (vars.length > 0) {
            setSelectedVariant(vars[0]);
            setSelectedSize(vars[0].size);
          } else {
            const sizes = p.sizes || ['Standard'];
            setSelectedSize(sizes[0]);
          }

          // Fetch related products from same school
          const schoolId = p.schoolId || activeSchool?.id;
          if (schoolId) {
            fetchSchoolProducts(schoolId, {})
              .then(relData => {
                if (relData.products) {
                  setRelatedProducts(relData.products.filter((rp: Product) => rp.id !== p.id).slice(0, 4));
                }
              })
              .catch(() => {});
          }
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.id, activeSchool?.id]);

  if (loading) {
    return (
      <main className="max-w-container-max mx-auto px-4 py-20 text-center font-sans">
        <div className="text-xs font-bold text-gray-400">Loading school uniform specifications...</div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="max-w-container-max mx-auto px-4 py-20 text-center font-sans">
        <div className="bg-white rounded-3xl border border-gray-200 p-8 max-w-md mx-auto shadow-sm">
          <h2 className="text-xl font-black text-gray-700 mb-2">Product Not Found</h2>
          <p className="text-xs text-gray-400 mb-6">This item may have been discontinued or belongs to another institution.</p>
          <Link href="/student/store" className="bg-[#FF561F] text-white px-6 py-3 rounded-xl text-xs font-bold inline-block shadow-md">
            &larr; Back to School Store
          </Link>
        </div>
      </main>
    );
  }

  const variants = product.variants || [];
  const currentStock = selectedVariant ? selectedVariant.stock : (product as any).stock || 0;
  const isVariantDisabled = selectedVariant ? (selectedVariant.isAvailable === false || selectedVariant.stock === 0) : false;
  const isOutOfStock = currentStock === 0 || isVariantDisabled || product.availabilityStatus === 'OUT_OF_STOCK' || product.availabilityStatus === 'TEMPORARILY_UNAVAILABLE' || product.availabilityStatus === 'INACTIVE';
  const unitPrice = selectedVariant?.price || product.price || product.basePrice || 699;
  const images = product.images && product.images.length > 0
    ? product.images
    : ['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80'];

  const categoryName = typeof product.category === 'object' && product.category !== null
    ? (product.category as any).name
    : product.category || 'Apparel';

  const schoolName = (product as any).school?.name || activeSchool?.name || 'Partner School';

  const handleSizeSelect = (sz: string) => {
    setSelectedSize(sz);
    const matched = variants.find(v => v.size === sz);
    if (matched) setSelectedVariant(matched);
  };

  const handleWishlistToggle = async () => {
    try {
      if (isWishlisted) {
        await removeFromWishlistApi(product.id);
        setIsWishlisted(false);
        showToast('Removed from wishlist');
      } else {
        await addToWishlistApi(product.id);
        setIsWishlisted(true);
        showToast('Added to wishlist');
      }
    } catch {
      setIsWishlisted(!isWishlisted);
    }
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(product, selectedSize, quantity);
    showToast(`Added ${quantity}x ${product.name} (Size ${selectedSize}) to cart!`);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    addToCart(product, selectedSize, quantity);
    router.push('/shop/checkout');
  };

  const handleRunAiSizeCheck = () => {
    const age = parseInt(calcAge, 10) || 12;
    const height = parseInt(calcHeight, 10) || 148;

    let rec = '32';
    if (height < 125 || age <= 6) rec = '26';
    else if (height < 135 || age <= 8) rec = '28';
    else if (height < 145 || age <= 10) rec = '30';
    else if (height < 155 || age <= 12) rec = '32';
    else if (height < 165 || age <= 14) rec = '34';
    else if (height < 175 || age <= 16) rec = '36';
    else rec = '38';

    if (calcFit === 'RELAXED') {
      const nextMap: Record<string, string> = { '28': '30', '30': '32', '32': '34', '34': '36' };
      rec = nextMap[rec] || rec;
    }

    setRecommendedSize(rec);
    handleSizeSelect(rec);
  };

  return (
    <main className="min-h-[85vh] bg-[#FCFCFB] py-8 px-4 md:px-8 font-sans">
      <div className="max-w-container-max mx-auto">

        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs text-gray-400 mb-6 overflow-x-auto whitespace-nowrap">
          <Link href="/student/store" className="hover:text-[#FF561F] transition-colors">School Store</Link>
          <span>/</span>
          <span className="text-gray-600 font-bold">{schoolName}</span>
          <span>/</span>
          <span className="text-[#102a43] font-black truncate max-w-xs">{product.name}</span>
        </nav>

        {/* Product Hero Grid */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 md:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 mb-12">

          {/* Left Column: Image Gallery */}
          <div className="lg:col-span-6 space-y-4">
            <div className="aspect-[4/5] bg-gray-100 rounded-3xl overflow-hidden relative border border-gray-100 shadow-inner">
              <span className="absolute top-4 left-4 bg-[#102a43] text-white text-xs font-black px-3 py-1 rounded-lg shadow-sm z-10 uppercase tracking-wider">
                {categoryName}
              </span>
              <span className="absolute top-4 right-4 bg-white/90 backdrop-blur text-gray-800 text-[11px] font-black px-3 py-1 rounded-lg shadow-sm z-10 uppercase">
                {product.gender} FIT
              </span>
              <img
                src={images[activeImageIdx] || images[0]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Thumbnail Carousel */}
            {images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIdx(idx)}
                    className={`w-16 h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                      activeImageIdx === idx
                        ? 'border-[#FF561F] shadow-md ring-2 ring-[#FF561F]/30'
                        : 'border-gray-200 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="thumb" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Product Info & Order Configuration */}
          <div className="lg:col-span-6 flex flex-col justify-between">
            <div>
              {/* Institution and SKU Tag */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-black text-[#FF561F] uppercase tracking-wider">
                  {schoolName} Official Uniform
                </span>
                <span className="text-xs font-bold text-gray-400">
                  SKU: {selectedVariant?.sku || product.sku || 'SKU-STD'}
                </span>
              </div>

              <h1 className="text-2xl md:text-3xl font-black text-[#102a43] mb-3 leading-tight">
                {product.name}
              </h1>

              {/* Price Block */}
              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-3xl font-black text-[#FF561F]">
                  ₹{unitPrice.toLocaleString('en-IN')}
                </span>
                {product.salePrice && product.basePrice && product.salePrice < product.basePrice && (
                  <span className="text-sm text-gray-400 line-through">
                    ₹{product.basePrice.toLocaleString('en-IN')}
                  </span>
                )}
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-md">
                  Institutional Approved
                </span>
              </div>

              <p className="text-xs md:text-sm text-gray-500 leading-relaxed mb-6">
                {product.description}
              </p>

              {/* Active Child Context Notification */}
              {activeChild && (
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3.5 mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-blue-600 text-lg">face</span>
                    <div>
                      <span className="text-xs font-black text-[#102a43] block">
                        Shopping for {activeChild.name}
                      </span>
                      <span className="text-[11px] text-gray-500">
                        {activeChild.schoolName} • {activeChild.grade}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-blue-700 bg-white px-2.5 py-1 rounded-lg border border-blue-200">
                    Grade Matched
                  </span>
                </div>
              )}

              {/* Size Selector with AI Size Guide Trigger */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2.5">
                  <label className="text-xs font-black text-[#102a43] uppercase tracking-wider">
                    Select Uniform Size:
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowSizeModal(true)}
                    className="text-xs font-bold text-[#FF561F] hover:underline flex items-center gap-1 bg-orange-50 px-2.5 py-1 rounded-lg border border-orange-200/60"
                  >
                    <span className="material-symbols-outlined text-sm">straighten</span>
                    <span>Find My Size (AI)</span>
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {variants.length > 0 ? (
                    variants.map(v => {
                      const vStock = v.stock;
                      const isVOut = v.isAvailable === false || vStock === 0;
                      return (
                        <button
                          key={v.id}
                          type="button"
                          disabled={isVOut}
                          onClick={() => handleSizeSelect(v.size)}
                          className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all flex flex-col items-center min-w-[70px] ${
                            selectedSize === v.size
                              ? 'bg-[#102a43] text-white border-[#102a43] shadow-md ring-2 ring-[#FF561F]'
                              : isVOut
                              ? 'bg-rose-50 text-rose-400 border-rose-200 line-through cursor-not-allowed opacity-70'
                              : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400 hover:bg-gray-50'
                          }`}
                          title={isVOut ? `Size ${v.size} (Unavailable)` : `Size ${v.size}`}
                        >
                          <span className="text-xs font-black">{v.size}</span>
                          <span className="text-[9px] opacity-80 mt-0.5">{isVOut ? 'Unavailable' : `${vStock} in stock`}</span>
                        </button>
                      );
                    })
                  ) : (
                    (product.sizes || ['28', '30', '32', '34', '36']).map(sz => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => handleSizeSelect(sz)}
                        className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                          selectedSize === sz
                            ? 'bg-[#102a43] text-white border-[#102a43]'
                            : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        Size {sz}
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Quantity Selector & Stock Indicator */}
              <div className="flex items-center justify-between mb-8 border-y border-gray-100 py-4">
                <div>
                  <label className="block text-xs font-black text-[#102a43] uppercase tracking-wider mb-1">
                    Quantity:
                  </label>
                  <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden w-fit bg-gray-50">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-2 text-gray-600 hover:bg-gray-200 font-bold transition-colors"
                    >
                      -
                    </button>
                    <span className="px-4 py-2 text-xs font-black text-[#102a43] bg-white min-w-[36px] text-center">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-3 py-2 text-gray-600 hover:bg-gray-200 font-bold transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-gray-400 block mb-0.5">Item Availability</span>
                  <span className={`text-xs font-black ${isOutOfStock ? 'text-red-500' : 'text-emerald-600'}`}>
                    {isOutOfStock ? 'Currently Out of Stock' : 'Ready for Immediate Dispatch'}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons: Add to Cart, Buy Now, Wishlist */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled={isOutOfStock}
                  onClick={handleAddToCart}
                  className={`flex-1 py-3.5 rounded-2xl font-extrabold text-xs transition-all shadow-md flex items-center justify-center gap-2 ${
                    isOutOfStock
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-[#FF561F] hover:bg-[#E64A1A] text-white shadow-orange-500/20'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">shopping_cart</span>
                  <span>{isOutOfStock ? 'Out of Stock' : 'Add to Cart'}</span>
                </button>

                <button
                  type="button"
                  disabled={isOutOfStock}
                  onClick={handleBuyNow}
                  className={`flex-1 py-3.5 rounded-2xl font-extrabold text-xs transition-all shadow-md flex items-center justify-center gap-2 ${
                    isOutOfStock
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-[#102a43] hover:bg-[#243b53] text-white'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">bolt</span>
                  <span>Buy Now</span>
                </button>

                <button
                  type="button"
                  onClick={handleWishlistToggle}
                  className={`p-3.5 rounded-2xl border transition-colors flex items-center justify-center ${
                    isWishlisted
                      ? 'bg-red-50 border-red-200 text-red-500'
                      : 'bg-gray-50 border-gray-200 text-gray-400 hover:text-red-500'
                  }`}
                  title={isWishlisted ? 'Saved in Wishlist' : 'Add to Wishlist'}
                >
                  <span className="material-symbols-outlined text-xl">
                    {isWishlisted ? 'favorite' : 'favorite_border'}
                  </span>
                </button>
              </div>

              {/* Guarantees & Features */}
              <div className="grid grid-cols-3 gap-2 pt-2 text-center text-[10px] text-gray-500 font-bold">
                <div className="bg-gray-50 p-2 rounded-xl border border-gray-100 flex flex-col items-center gap-1">
                  <span className="material-symbols-outlined text-sm text-[#FF561F]">verified</span>
                  <span>100% School Compliant</span>
                </div>
                <div className="bg-gray-50 p-2 rounded-xl border border-gray-100 flex flex-col items-center gap-1">
                  <span className="material-symbols-outlined text-sm text-blue-600">sync_alt</span>
                  <span>7-Day Doorstep Exchange</span>
                </div>
                <div className="bg-gray-50 p-2 rounded-xl border border-gray-100 flex flex-col items-center gap-1">
                  <span className="material-symbols-outlined text-sm text-emerald-600">local_shipping</span>
                  <span>Fast Tracked Delivery</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Specifications & Size Guide Table */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 md:p-10 mb-12">
          <h3 className="text-base font-black text-[#102a43] uppercase tracking-wider mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-[#FF561F]">table_chart</span>
            Uniform Specifications & Size Chart
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-gray-200 rounded-2xl overflow-hidden">
              <thead className="bg-gray-50 text-gray-600 font-black uppercase text-[10px] border-b border-gray-200">
                <tr>
                  <th className="p-3.5">Standard Size</th>
                  <th className="p-3.5">Age Group</th>
                  <th className="p-3.5">Chest (Inches)</th>
                  <th className="p-3.5">Waist (Inches)</th>
                  <th className="p-3.5">Recommended Height</th>
                  <th className="p-3.5">Stock Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700 font-medium">
                {[
                  { sz: '28', age: '6 - 8 Yrs', chest: '28 - 29"', waist: '22 - 24"', height: '125 - 135 cm' },
                  { sz: '30', age: '8 - 10 Yrs', chest: '30 - 31"', waist: '24 - 26"', height: '135 - 145 cm' },
                  { sz: '32', age: '10 - 12 Yrs', chest: '32 - 33"', waist: '26 - 28"', height: '145 - 155 cm' },
                  { sz: '34', age: '12 - 14 Yrs', chest: '34 - 35"', waist: '28 - 30"', height: '155 - 165 cm' },
                  { sz: '36', age: '14 - 16 Yrs', chest: '36 - 37"', waist: '30 - 32"', height: '165 - 175 cm' },
                  { sz: '38', age: '16+ Yrs', chest: '38 - 40"', waist: '32 - 34"', height: '175+ cm' }
                ].map((row) => (
                  <tr key={row.sz} className={selectedSize === row.sz ? 'bg-orange-50/60 font-bold text-[#FF561F]' : 'hover:bg-gray-50'}>
                    <td className="p-3.5 font-black">Size {row.sz}</td>
                    <td className="p-3.5">{row.age}</td>
                    <td className="p-3.5">{row.chest}</td>
                    <td className="p-3.5">{row.waist}</td>
                    <td className="p-3.5">{row.height}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">
                        In Stock
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Frequently Bought Together / School Uniform Bundle */}
        {relatedProducts.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-black text-[#102a43]">Frequently Bought Together</h3>
                <p className="text-xs text-gray-500">Official companion items for {schoolName} students</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((rel) => (
                <div key={rel.id} className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm flex flex-col justify-between group hover:shadow-md transition-all">
                  <div>
                    <div className="aspect-[4/5] bg-gray-100 rounded-xl overflow-hidden mb-3 relative">
                      <img
                        src={rel.images?.[0] || 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=400&q=80'}
                        alt={rel.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <Link href={`/student/products/${rel.id}`} className="text-xs font-black text-[#102a43] group-hover:text-[#FF561F] truncate block mb-1">
                      {rel.name}
                    </Link>
                    <div className="text-xs font-black text-[#FF561F] mb-3">
                      ₹{(rel.price || 599).toLocaleString('en-IN')}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      addToCart(rel, 'M', 1);
                      showToast(`Added ${rel.name} to cart!`);
                    }}
                    className="w-full py-2 bg-gray-100 hover:bg-[#FF561F] hover:text-white text-[#102a43] text-xs font-extrabold rounded-xl transition-colors flex items-center justify-center gap-1"
                  >
                    <span className="material-symbols-outlined text-sm">add_shopping_cart</span>
                    <span>Add Companion</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* AI Size Recommendation Modal */}
      {showSizeModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl animate-fade-in space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#FF561F] text-xl">straighten</span>
                <h3 className="text-base font-black text-[#102a43]">AI Size Calculator</h3>
              </div>
              <button
                onClick={() => setShowSizeModal(false)}
                className="text-gray-400 hover:text-gray-600 text-base"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-gray-500">
              Enter your student&apos;s physical measurements to calculate the best fitting size for {product.name}.
            </p>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Age (Yrs)</label>
                <input
                  type="number"
                  value={calcAge}
                  onChange={e => setCalcAge(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold focus:outline-none focus:border-[#FF561F]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Height (cm)</label>
                <input
                  type="number"
                  value={calcHeight}
                  onChange={e => setCalcHeight(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold focus:outline-none focus:border-[#FF561F]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Weight (kg)</label>
                <input
                  type="number"
                  value={calcWeight}
                  onChange={e => setCalcWeight(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold focus:outline-none focus:border-[#FF561F]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Fit Preference</label>
              <div className="grid grid-cols-3 gap-2">
                {(['SLIM', 'REGULAR', 'RELAXED'] as const).map(fit => (
                  <button
                    key={fit}
                    type="button"
                    onClick={() => setCalcFit(fit)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      calcFit === fit
                        ? 'bg-[#102a43] text-white border-[#102a43]'
                        : 'bg-gray-50 text-gray-700 border-gray-200'
                    }`}
                  >
                    {fit}
                  </button>
                ))}
              </div>
            </div>

            {recommendedSize && (
              <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 text-center">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-500 block mb-0.5">Recommended Size</span>
                <span className="text-xl font-black text-[#FF561F]">Size {recommendedSize}</span>
                <p className="text-[10px] text-gray-500 mt-1">Calculated and pre-selected for your cart addition.</p>
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleRunAiSizeCheck}
                className="flex-1 py-3 bg-[#FF561F] text-white text-xs font-extrabold rounded-xl shadow-md hover:bg-[#E64A1A] transition-colors"
              >
                Calculate Size
              </button>
              {recommendedSize && (
                <button
                  type="button"
                  onClick={() => setShowSizeModal(false)}
                  className="px-4 py-3 bg-[#102a43] text-white text-xs font-bold rounded-xl"
                >
                  Apply & Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Floating Contextual AI Assistant */}
      <AIUniformAssistant currentProducts={[product, ...relatedProducts]} />
    </main>
  );
}
