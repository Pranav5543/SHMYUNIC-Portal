'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchOrderById } from '@/services/api';
import { useApp } from '@/context/AppContext';
import RoleGuard from '@/components/RoleGuard';

export default function OrderDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
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
      <main className="max-w-container-max mx-auto px-4 py-16 text-center font-sans">
        <div className="bg-white rounded-3xl border border-gray-200 p-8 max-w-md mx-auto shadow-sm">
          <h2 className="text-xl font-black text-[#102a43] mb-2">Authentication Required</h2>
          <p className="text-xs text-gray-500 mb-6">Please sign in to view order specifications.</p>
          <Link href={`/auth/login?returnUrl=/orders/${params.id}`} className="bg-[#FF561F] text-white px-6 py-3 rounded-xl text-xs font-bold inline-block shadow-md">
            Sign In Now
          </Link>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="max-w-container-max mx-auto px-4 py-20 text-center font-sans">
        <div className="text-xs font-bold text-gray-400">Loading order details...</div>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="max-w-container-max mx-auto px-4 py-20 text-center font-sans">
        <div className="bg-white rounded-3xl border border-gray-200 p-8 max-w-md mx-auto shadow-sm">
          <h2 className="text-xl font-black text-gray-700 mb-2">Order Not Found</h2>
          <p className="text-xs text-gray-400 mb-6">We could not locate this order in your account.</p>
          <Link href="/shop/orders" className="text-xs font-bold text-[#FF561F] hover:underline">
            &larr; Back to Order History
          </Link>
        </div>
      </main>
    );
  }

  const items = order.items || [];
  const trackingNumber = order.fulfillmentOrders?.[0]?.trackingNumber || 'DELHIVERY-99887766';

  return (
    <main className="min-h-[85vh] bg-[#FCFCFB] py-8 px-4 md:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Back navigation & header actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link href="/shop/orders" className="text-xs font-extrabold text-[#102a43] hover:text-[#FF561F] transition-colors inline-flex items-center gap-1 mb-2">
              &larr; Back to All Orders
            </Link>
            <h1 className="text-2xl md:text-3xl font-black text-[#102a43]">
              Order #{order.orderNumber}
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/orders/${order.id}/track`}
              className="py-2.5 px-4 bg-[#FF561F] hover:bg-[#E64A1A] text-white text-xs font-extrabold rounded-xl shadow-md transition-all flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-base">local_shipping</span>
              <span>Track Delivery</span>
            </Link>

            <Link
              href={`/orders/${order.id}/exchange`}
              className="py-2.5 px-4 bg-white border border-gray-200 hover:border-gray-400 text-[#102a43] text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
            >
              <span className="material-symbols-outlined text-base">sync_alt</span>
              <span>Request Exchange</span>
            </Link>
          </div>
        </div>

        {/* Main Order Details Card */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 md:p-8 space-y-6">

          {/* Status and Logistics Strip */}
          <div className="bg-gray-50 rounded-2xl p-4 md:p-6 border border-gray-200 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase block">Order Status</span>
              <span className="inline-block mt-1 text-xs font-extrabold uppercase px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                {order.orderStatus}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase block">Payment Status</span>
              <span className="inline-block mt-1 text-xs font-extrabold uppercase px-2.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                {order.paymentStatus}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase block">Carrier Logistics</span>
              <span className="text-xs font-black text-[#102a43] block mt-1">Delhivery Express</span>
              <span className="text-[10px] text-gray-400 font-mono">{trackingNumber}</span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase block">Delivery Mode</span>
              <span className="text-xs font-bold text-[#102a43] block mt-1">
                {order.deliveryType === 'SCHOOL_BULK' ? 'School Campus Drop' : 'Individual Home Delivery'}
              </span>
            </div>
          </div>

          {/* Purchased Uniform Items */}
          <div>
            <h2 className="text-xs font-extrabold text-[#102a43] uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#FF561F] text-base">checkroom</span>
              Uniform Items in this Order ({items.length})
            </h2>

            <div className="divide-y divide-gray-100 border border-gray-200 rounded-2xl overflow-hidden">
              {items.map((item: any) => (
                <div key={item.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <img
                      src={item.productImage || 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=150&q=80'}
                      alt={item.productNameSnapshot}
                      className="w-16 h-20 object-cover rounded-xl border border-gray-200 shrink-0"
                    />
                    <div>
                      <h3 className="font-extrabold text-sm text-[#102a43]">{item.productNameSnapshot}</h3>
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                        <span className="bg-gray-100 font-bold px-2 py-0.5 rounded text-[#102a43]">
                          Size: {item.selectedSize}
                        </span>
                        <span>•</span>
                        <span>Qty: {item.quantity}</span>
                        <span>•</span>
                        <span>SKU: {item.skuSnapshot || 'SKU-STD'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="sm:text-right flex sm:flex-col items-center sm:items-end justify-between">
                    <div className="text-sm font-black text-[#FF561F]">
                      ₹{Number(item.subtotal || item.unitPrice * item.quantity).toLocaleString('en-IN')}
                    </div>
                    <Link
                      href={`/orders/${order.id}/exchange`}
                      className="text-[11px] font-bold text-blue-600 hover:underline mt-1"
                    >
                      Exchange Size &rarr;
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Address & Pricing Summary Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
            <div>
              <span className="text-xs font-black text-[#102a43] uppercase tracking-wider block mb-2">
                Shipping Destination
              </span>
              <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-200">
                {order.shippingAddress || 'Flat 402, Royal Palms Apartments, Madhapur, Hyderabad - 500081'}<br />
                Recipient: {user.firstName} {user.lastName}
              </p>
            </div>

            <div className="space-y-2 text-xs bg-gray-50 p-4 rounded-xl border border-gray-200">
              <span className="text-xs font-black text-[#102a43] uppercase tracking-wider block mb-3">
                Payment Breakdown
              </span>
              <div className="flex justify-between text-gray-500">
                <span>Subtotal:</span>
                <span className="font-bold text-[#102a43]">₹{Number(order.subtotal || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>GST (8%):</span>
                <span className="font-bold text-[#102a43]">₹{Number(order.tax || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Shipping Fee:</span>
                <span className="font-bold text-[#102a43]">{Number(order.shippingFee) === 0 ? 'FREE' : `₹${order.shippingFee}`}</span>
              </div>
              <div className="flex justify-between text-sm font-black text-[#102a43] border-t border-gray-200 pt-2">
                <span>Total Paid:</span>
                <span className="text-base text-[#FF561F]">₹{Number(order.totalAmount || 0).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </main>
  );
}
