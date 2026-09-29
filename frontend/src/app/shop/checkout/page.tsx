'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { createOrder } from '@/services/api';

export default function CheckoutPage() {
  const router = useRouter();
  const { user, cart, subtotal, cartCount, refreshCart, showToast, activeSchool } = useApp();

  const [deliveryType, setDeliveryType] = useState<'INDIVIDUAL_HOME' | 'SCHOOL_BULK'>('INDIVIDUAL_HOME');
  const [paymentMethod, setPaymentMethod] = useState<'CREDIT_CARD' | 'UPI' | 'NET_BANKING' | 'COD'>('CREDIT_CARD');

  // Address fields
  const [fullName, setFullName] = useState(user ? `${user.firstName} ${user.lastName}` : '');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [addressLine1, setAddressLine1] = useState('Flat 402, Royal Palms Apartments');
  const [addressLine2, setAddressLine2] = useState('Near Bio-Diversity Park, Madhapur');
  const [city, setCity] = useState('Hyderabad');
  const [state, setState] = useState('Telangana');
  const [postalCode, setPostalCode] = useState('500081');

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const tax = Number((subtotal * 0.08).toFixed(2));
  const shippingFee = deliveryType === 'SCHOOL_BULK' ? 0.0 : 99.0;
  const totalAmount = Number((subtotal + tax + shippingFee).toFixed(2));

  if (!user) {
    return (
      <main className="max-w-container-max mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-3xl border border-gray-200 p-8 max-w-md mx-auto">
          <h2 className="text-xl font-black text-[#102a43] mb-2">Authentication Required</h2>
          <p className="text-xs text-gray-500 mb-6">Please sign in to complete your checkout.</p>
          <Link href="/auth/login?returnUrl=/shop/checkout" className="bg-[#FF561F] text-white px-6 py-3 rounded-xl text-xs font-bold">
            Sign In Now
          </Link>
        </div>
      </main>
    );
  }

  if (cart.length === 0) {
    return (
      <main className="max-w-container-max mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-3xl border border-gray-200 p-8 max-w-md mx-auto">
          <h2 className="text-xl font-black text-[#102a43] mb-2">Cart is Empty</h2>
          <p className="text-xs text-gray-500 mb-6">Please add items to your cart before proceeding to checkout.</p>
          <Link href="/shop" className="bg-[#FF561F] text-white px-6 py-3 rounded-xl text-xs font-bold">
            Browse Catalog
          </Link>
        </div>
      </main>
    );
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSubmitting(true);

    try {
      const fullShippingAddress = `${addressLine1}, ${addressLine2 ? addressLine2 + ', ' : ''}${city}, ${state} - ${postalCode}`;

      const res = await createOrder({
        deliveryType,
        paymentMethod,
        shippingAddress: fullShippingAddress,
        items: cart.map(i => ({
          productId: i.productId,
          selectedSize: i.selectedSize,
          quantity: i.quantity
        }))
      });

      setSubmitting(false);

      if (res.error) {
        setErrorMessage(res.details || res.error);
        return;
      }

      await refreshCart();
      showToast(`Order #${res.order.orderNumber} placed successfully!`);
      router.push(`/orders/confirmation?orderId=${res.order.id}`);
    } catch (err: any) {
      setSubmitting(false);
      setErrorMessage('Order checkout failed. Please verify stock availability and try again.');
    }
  };

  return (
    <main className="max-w-container-max mx-auto px-4 md:px-8 py-8 w-full font-sans">
      <div className="mb-8">
        <span className="text-[#FF561F] text-xs font-bold uppercase tracking-wider block mb-1">Secure Order Checkout</span>
        <h1 className="text-3xl font-black text-[#102a43]">Checkout & Payment</h1>
      </div>

      {errorMessage && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-5 py-3.5 rounded-2xl text-xs font-bold flex items-center gap-2">
          <span className="material-symbols-outlined text-lg">error</span>
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Delivery Address & Payment Method */}
        <div className="lg:col-span-8 space-y-6">
          {/* Section 1: Shipping Address */}
          <div className="bg-white rounded-3xl border border-gray-200 p-6 md:p-8 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
              <span className="w-6 h-6 rounded-full bg-[#FF561F] text-white flex items-center justify-center text-xs font-bold">1</span>
              <h2 className="text-base font-extrabold text-[#102a43]">Shipping Address (India)</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#F4F5F7] border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#FF561F]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Contact Phone *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#F4F5F7] border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#FF561F]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Address Line 1 *</label>
              <input
                type="text"
                required
                value={addressLine1}
                onChange={e => setAddressLine1(e.target.value)}
                placeholder="House / Flat No., Building Name, Street"
                className="w-full px-4 py-2.5 bg-[#F4F5F7] border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#FF561F]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Address Line 2 (Optional)</label>
              <input
                type="text"
                value={addressLine2}
                onChange={e => setAddressLine2(e.target.value)}
                placeholder="Landmark, Area, Colony"
                className="w-full px-4 py-2.5 bg-[#F4F5F7] border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#FF561F]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">City *</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#F4F5F7] border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#FF561F]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">State *</label>
                <input
                  type="text"
                  required
                  value={state}
                  onChange={e => setState(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#F4F5F7] border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#FF561F]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Pincode *</label>
                <input
                  type="text"
                  required
                  value={postalCode}
                  onChange={e => setPostalCode(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#F4F5F7] border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#FF561F]"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Delivery Option */}
          <div className="bg-white rounded-3xl border border-gray-200 p-6 md:p-8 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
              <span className="w-6 h-6 rounded-full bg-[#FF561F] text-white flex items-center justify-center text-xs font-bold">2</span>
              <h2 className="text-base font-extrabold text-[#102a43]">Select Delivery Type</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center gap-3 ${
                deliveryType === 'INDIVIDUAL_HOME' ? 'border-[#FF561F] bg-orange-50/20 ring-2 ring-[#FF561F]' : 'border-gray-200'
              }`}>
                <input
                  type="radio"
                  name="delivery"
                  checked={deliveryType === 'INDIVIDUAL_HOME'}
                  onChange={() => setDeliveryType('INDIVIDUAL_HOME')}
                  className="text-[#FF561F] focus:ring-[#FF561F]"
                />
                <div>
                  <div className="font-bold text-xs text-[#102a43]">Home Courier Delivery</div>
                  <div className="text-[11px] text-gray-500">Delivered via Delhivery Express (₹99)</div>
                </div>
              </label>

              <label className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center gap-3 ${
                deliveryType === 'SCHOOL_BULK' ? 'border-[#FF561F] bg-orange-50/20 ring-2 ring-[#FF561F]' : 'border-gray-200'
              }`}>
                <input
                  type="radio"
                  name="delivery"
                  checked={deliveryType === 'SCHOOL_BULK'}
                  onChange={() => setDeliveryType('SCHOOL_BULK')}
                  className="text-[#FF561F] focus:ring-[#FF561F]"
                />
                <div>
                  <div className="font-bold text-xs text-[#102a43]">School Campus Bulk Drop</div>
                  <div className="text-[11px] text-gray-500">Pick up at {activeSchool?.name || 'Partner School Store'} (FREE)</div>
                </div>
              </label>
            </div>
          </div>

          {/* Section 3: Payment Method */}
          <div className="bg-white rounded-3xl border border-gray-200 p-6 md:p-8 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
              <span className="w-6 h-6 rounded-full bg-[#FF561F] text-white flex items-center justify-center text-xs font-bold">3</span>
              <h2 className="text-base font-extrabold text-[#102a43]">Payment Option</h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { id: 'CREDIT_CARD', label: 'Credit / Debit Card', icon: 'credit_card' },
                { id: 'UPI', label: 'UPI / GPay / PhonePe', icon: 'qr_code_2' },
                { id: 'NET_BANKING', label: 'Net Banking', icon: 'account_balance' },
                { id: 'COD', label: 'Pay on Delivery', icon: 'payments' }
              ].map(pm => (
                <button
                  key={pm.id}
                  type="button"
                  onClick={() => setPaymentMethod(pm.id as any)}
                  className={`p-4 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
                    paymentMethod === pm.id
                      ? 'bg-[#102a43] text-white border-[#102a43] shadow-md ring-2 ring-[#FF561F]'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <span className="material-symbols-outlined text-2xl">{pm.icon}</span>
                  <span className="text-[11px] font-bold">{pm.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Place Order */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-3xl border border-gray-200 p-6 md:p-8 shadow-sm sticky top-24 space-y-6">
            <h2 className="text-lg font-black text-[#102a43] border-b border-gray-100 pb-3">Cart Items ({cartCount})</h2>

            <div className="max-h-60 overflow-y-auto space-y-3 pr-1">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-xs border-b border-gray-50 pb-2">
                  <div>
                    <div className="font-bold text-[#102a43] line-clamp-1">{item.productName}</div>
                    <div className="text-[10px] text-gray-400">Size {item.selectedSize} × {item.quantity}</div>
                  </div>
                  <div className="font-black text-gray-800">
                    ₹{(item.priceSnapshot * item.quantity).toLocaleString('en-IN')}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2.5 text-xs border-t border-gray-100 pt-4">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-bold text-gray-800">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>GST (8%)</span>
                <span className="font-bold text-gray-800">₹{tax.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className="font-bold text-gray-800">{shippingFee === 0 ? 'FREE' : `₹${shippingFee}`}</span>
              </div>

              <div className="border-t border-gray-100 pt-3 flex justify-between items-center text-sm font-black text-[#102a43]">
                <span>Total Payable</span>
                <span className="text-xl text-[#FF561F]">₹{totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#FF561F] hover:bg-[#E64A1A] text-white font-extrabold py-4 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#FF561F]/20 transition-all disabled:opacity-50"
            >
              {submitting ? (
                <span>Processing Your Order...</span>
              ) : (
                <>
                  <span className="material-symbols-outlined text-base">check_circle</span>
                  <span>Place Order & Pay ₹{totalAmount.toLocaleString('en-IN')}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </main>
  );
}
