'use client';

import React, { useState, useEffect } from 'react';
import RoleGuard from '@/components/RoleGuard';
import Sidebar from '@/components/Sidebar';
import DataTable from '@/components/DataTable';
import { useApp } from '@/context/AppContext';
import { fetchOrders, updateOrderStatus } from '@/services/api';

export default function OperationsDashboardPage() {
  const { showToast } = useApp();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = () => {
    setLoading(true);
    fetchOrders()
      .then(data => {
        if (data.orders) setOrders(data.orders);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleUpdateStatus = (orderId: string, orderStatus: string, shippingStatus: string) => {
    updateOrderStatus(orderId, orderStatus, shippingStatus)
      .then(res => {
        if (res.error) showToast(`Error: ${res.error}`);
        else {
          showToast(`Order status updated to ${orderStatus}`);
          loadOrders();
        }
      });
  };

  return (
    <RoleGuard allowedRoles={['WAREHOUSE', 'INTERNAL_ADMIN']}>
      <div className="flex-1 flex bg-[#FAFAFA]">
        <Sidebar />
        <main className="flex-1 p-6 md:p-8">
          <div className="mb-6">
            <span className="text-[10px] font-extrabold uppercase tracking-wider bg-cyan-100 text-cyan-900 px-2.5 py-0.5 rounded">
              Fulfillment Operations (/operations/dashboard)
            </span>
            <h1 className="text-2xl font-black text-[#102a43]">Logistics & Warehouse Station</h1>
            <p className="text-xs text-gray-500">Live Orders, Packing & Logistics Dispatch</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
              <span className="text-xs font-bold text-gray-400">Total Live Orders</span>
              <div className="text-2xl font-black text-[#102a43]">{orders.length}</div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
              <span className="text-xs font-bold text-gray-400">Needs Packing</span>
              <div className="text-2xl font-black text-[#FF561F]">
                {orders.filter(o => o.orderStatus === 'CONFIRMED' || o.orderStatus === 'PROCESSING').length}
              </div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
              <span className="text-xs font-bold text-gray-400">Dispatched / Shipped</span>
              <div className="text-2xl font-black text-emerald-600">
                {orders.filter(o => o.orderStatus === 'SHIPPED' || o.orderStatus === 'DELIVERED').length}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-gray-400 font-bold">Loading orders...</div>
          ) : (
            <DataTable
              searchPlaceholder="Search order number or customer..."
              columns={[
                { header: 'Order Number', cell: (r: any) => <span className="font-bold text-[#102a43]">{r.orderNumber}</span> },
                { header: 'Customer', cell: (r: any) => (
                  <div>
                    <div className="font-bold">{r.customerName}</div>
                    <div className="text-[10px] text-gray-400">{r.customerEmail}</div>
                  </div>
                )},
                { header: 'Items', cell: (r: any) => <span>{(r.items || []).length} item(s)</span> },
                { header: 'Total (₹)', cell: (r: any) => <span className="font-bold text-[#FF561F]">₹{r.totalAmount.toLocaleString('en-IN')}</span> },
                { header: 'Order Status', cell: (r: any) => (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    r.orderStatus === 'DELIVERED' ? 'bg-emerald-100 text-emerald-800' :
                    r.orderStatus === 'SHIPPED' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {r.orderStatus}
                  </span>
                )},
                { header: 'Dispatch Action', cell: (r: any) => (
                  <div className="flex items-center gap-2">
                    {r.orderStatus === 'CONFIRMED' && (
                      <button
                        onClick={() => handleUpdateStatus(r.id, 'PROCESSING', 'LABEL_CREATED')}
                        className="bg-blue-600 text-white px-2.5 py-1 rounded text-[10px] font-bold"
                      >
                        Start Pick
                      </button>
                    )}
                    {(r.orderStatus === 'PROCESSING' || r.orderStatus === 'CONFIRMED') && (
                      <button
                        onClick={() => handleUpdateStatus(r.id, 'PACKED', 'LABEL_CREATED')}
                        className="bg-[#FF561F] text-white px-2.5 py-1 rounded text-[10px] font-bold"
                      >
                        Mark Packed
                      </button>
                    )}
                    {r.orderStatus === 'PACKED' && (
                      <button
                        onClick={() => handleUpdateStatus(r.id, 'SHIPPED', 'IN_TRANSIT')}
                        className="bg-emerald-600 text-white px-2.5 py-1 rounded text-[10px] font-bold"
                      >
                        Dispatch / Ship
                      </button>
                    )}
                    {r.orderStatus === 'SHIPPED' && (
                      <button
                        onClick={() => handleUpdateStatus(r.id, 'DELIVERED', 'DELIVERED')}
                        className="bg-green-700 text-white px-2.5 py-1 rounded text-[10px] font-bold"
                      >
                        Mark Delivered
                      </button>
                    )}
                    {r.orderStatus === 'DELIVERED' && (
                      <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">verified</span> Delivered
                      </span>
                    )}
                  </div>
                )}
              ]}
              data={orders}
            />
          )}
        </main>
      </div>
    </RoleGuard>
  );
}
