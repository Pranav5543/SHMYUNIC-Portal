'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { fetchWishlist, removeFromWishlistApi } from '@/services/api';
import { Product } from '@/types';

export default function WishlistPage() {
  const { user, addToCart, showToast } = useApp();
  const [wishlistItems, setWishlistItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const loadWishlistItems = () => {
    if (user) {
      setLoading(true);
      fetchWishlist()
        .then(data => {
          if (data.products) {
            setWishlistItems(data.products);
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWishlistItems();
  }, [user]);

  const handleRemove = async (productId: string) => {
    try {
      await removeFromWishlistApi(productId);
      setWishlistItems(prev => prev.filter(p => p.id !== productId));
      showToast('Item removed from wishlist');
    } catch (e) {
      showToast('Failed to remove item from wishlist');
    }
  };

  const handleMoveToCart = async (product: Product) => {
    await addToCart(product, 'M', 1);
    await handleRemove(product.id);
  };

  if (!user) {
    return (
      <main className="max-w-container-max mx-auto px-4 py-16 text-center font-sans">
        <div className="bg-white rounded-3xl border border-gray-200 p-8 max-w-md mx-auto shadow-sm">
          <span className="material-symbols-outlined text-5xl text-[#FF561F] mb-3">favorite</span>
          <h2 className="text-xl font-black text-[#102a43] mb-2">Authentication Required</h2>
          <p className="text-xs text-gray-500 mb-6">Please sign in to view your saved wishlist items.</p>
          <Link href="/auth/login?returnUrl=/wishlist" className="bg-[#FF561F] text-white px-6 py-3 rounded-xl text-xs font-bold inline-block shadow-md">
            Sign In Now
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-container-max mx-auto px-4 md:px-8 py-8 w-full font-sans">
      <div className="flex items-center justify-between mb-8">
        <div>
          <span className="text-[#FF561F] text-xs font-bold uppercase tracking-wider block mb-1">Saved Favorites</span>
          <h1 className="text-2xl md:text-3xl font-black text-[#102a43]">My Wishlist ({wishlistItems.length})</h1>
        </div>

        <Link
          href="/student/store"
          className="text-xs font-bold text-[#102a43] bg-gray-100 hover:bg-gray-200 px-4 py-2.5 rounded-xl transition-all"
        >
          Explore Catalog
        </Link>
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs font-bold text-gray-400">Loading saved wishlist items...</div>
      ) : wishlistItems.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center max-w-md mx-auto shadow-sm">
          <span className="material-symbols-outlined text-5xl text-gray-300 mb-2">favorite_border</span>
          <h3 className="text-base font-bold text-gray-700">Your Wishlist is Empty</h3>
          <p className="text-xs text-gray-400 mb-6">Explore your school store catalog and save items for later.</p>
          <Link href="/student/store" className="bg-[#FF561F] text-white px-6 py-3 rounded-xl text-xs font-bold inline-block shadow-md">
            Go to School Store
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlistItems.map((product) => (
            <div key={product.id} className="bg-white rounded-3xl border border-gray-200 shadow-sm p-5 flex flex-col justify-between group hover:shadow-md transition-all">
              <div>
                <div className="aspect-[4/5] bg-gray-100 rounded-2xl overflow-hidden mb-4 relative">
                  <button
                    onClick={() => handleRemove(product.id)}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 text-gray-400 hover:text-red-500 flex items-center justify-center transition-colors shadow-sm z-10"
                    title="Remove from Wishlist"
                  >
                    <span className="material-symbols-outlined text-base">close</span>
                  </button>
                  <img
                    src={product.images?.[0] || 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=400&q=80'}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-gray-400 mb-1">
                  <span>{product.category}</span>
                  <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">In Stock</span>
                </div>

                <h3 className="text-sm font-extrabold text-[#102a43] line-clamp-1 mb-2">{product.name}</h3>
                <div className="text-lg font-black text-[#FF561F] mb-4">₹{product.price.toLocaleString('en-IN')}</div>
              </div>

              <button
                onClick={() => handleMoveToCart(product)}
                className="w-full bg-[#102a43] hover:bg-[#243b53] text-white text-xs font-bold py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-base">shopping_bag</span>
                <span>Move to Cart</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
