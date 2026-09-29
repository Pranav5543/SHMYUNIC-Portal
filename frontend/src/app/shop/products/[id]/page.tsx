'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchProductById } from '@/services/api';
import { useApp } from '@/context/AppContext';
import { Product, ProductVariant } from '@/types';

export default function GeneralProductDetailPage({ params }: { params: { id: string } }) {
  const { addToCart } = useApp();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [loading, setLoading] = useState(true);

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
            const sizes = p.sizes || ['Medium'];
            setSelectedSize(sizes[0]);
          }
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return <div className="py-20 text-center text-xs font-bold text-gray-400">Loading product details...</div>;
  }

  if (!product) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-xl font-bold text-gray-700">Product Not Found</h2>
        <Link href="/shop" className="text-xs font-bold text-[#FF561F] hover:underline mt-2 block">
          &larr; Back to Catalog
        </Link>
      </div>
    );
  }

  const variants = product.variants || [];
  const currentStock = selectedVariant ? selectedVariant.stock : (product as any).stock || 0;
  const isOutOfStock = currentStock === 0;

  const handleSizeSelect = (sz: string) => {
    setSelectedSize(sz);
    const matched = variants.find(v => v.size === sz);
    if (matched) {
      setSelectedVariant(matched);
    }
  };

  return (
    <main className="flex-1 py-8 px-4 md:px-8 max-w-container-max mx-auto w-full font-sans">
      <Link href="/shop" className="text-xs font-extrabold text-[#102a43] hover:text-[#FF561F] transition-colors inline-flex items-center gap-1 mb-6">
        &larr; Back to General Catalog
      </Link>

      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
        {/* Product Image Gallery */}
        <div className="aspect-[4/5] bg-gray-100 rounded-2xl overflow-hidden relative border border-gray-100">
          <span className="absolute top-4 left-4 bg-[#102a43] text-white text-xs font-extrabold px-3 py-1 rounded-md shadow-sm z-10 uppercase tracking-wider">
            {product.category}
          </span>
          <img
            src={product.images?.[0] || 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80'}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Product Details & Variant Selection */}
        <div className="flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-extrabold text-gray-400 uppercase tracking-wider">SKU: {selectedVariant?.sku || product.sku || 'SKU-STD'}</span>
              <span className="text-gray-300">•</span>
              <span className="text-xs font-extrabold text-[#FF561F] uppercase">{product.gender}</span>
            </div>

            <h1 className="text-2xl md:text-3xl font-black text-[#102a43] mb-3">{product.name}</h1>
            <p className="text-xs md:text-sm text-gray-500 leading-relaxed mb-6">{product.description}</p>

            <div className="text-3xl font-black text-[#FF561F] mb-6">
              ₹{(selectedVariant?.price || product.price).toLocaleString('en-IN')}
            </div>

            {/* Size Selector Pills */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-extrabold text-[#102a43] uppercase tracking-wider">Select Size:</label>
                <span className={`text-xs font-extrabold ${isOutOfStock ? 'text-red-500' : currentStock < 10 ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {isOutOfStock ? 'Out of Stock' : `${currentStock} units available`}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {variants.length > 0 ? (
                  variants.map(v => {
                    const vStock = v.stock;
                    const isVOut = vStock === 0;
                    return (
                      <button
                        key={v.id}
                        onClick={() => handleSizeSelect(v.size)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all flex flex-col items-center min-w-[64px] ${
                          selectedSize === v.size
                            ? 'bg-[#102a43] text-white border-[#102a43] shadow-md ring-2 ring-[#FF561F]'
                            : isVOut
                            ? 'bg-gray-100 text-gray-400 border-gray-200 line-through cursor-not-allowed opacity-60'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
                        }`}
                      >
                        <span>Size {v.size}</span>
                        <span className="text-[9px] opacity-75">{isVOut ? '0 left' : `${vStock} left`}</span>
                      </button>
                    );
                  })
                ) : (
                  (product.sizes || ['Medium']).map(sz => (
                    <button
                      key={sz}
                      onClick={() => setSelectedSize(sz)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                        selectedSize === sz
                          ? 'bg-[#102a43] text-white border-[#102a43]'
                          : 'bg-white text-gray-700 border-gray-200'
                      }`}
                    >
                      Size {sz}
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Add to Cart CTA */}
          <div className="border-t border-gray-100 pt-6">
            <button
              disabled={isOutOfStock}
              onClick={() => addToCart(product, selectedSize)}
              className={`w-full py-4 rounded-2xl text-sm font-extrabold flex items-center justify-center gap-2 shadow-lg transition-all ${
                isOutOfStock
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
                  : 'bg-[#FF561F] hover:bg-[#E64A1A] text-white hover:shadow-xl'
              }`}
            >
              <span className="material-symbols-outlined">shopping_cart</span>
              {isOutOfStock ? 'Out of Stock' : `Add Size ${selectedSize} to Cart`}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
