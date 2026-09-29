/**
 * ShopMyUniform Seed Dataset with Taxonomically Accurate Product Types & Visual Assets
 */

export interface SeedProduct {
  id: string;
  sku: string;
  name: string;
  description: string;
  category: string;
  productType: string;
  sizeType: 'CLOTHING' | 'SCHOOL_CLOTHING' | 'SHOES' | 'SOCKS' | 'BAGS';
  brand: string;
  gender: 'BOYS' | 'GIRLS' | 'MEN' | 'WOMEN' | 'UNISEX';
  basePrice: number;
  customerPrice: number;
  schoolId?: string;
  companyId?: string;
  isAvailableStudent: boolean;
  isAvailableGeneral: boolean;
  isAvailableCorporate: boolean;
  images: string[];
  sizes: string[];
  colors: string[];
  variantStockMap?: Record<string, number>;
  stock: number;
}

export const SEED_SCHOOLS = [
  { id: 'sch-001', name: 'Greenwood High International School', code: 'GW-INT', address: 'Bangalore, India', totalStudents: 2400 },
  { id: 'sch-002', name: 'Oakridge International School', code: 'OAK-INT', address: 'Hyderabad, India', totalStudents: 1850 },
  { id: 'sch-003', name: 'Global International Academy', code: 'GIA-BLR', address: 'Mumbai, India', totalStudents: 1600 }
];

export const SEED_COMPANIES = [
  { id: 'cmp-001', name: 'Acme Corporation Global', code: 'ACME-CORP', approvedCatalogIds: [] },
  { id: 'cmp-002', name: 'TechNova Solutions Ltd', code: 'TECH-NOVA', approvedCatalogIds: [] }
];

export const SEED_VENDORS = [
  { id: 'vnd-001', name: 'Apex Apparel & Mills Ltd', contactEmail: 'supply@apexapparel.com', rating: 4.9, capacityPerMonth: 25000, activeOrders: 14 },
  { id: 'vnd-002', name: 'TextileCraft Uniform Solutions', contactEmail: 'orders@textilecraft.com', rating: 4.8, capacityPerMonth: 18000, activeOrders: 9 }
];

export const SEED_CATEGORIES = [
  'School Uniforms',
  'Corporate',
  'Healthcare',
  'Hospitality',
  'Industrial Workwear',
  'Sportswear',
  'PPE',
  'Accessories'
];

export const SEED_TEST_USERS = [
  {
    email: 'student.parent@test.shopmyuniform.com',
    role: 'STUDENT_PARENT',
    firstName: 'Arun',
    lastName: 'Sharma',
    schoolId: 'sch-001',
    password: 'Password123!'
  },
  {
    email: 'customer@test.shopmyuniform.com',
    role: 'GENERAL_CUSTOMER',
    firstName: 'Priya',
    lastName: 'Verma',
    password: 'Password123!'
  },
  {
    email: 'employee@test.shopmyuniform.com',
    role: 'EMPLOYEE',
    firstName: 'Vikram',
    lastName: 'Patel',
    companyId: 'cmp-001',
    password: 'Password123!'
  },
  {
    email: 'schooladmin@test.shopmyuniform.com',
    role: 'SCHOOL_ADMIN',
    firstName: 'Dr. Sarah',
    lastName: 'Mathew',
    schoolId: 'sch-001',
    password: 'Password123!'
  },
  {
    email: 'admin@test.shopmyuniform.com',
    role: 'INTERNAL_ADMIN',
    firstName: 'Master',
    lastName: 'Administrator',
    password: 'Password123!'
  },
  {
    email: 'vendor@test.shopmyuniform.com',
    role: 'VENDOR',
    firstName: 'Rajesh',
    lastName: 'Kumar',
    vendorId: 'vnd-001',
    password: 'Password123!'
  },
  {
    email: 'fulfillment@test.shopmyuniform.com',
    role: 'WAREHOUSE',
    firstName: 'Karan',
    lastName: 'Singh',
    password: 'Password123!'
  }
];

