import { UserRole } from '../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

function getHeaders(token?: string | null) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  const activeToken = token || (typeof window !== 'undefined' ? localStorage.getItem('smu_token') : null);
  if (activeToken) {
    headers['Authorization'] = `Bearer ${activeToken}`;
  }
  return headers;
}

export async function loginUser(email: string, password: string, role: UserRole) {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, role })
  });
  return res.json();
}

export async function registerUser(payload: any) {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return res.json();
}

export async function fetchCurrentUser(token?: string) {
  const res = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: getHeaders(token)
  });
  return res.json();
}

export async function fetchSchools() {
  const res = await fetch(`${API_BASE_URL}/schools`);
  return res.json();
}

export async function fetchCompanies() {
  const res = await fetch(`${API_BASE_URL}/companies`);
  return res.json();
}

export async function fetchChildren() {
  const res = await fetch(`${API_BASE_URL}/children`, {
    headers: getHeaders()
  });
  return res.json();
}

export async function createChild(payload: { name: string; schoolId?: string; schoolName?: string; grade: string; studentId?: string }) {
  const res = await fetch(`${API_BASE_URL}/children`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(payload)
  });
  return res.json();
}

export async function updateChild(id: string, updates: any) {
  const res = await fetch(`${API_BASE_URL}/children/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(updates)
  });
  return res.json();
}

export async function deleteChild(id: string) {
  const res = await fetch(`${API_BASE_URL}/children/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  return res.json();
}

export interface FilterParams {
  role?: UserRole;
  schoolId?: string;
  companyId?: string;
  category?: string;
  productType?: string;
  gender?: string;
  color?: string;
  size?: string;
  search?: string;
  sort?: string;
}

export async function fetchProducts(params?: FilterParams) {
  const queryParams: Record<string, string> = {};
  if (params?.role) queryParams.role = params.role;
  if (params?.schoolId) queryParams.schoolId = params.schoolId;
  if (params?.companyId) queryParams.companyId = params.companyId;
  if (params?.category && params.category !== 'All') queryParams.category = params.category;
  if (params?.productType && params.productType !== 'All') queryParams.productType = params.productType;
  if (params?.gender && params.gender !== 'All') queryParams.gender = params.gender;
  if (params?.color && params.color !== 'All') queryParams.color = params.color;
  if (params?.size && params.size !== 'All') queryParams.size = params.size;
  if (params?.search) queryParams.search = params.search;
  if (params?.sort && params.sort !== 'recommended') queryParams.sort = params.sort;

  const query = new URLSearchParams(queryParams).toString();
  const res = await fetch(`${API_BASE_URL}/products?${query}`, {
    headers: getHeaders()
  });
  return res.json();
}

export async function fetchSchoolProducts(schoolId: string, params?: FilterParams) {
  const queryParams: Record<string, string> = {};
  if (params?.category && params.category !== 'All') queryParams.category = params.category;
  if (params?.productType && params.productType !== 'All') queryParams.productType = params.productType;
  if (params?.gender && params.gender !== 'All') queryParams.gender = params.gender;
  if (params?.color && params.color !== 'All') queryParams.color = params.color;
  if (params?.size && params.size !== 'All') queryParams.size = params.size;
  if (params?.search) queryParams.search = params.search;
  if (params?.sort && params.sort !== 'recommended') queryParams.sort = params.sort;

  const query = new URLSearchParams(queryParams).toString();
  const url = `${API_BASE_URL}/schools/${schoolId}/products${query ? `?${query}` : ''}`;
  const res = await fetch(url, { headers: getHeaders() });
  return res.json();
}

export async function fetchCompanyProducts(companyId: string, params?: FilterParams) {
  const queryParams: Record<string, string> = {};
  if (params?.category && params.category !== 'All') queryParams.category = params.category;
  if (params?.productType && params.productType !== 'All') queryParams.productType = params.productType;
  if (params?.gender && params.gender !== 'All') queryParams.gender = params.gender;
  if (params?.color && params.color !== 'All') queryParams.color = params.color;
  if (params?.size && params.size !== 'All') queryParams.size = params.size;
  if (params?.search) queryParams.search = params.search;
  if (params?.sort && params.sort !== 'recommended') queryParams.sort = params.sort;

  const query = new URLSearchParams(queryParams).toString();
  const url = `${API_BASE_URL}/companies/${companyId}/products${query ? `?${query}` : ''}`;
  const res = await fetch(url, { headers: getHeaders() });
  return res.json();
}

export async function fetchProductById(id: string) {
  const res = await fetch(`${API_BASE_URL}/products/${id}`, {
    headers: getHeaders()
  });
  return res.json();
}

export async function createProduct(payload: any) {
  const res = await fetch(`${API_BASE_URL}/products`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(payload)
  });
  return res.json();
}

