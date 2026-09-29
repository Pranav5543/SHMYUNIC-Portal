'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { updateCartItemApi } from '@/services/api';
import AIUniformAssistant from '@/components/AIUniformAssistant';

export default function CartPage() {
  const router = useRouter();
  const { user, cart, removeFromCart, clearCart, refreshCart, subtotal, cartCount, activeChild, activeSchool } = useApp();
  const [deliveryType, setDeliveryType] = useState<'INDIVIDUAL_HOME' | 'SCHOOL_BULK'>('INDIVIDUAL_HOME');
  const [couponCode, setCouponCode] = useState('');
  const [discountApplied, setDiscountApplied] = useState(0);
  const [updating, setUpdating] = useState(false);

  const tax = Number((subtotal * 0.08).toFixed(2));
  const shippingFee = deliveryType === 'SCHOOL_BULK' ? 0.0 : 99.0;
  const totalAmount = Number((Math.max(0, subtotal - discountApplied) + tax + shippingFee).toFixed(2));

  const handleQuantityChange = async (itemId: string, newQty: number) => {
    if (newQty < 1 || updating) return;
    setUpdating(true);
    try {
      await updateCartItemApi(itemId, newQty);
      await refreshCart();
    } catch (e) {
      console.error(e);
    } finally {
      setUpdating(false);
    }
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponCode.trim().toUpperCase() === 'SMUFIRST' || couponCode.trim().toUpperCase() === 'SCHOOL10') {
      const disc = Math.round(subtotal * 0.10);
      setDiscountApplied(disc);
    } else {
      setDiscountApplied(0);
    }
  };

  if (!user) {
    return (
      <main className="max-w-container-max mx-auto px-4 md:px-8 py-16 text-center font-sans">
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-12 max-w-lg mx-auto">
          <span className="material-symbols-outlined text-5xl text-[#FF561F] mb-4">shopping_cart</span>
          <h2 className="text-2xl font-black text-[#102a43] mb-2">Sign in to View Your Cart</h2>
          <p className="text-xs text-gray-500 mb-6 leading-relaxed">
            Your shopping cart is saved to your account. Please sign in to view saved uniform pieces and proceed to checkout.
          </p>
          <Link
            href="/auth/login?returnUrl=/shop/cart"
            className="inline-flex items-center justify-center gap-2 bg-[#FF561F] hover:bg-[#E64A1A] text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md text-xs"
          >
            <span className="material-symbols-outlined text-base">login</span>
            <span>Sign In to Access Cart</span>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[85vh] bg-[#FCFCFB] py-8 px-4 md:px-8 font-sans">
      <div className="max-w-container-max mx-auto">
        
        {/* Header Title & Child Context Strip */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <span className="text-[#FF561F] text-xs font-bold uppercase tracking-wider block mb-1">Shopping Cart</span>
            <h1 className="text-2xl md:text-3xl font-black text-[#102a43]">Shopping Cart ({cartCount} Items)</h1>
          </div>

          {activeChild && (
            <div className="flex items-center gap-2.5 bg-blue-50 border border-blue-200 px-4 py-2 rounded-2xl text-xs font-bold text-[#102a43]">
              <span className="material-symbols-outlined text-blue-600 text-base">face</span>
              <span>Shopping for: <strong>{activeChild.name}</strong> • {activeChild.schoolName || activeSchool?.name} ({activeChild.grade})</span>
            </div>
          )}

          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs font-bold text-gray-400 hover:text-red-600 transition-colors flex items-center gap-1 self-end md:self-auto"
            >
              <span className="material-symbols-outlined text-base">delete</span>
              <span>Clear Cart</span>
            </button>
          )}
        </div>

        {cart.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-16 text-center max-w-xl mx-auto">
            <span className="material-symbols-outlined text-6xl text-gray-300 mb-3">remove_shopping_cart</span>
            <h3 className="text-lg font-extrabold text-gray-700 mb-1">Your cart is currently empty</h3>
            <p className="text-xs text-gray-400 mb-6">
              Browse official uniform apparel, PE sportswear, footwear and accessories for your school.
            </p>
            <Link
              href="/student/store"
              className="inline-block bg-[#FF561F] text-white px-8 py-3 rounded-xl text-xs font-bold shadow-md hover:bg-[#E64A1A] transition-all"
            >
              Go to School Store
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Cart Item List + AI Complete Uniform Banner */}
            <div className="lg:col-span-8 space-y-4">
              
              {/* AI "Complete My Uniform" Context Reminder */}
              <div className="bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-white rounded-2xl border border-orange-200/60 p-4.5 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-[#FF561F] text-xl mt-0.5">auto_awesome</span>
                  <div>
                    <h3 className="text-xs font-black text-[#102a43]">AI Uniform Checklist Assistant</h3>
                    <p className="text-[11px] text-gray-600 mt-0.5 leading-relaxed">
                      Make sure you have all mandatory essentials: Official Shirts, Trousers/Skirts, Tie, Belt, PE T-Shirt and Track Pants before placing your order.
                    </p>
                  </div>
                </div>
                <Link
                  href="/student/store"
                  className="text-xs font-black text-[#FF561F] hover:underline whitespace-nowrap shrink-0"
                >
                  + Add Essentials
                </Link>
              </div>

              {/* Items List */}
              {cart.map((item) => (
                <div
                  key={item.id || `${item.productId}-${item.selectedSize}`}
                  className="bg-white rounded-2xl border border-gray-200 p-4 md:p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <img
                      src={item.image || 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=200&q=80'}
                      alt={item.productName}
                      className="w-20 h-24 object-cover rounded-xl border border-gray-100 shrink-0"
                    />

                    <div>
                      <div className="text-[10px] font-extrabold text-[#FF561F] uppercase tracking-wider mb-0.5">
                        {activeSchool?.name || 'School Approved Uniform'}
                      </div>
                      <h3 className="font-bold text-sm text-[#102a43] leading-snug">{item.productName}</h3>
                      <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-500">
                        <span className="bg-gray-100 px-2 py-0.5 rounded font-bold text-gray-700">Size: {item.selectedSize}</span>
                        <span>•</span>
                        <span className="font-extrabold text-[#102a43]">₹{item.priceSnapshot.toLocaleString('en-IN')} / unit</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100">
                    {/* Quantity Counter */}
                    <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50 p-1">
                      <button
                        disabled={item.quantity <= 1 || updating}
                        onClick={() => item.id && handleQuantityChange(item.id, item.quantity - 1)}
                        className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-white rounded-lg transition-colors font-bold text-xs disabled:opacity-40"
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-extrabold text-xs text-[#102a43]">{item.quantity}</span>
                      <button
                        disabled={updating}
                        onClick={() => item.id && handleQuantityChange(item.id, item.quantity + 1)}
                        className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-white rounded-lg transition-colors font-bold text-xs"
                      >
                        +
                      </button>
                    </div>

                    <div className="text-right">
                      <div className="text-base font-black text-[#FF561F]">
                        ₹{(item.priceSnapshot * item.quantity).toLocaleString('en-IN')}
                      </div>
                      <button
                        onClick={() => item.id && removeFromCart(item.id)}
                        className="text-[11px] font-bold text-gray-400 hover:text-red-600 transition-colors mt-0.5"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Column: Checkout Order Summary Sidebar */}
            <div className="lg:col-span-4">
              <div className="bg-white rounded-3xl border border-gray-200 p-6 md:p-8 shadow-sm sticky top-24 space-y-6">
                <h2 className="text-lg font-black text-[#102a43] border-b border-gray-100 pb-3">Order Summary</h2>

                {/* Delivery Option Selector */}
                <div>
                  <label className="block text-xs font-extrabold text-[#102a43] uppercase tracking-wider mb-2">
                    Delivery Method
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setDeliveryType('INDIVIDUAL_HOME')}
                      className={`p-3 rounded-xl border text-xs font-bold text-center transition-all ${
                        deliveryType === 'INDIVIDUAL_HOME'
                          ? 'bg-[#102a43] text-white border-[#102a43] shadow-sm'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div>Home Delivery</div>
                      <div className="text-[10px] opacity-75 mt-0.5">₹99 Standard</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeliveryType('SCHOOL_BULK')}
                      className={`p-3 rounded-xl border text-xs font-bold text-center transition-all ${
                        deliveryType === 'SCHOOL_BULK'
                          ? 'bg-[#102a43] text-white border-[#102a43] shadow-sm'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div>School Campus</div>
                      <div className="text-[10px] opacity-75 mt-0.5">FREE Dispatch</div>
                    </button>
                  </div>
                </div>

                {/* Coupon Input */}
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={e => setCouponCode(e.target.value)}
                    placeholder="Coupon code (e.g. SCHOOL10)"
                    className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs uppercase font-bold focus:outline-none focus:border-[#FF561F]"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#102a43] hover:bg-[#243b53] text-white text-xs font-bold rounded-xl"
                  >
                    Apply
                  </button>
                </form>

                {discountApplied > 0 && (
                  <div className="text-xs font-bold text-emerald-600 bg-emerald-50 p-2 rounded-lg text-center">
                    ✓ Promo Applied: ₹{discountApplied} Discount
                  </div>
                )}

                {/* Price Line Breakdown */}
                <div className="space-y-2.5 text-xs text-gray-600 border-t border-gray-100 pt-4">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="font-bold text-[#102a43]">₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>

                  {discountApplied > 0 && (
                    <div className="flex justify-between text-emerald-600 font-bold">
                      <span>Discount:</span>
                      <span>-₹{discountApplied.toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span>Estimated GST (8%):</span>
                    <span className="font-bold text-[#102a43]">₹{tax.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Delivery Fee:</span>
                    <span className="font-bold text-[#102a43]">{shippingFee === 0 ? 'FREE' : `₹${shippingFee.toFixed(2)}`}</span>
                  </div>

                  <div className="flex justify-between text-sm font-black text-[#102a43] border-t border-gray-100 pt-3">
                    <span>Total Amount:</span>
                    <span className="text-base text-[#FF561F]">₹{totalAmount.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Proceed CTA */}
                <button
                  type="button"
                  onClick={() => router.push('/shop/checkout')}
                  className="w-full py-4 bg-[#FF561F] hover:bg-[#E64A1A] text-white font-extrabold rounded-2xl text-xs transition-all shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-base">lock</span>
                  <span>Proceed to Checkout & Payment</span>
                </button>

                <div className="text-[10px] text-gray-400 text-center flex items-center justify-center gap-1.5">
                  <span className="material-symbols-outlined text-xs text-emerald-600">verified_user</span>
                  <span>7-Day Free Doorstep Size Exchange Guaranteed</span>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* Contextual AI Assistant */}
      <AIUniformAssistant currentProducts={[]} />
    </main>
  );
}
