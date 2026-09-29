'use client';

import React, { useState, useEffect } from 'react';
import RoleGuard from '@/components/RoleGuard';
import Sidebar from '@/components/Sidebar';
import DataTable from '@/components/DataTable';
import StaffMasterCatalogManager from '@/components/admin/StaffMasterCatalogManager';
import { useApp } from '@/context/AppContext';
import { fetchProducts, fetchInventory, updateStock, createProduct, fetchAuditLogs, fetchCategories } from '@/services/api';
import { Product } from '@/types';

export default function MasterAdminDashboardPage() {
  const { showToast } = useApp();
  const [activeTab, setActiveTab] = useState<'master_catalog' | 'products' | 'inventory' | 'audit'>('master_catalog');

  const [products, setProducts] = useState<Product[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit Stock State
  const [editingSku, setEditingSku] = useState<string | null>(null);
  const [newStockVal, setNewStockVal] = useState<number>(0);
  const [adjustReason, setAdjustReason] = useState('Admin Stock Adjustment');

  // New Product Modal State
  const [showProductModal, setShowProductModal] = useState(false);
  const [prodName, setProdName] = useState('');
  const [prodSku, setProdSku] = useState('');
  const [prodPrice, setProdPrice] = useState(1299);
  const [prodCategoryId, setProdCategoryId] = useState('');
  const [prodDesc, setProdDesc] = useState('');

  const loadData = () => {
    setLoading(true);
    Promise.all([
      fetchProducts({ role: 'INTERNAL_ADMIN' }),
      fetchInventory(),
      fetchAuditLogs(),
      fetchCategories()
    ]).then(([prodRes, invRes, auditRes, catRes]) => {
      if (prodRes.products) setProducts(prodRes.products);
      if (invRes.inventory) setInventory(invRes.inventory);
      if (auditRes.auditLogs) setAuditLogs(auditRes.auditLogs);
      if (catRes.categories) {
        setCategories(catRes.categories);
        if (catRes.categories.length > 0) {
          setProdCategoryId(catRes.categories[0].id);
        }
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStockUpdateSubmit = (sku: string) => {
    updateStock(sku, newStockVal, adjustReason).then(res => {
      if (res.error) showToast(`Error: ${res.error}`);
      else {
        showToast(`Stock updated for ${sku}!`);
        setEditingSku(null);
        loadData();
      }
    });
  };

  const handleCreateProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createProduct({
      name: prodName,
      sku: prodSku,
      price: prodPrice,
      categoryId: prodCategoryId,
      description: prodDesc,
      sizeType: 'CLOTHING',
      gender: 'UNISEX',
      brand: 'Master Signature',
      status: 'ACTIVE',
      images: ['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80']
    }).then(res => {
      if (res.error) showToast(`Error: ${res.error}`);
      else {
        showToast(`Product ${prodName} created successfully!`);
        setShowProductModal(false);
        setProdName('');
        setProdSku('');
        setProdDesc('');
        loadData();
      }
    }).catch(() => {
      showToast('Failed to create product');
    });
  };

  return (
    <RoleGuard allowedRoles={['INTERNAL_ADMIN']}>
      <div className="flex-1 flex bg-[#FAFAFA]">
        <Sidebar />
        <main className="flex-1 p-6 md:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider bg-slate-900 text-white px-2.5 py-0.5 rounded">
                Master Admin Portal (/admin/dashboard)
              </span>
              <h1 className="text-2xl font-black text-[#102a43] mt-1">Master Executive Dashboard</h1>
              <p className="text-xs text-gray-500">Master Product Catalog, Stock Engine & Audit Trails</p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowProductModal(true)}
                className="bg-[#FF561F] hover:bg-[#E64A1A] text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-md flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-base">add</span> Add New Product
              </button>
              <div className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" /> System Active
              </div>
            </div>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-5 mb-8">
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
              <span className="text-xs font-bold text-gray-400">Total Products in DB</span>
              <div className="text-2xl font-black text-[#102a43]">{products.length}</div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
              <span className="text-xs font-bold text-gray-400">Inventory Items Managed</span>
              <div className="text-2xl font-black text-[#FF561F]">{inventory.length}</div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
              <span className="text-xs font-bold text-gray-400">Audit Logs Recorded</span>
              <div className="text-2xl font-black text-purple-600">{auditLogs.length}</div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
              <span className="text-xs font-bold text-gray-400">System Status</span>
              <div className="text-sm font-bold text-emerald-600 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" /> Active
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-gray-200 mb-6 gap-6 text-xs font-bold text-gray-500 overflow-x-auto">
            <button
              onClick={() => setActiveTab('master_catalog')}
              className={`pb-3 transition-colors border-b-2 flex items-center gap-1.5 ${
                activeTab === 'master_catalog' ? 'border-[#FF561F] text-[#FF561F]' : 'border-transparent hover:text-gray-800'
              }`}
            >
              <span className="material-symbols-outlined text-base">account_tree</span>
              Master School Catalog (Schools → Classes → Uniforms)
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`pb-3 transition-colors border-b-2 ${activeTab === 'products' ? 'border-[#FF561F] text-[#FF561F]' : 'border-transparent hover:text-gray-800'}`}
            >
              Flat Product Catalog ({products.length})
            </button>
            <button
              onClick={() => setActiveTab('inventory')}
              className={`pb-3 transition-colors border-b-2 ${activeTab === 'inventory' ? 'border-[#FF561F] text-[#FF561F]' : 'border-transparent hover:text-gray-800'}`}
            >
              Real-time Inventory Ledger ({inventory.length})
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`pb-3 transition-colors border-b-2 ${activeTab === 'audit' ? 'border-[#FF561F] text-[#FF561F]' : 'border-transparent hover:text-gray-800'}`}
            >
              Security & Audit Logs ({auditLogs.length})
            </button>
          </div>

          <div>
            {activeTab === 'master_catalog' && <StaffMasterCatalogManager />}
              {activeTab === 'products' && (
                <DataTable<Product>
                  searchPlaceholder="Search products by SKU, name, category..."
                  data={products}
                  columns={[
                    { header: 'SKU', accessorKey: 'sku' },
                    { header: 'Product Name', accessorKey: 'name' },
                    { header: 'Category', accessorKey: 'category' },
                    { header: 'Gender', accessorKey: 'gender' },
                    {
                      header: 'Base Price',
                      cell: (row) => `₹${row.price}`
                    },
                    {
                      header: 'Status',
                      cell: (row) => (
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800">
                          {row.status || 'ACTIVE'}
                        </span>
                      )
                    }
                  ]}
                />
              )}

              {activeTab === 'inventory' && (
                <div className="space-y-4">
                  <DataTable
                    searchPlaceholder="Search inventory by SKU, size, color..."
                    data={inventory}
                    columns={[
                      { header: 'SKU', accessorKey: 'sku' },
                      { header: 'Size', accessorKey: 'size' },
                      { header: 'Color', accessorKey: 'color' },
                      {
                        header: 'Stock Count',
                        cell: (row: any) => (
                          <div className="flex items-center gap-2">
                            <span className={`font-bold ${row.stock < 10 ? 'text-red-600' : 'text-emerald-700'}`}>
                              {row.stock} units
                            </span>
                            {editingSku === row.sku ? (
                              <div className="flex items-center gap-1 bg-white p-1 rounded border border-gray-300">
                                <input
                                  type="number"
                                  className="w-16 px-1 py-0.5 border text-xs"
                                  value={newStockVal}
                                  onChange={e => setNewStockVal(Number(e.target.value))}
                                />
                                <button
                                  onClick={() => handleStockUpdateSubmit(row.sku)}
                                  className="bg-emerald-600 text-white px-2 py-0.5 rounded text-[10px]"
                                >
                                  Save
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => { setEditingSku(row.sku); setNewStockVal(row.stock); }}
                                className="text-[10px] text-blue-600 hover:underline"
                              >
                                Edit
                              </button>
                            )}
                          </div>
                        )
                      }
                    ]}
                  />
                </div>
              )}

              {activeTab === 'audit' && (
                <DataTable
                  searchPlaceholder="Search audit logs..."
                  data={auditLogs}
                  columns={[
                    { header: 'Log ID', accessorKey: 'id' },
                    { header: 'User Email', accessorKey: 'userEmail' },
                    { header: 'Action', accessorKey: 'action' },
                    { header: 'Entity', accessorKey: 'entity' },
                    { header: 'Timestamp', cell: (row: any) => new Date(row.timestamp).toLocaleString() }
                  ]}
                />
              )}
            </div>

          {/* New Product Modal */}
          {showProductModal && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
                <h3 className="text-lg font-bold text-[#102a43] mb-4">Add New Product to Catalog</h3>
                <form onSubmit={handleCreateProductSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Product Name</label>
                    <input
                      type="text"
                      required
                      value={prodName}
                      onChange={e => setProdName(e.target.value)}
                      className="w-full px-3 py-2 border rounded-xl text-xs"
                      placeholder="e.g. Premium Cotton Polo"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">SKU</label>
                    <input
                      type="text"
                      required
                      value={prodSku}
                      onChange={e => setProdSku(e.target.value)}
                      className="w-full px-3 py-2 border rounded-xl text-xs"
                      placeholder="e.g. SMU-POLO-001"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Price (₹)</label>
                      <input
                        type="number"
                        required
                        value={prodPrice}
                        onChange={e => setProdPrice(Number(e.target.value))}
                        className="w-full px-3 py-2 border rounded-xl text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Category</label>
                      <select
                        value={prodCategoryId}
                        onChange={e => setProdCategoryId(e.target.value)}
                        className="w-full px-3 py-2 border rounded-xl text-xs bg-white"
                      >
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Description</label>
                    <textarea
                      value={prodDesc}
                      onChange={e => setProdDesc(e.target.value)}
                      className="w-full px-3 py-2 border rounded-xl text-xs"
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-2 pt-3">
                    <button
                      type="button"
                      onClick={() => setShowProductModal(false)}
                      className="flex-1 py-2 bg-gray-100 text-gray-700 font-bold rounded-xl text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2 bg-[#FF561F] text-white font-bold rounded-xl text-xs shadow-md"
                    >
                      Save Product
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </RoleGuard>
  );
}
