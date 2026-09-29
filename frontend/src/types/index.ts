export type UserRole =
  | 'STUDENT_PARENT'
  | 'GENERAL_CUSTOMER'
  | 'EMPLOYEE'
  | 'SCHOOL_ADMIN'
  | 'INTERNAL_ADMIN'
  | 'VENDOR'
  | 'WAREHOUSE';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone?: string;
  schoolId?: string;
  companyId?: string;
  vendorId?: string;
  isEmailVerified: boolean;
  createdAt: string;
}

export interface Child {
  id: string;
  parentId: string;
  name: string;
  schoolId?: string;
  schoolName: string;
  grade: string;
  studentId: string;
  school?: School;
}

export interface School {
  id: string;
  name: string;
  code: string;
  address: string;
  city?: string;
  logoUrl?: string;
  totalStudents: number;
}

export interface Company {
  id: string;
  name: string;
  code: string;
  logoUrl?: string;
  approvedCatalogIds: string[];
}

export interface Vendor {
  id: string;
  name: string;
  contactEmail: string;
  rating: number;
  capacityPerMonth: number;
  activeOrders: number;
}

export interface ProductVariant {
  id: string;
  sku: string;
  size: string;
  color: string;
  stock: number;
  price: number;
  isAvailable?: boolean;
  displayOrder?: number;
  imageUrl?: string;
}

export interface AcademicYear {
  id: string;
  schoolId: string;
  year: string;
  isCurrent: boolean;
  status: string;
}

export interface UniformType {
  id: string;
  classId: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  displayOrder: number;
  status: string;
  products?: Product[];
  _count?: { products: number };
}

export interface SchoolClass {
  id: string;
  schoolId: string;
  name: string;
  code: string;
  displayOrder: number;
  status: string;
  uniformTypes?: UniformType[];
  products?: Product[];
  _count?: { products: number };
}

export interface School {
  id: string;
  name: string;
  code: string;
  address: string;
  contactEmail?: string;
  phone?: string;
  status?: string;
  logoUrl?: string;
  totalStudents: number;
  classesCount?: number;
  productsCount?: number;
  academicYears?: AcademicYear[];
  classes?: SchoolClass[];
}

export type ProductType =
  | 'SHIRT'
  | 'T_SHIRT'
  | 'POLO'
  | 'TROUSER'
  | 'PANTS'
  | 'SHORTS'
  | 'SKIRT'
  | 'DRESS'
  | 'BLAZER'
  | 'JACKET'
  | 'SWEATER'
  | 'CARDIGAN'
  | 'TIE'
  | 'BELT'
  | 'SOCKS'
  | 'SHOES'
  | 'SCHOOL_SHOES'
  | 'SPORTS_SHOES'
  | 'BOOTS'
  | 'BAG'
  | 'BACKPACK'
  | 'CAP'
  | 'APRON'
  | 'CHEF_COAT'
  | 'SCRUB_TOP'
  | 'SCRUB_PANTS'
  | 'COVERALL'
  | 'SAFETY_VEST'
  | 'SAFETY_SHOES'
  | 'PPE'
  | 'TRACKSUIT';

export type SizeType = 'CLOTHING' | 'SCHOOL_CLOTHING' | 'SHOES' | 'SOCKS' | 'BAGS';

export type CatalogAvailability = 'AVAILABLE' | 'OUT_OF_STOCK' | 'TEMPORARILY_UNAVAILABLE' | 'COMING_SOON' | 'INACTIVE';

export interface Product {
  id: string;
  sku?: string;
  name: string;
  description: string;
  category: string;
  categorySlug?: string;
  productType?: ProductType;
  sizeType?: SizeType;
  brand?: string;
  gender: 'BOYS' | 'GIRLS' | 'MEN' | 'WOMEN' | 'UNISEX';
  schoolId?: string;
  classId?: string;
  className?: string;
  uniformTypeId?: string;
  uniformTypeName?: string;
  academicYearId?: string;
  academicYear?: string;
  companyId?: string;
  price: number;
  basePrice?: number;
  salePrice?: number;
  originalPrice?: number;
  displayOrder?: number;
  availabilityStatus?: CatalogAvailability;
  school?: School;
  categoryId?: string;
  images: string[];
  variants?: ProductVariant[];
  sizes?: string[];
  availableSizes?: string[];
  sizeMatrix?: Array<{ id?: string; size: string; isAvailable: boolean; price: number }>;
  colors?: string[];
  stock?: number;
  isAvailableStudent?: boolean;
  isAvailableGeneral?: boolean;
  isAvailableCorporate?: boolean;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  selectedSize: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerRole: UserRole;
  schoolId?: string;
  schoolName?: string;
  companyId?: string;
  companyName?: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shippingFee: number;
  totalAmount: number;
  orderStatus: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'PACKED' | 'DISPATCHED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  shippingStatus: 'LABEL_CREATED' | 'IN_TRANSIT' | 'OUT_FOR_DELIVERY' | 'DELIVERED';
  deliveryType: 'SCHOOL_BULK' | 'INDIVIDUAL_HOME';
  shippingAddress: string;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryItem {
  id: string;
  productId: string;
  sku: string;
  productName: string;
  stockAvailable: number;
  stockReserved: number;
  reorderThreshold: number;
  warehouseLocation: string;
  status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
  updatedAt: string;
}

export interface StockMovement {
  id: string;
  inventoryId: string;
  sku: string;
  changeQuantity: number;
  previousStock: number;
  newStock: number;
  reason: string;
  updatedBy: string;
  timestamp: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userEmail: string;
  action: string;
  entity: string;
  entityId: string;
  oldValue?: string;
  newValue?: string;
  timestamp: string;
}
