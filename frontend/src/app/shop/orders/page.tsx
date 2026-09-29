'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { fetchOrders, addToCartApi } from '@/services/api';

function OrdersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const createdOrderId = searchParams.get('created');
  const { user, refreshCart, showToast } = useApp();

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reorderingId, setReorderingId] = useState<string | null>(null);

  const loadUserOrders = () => {
    if (user) {
      setLoading(true);
      fetchOrders()
        .then(data => {
          if (data.orders) setOrders(data.orders);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserOrders();
  }, [user]);

  const handleBuyAgain = async (order: any) => {
    setReorderingId(order.id);
    try {
      let addedCount = 0;
      for (const item of order.items || []) {
        const res = await addToCartApi(item.productId, item.selectedSize, item.quantity, item.productVariantId);
        if (res.items) {
          addedCount++;
        }
      }
      await refreshCart();
      showToast(`Added ${addedCount} items from Order #${order.orderNumber} to your cart!`);
      router.push('/shop/cart');
    } catch (err) {
      showToast('Failed to reorder items');
    } finally {
      setReorderingId(null);
    }
  };

  if (!user) {
    return (
      <main className="max-w-container-max mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-3xl border border-gray-200 p-8 max-w-md mx-auto shadow-sm">
          <h2 className="text-xl font-black text-[#102a43] mb-2">Authentication Required</h2>
          <p className="text-xs text-gray-500 mb-6">Please sign in to view your orders.</p>
          <Link href="/auth/login?returnUrl=/shop/orders" className="bg-[#FF561F] text-white px-6 py-3 rounded-xl text-xs font-bold inline-block shadow-md">
            Sign In Now
          </Link>
        </div>
      </main>
    );
  }

  const orderTimelineSteps = ['CONFIRMED', 'PROCESSING', 'PACKED', 'SHIPPED', 'DELIVERED'];

  return (
    <main className="max-w-container-max mx-auto px-4 md:px-8 py-8 w-full font-sans">
      <div className="flex items-center justify-between mb-8">
        <div>
          <span className="text-[#FF561F] text-xs font-bold uppercase tracking-wider block mb-1">Customer Order History</span>
          <h1 className="text-2xl md:text-3xl font-black text-[#102a43]">My Account Orders</h1>
        </div>

        <button
          onClick={loadUserOrders}
          className="text-xs font-bold text-[#102a43] bg-gray-100 hover:bg-gray-200 px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5"
        >
          <span className="material-symbols-outlined text-base">refresh</span>
          <span>Refresh Live Status</span>
        </button>
      </div>

      {createdOrderId && (
        <div className="mb-6 bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-start gap-3">
          <span className="material-symbols-outlined text-emerald-600 text-xl">check_circle</span>
          <div>
            <h3 className="text-xs font-bold text-emerald-900">Order Successfully Confirmed #{createdOrderId}</h3>
            <p className="text-xs text-emerald-700">Your order has been placed successfully and dispatched to fulfillment.</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center text-xs font-bold text-gray-400">Loading your orders...</div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center max-w-md mx-auto shadow-sm">
          <span className="material-symbols-outlined text-5xl text-gray-300 mb-2">package_2</span>
          <h3 className="text-base font-bold text-gray-700">No orders found</h3>
          <p className="text-xs text-gray-400 mb-6">You haven't placed any orders yet.</p>
          <Link href="/student/store" className="bg-[#FF561F] text-white px-6 py-3 rounded-xl text-xs font-bold inline-block shadow-md">
            Explore School Store
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const currentStepIdx = orderTimelineSteps.indexOf(order.orderStatus);

            const statusColors: Record<string, string> = {
              CONFIRMED: 'bg-blue-100 text-blue-800 border-blue-200',
              PROCESSING: 'bg-amber-100 text-amber-800 border-amber-200',
              PACKED: 'bg-purple-100 text-purple-800 border-purple-200',
              SHIPPED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
              DELIVERED: 'bg-green-100 text-green-800 border-green-200',
              CANCELLED: 'bg-red-100 text-red-800 border-red-200'
            };

            return (
              <div key={order.id} className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 md:p-8 space-y-6">
                {/* Order Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-lg font-black text-[#102a43]">#{order.orderNumber}</h2>
                      <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border uppercase ${statusColors[order.orderStatus] || 'bg-gray-100 text-gray-700'}`}>
                        {order.orderStatus}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-left md:text-right">
                      <div className="text-xs text-gray-400">Total Amount</div>
                      <div className="text-xl font-black text-[#FF561F]">₹{order.totalAmount.toLocaleString('en-IN')}</div>
                    </div>

                    <button
                      onClick={() => handleBuyAgain(order)}
                      disabled={reorderingId === order.id}
                      className="bg-[#FF561F] hover:bg-[#E64A1A] text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined text-base">replay</span>
                      <span>{reorderingId === order.id ? 'Reordering...' : 'Buy Again'}</span>
                    </button>
                  </div>
                </div>

                {/* Real-time Order Progress Stepper */}
                <div className="bg-[#F8FAFC] rounded-2xl p-4 border border-gray-200/60">
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 mb-3">Live Order Tracking Progress</div>
                  <div className="grid grid-cols-5 gap-2">
                    {orderTimelineSteps.map((step, idx) => {
                      const isDone = idx <= currentStepIdx;
                      const isCurrent = idx === currentStepIdx;
                      return (
                        <div key={step} className="flex flex-col items-center text-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all mb-1 ${
                            isCurrent
                              ? 'bg-[#FF561F] text-white ring-4 ring-[#FF561F]/20'
                              : isDone
                              ? 'bg-emerald-600 text-white'
                              : 'bg-gray-200 text-gray-400'
                          }`}>
                            {isDone ? '✓' : idx + 1}
                          </div>
                          <span className={`text-[9px] font-extrabold uppercase ${isCurrent ? 'text-[#FF561F]' : isDone ? 'text-gray-700' : 'text-gray-400'}`}>
                            {step}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Items List */}
                <div className="space-y-4">
                  {(order.items || []).map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between gap-4 text-xs border-b border-gray-50 pb-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.productImage || 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=200&q=80'}
                          alt={item.productNameSnapshot}
                          className="w-12 h-14 object-cover rounded-lg border border-gray-100"
                        />
                        <div>
                          <div className="font-bold text-[#102a43]">{item.productNameSnapshot}</div>
                          <div className="text-[11px] text-gray-400">Size: {item.selectedSize} • Qty: {item.quantity} • SKU: {item.skuSnapshot}</div>
                        </div>
                      </div>

                      <div className="font-black text-[#102a43]">
                        ₹{item.subtotal.toLocaleString('en-IN')}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Fulfillment & Address Footer */}
                <div className="bg-[#F4F5F7] rounded-2xl p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="font-extrabold text-[#102a43] block mb-1">Shipping Address:</span>
                    <p className="text-gray-600">{order.shippingAddress}</p>
                  </div>

                  {order.fulfillmentOrders && order.fulfillmentOrders.length > 0 && (
                    <div>
                      <span className="font-extrabold text-[#102a43] block mb-1">Logistics & Delivery:</span>
                      <p className="text-gray-600">Carrier: {order.fulfillmentOrders[0].carrier || 'Delhivery Express'}</p>
                      <p className="text-[#FF561F] font-bold mt-0.5">Tracking #: {order.fulfillmentOrders[0].trackingNumber || 'DELHIVERY-99887766'}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-xs font-bold text-gray-400">Loading Orders...</div>}>
      <OrdersContent />
    </Suspense>
  );
}
