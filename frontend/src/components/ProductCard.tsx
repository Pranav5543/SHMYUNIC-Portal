'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Product } from '../types';
import { useApp } from '../context/AppContext';

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart, role } = useApp();
  const variants = product.variants || [];
  const sizes = product.sizes || ['Standard'];

  // Find first available variant or size
  const firstAvailableVariant = variants.find(v => v.isAvailable !== false && v.stock > 0) || variants[0];
  const [selectedSize, setSelectedSize] = useState(firstAvailableVariant?.size || sizes[0] || 'Standard');

  const detailPath = role === 'STUDENT_PARENT'
    ? `/student/products/${product.id}`
    : `/shop/products/${product.id}`;

  const imageSrc = product.images?.[0] || 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80';
  const selectedVariant = variants.find(v => v.size === selectedSize) || variants[0];
  const displaySku = selectedVariant?.sku || product.sku || 'SKU-STD';

  const isProductOutOfStock = product.availabilityStatus === 'OUT_OF_STOCK' || product.availabilityStatus === 'TEMPORARILY_UNAVAILABLE' || product.availabilityStatus === 'INACTIVE';
  const isSizeUnavailable = selectedVariant ? (selectedVariant.isAvailable === false || selectedVariant.stock === 0) : false;
  const isCannotAddToCart = isProductOutOfStock || isSizeUnavailable;

  const categoryName = typeof product.category === 'object' && product.category !== null
    ? (product.category as any).name
    : product.category || 'Apparel';

  const schoolName = (product as any).school?.name || '';
  const currentPrice = selectedVariant?.price || product.price || product.basePrice || 450;
  const originalPrice = product.originalPrice || product.basePrice;

  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all border border-gray-200 flex flex-col justify-between">
      <div className="relative aspect-[4/5] bg-gray-100 overflow-hidden">
        <span className="absolute top-3 left-3 bg-[#102a43] text-white text-[10px] font-bold px-2.5 py-0.5 rounded shadow-sm z-10 uppercase tracking-wider">
          {categoryName}
        </span>
        <div className="absolute top-3 right-3 flex flex-col items-end gap-1 z-10">
          <span className="bg-white/90 backdrop-blur text-gray-800 text-[10px] font-extrabold px-2 py-0.5 rounded shadow-sm uppercase">
            {product.gender || 'UNISEX'}
          </span>
          {product.availabilityStatus && product.availabilityStatus !== 'AVAILABLE' && (
            <span className="bg-rose-600 text-white text-[9px] font-black px-2 py-0.5 rounded shadow-sm uppercase">
              {product.availabilityStatus.replace(/_/g, ' ')}
            </span>
          )}
        </div>
        <img
          src={imageSrc}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <button
          disabled={isCannotAddToCart}
          onClick={() => addToCart(product, selectedSize)}
          className={`absolute bottom-3 left-3 right-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-lg ${
            isCannotAddToCart
              ? 'bg-gray-500 text-white cursor-not-allowed opacity-90'
              : 'bg-[#FF561F] hover:bg-[#E64A1A] text-white opacity-0 group-hover:opacity-100'
          }`}
        >
          <span className="material-symbols-outlined text-sm">shopping_cart</span>
          {isProductOutOfStock ? 'Out of Stock' : isSizeUnavailable ? `Size ${selectedSize} Unavailable` : 'Add to Cart'}
        </button>
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
            <span>{product.gender || 'UNISEX'} • SKU: {displaySku}</span>
            {schoolName && <span className="text-[#FF561F] truncate max-w-[120px]">{schoolName}</span>}
          </div>
          <Link href={detailPath} className="font-bold text-sm text-[#102a43] hover:text-[#FF561F] transition-colors line-clamp-1 block mb-1">
            {product.name}
          </Link>
          <p className="text-xs text-gray-500 line-clamp-2 mb-3 leading-relaxed">{product.description}</p>
        </div>

        <div>
          {/* Size Selection Pills with Availability */}
          <div className="flex items-center gap-1.5 mb-3 overflow-x-auto py-1">
            {variants.length > 0 ? (
              variants.map(v => {
                const isAvail = v.isAvailable !== false && v.stock > 0;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setSelectedSize(v.size)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-all shrink-0 ${
                      selectedSize === v.size
                        ? 'bg-[#102a43] text-white border-[#102a43]'
                        : !isAvail
                        ? 'bg-rose-50 text-rose-400 border-rose-200 line-through opacity-70'
                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                    }`}
                    title={!isAvail ? `Size ${v.size} (Unavailable)` : `Size ${v.size}`}
                  >
                    {v.size}
                  </button>
                );
              })
            ) : (
              sizes.map(sz => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => setSelectedSize(sz)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-all shrink-0 ${
                    selectedSize === sz
                      ? 'bg-[#102a43] text-white border-[#102a43]'
                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {sz}
                </button>
              ))
            )}
          </div>

          <div className="flex items-center justify-between border-t border-gray-100 pt-3">
            <div>
              <span className="text-base font-extrabold text-[#FF561F]">
                ₹{Number(currentPrice).toLocaleString('en-IN')}
              </span>
              {originalPrice && originalPrice > currentPrice && (
                <span className="text-xs text-gray-400 line-through ml-1.5">
                  ₹{Number(originalPrice).toLocaleString('en-IN')}
                </span>
              )}
            </div>
            <Link
              href={detailPath}
              className="text-[11px] font-bold text-[#102a43] hover:underline flex items-center gap-0.5"
            >
              Details &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