export function generate100Products(): SeedProduct[] {
  const products: SeedProduct[] = [];

  // Dedicated High-Quality Image URLs by Product Type
  const imgShirt = 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80';
  const imgTrouser = 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=800&q=80';
  const imgSkirt = 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?auto=format&fit=crop&w=800&q=80';
  const imgBlazer = 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80';
  const imgSchoolShoe = 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80';
  const imgSportsShoe = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80';
  const imgBackpack = 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80';
  const imgSocks = 'https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?auto=format&fit=crop&w=800&q=80';
  const imgTie = 'https://images.unsplash.com/photo-1598554747436-c9293d6a588f?auto=format&fit=crop&w=800&q=80';
  const imgPolo = 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80';
  const imgCorpPolo = 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80';
  const imgScrub = 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&w=800&q=80';
  const imgPPE = 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80';
  const imgIndustrial = 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80';
  const imgChef = 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=800&q=80';

  // ============================================================
  // 1. Greenwood High International School (sch-001)
  // ============================================================
  products.push(
    {
      id: 'prd-gw-1',
      sku: 'GW-SHIRT-B',
      name: 'Greenwood Boys White Oxford Formal Shirt',
      description: 'Official Greenwood High crest-stitched formal white Oxford cotton dress shirt for boys.',
      category: 'School Uniforms',
      productType: 'SHIRT',
      sizeType: 'SCHOOL_CLOTHING',
      brand: 'Campus Classics',
      gender: 'BOYS',
      basePrice: 22.50,
      customerPrice: 22.50,
      schoolId: 'sch-001',
      isAvailableStudent: true,
      isAvailableGeneral: false,
      isAvailableCorporate: false,
      images: [imgShirt],
      sizes: ['28', '30', '32', '34', '36'],
      colors: ['White'],
      variantStockMap: { '28': 30, '30': 40, '32': 50, '34': 20, '36': 0 },
      stock: 140
    },
    {
      id: 'prd-gw-2',
      sku: 'GW-SHIRT-G',
      name: 'Greenwood Girls White Oxford Formal Shirt',
      description: 'Greenwood High tailored white formal shirt for girls with rounded collar and chest embroidered logo.',
      category: 'School Uniforms',
      productType: 'SHIRT',
      sizeType: 'SCHOOL_CLOTHING',
      brand: 'Campus Classics',
      gender: 'GIRLS',
      basePrice: 22.50,
      customerPrice: 22.50,
      schoolId: 'sch-001',
      isAvailableStudent: true,
      isAvailableGeneral: false,
      isAvailableCorporate: false,
      images: [imgShirt],
      sizes: ['28', '30', '32', '34', '36'],
      colors: ['White'],
      variantStockMap: { '28': 25, '30': 35, '32': 40, '34': 15, '36': 5 },
      stock: 120
    },
    {
      id: 'prd-gw-3',
      sku: 'GW-TROUSER-B',
      name: 'Greenwood Boys Flat-Front Navy Trousers',
      description: 'Greenwood High navy pleatless uniform pants for boys.',
      category: 'School Uniforms',
      productType: 'TROUSER',
      sizeType: 'SCHOOL_CLOTHING',
      brand: 'Campus Classics',
      gender: 'BOYS',
      basePrice: 28.00,
      customerPrice: 28.00,
      schoolId: 'sch-001',
      isAvailableStudent: true,
      isAvailableGeneral: false,
      isAvailableCorporate: false,
      images: [imgTrouser],
      sizes: ['28', '30', '32', '34', '36'],
      colors: ['Navy Blue'],
      variantStockMap: { '28': 20, '30': 30, '32': 35, '34': 15, '36': 5 },
      stock: 105
    },
    {
      id: 'prd-gw-4',
      sku: 'GW-SKIRT-G',
      name: 'Greenwood Girls Navy Pleated Skirt',
      description: 'Greenwood High official navy box-pleated uniform skirt.',
      category: 'School Uniforms',
      productType: 'SKIRT',
      sizeType: 'SCHOOL_CLOTHING',
      brand: 'Campus Classics',
      gender: 'GIRLS',
      basePrice: 26.00,
      customerPrice: 26.00,
      schoolId: 'sch-001',
      isAvailableStudent: true,
      isAvailableGeneral: false,
      isAvailableCorporate: false,
      images: [imgSkirt],
      sizes: ['26', '28', '30', '32', '34'],
      colors: ['Navy Blue'],
      variantStockMap: { '26': 15, '28': 25, '30': 30, '32': 20, '34': 10 },
      stock: 100
    },
    {
      id: 'prd-gw-5',
      sku: 'GW-BLAZER-B',
      name: 'Greenwood Boys Navy Crested Blazer',
      description: 'Official Greenwood High navy wool-blend crested suit jacket for boys.',
      category: 'School Uniforms',
      productType: 'BLAZER',
      sizeType: 'SCHOOL_CLOTHING',
      brand: 'Campus Classics',
      gender: 'BOYS',
      basePrice: 55.00,
      customerPrice: 55.00,
      schoolId: 'sch-001',
      isAvailableStudent: true,
      isAvailableGeneral: false,
      isAvailableCorporate: false,
      images: [imgBlazer],
      sizes: ['32', '34', '36', '38', '40'],
      colors: ['Navy Blue'],
      variantStockMap: { '32': 15, '34': 25, '36': 0, '38': 10, '40': 5 },
      stock: 55
    },
    {
      id: 'prd-gw-6',
      sku: 'GW-SHOE-B',
      name: 'Greenwood Boys Classic Black Leather School Shoes',
      description: 'Durable full-grain black leather formal lace-up school shoes for boys.',
      category: 'School Uniforms',
      productType: 'SCHOOL_SHOES',
      sizeType: 'SHOES',
      brand: 'FlexStep School',
      gender: 'BOYS',
      basePrice: 38.00,
      customerPrice: 38.00,
      schoolId: 'sch-001',
      isAvailableStudent: true,
      isAvailableGeneral: false,
      isAvailableCorporate: false,
      images: [imgSchoolShoe],
      sizes: ['UK 4', 'UK 5', 'UK 6', 'UK 7', 'UK 8', 'UK 9'],
      colors: ['Black'],
      variantStockMap: { 'UK 4': 10, 'UK 5': 20, 'UK 6': 25, 'UK 7': 15, 'UK 8': 10, 'UK 9': 5 },
      stock: 85
    },
    {
      id: 'prd-gw-7',
      sku: 'GW-SHOE-G',
      name: 'Greenwood Girls Black Leather Buckle Shoes',
      description: 'Comfortable orthotic-soled black leather Mary Jane shoes for girls.',
      category: 'School Uniforms',
      productType: 'SCHOOL_SHOES',
      sizeType: 'SHOES',
      brand: 'FlexStep School',
      gender: 'GIRLS',
      basePrice: 36.00,
      customerPrice: 36.00,
      schoolId: 'sch-001',
      isAvailableStudent: true,
      isAvailableGeneral: false,
      isAvailableCorporate: false,
      images: [imgSchoolShoe],
      sizes: ['UK 3', 'UK 4', 'UK 5', 'UK 6', 'UK 7'],
      colors: ['Black'],
      variantStockMap: { 'UK 3': 15, 'UK 4': 20, 'UK 5': 25, 'UK 6': 10, 'UK 7': 5 },
      stock: 75
    },
    {
      id: 'prd-gw-8',
      sku: 'GW-BACKPACK-01',
      name: 'Greenwood Ergonomic 30L Crested Backpack',
      description: 'Water-resistant multi-compartment padded school backpack with Greenwood emblem.',
      category: 'Accessories',
      productType: 'BACKPACK',
      sizeType: 'BAGS',
      brand: 'Campus Classics',
      gender: 'UNISEX',
      basePrice: 32.00,
      customerPrice: 32.00,
      schoolId: 'sch-001',
      isAvailableStudent: true,
      isAvailableGeneral: true,
      isAvailableCorporate: false,
      images: [imgBackpack],
      sizes: ['One Size'],
      colors: ['Navy/Gold'],
      variantStockMap: { 'One Size': 120 },
      stock: 120
    },
    {
      id: 'prd-gw-9',
      sku: 'GW-SOCKS-01',
      name: 'Greenwood White Cotton Crew Socks (3-Pack)',
      description: 'Ribbed antimicrobial white cotton school crew socks.',
      category: 'Accessories',
      productType: 'SOCKS',
      sizeType: 'SOCKS',
      brand: 'Campus Classics',
      gender: 'UNISEX',
      basePrice: 9.50,
      customerPrice: 9.50,
      schoolId: 'sch-001',
      isAvailableStudent: true,
      isAvailableGeneral: false,
      isAvailableCorporate: false,
      images: [imgSocks],
      sizes: ['Small', 'Medium', 'Large'],
      colors: ['White'],
      variantStockMap: { 'Small': 50, 'Medium': 80, 'Large': 40 },
      stock: 170
    },
    {
      id: 'prd-gw-10',
      sku: 'GW-TIE-01',
      name: 'Greenwood High Woven Striped Tie',
      description: 'Official Greenwood High navy and gold diagonal stripe woven necktie.',
      category: 'Accessories',
      productType: 'TIE',
      sizeType: 'BAGS',
      brand: 'Campus Classics',
      gender: 'UNISEX',
      basePrice: 8.50,
      customerPrice: 8.50,
      schoolId: 'sch-001',
      isAvailableStudent: true,
      isAvailableGeneral: false,
      isAvailableCorporate: false,
      images: [imgTie],
      sizes: ['Standard'],
      colors: ['Navy/Gold'],
      variantStockMap: { 'Standard': 200 },
      stock: 200
    },
    {
      id: 'prd-gw-11',
      sku: 'GW-PE-01',
      name: 'Greenwood Phoenix PE Athletics T-Shirt',
      description: 'Moisture-wicking breathable PE shirt with Greenwood Phoenix crest.',
      category: 'Sportswear',
      productType: 'T_SHIRT',
      sizeType: 'CLOTHING',
      brand: 'Campus Classics',
      gender: 'UNISEX',
      basePrice: 16.00,
      customerPrice: 16.00,
      schoolId: 'sch-001',
      isAvailableStudent: true,
      isAvailableGeneral: false,
      isAvailableCorporate: false,
      images: [imgPolo],
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['Red', 'Blue'],
      variantStockMap: { 'S': 30, 'M': 45, 'L': 50, 'XL': 20 },
      stock: 145
    }
  );

  // ============================================================
  // 2. Oakridge International School (sch-002)
  // ============================================================
  products.push(
    {
      id: 'prd-oak-1',
      sku: 'OAK-SHIRT-B',
      name: 'Oakridge Boys White Formal Shirt',
      description: 'Oakridge signature formal white cotton uniform shirt for boys.',
      category: 'School Uniforms',
      productType: 'SHIRT',
      sizeType: 'SCHOOL_CLOTHING',
      brand: 'Oakridge Heritage',
      gender: 'BOYS',
      basePrice: 24.00,
      customerPrice: 24.00,
      schoolId: 'sch-002',
      isAvailableStudent: true,
      isAvailableGeneral: false,
      isAvailableCorporate: false,
      images: [imgShirt],
      sizes: ['28', '30', '32', '34', '36'],
      colors: ['White'],
      variantStockMap: { '28': 25, '30': 35, '32': 40, '34': 20, '36': 10 },
      stock: 130
    },
    {
      id: 'prd-oak-2',
      sku: 'OAK-TROUSER-B',
      name: 'Oakridge Boys Mid-Grey Trousers',
      description: 'Oakridge tailored mid-grey formal uniform trousers for boys.',
      category: 'School Uniforms',
      productType: 'TROUSER',
      sizeType: 'SCHOOL_CLOTHING',
      brand: 'Oakridge Heritage',
      gender: 'BOYS',
      basePrice: 30.00,
      customerPrice: 30.00,
      schoolId: 'sch-002',
      isAvailableStudent: true,
      isAvailableGeneral: false,
      isAvailableCorporate: false,
      images: [imgTrouser],
      sizes: ['28', '30', '32', '34'],
      colors: ['Grey'],
      variantStockMap: { '28': 15, '30': 25, '32': 30, '34': 10 },
      stock: 80
    },
    {
      id: 'prd-oak-3',
      sku: 'OAK-SKIRT-G',
      name: 'Oakridge Girls Grey Pleated Skirt',
      description: 'Oakridge grey pleated uniform skirt for girls.',
      category: 'School Uniforms',
      productType: 'SKIRT',
      sizeType: 'SCHOOL_CLOTHING',
      brand: 'Oakridge Heritage',
      gender: 'GIRLS',
      basePrice: 28.00,
      customerPrice: 28.00,
      schoolId: 'sch-002',
      isAvailableStudent: true,
      isAvailableGeneral: false,
      isAvailableCorporate: false,
      images: [imgSkirt],
      sizes: ['26', '28', '30', '32'],
      colors: ['Grey'],
      variantStockMap: { '26': 15, '28': 20, '30': 25, '32': 10 },
      stock: 70
    },
    {
      id: 'prd-oak-4',
      sku: 'OAK-SHOE-B',
      name: 'Oakridge Boys Black School Shoes',
      description: 'Oakridge formal black leather shoes for boys.',
      category: 'School Uniforms',
      productType: 'SCHOOL_SHOES',
      sizeType: 'SHOES',
      brand: 'FlexStep School',
      gender: 'BOYS',
      basePrice: 40.00,
      customerPrice: 40.00,
      schoolId: 'sch-002',
      isAvailableStudent: true,
      isAvailableGeneral: false,
      isAvailableCorporate: false,
      images: [imgSchoolShoe],
      sizes: ['UK 4', 'UK 5', 'UK 6', 'UK 7', 'UK 8'],
      colors: ['Black'],
      variantStockMap: { 'UK 4': 10, 'UK 5': 15, 'UK 6': 20, 'UK 7': 10, 'UK 8': 5 },
      stock: 60
    },
    {
      id: 'prd-oak-5',
      sku: 'OAK-BACKPACK-01',
      name: 'Oakridge Heritage Campus Backpack',
      description: 'Oakridge crested burgundy and grey 28L school backpack.',
      category: 'Accessories',
      productType: 'BACKPACK',
      sizeType: 'BAGS',
      brand: 'Oakridge Heritage',
      gender: 'UNISEX',
      basePrice: 34.00,
      customerPrice: 34.00,
      schoolId: 'sch-002',
      isAvailableStudent: true,
      isAvailableGeneral: false,
      isAvailableCorporate: false,
      images: [imgBackpack],
      sizes: ['One Size'],
      colors: ['Burgundy/Grey'],
      variantStockMap: { 'One Size': 90 },
      stock: 90
    }
  );

  // ============================================================
  // 3. Global International Academy (sch-003)
  // ============================================================
  products.push(
    {
      id: 'prd-glb-1',
      sku: 'GIA-SHIRT-B',
      name: 'Global Boys Light Blue Oxford Shirt',
      description: 'Global International Sky Blue Oxford formal shirt for boys.',
      category: 'School Uniforms',
      productType: 'SHIRT',
      sizeType: 'SCHOOL_CLOTHING',
      brand: 'Global Academy',
      gender: 'BOYS',
      basePrice: 21.00,
      customerPrice: 21.00,
      schoolId: 'sch-003',
      isAvailableStudent: true,
      isAvailableGeneral: false,
      isAvailableCorporate: false,
      images: [imgShirt],
      sizes: ['28', '30', '32', '34', '36'],
      colors: ['Light Blue'],
      variantStockMap: { '28': 30, '30': 40, '32': 50, '34': 25, '36': 15 },
      stock: 160
    },
    {
      id: 'prd-glb-2',
      sku: 'GIA-TROUSER-B',
      name: 'Global Boys Dark Navy Trousers',
      description: 'Global International dark navy uniform trousers for boys.',
      category: 'School Uniforms',
      productType: 'TROUSER',
      sizeType: 'SCHOOL_CLOTHING',
      brand: 'Global Academy',
      gender: 'BOYS',
      basePrice: 27.00,
      customerPrice: 27.00,
      schoolId: 'sch-003',
      isAvailableStudent: true,
      isAvailableGeneral: false,
      isAvailableCorporate: false,
      images: [imgTrouser],
      sizes: ['28', '30', '32', '34'],
      colors: ['Navy'],
      variantStockMap: { '28': 20, '30': 30, '32': 35, '34': 15 },
      stock: 100
    },
    {
      id: 'prd-glb-3',
      sku: 'GIA-SHOE-G',
      name: 'Global Girls Black Leather School Shoes',
      description: 'Global Academy classic black shoes for girls.',
      category: 'School Uniforms',
      productType: 'SCHOOL_SHOES',
      sizeType: 'SHOES',
      brand: 'FlexStep School',
      gender: 'GIRLS',
      basePrice: 35.00,
      customerPrice: 35.00,
      schoolId: 'sch-003',
      isAvailableStudent: true,
      isAvailableGeneral: false,
      isAvailableCorporate: false,
      images: [imgSchoolShoe],
      sizes: ['UK 3', 'UK 4', 'UK 5', 'UK 6'],
      colors: ['Black'],
      variantStockMap: { 'UK 3': 10, 'UK 4': 20, 'UK 5': 15, 'UK 6': 5 },
      stock: 50
    }
  );

  // ============================================================
  // 4. Acme Corporation Global (cmp-001) & TechNova (cmp-002)
  // ============================================================
  products.push(
    {
      id: 'prd-acm-1',
      sku: 'ACM-POLO-M',
      name: 'Acme Corp Men Executive Polo Shirt',
      description: 'Official Acme Corporation embroidered performance polo shirt for men.',
      category: 'Corporate',
      productType: 'POLO',
      sizeType: 'CLOTHING',
      brand: 'Executive Signature',
      gender: 'MEN',
      basePrice: 28.00,
      customerPrice: 28.00,
      companyId: 'cmp-001',
      isAvailableStudent: false,
      isAvailableGeneral: false,
      isAvailableCorporate: true,
      images: [imgCorpPolo],
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      colors: ['Navy', 'Black'],
      variantStockMap: { 'S': 30, 'M': 50, 'L': 60, 'XL': 40, 'XXL': 20 },
      stock: 200
    },
    {
      id: 'prd-acm-2',
      sku: 'ACM-SHIRT-M',
      name: 'Acme Corp Men Non-Iron Twill Dress Shirt',
      description: 'Acme Corporation embroidered formal business dress shirt for men.',
      category: 'Corporate',
      productType: 'SHIRT',
      sizeType: 'CLOTHING',
      brand: 'Executive Signature',
      gender: 'MEN',
      basePrice: 34.00,
      customerPrice: 34.00,
      companyId: 'cmp-001',
      isAvailableStudent: false,
      isAvailableGeneral: false,
      isAvailableCorporate: true,
      images: [imgShirt],
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['White', 'Blue'],
      variantStockMap: { 'S': 20, 'M': 40, 'L': 50, 'XL': 30 },
      stock: 140
    },
    {
      id: 'prd-tkn-1',
      sku: 'TKN-POLO-U',
      name: 'TechNova Performance Tech Polo',
      description: 'TechNova Solutions lightweight breathable corporate polo.',
      category: 'Corporate',
      productType: 'POLO',
      sizeType: 'CLOTHING',
      brand: 'TechNova Apparel',
      gender: 'UNISEX',
      basePrice: 30.00,
      customerPrice: 30.00,
      companyId: 'cmp-002',
      isAvailableStudent: false,
      isAvailableGeneral: false,
      isAvailableCorporate: true,
      images: [imgCorpPolo],
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['Grey', 'Black'],
      variantStockMap: { 'S': 25, 'M': 45, 'L': 50, 'XL': 30 },
      stock: 150
    }
  );

  // ============================================================
  // 5. General Retail (Healthcare, PPE, Industrial, Hospitality)
  // ============================================================
  products.push(
    {
      id: 'prd-gen-1',
      sku: 'SMU-MED-SCRUB',
      name: 'MediPro 4-Way Stretch Clinical Scrub Top',
      description: 'Antimicrobial fluid-resistant healthcare scrub top.',
      category: 'Healthcare',
      productType: 'SCRUB_TOP',
      sizeType: 'CLOTHING',
      brand: 'MediPro Clinical',
      gender: 'UNISEX',
      basePrice: 28.00,
      customerPrice: 28.00,
      isAvailableStudent: false,
      isAvailableGeneral: true,
      isAvailableCorporate: true,
      images: [imgScrub],
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
      colors: ['Blue', 'Navy'],
      variantStockMap: { 'XS': 15, 'S': 30, 'M': 45, 'L': 35, 'XL': 20 },
      stock: 145
    },
    {
      id: 'prd-gen-2',
      sku: 'SMU-PPE-VEST',
      name: 'Titan-Shield High-Vis Reflective Safety Vest',
      description: 'Class 2 reflective safety vest for industrial work.',
      category: 'PPE',
      productType: 'SAFETY_VEST',
      sizeType: 'CLOTHING',
      brand: 'Safeguard Technical',
      gender: 'UNISEX',
      basePrice: 14.50,
      customerPrice: 14.50,
      isAvailableStudent: false,
      isAvailableGeneral: true,
      isAvailableCorporate: true,
      images: [imgPPE],
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['Yellow', 'Orange'],
      variantStockMap: { 'S': 50, 'M': 100, 'L': 100, 'XL': 50 },
      stock: 300
    },
    {
      id: 'prd-gen-3',
      sku: 'SMU-IND-COVERALL',
      name: 'IronClad 100% Cotton Heavy-Duty Work Coverall',
      description: 'Industrial manufacturing heavy cotton coverall.',
      category: 'Industrial Workwear',
      productType: 'COVERALL',
      sizeType: 'CLOTHING',
      brand: 'IronClad Workwear',
      gender: 'MEN',
      basePrice: 58.00,
      customerPrice: 58.00,
      isAvailableStudent: false,
      isAvailableGeneral: true,
      isAvailableCorporate: true,
      images: [imgIndustrial],
      sizes: ['38', '40', '42', '44'],
      colors: ['Navy Blue', 'Orange'],
      variantStockMap: { '38': 15, '40': 25, '42': 30, '44': 10 },
      stock: 80
    },
    {
      id: 'prd-gen-4',
      sku: 'SMU-HSP-CHEF',
      name: 'Culinary Master Executive Double-Breasted Chef Coat',
      description: 'Commercial kitchen grade chef coat with dispersion mesh.',
      category: 'Hospitality',
      productType: 'CHEF_COAT',
      sizeType: 'CLOTHING',
      brand: 'Culinary Master',
      gender: 'UNISEX',
      basePrice: 48.00,
      customerPrice: 48.00,
      isAvailableStudent: false,
      isAvailableGeneral: true,
      isAvailableCorporate: true,
      images: [imgChef],
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['White', 'Black'],
      variantStockMap: { 'S': 15, 'M': 25, 'L': 30, 'XL': 20 },
      stock: 90
    },
    {
      id: 'prd-gen-5',
      sku: 'SMU-SPORTS-SHOES',
      name: 'AirFlex All-Terrain Campus Sports Shoes',
      description: 'Cushioned rubber outsole athletic training shoes for outdoor sports.',
      category: 'Sportswear',
      productType: 'SPORTS_SHOES',
      sizeType: 'SHOES',
      brand: 'FlexStep School',
      gender: 'UNISEX',
      basePrice: 45.00,
      customerPrice: 45.00,
      isAvailableStudent: true,
      isAvailableGeneral: true,
      isAvailableCorporate: false,
      images: [imgSportsShoe],
      sizes: ['UK 5', 'UK 6', 'UK 7', 'UK 8', 'UK 9', 'UK 10'],
      colors: ['Black', 'White', 'Blue'],
      variantStockMap: { 'UK 5': 10, 'UK 6': 20, 'UK 7': 25, 'UK 8': 20, 'UK 9': 15, 'UK 10': 5 },
      stock: 95
    }
  );

  return products;
}
