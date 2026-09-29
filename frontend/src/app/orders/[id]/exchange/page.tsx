'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchOrderById, submitReturnRequest } from '@/services/api';
import { useApp } from '@/context/AppContext';

export default function ExchangeRequestPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user, showToast } = useApp();
  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<string>('');
  const [reason, setReason] = useState<string>('Size Too Small');
  const [targetSize, setTargetSize] = useState<string>('L');
  const [comments, setComments] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetchOrderById(params.id)
      .then(data => {
        if (data.order) {
          setOrder(data.order);
          if (data.order.items && data.order.items.length > 0) {
            setSelectedItem(data.order.items[0].id);
          }
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.id]);

  if (!user) {
    return (
      <main className="max-w-container-max mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-3xl border border-gray-200 p-8 max-w-md mx-auto shadow-sm">
          <h2 className="text-xl font-black text-[#102a43] mb-2">Authentication Required</h2>
          <p className="text-xs text-gray-500 mb-6">Please sign in to request an order return or size exchange.</p>
          <Link href={`/auth/login?returnUrl=/orders/${params.id}/exchange`} className="bg-[#FF561F] text-white px-6 py-3 rounded-xl text-xs font-bold inline-block shadow-md">
            Sign In Now
          </Link>
        </div>
      </main>
    );
  }

  if (loading) {
    return <div className="py-20 text-center text-xs font-bold text-gray-400">Loading order details...</div>;
  }

  if (!order) {
    return (
      <main className="max-w-container-max mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-3xl border border-gray-200 p-8 max-w-md mx-auto shadow-sm">
          <h2 className="text-xl font-black text-gray-700 mb-2">Order Not Found</h2>
          <Link href="/shop/orders" className="text-xs font-bold text-[#FF561F] hover:underline">
            &larr; Back to My Orders
          </Link>
        </div>
      </main>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await submitReturnRequest(params.id, {
        orderItemId: selectedItem,
        reason,
        targetSize,
        comments
      });
      setSubmitting(false);
      if (res.returnRequest) {
        setSubmitted(true);
        showToast('Exchange request submitted successfully!');
      } else {
        showToast(res.error || 'Failed to submit exchange request');
      }
    } catch (err) {
      setSubmitting(false);
      showToast('Error submitting exchange request');
    }
  };

  return (
    <main className="max-w-container-max mx-auto px-4 md:px-8 py-8 w-full font-sans">
      <Link href="/shop/orders" className="text-xs font-extrabold text-[#102a43] hover:text-[#FF561F] transition-colors inline-flex items-center gap-1 mb-6">
        &larr; Back to Order History
      </Link>

      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <span className="text-[#FF561F] text-xs font-bold uppercase tracking-wider block mb-1">Easy 7-Day Doorstep Exchange</span>
          <h1 className="text-2xl md:text-3xl font-black text-[#102a43]">Request Size Exchange / Return</h1>
          <p className="text-xs text-gray-500 mt-1">Order #{order.orderNumber} • Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
        </div>

        {submitted ? (
          <div className="bg-white rounded-3xl border border-gray-200 p-8 md:p-12 text-center shadow-sm">
            <span className="material-symbols-outlined text-5xl text-emerald-600 mb-3">published_with_changes</span>
            <h2 className="text-xl font-black text-[#102a43] mb-2">Exchange Request Registered</h2>
            <p className="text-xs text-gray-500 mb-6 max-w-md mx-auto">
              Our courier executive will pick up your item and deliver the replacement size <strong className="text-[#102a43]">({targetSize})</strong> within 3 business days.
            </p>
            <Link href="/shop/orders" className="bg-[#FF561F] text-white px-6 py-3 rounded-xl text-xs font-bold inline-block shadow-md">
              View Order Status
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 md:p-10 space-y-6">
            {/* Item Selection */}
            <div>
              <label className="block text-xs font-bold text-[#102a43] mb-2">Select Item to Exchange / Return *</label>
              <div className="space-y-3">
                {(order.items || []).map((item: any) => (
                  <label
                    key={item.id}
                    className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                      selectedItem === item.id ? 'bg-orange-50/60 border-[#FF561F]' : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="exchangeItem"
                        checked={selectedItem === item.id}
                        onChange={() => setSelectedItem(item.id)}
                        className="accent-[#FF561F]"
                      />
                      <div>
                        <div className="text-xs font-bold text-[#102a43]">{item.productNameSnapshot}</div>
                        <div className="text-[11px] text-gray-400">Current Size: {item.selectedSize} • Qty: {item.quantity}</div>
                      </div>
                    </div>
                    <span className="text-xs font-black text-[#FF561F]">₹{item.unitPrice}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Exchange Reason */}
            <div>
              <label className="block text-xs font-bold text-[#102a43] mb-1">Reason for Exchange *</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#FF561F]"
              >
                <option value="Size Too Small">Size Too Small (Request Larger Size)</option>
                <option value="Size Too Large">Size Too Large (Request Smaller Size)</option>
                <option value="Defective / Damaged">Fabric Defect / Damaged on Arrival</option>
                <option value="Wrong Item Received">Received Different Size/Color</option>
              </select>
            </div>

            {/* Replacement Size Selection */}
            <div>
              <label className="block text-xs font-bold text-[#102a43] mb-2">Select Preferred Replacement Size *</label>
              <div className="flex flex-wrap gap-2">
                {['XS', 'S', 'M', 'L', 'XL', '2XL'].map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => setTargetSize(sz)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                      targetSize === sz
                        ? 'bg-[#102a43] text-white border-[#102a43] shadow-md'
                        : 'bg-gray-50 text-gray-700 border-gray-200'
                    }`}
                  >
                    Size {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Additional Comments */}
            <div>
              <label className="block text-xs font-bold text-[#102a43] mb-1">Additional Notes / Fitting Details</label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Mention any specific instructions for pickup or fitting..."
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#FF561F] h-24"
              />
            </div>

            {/* Pickup Address Confirmation */}
            <div className="bg-blue-50 p-4 rounded-2xl border border-blue-200 text-xs">
              <span className="font-extrabold text-blue-900 block mb-1">Doorstep Pickup Address:</span>
              <p className="text-blue-800">{order.shippingAddress}</p>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 bg-[#FF561F] hover:bg-[#E64A1A] text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-base">swap_horiz</span>
              <span>{submitting ? 'Submitting Request...' : 'Submit Exchange Request'}</span>
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