export async function updateProduct(id: string, updates: any) {
  const res = await fetch(`${API_BASE_URL}/products/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(updates)
  });
  return res.json();
}

export async function fetchCategories() {
  const res = await fetch(`${API_BASE_URL}/categories`);
  return res.json();
}

// Cart API Functions
export async function fetchCart() {
  const res = await fetch(`${API_BASE_URL}/cart`, {
    headers: getHeaders()
  });
  return res.json();
}

export async function addToCartApi(productId: string, selectedSize: string, quantity = 1, productVariantId?: string) {
  const res = await fetch(`${API_BASE_URL}/cart/items`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ productId, selectedSize, quantity, productVariantId })
  });
  return res.json();
}

export async function updateCartItemApi(itemId: string, quantity: number) {
  const res = await fetch(`${API_BASE_URL}/cart/items/${itemId}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify({ quantity })
  });
  return res.json();
}

export async function removeFromCartApi(itemId: string) {
  const res = await fetch(`${API_BASE_URL}/cart/items/${itemId}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  return res.json();
}

export async function clearCartApi() {
  const res = await fetch(`${API_BASE_URL}/cart`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  return res.json();
}

export async function fetchInventory() {
  const res = await fetch(`${API_BASE_URL}/inventory`, {
    headers: getHeaders()
  });
  return res.json();
}

export async function updateStock(sku: string, newStock: number, reason: string) {
  const res = await fetch(`${API_BASE_URL}/inventory/update`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ sku, newStock, reason })
  });
  return res.json();
}

export async function fetchOrders() {
  const res = await fetch(`${API_BASE_URL}/orders`, {
    headers: getHeaders()
  });
  return res.json();
}

export async function fetchOrderById(id: string) {
  const res = await fetch(`${API_BASE_URL}/orders/${id}`, {
    headers: getHeaders()
  });
  return res.json();
}

export async function createOrder(payload: any) {
  const res = await fetch(`${API_BASE_URL}/orders`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(payload)
  });
  return res.json();
}

export async function updateOrderStatus(orderId: string, orderStatus: string, shippingStatus: string) {
  const res = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify({ orderStatus, shippingStatus })
  });
  return res.json();
}

export async function fetchAuditLogs() {
  const res = await fetch(`${API_BASE_URL}/admin/audit-logs`, {
    headers: getHeaders()
  });
  return res.json();
}

// Wishlist API Functions
export async function fetchWishlist() {
  const res = await fetch(`${API_BASE_URL}/wishlist`, {
    headers: getHeaders()
  });
  return res.json();
}

export async function addToWishlistApi(productId: string) {
  const res = await fetch(`${API_BASE_URL}/wishlist/items`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ productId })
  });
  return res.json();
}

export async function removeFromWishlistApi(productId: string) {
  const res = await fetch(`${API_BASE_URL}/wishlist/items/${productId}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  return res.json();
}

// Return & Size Exchange API Functions
export async function submitReturnRequest(orderId: string, payload: { orderItemId?: string; reason: string; targetSize?: string; comments?: string }) {
  const res = await fetch(`${API_BASE_URL}/orders/${orderId}/exchange`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(payload)
  });
  return res.json();
}

