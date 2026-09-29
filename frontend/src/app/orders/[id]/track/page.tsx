'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchOrderById } from '@/services/api';
import { useApp } from '@/context/AppContext';

export default function OrderTrackingPage({ params }: { params: { id: string } }) {
  const { user } = useApp();
  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrderById(params.id)
      .then(data => {
        if (data.order) setOrder(data.order);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.id]);

  if (!user) {
    return (
      <main className="max-w-container-max mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-3xl border border-gray-200 p-8 max-w-md mx-auto shadow-sm">
          <h2 className="text-xl font-black text-[#102a43] mb-2">Authentication Required</h2>
          <p className="text-xs text-gray-500 mb-6">Please sign in to track your order.</p>
          <Link href={`/auth/login?returnUrl=/orders/${params.id}/track`} className="bg-[#FF561F] text-white px-6 py-3 rounded-xl text-xs font-bold inline-block shadow-md">
            Sign In Now
          </Link>
        </div>
      </main>
    );
  }

  if (loading) {
    return <div className="py-20 text-center text-xs font-bold text-gray-400">Loading tracking status...</div>;
  }

  if (!order) {
    return (
      <main className="max-w-container-max mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-3xl border border-gray-200 p-8 max-w-md mx-auto shadow-sm">
          <h2 className="text-xl font-black text-gray-700 mb-2">Order Not Found</h2>
          <Link href="/shop/orders" className="text-xs font-bold text-[#FF561F] hover:underline">
            &larr; Back to Orders
          </Link>
        </div>
      </main>
    );
  }

  const trackingSteps = [
    { label: 'Order Confirmed', date: new Date(order.createdAt).toLocaleDateString(), done: true },
    { label: 'Processing & Quality Check', date: 'In Progress', done: ['PROCESSING', 'PACKED', 'SHIPPED', 'DELIVERED'].includes(order.orderStatus) },
    { label: 'Dispatched with Carrier', date: order.fulfillmentOrders?.[0]?.trackingNumber || 'Pending', done: ['SHIPPED', 'DELIVERED'].includes(order.orderStatus) },
    { label: 'Out for Doorstep Delivery', date: 'Expected in 2 Days', done: order.orderStatus === 'DELIVERED' }
  ];

  return (
    <main className="max-w-container-max mx-auto px-4 md:px-8 py-8 w-full font-sans">
      <Link href="/shop/orders" className="text-xs font-extrabold text-[#102a43] hover:text-[#FF561F] transition-colors inline-flex items-center gap-1 mb-6">
        &larr; Back to Orders List
      </Link>

      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 md:p-10 space-y-8 max-w-3xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-6">
          <div>
            <span className="text-[#FF561F] text-xs font-extrabold uppercase tracking-wider block mb-1">Live Delivery Tracking</span>
            <h1 className="text-2xl font-black text-[#102a43]">Order #{order.orderNumber}</h1>
            <p className="text-xs text-gray-400 mt-0.5">Carrier: Delhivery Express • Tracking #: {order.fulfillmentOrders?.[0]?.trackingNumber || 'DELHIVERY-99887766'}</p>
          </div>

          <div className="bg-orange-50 border border-orange-200 px-4 py-2 rounded-2xl text-right">
            <span className="text-[10px] font-bold text-gray-500 uppercase block">Estimated Delivery</span>
            <span className="text-sm font-black text-[#FF561F]">3-4 Business Days</span>
          </div>
        </div>

        {/* Vertical Interactive Tracking Timeline */}
        <div className="space-y-6 relative pl-6 border-l-2 border-orange-100 ml-4">
          {trackingSteps.map((step, idx) => (
            <div key={step.label} className="relative flex items-start gap-4">
              <div className={`absolute -left-[31px] w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow-sm ${
                step.done ? 'bg-[#FF561F] text-white ring-4 ring-orange-100' : 'bg-gray-200 text-gray-400'
              }`}>
                {step.done ? '✓' : idx + 1}
              </div>

              <div>
                <h3 className={`text-sm font-extrabold ${step.done ? 'text-[#102a43]' : 'text-gray-400'}`}>{step.label}</h3>
                <p className="text-xs text-gray-400 mt-0.5">{step.date}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Delivery Address & Order Items Summary */}
        <div className="bg-gray-50 rounded-2xl p-6 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs border border-gray-200">
          <div>
            <span className="font-extrabold text-[#102a43] block mb-1">Delivery Address:</span>
            <p className="text-gray-600">{order.shippingAddress}</p>
          </div>

          <div>
            <span className="font-extrabold text-[#102a43] block mb-1">Items Included:</span>
            <ul className="space-y-1 text-gray-600">
              {(order.items || []).map((item: any) => (
                <li key={item.id}>
                  • {item.productNameSnapshot} (Size: {item.selectedSize}, Qty: {item.quantity})
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
