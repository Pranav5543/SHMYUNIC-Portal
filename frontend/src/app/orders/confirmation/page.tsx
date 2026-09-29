'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { fetchOrderById } from '@/services/api';
import { useApp } from '@/context/AppContext';
import RoleGuard from '@/components/RoleGuard';

function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId') || searchParams.get('id');
  const { user } = useApp();

  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      fetchOrderById(orderId)
        .then(data => {
          if (data.order) setOrder(data.order);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [orderId]);

  return (
    <main className="min-h-[85vh] bg-[#FCFCFB] py-12 px-4 md:px-8 font-sans">
      <div className="max-w-2xl mx-auto">
        
        {/* Celebratory Confirmation Card */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-xl p-6 md:p-10 text-center animate-fade-in">
          <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-6 ring-8 ring-emerald-50/50 shadow-inner">
            <span className="material-symbols-outlined text-4xl">check_circle</span>
          </div>

          <span className="text-[10px] font-extrabold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full inline-block mb-3">
            Payment Verified • Order Placed
          </span>

          <h1 className="text-2xl md:text-3xl font-black text-[#102a43] mb-2">
            Order Placed Successfully!
          </h1>
          <p className="text-xs text-gray-500 mb-6 max-w-md mx-auto leading-relaxed">
            Thank you for your uniform purchase. We have received your order and our automated fulfillment facility has begun processing.
          </p>

          {/* Order Snapshot Box */}
          <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 text-left mb-8 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200 pb-3">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase block">Order Identification</span>
                <span className="text-sm font-black text-[#102a43]">{order ? `#${order.orderNumber}` : '#SMU-ORD-2026-CONFIRMED'}</span>
              </div>
              <div className="sm:text-right">
                <span className="text-[10px] font-bold text-gray-400 uppercase block">Order Date</span>
                <span className="text-xs font-bold text-gray-700">{order ? new Date(order.createdAt).toLocaleDateString() : new Date().toLocaleDateString()}</span>
              </div>
            </div>

            {/* Item Breakdown */}
            {order?.items && order.items.length > 0 && (
              <div className="space-y-2.5">
                <span className="text-[10px] font-extrabold uppercase text-gray-400 tracking-wider block">
                  Purchased Uniform Items ({order.items.length}):
                </span>
                {order.items.map((item: any) => (
                  <div key={item.id} className="flex items-center justify-between text-xs bg-white p-3 rounded-xl border border-gray-200">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <img
                        src={item.productImage || 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=100&q=80'}
                        alt={item.productNameSnapshot}
                        className="w-10 h-12 object-cover rounded-lg border border-gray-100 shrink-0"
                      />
                      <div className="truncate">
                        <div className="font-bold text-[#102a43] truncate">{item.productNameSnapshot}</div>
                        <div className="text-[10px] text-gray-400">Size: {item.selectedSize} • Qty: {item.quantity}</div>
                      </div>
                    </div>
                    <span className="font-black text-[#102a43] shrink-0">
                      ₹{item.subtotal ? Number(item.subtotal).toLocaleString('en-IN') : '—'}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Total and Delivery Snapshot */}
            <div className="border-t border-gray-200 pt-3 flex items-center justify-between text-xs">
              <div>
                <span className="text-gray-500 block">Total Amount Paid:</span>
                <span className="text-base font-black text-[#FF561F]">
                  ₹{order?.totalAmount ? Number(order.totalAmount).toLocaleString('en-IN') : '—'}
                </span>
              </div>
              <div className="text-right">
                <span className="text-gray-500 block">Carrier:</span>
                <span className="font-bold text-emerald-700">Delhivery Express (3-4 Days)</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            {orderId && (
              <Link
                href={`/orders/${orderId}/track`}
                className="w-full sm:w-auto py-3 px-6 bg-[#FF561F] hover:bg-[#E64A1A] text-white text-xs font-extrabold rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-base">local_shipping</span>
                <span>Track Live Delivery</span>
              </Link>
            )}

            <Link
              href="/shop/orders"
              className="w-full sm:w-auto py-3 px-6 bg-[#102a43] hover:bg-[#243b53] text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-base">receipt_long</span>
              <span>View All Orders</span>
            </Link>

            <Link
              href="/student/store"
              className="w-full sm:w-auto py-3 px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-all"
            >
              Continue Shopping
            </Link>
          </div>
        </div>

      </div>
    </main>
  );
}

export default function OrderConfirmationPage() {
  return (
    <RoleGuard allowedRoles={['STUDENT_PARENT', 'GENERAL_CUSTOMER', 'EMPLOYEE', 'INTERNAL_ADMIN']}>
      <Suspense fallback={<div className="py-20 text-center text-xs font-bold text-gray-400">Loading Order Confirmation...</div>}>
        <OrderConfirmationContent />
      </Suspense>
    </RoleGuard>
  );
}