export async function fetchReturnRequest(orderId: string) {
  const res = await fetch(`${API_BASE_URL}/orders/${orderId}/exchange`, {
    headers: getHeaders()
  });
  return res.json();
}

// Bulk Quote API Function
export async function submitBulkQuote(payload: { orgName: string; contactName: string; email: string; phone?: string; quantity: number | string; notes?: string }) {
  const res = await fetch(`${API_BASE_URL}/quote`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(payload)
  });
  return res.json();
}

// School Admin Metrics API Function
export async function fetchSchoolAdminMetrics(schoolId?: string) {
  const query = schoolId ? `?schoolId=${schoolId}` : '';
  const res = await fetch(`${API_BASE_URL}/school-admin/metrics${query}`, {
    headers: getHeaders()
  });
  return res.json();
}

// Vendor Purchase Orders API Function
export async function fetchVendorPurchaseOrders() {
  const res = await fetch(`${API_BASE_URL}/vendor/purchase-orders`, {
    headers: getHeaders()
  });
  return res.json();
}

// ============================================================
// Master Catalog API Functions
// ============================================================

export interface MasterCatalogParams {
  schoolId?: string;
  classId?: string;
  uniformTypeId?: string;
  category?: string;
  gender?: string;
  search?: string;
  sort?: string;
}

export async function fetchMasterCatalog(params?: MasterCatalogParams) {
  const queryParams: Record<string, string> = {};
  if (params?.schoolId) queryParams.schoolId = params.schoolId;
  if (params?.classId && params.classId !== 'All') queryParams.classId = params.classId;
  if (params?.uniformTypeId && params.uniformTypeId !== 'All') queryParams.uniformTypeId = params.uniformTypeId;
  if (params?.category && params.category !== 'All') queryParams.category = params.category;
  if (params?.gender && params.gender !== 'All') queryParams.gender = params.gender;
  if (params?.search) queryParams.search = params.search;
  if (params?.sort && params.sort !== 'recommended') queryParams.sort = params.sort;

  const query = new URLSearchParams(queryParams).toString();
  const res = await fetch(`${API_BASE_URL}/catalog${query ? `?${query}` : ''}`, {
    headers: getHeaders()
  });
  return res.json();
}

export async function fetchAllSchoolsAdmin() {
  const res = await fetch(`${API_BASE_URL}/catalog/schools`, {
    headers: getHeaders()
  });
  return res.json();
}

export async function createSchoolAdmin(payload: any) {
  const res = await fetch(`${API_BASE_URL}/catalog/schools`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(payload)
  });
  return res.json();
}

export async function updateSchoolAdmin(id: string, payload: any) {
  const res = await fetch(`${API_BASE_URL}/catalog/schools/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(payload)
  });
  return res.json();
}

export async function fetchSchoolClasses(schoolId: string) {
  const res = await fetch(`${API_BASE_URL}/schools/${schoolId}/classes`, {
    headers: getHeaders()
  });
  return res.json();
}

export async function createClassAdmin(schoolId: string, payload: any) {
  const res = await fetch(`${API_BASE_URL}/schools/${schoolId}/classes`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(payload)
  });
  return res.json();
}

export async function updateClassAdmin(id: string, payload: any) {
  const res = await fetch(`${API_BASE_URL}/classes/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(payload)
  });
  return res.json();
}

export async function fetchClassUniformTypes(classId: string) {
  const res = await fetch(`${API_BASE_URL}/classes/${classId}/uniform-types`, {
    headers: getHeaders()
  });
  return res.json();
}

export async function createUniformTypeAdmin(classId: string, payload: any) {
  const res = await fetch(`${API_BASE_URL}/classes/${classId}/uniform-types`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(payload)
  });
  return res.json();
}

export async function updateUniformTypeAdmin(id: string, payload: any) {
  const res = await fetch(`${API_BASE_URL}/uniform-types/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(payload)
  });
  return res.json();
}

export async function updateProductCatalogDetails(id: string, payload: any) {
  const res = await fetch(`${API_BASE_URL}/products/${id}/catalog`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(payload)
  });
  return res.json();
}


