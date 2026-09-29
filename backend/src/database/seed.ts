import { PrismaClient, UserRole, OrganizationType, ProductAudience, OrderStatus, PaymentStatus, ShippingStatus, DeliveryType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seed() {
  console.log('🌱 Starting ShopMyUniform PostgreSQL Multi-School Database Seeding...');

  // 1. Clear existing records in proper dependency order
  await prisma.auditLog.deleteMany();
  await prisma.returnRequest.deleteMany();
  await prisma.quoteRequest.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.fulfillmentEvent.deleteMany();
  await prisma.fulfillmentOrder.deleteMany();
  await prisma.paymentEvent.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.price.deleteMany();
  await prisma.productVisibility.deleteMany();
  await prisma.productSchoolAssignment.deleteMany();
  await prisma.productOrganizationAssignment.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.child.deleteMany();
  await prisma.studentParentProfile.deleteMany();
  await prisma.corporateEmployeeProfile.deleteMany();
  await prisma.customerProfile.deleteMany();
  await prisma.session.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.emailVerificationToken.deleteMany();
  await prisma.uniformType.deleteMany();
  await prisma.schoolClass.deleteMany();
  await prisma.academicYear.deleteMany();
  await prisma.school.deleteMany();
  await prisma.vendorProduct.deleteMany();
  await prisma.purchaseOrderItem.deleteMany();
  await prisma.purchaseOrder.deleteMany();
  await prisma.vendor.deleteMany();
  await prisma.organization.deleteMany();
  await prisma.address.deleteMany();
  await prisma.user.deleteMany();
  await prisma.rolePermission.deleteMany();
  await prisma.permission.deleteMany();
  await prisma.role.deleteMany();

  console.log('✓ Cleared previous database records');

  // 2. Seed Roles
  const rolesList: { name: UserRole; description: string }[] = [
    { name: 'STUDENT_PARENT', description: 'Student or Parent buying school uniforms' },
    { name: 'GENERAL_CUSTOMER', description: 'Public retail shopper for general workwear' },
    { name: 'EMPLOYEE', description: 'Corporate employee purchasing company-approved workwear' },
    { name: 'SCHOOL_ADMIN', description: 'School administration managing student store & bulk orders' },
    { name: 'INTERNAL_ADMIN', description: 'Master administrator with full system permissions' },
    { name: 'VENDOR', description: 'Manufacturing partner supplying stock and fulfillment' },
    { name: 'WAREHOUSE', description: 'Warehouse operations managing inventory and shipping' }
  ];

  for (const r of rolesList) {
    await prisma.role.create({
      data: { name: r.name, description: r.description }
    });
  }
  console.log('✓ Created platform roles');

  // 3. Seed 3 DISTINCT DEMO SCHOOLS (CBSE, ICSE, International)
  // School 1: CBSE — Green Valley Public School
  const gvpsOrg = await prisma.organization.create({
    data: {
      name: 'Green Valley Educational Foundation',
      type: OrganizationType.SCHOOL,
      contactEmail: 'admin@greenvalleyschool.edu.in',
      phone: '+91 40 2345 6780',
      address: 'Srinagar Colony, Banjara Hills Road No. 3, Hyderabad, Telangana'
    }
  });
  const gvpsSchool = await prisma.school.create({
    data: {
      organizationId: gvpsOrg.id,
      name: 'Green Valley Public School',
      code: 'GVPS-CBSE',
      address: 'Road No. 3, Banjara Hills, Hyderabad, Telangana 500034',
      contactEmail: 'store@greenvalleyschool.edu.in',
      phone: '+91 40 2345 6781',
      totalStudents: 3200,
      logoUrl: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=300&q=80'
    }
  });

  // School 2: ICSE — St. Mary\'s Academy
  const smaOrg = await prisma.organization.create({
    data: {
      name: 'St. Mary\'s Educational Trust',
      type: OrganizationType.SCHOOL,
      contactEmail: 'office@stmarysacademy.in',
      phone: '+91 40 2780 1122',
      address: 'St. John\'s Road, Secunderabad, Hyderabad, Telangana'
    }
  });
  const smaSchool = await prisma.school.create({
    data: {
      organizationId: smaOrg.id,
      name: 'St. Mary\'s Academy',
      code: 'SMA-ICSE',
      address: 'St. John\'s Road, Secunderabad, Telangana 500003',
      contactEmail: 'uniforms@stmarysacademy.in',
      phone: '+91 40 2780 1123',
      totalStudents: 2750,
      logoUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=300&q=80'
    }
  });

  // School 3: International — CHIREC International School
  const chirecOrg = await prisma.organization.create({
    data: {
      name: 'CHIREC International Education Society',
      type: OrganizationType.SCHOOL,
      contactEmail: 'office@chirec.ac.in',
      phone: '+91 40 4476 0999',
      address: '1-55/12, CHIREC Avenue, Kondapur, Hyderabad, Telangana'
    }
  });
  const chirecSchool = await prisma.school.create({
    data: {
      organizationId: chirecOrg.id,
      name: 'CHIREC International School',
      code: 'CHIREC-HYD',
      address: '1-55/12, CHIREC Avenue, Kondapur, Hyderabad, Telangana 500084',
      contactEmail: 'store@chirec.ac.in',
      phone: '+91 40 4476 0998',
      totalStudents: 3500,
      logoUrl: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=300&q=80'
    }
  });

  const techNovaOrg = await prisma.organization.create({
    data: {
      name: 'TechNova Solutions India Pvt Ltd',
      type: OrganizationType.CORPORATE,
      contactEmail: 'procurement@technova.com',
      phone: '+91 40 6789 0000',
      address: 'Cyber Towers, HITEC City, Hyderabad, Telangana 500081'
    }
  });

  console.log('✓ Created 3 distinct demo schools (CBSE, ICSE, International)');

  // 3b. Seed Academic Years, Classes (Class 1 to 12), and Uniform Types for each School
  interface SchoolCatalogSetup {
    academicYearId: string;
    classMap: Record<string, string>;
    uniformTypeMap: Record<string, Record<string, string>>;
  }

  const schoolCatalogMap: Record<string, SchoolCatalogSetup> = {};

  for (const s of [gvpsSchool, smaSchool, chirecSchool]) {
    const ay = await prisma.academicYear.create({
      data: {
        schoolId: s.id,
        year: '2025-2026',
        isCurrent: true,
        status: 'ACTIVE'
      }
    });

    const classMap: Record<string, string> = {};
    const uniformTypeMap: Record<string, Record<string, string>> = {};

    for (let c = 1; c <= 12; c++) {
      const clsName = `Class ${c}`;
      const cls = await prisma.schoolClass.create({
        data: {
          schoolId: s.id,
          name: clsName,
          code: `${s.code}-C${c}`,
          displayOrder: c,
          status: 'ACTIVE'
        }
      });
      classMap[clsName] = cls.id;
      uniformTypeMap[cls.id] = {};

      const uTypes = [
        { name: 'Regular Uniform', slug: 'regular-uniform', displayOrder: 1 },
        { name: 'Sports Uniform', slug: 'sports-uniform', displayOrder: 2 },
        { name: 'Winter Uniform', slug: 'winter-uniform', displayOrder: 3 },
        { name: 'House Uniform', slug: 'house-uniform', displayOrder: 4 }
      ];

      for (const ut of uTypes) {
        const createdUt = await prisma.uniformType.create({
          data: {
            classId: cls.id,
            name: ut.name,
            slug: ut.slug,
            displayOrder: ut.displayOrder,
            status: 'ACTIVE'
          }
        });
        uniformTypeMap[cls.id][ut.slug] = createdUt.id;
      }
    }

    schoolCatalogMap[s.id] = {
      academicYearId: ay.id,
      classMap,
      uniformTypeMap
    };
  }
  console.log('✓ Seeded master academic years, classes 1-12, and uniform types for all schools');

  // 4. Seed Standard User Accounts for all Roles
  const defaultPasswordHash = await bcrypt.hash('Password123!', 10);

  // Demo Parent 1 with 3 Children across all 3 Schools
  const parentUser = await prisma.user.create({
    data: {
      email: 'student.parent@test.shopmyuniform.com',
      passwordHash: defaultPasswordHash,
      firstName: 'Ananya',
      lastName: 'Sharma',
      phone: '+91 98765 43210',
      role: UserRole.STUDENT_PARENT,
      isEmailVerified: true,
      schoolId: gvpsSchool.id,
      studentProfile: {
        create: {
          studentName: 'Rahul Sharma',
          studentId: 'GVPS-2026-7A-101',
          schoolName: gvpsSchool.name,
          grade: 'Grade 7',
          relationship: 'Parent',
          schoolId: gvpsSchool.id
        }
      }
    }
  });

  // Child 1: Rahul (CBSE — Green Valley Public School)
  await prisma.child.create({
    data: {
      parentId: parentUser.id,
      name: 'Rahul Sharma',
      grade: 'Grade 7',
      studentId: 'GVPS-2026-7A-101',
      schoolId: gvpsSchool.id,
      schoolName: gvpsSchool.name
    }
  });

  // Child 2: Ananya (ICSE — St. Mary's Academy)
  await prisma.child.create({
    data: {
      parentId: parentUser.id,
      name: 'Ananya Sharma (Jr)',
      grade: 'Grade 4',
      studentId: 'SMA-2026-4B-055',
      schoolId: smaSchool.id,
      schoolName: smaSchool.name
    }
  });

  // Child 3: Aarav (International — CHIREC International School)
  await prisma.child.create({
    data: {
      parentId: parentUser.id,
      name: 'Aarav Sharma',
      grade: 'Grade 6',
      studentId: 'CHIREC-2026-6C-208',
      schoolId: chirecSchool.id,
      schoolName: chirecSchool.name
    }
  });

  // Also seed user account for the exact email shown in screenshot (kumaravamsi2246@gmail.com)
  const vamsiUser = await prisma.user.create({
    data: {
      email: 'kumaravamsi2246@gmail.com',
      passwordHash: defaultPasswordHash,
      firstName: 'vamsi',
      lastName: 'kummara',
      phone: '+91 98480 99887',
      role: UserRole.STUDENT_PARENT,
      isEmailVerified: true,
      schoolId: chirecSchool.id,
      studentProfile: {
        create: {
          studentName: 'xyz',
          studentId: 'CHIREC-2026-7B-014',
          schoolName: chirecSchool.name,
          grade: 'Grade 7',
          relationship: 'Parent',
          schoolId: chirecSchool.id
        }
      }
    }
  });

  await prisma.child.create({
    data: {
      parentId: vamsiUser.id,
      name: 'xyz',
      grade: 'Grade 7',
      studentId: 'CHIREC-2026-7B-014',
      schoolId: chirecSchool.id,
      schoolName: chirecSchool.name
    }
  });

  await prisma.child.create({
    data: {
      parentId: vamsiUser.id,
      name: 'abc',
      grade: 'Grade 4',
      studentId: 'SMA-2026-4A-099',
      schoolId: smaSchool.id,
      schoolName: smaSchool.name
    }
  });

  await prisma.user.create({
    data: {
      email: 'customer@test.shopmyuniform.com',
      passwordHash: defaultPasswordHash,
      firstName: 'Rajesh',
      lastName: 'Kumar',
      phone: '+91 98111 22233',
      role: UserRole.GENERAL_CUSTOMER,
      isEmailVerified: true,
      customerProfile: { create: { companyName: 'Individual Retail Buyer' } }
    }
  });

  await prisma.user.create({
    data: {
      email: 'employee@test.shopmyuniform.com',
      passwordHash: defaultPasswordHash,
      firstName: 'Vikram',
      lastName: 'Malhotra',
      phone: '+91 99887 76655',
      role: UserRole.EMPLOYEE,
      isEmailVerified: true,
      companyId: techNovaOrg.id,
      employeeProfile: {
        create: {
          companyName: 'TechNova Solutions India Pvt Ltd',
          employeeId: 'TN-8842',
          department: 'Operations',
          organizationId: techNovaOrg.id
        }
      }
    }
  });

  await prisma.user.create({
    data: {
      email: 'school.admin@test.shopmyuniform.com',
      passwordHash: defaultPasswordHash,
      firstName: 'Priya',
      lastName: 'Reddy',
      phone: '+91 94400 33221',
      role: UserRole.SCHOOL_ADMIN,
      isEmailVerified: true,
      schoolId: gvpsSchool.id
    }
  });

  await prisma.user.create({
    data: {
      email: 'admin@test.shopmyuniform.com',
      passwordHash: defaultPasswordHash,
      firstName: 'Master',
      lastName: 'Administrator',
      phone: '+91 90000 00001',
      role: UserRole.INTERNAL_ADMIN,
      isEmailVerified: true
    }
  });

  const vendorOrg = await prisma.vendor.create({
    data: {
      name: 'Apex Apparel & Uniform Mills Ltd',
      contactEmail: 'orders@apexapparel.in',
      phone: '+91 40 2770 8899',
      rating: 4.9,
      capacityPerMonth: 35000
    }
  });

  await prisma.user.create({
    data: {
      email: 'vendor@test.shopmyuniform.com',
      passwordHash: defaultPasswordHash,
      firstName: 'Suresh',
      lastName: 'Patel',
      phone: '+91 98490 55555',
      role: UserRole.VENDOR,
      isEmailVerified: true,
      vendorId: vendorOrg.id
    }
  });

  await prisma.user.create({
    data: {
      email: 'fulfillment@test.shopmyuniform.com',
      passwordHash: defaultPasswordHash,
      firstName: 'Karan',
      lastName: 'Singh',
      phone: '+91 97000 11223',
      role: UserRole.WAREHOUSE,
      isEmailVerified: true
    }
  });

  await prisma.address.create({
    data: {
      userId: parentUser.id,
      type: 'SHIPPING',
      name: 'Ananya Sharma',
      phone: '+91 98765 43210',
      line1: 'Flat 402, Royal Palms Apartments',
      line2: 'Near Bio-Diversity Park, Madhapur',
      city: 'Hyderabad',
      state: 'Telangana',
      postalCode: '500081',
      country: 'India',
      isDefault: true
    }
  });

  console.log('✓ Created multi-child parent accounts & internal roles');

  // 5. Seed Catalog Categories
  const categoriesList = [
    { name: 'Shirts', slug: 'shirts', description: 'Oxford cotton formal and casual school shirts' },
    { name: 'Trousers', slug: 'trousers', description: 'Formal and pleated uniform trousers' },
    { name: 'Shorts', slug: 'shorts', description: 'School uniform chino and sports shorts' },
    { name: 'Skirts', slug: 'skirts', description: 'Pleated and A-line uniform skirts' },
    { name: 'Blazers', slug: 'blazers', description: 'Wool-blend crested institutional blazers' },
    { name: 'Sweaters', slug: 'sweaters', description: 'V-neck winter knit sweaters and pullovers' },
    { name: 'Jackets', slug: 'jackets', description: 'All-weather track jackets and winter outerwear' },
    { name: 'Ties', slug: 'ties', description: 'Crested and striped silk-feel school ties' },
    { name: 'Belts', slug: 'belts', description: 'Crested buckle canvas and leather belts' },
    { name: 'Socks', slug: 'socks', description: 'Cotton ribbed ankle and knee-high socks' },
    { name: 'School Shoes', slug: 'school-shoes', description: 'Classic black and brown formal leather shoes' },
    { name: 'Sports Shoes', slug: 'sports-shoes', description: 'Breathable white sports and court trainers' },
    { name: 'Sports Uniforms', slug: 'sports-uniforms', description: 'Dry-fit PE kits and active tracksuits' },
    { name: 'House T-Shirts', slug: 'house-t-shirts', description: 'Inter-house athletic team polos and tees' },
    { name: 'Bags', slug: 'bags', description: 'Ergonomic heavy-duty school backpacks' },
    { name: 'Accessories', slug: 'accessories', description: 'Badges, water bottles, caps and student IDs' },
    { name: 'Corporate Workwear', slug: 'corporate-workwear', description: 'Executive oxford shirts, trousers & office attire' },
    { name: 'Healthcare & Scrubs', slug: 'healthcare-scrubs', description: 'Antimicrobial medical scrubs & doctor lab coats' },
    { name: 'Industrial & Safety PPE', slug: 'safety-ppe', description: 'High-visibility safety vests and steel-toe boots' },
    { name: 'Hospitality & Culinary', slug: 'hospitality', description: 'Chef jackets, aprons and service uniforms' }
  ];

  const categoryMap: Record<string, string> = {};
  for (const c of categoriesList) {
    const created = await prisma.category.create({ data: c });
    categoryMap[c.slug] = created.id;
  }

  // 6. Product Creation Helper
  async function createFullProduct(data: {
    name: string;
    slug: string;
    sku: string;
    description: string;
    categorySlug: string;
    gender: string;
    basePrice: number;
    salePrice?: number;
    originalPrice?: number;
    images: string[];
    schoolId?: string;
    classId?: string;
    uniformTypeId?: string;
    academicYearId?: string;
    displayOrder?: number;
    companyId?: string;
    variants: { size: string; color: string; sku: string; price: number; stock: number; isAvailable?: boolean; displayOrder?: number }[];
  }) {
    const categoryId = categoryMap[data.categorySlug] || categoryMap['shirts'];

    let classId = data.classId;
    let uniformTypeId = data.uniformTypeId;
    let academicYearId = data.academicYearId;

    if (data.schoolId && schoolCatalogMap[data.schoolId]) {
      const setup = schoolCatalogMap[data.schoolId];
      academicYearId = academicYearId || setup.academicYearId;
      if (!classId) {
        const targetClass = (data.name.toLowerCase().includes('blazer') || data.sku.includes('BLZ')) ? 'Class 10' : 'Class 5';
        classId = setup.classMap[targetClass] || Object.values(setup.classMap)[0];
      }
      if (!uniformTypeId && classId && setup.uniformTypeMap[classId]) {
        let uSlug = 'regular-uniform';
        const nameLower = data.name.toLowerCase();
        if (nameLower.includes('sports') || nameLower.includes('pe') || data.categorySlug.includes('sports')) {
          uSlug = 'sports-uniform';
        } else if (nameLower.includes('winter') || nameLower.includes('blazer') || nameLower.includes('sweater') || nameLower.includes('jacket')) {
          uSlug = 'winter-uniform';
        } else if (nameLower.includes('house')) {
          uSlug = 'house-uniform';
        }
        uniformTypeId = setup.uniformTypeMap[classId][uSlug] || Object.values(setup.uniformTypeMap[classId])[0];
      }
    }

    const product = await prisma.product.create({
      data: {
        name: data.name,
        slug: data.slug,
        sku: data.sku,
        description: data.description,
        categoryId,
        gender: data.gender,
        basePrice: data.basePrice,
        salePrice: data.salePrice,
        originalPrice: data.originalPrice || data.basePrice,
        images: data.images,
        schoolId: data.schoolId,
        classId,
        uniformTypeId,
        academicYearId,
        displayOrder: data.displayOrder || 0,
        availabilityStatus: 'AVAILABLE',
        companyId: data.companyId,
        isAvailableStudent: !!data.schoolId || (!data.companyId),
        isAvailableCorporate: !!data.companyId,
        isAvailableGeneral: !data.schoolId && !data.companyId
      }
    });

    if (data.schoolId) {
      await prisma.productSchoolAssignment.create({
        data: { productId: product.id, schoolId: data.schoolId }
      });
    }

    if (data.images.length > 0) {
      await prisma.productImage.create({
        data: { productId: product.id, imageUrl: data.images[0], isPrimary: true, altText: data.name }
      });
    }

    let totalStock = 0;
    for (let i = 0; i < data.variants.length; i++) {
      const v = data.variants[i];
      await prisma.productVariant.create({
        data: {
          productId: product.id,
          sku: v.sku,
          size: v.size,
          color: v.color,
          price: v.price,
          imageUrl: data.images[0],
          isAvailable: v.isAvailable !== undefined ? v.isAvailable : true,
          displayOrder: v.displayOrder !== undefined ? v.displayOrder : i,
          status: 'ACTIVE'
        }
      });
      totalStock += v.stock;
    }

    const inv = await prisma.inventory.create({
      data: {
        productId: product.id,
        sku: data.sku,
        productName: data.name,
        stockAvailable: totalStock,
        stockReserved: 0,
        reorderThreshold: 10,
        warehouseLocation: 'Rack-HYD-01',
        status: totalStock > 0 ? 'IN_STOCK' : 'OUT_OF_STOCK'
      }
    });

    await prisma.stockMovement.create({
      data: {
        inventoryId: inv.id,
        sku: data.sku,
        type: 'INITIAL',
        changeQuantity: totalStock,
        previousStock: 0,
        newStock: totalStock,
        reason: 'Initial multi-school catalog seed',
        updatedBy: 'system'
      }
    });

    return product;
  }

  console.log('📦 Seeding Distinct Catalogs for CBSE, ICSE, and International Schools...');

  // High-Quality Verified Apparel Image URLs
  const imgWhiteShirt = 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80';
  const imgBlueShirt = 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80';
  const imgPoloTee = 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=800&q=80';
  const imgTrouserNavy = 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=800&q=80';
  const imgTrouserGrey = 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=80';
  const imgShorts = 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=800&q=80';
  const imgSkirt = 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?auto=format&fit=crop&w=800&q=80';
  const imgBlazerMaroon = 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80';
  const imgBlazerNavy = 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80';
  const imgSweater = 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=800&q=80';
  const imgHoodie = 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80';
  const imgJacket = 'https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=800&q=80';
  const imgTie = 'https://images.unsplash.com/photo-1598554747436-c9293d6a588f?auto=format&fit=crop&w=800&q=80';
  const imgBelt = 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&w=800&q=80';
  const imgSocks = 'https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?auto=format&fit=crop&w=800&q=80';
  const imgSchoolShoe = 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80';
  const imgSportsShoe = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80';
  const imgSportsUniform = 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=800&q=80';
  const imgHouseTee = 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80';
  const imgBackpack = 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80';
  const imgBottle = 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80';
  const imgCap = 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=800&q=80';
  const imgBadge = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80';

  // =========================================================================
  // SCHOOL 1: CBSE CATALOG — GREEN VALLEY PUBLIC SCHOOL
  // =========================================================================
  const s1 = gvpsSchool;
  const p1 = 'GVPS';

  // 1. Daily Uniform Boys - White Formal Shirt
  const gvpsShirt = await createFullProduct({
    name: `${s1.name} Classic White Formal Shirt (Boys)`,
    slug: `${p1.toLowerCase()}-white-formal-shirt-boys`,
    sku: `${p1}-SHIRT-B`,
    description: 'CBSE standard crisp white poly-cotton blend formal shirt with embroidered school crest on front pocket.',
    categorySlug: 'shirts',
    gender: 'BOYS',
    basePrice: 699,
    images: [imgWhiteShirt],
    schoolId: s1.id,
    variants: [
      { size: '28', color: 'White', sku: `${p1}-SH-B-28`, price: 699, stock: 40 },
      { size: '30', color: 'White', sku: `${p1}-SH-B-30`, price: 699, stock: 50 },
      { size: '32', color: 'White', sku: `${p1}-SH-B-32`, price: 749, stock: 45 },
      { size: '34', color: 'White', sku: `${p1}-SH-B-34`, price: 749, stock: 35 }
    ]
  });

  // 2. Daily Uniform Boys - Charcoal Trousers
  await createFullProduct({
    name: `${s1.name} Pleated Charcoal School Trousers`,
    slug: `${p1.toLowerCase()}-charcoal-trousers`,
    sku: `${p1}-TROUSER-CH`,
    description: 'Durable wrinkle-free charcoal grey pleated formal trousers with deep pockets and belt loops.',
    categorySlug: 'trousers',
    gender: 'BOYS',
    basePrice: 899,
    images: [imgTrouserGrey],
    schoolId: s1.id,
    variants: [
      { size: '28', color: 'Charcoal Grey', sku: `${p1}-TR-28`, price: 899, stock: 35 },
      { size: '30', color: 'Charcoal Grey', sku: `${p1}-TR-30`, price: 899, stock: 45 },
      { size: '32', color: 'Charcoal Grey', sku: `${p1}-TR-32`, price: 949, stock: 40 }
    ]
  });

  // 3. Daily Uniform Girls - Knife-Pleated Skirt
  await createFullProduct({
    name: `${s1.name} Knife-Pleated Charcoal Skirt`,
    slug: `${p1.toLowerCase()}-charcoal-skirt`,
    sku: `${p1}-SKIRT-CH`,
    description: 'Classic knee-length knife-pleated uniform skirt with inner adjustable waistband elastic.',
    categorySlug: 'skirts',
    gender: 'GIRLS',
    basePrice: 849,
    images: [imgSkirt],
    schoolId: s1.id,
    variants: [
      { size: '26', color: 'Charcoal Grey', sku: `${p1}-SK-26`, price: 849, stock: 30 },
      { size: '28', color: 'Charcoal Grey', sku: `${p1}-SK-28`, price: 849, stock: 40 },
      { size: '30', color: 'Charcoal Grey', sku: `${p1}-SK-30`, price: 899, stock: 30 }
    ]
  });

  // 4. Winter Uniform - Maroon Crested Blazer
  await createFullProduct({
    name: `${s1.name} Maroon Crested School Blazer`,
    slug: `${p1.toLowerCase()}-maroon-blazer`,
    sku: `${p1}-BLZ-MRN`,
    description: 'CBSE institutional maroon wool-blend formal winter blazer with embroidered gold crest.',
    categorySlug: 'blazers',
    gender: 'UNISEX',
    basePrice: 2299,
    images: [imgBlazerMaroon],
    schoolId: s1.id,
    variants: [
      { size: '30', color: 'Maroon', sku: `${p1}-BLZ-30`, price: 2299, stock: 25 },
      { size: '32', color: 'Maroon', sku: `${p1}-BLZ-32`, price: 2399, stock: 30 },
      { size: '34', color: 'Maroon', sku: `${p1}-BLZ-34`, price: 2499, stock: 20 }
    ]
  });

  // 5. Winter Uniform - V-Neck Knitted Maroon Sweater
  await createFullProduct({
    name: `${s1.name} V-Neck Knitted Maroon Sweater`,
    slug: `${p1.toLowerCase()}-vneck-maroon-sweater`,
    sku: `${p1}-SW-MRN`,
    description: 'Warm acrylic-wool knitted pullover with white and yellow contrast tipping at V-neck.',
    categorySlug: 'sweaters',
    gender: 'UNISEX',
    basePrice: 1099,
    images: [imgSweater],
    schoolId: s1.id,
    variants: [
      { size: '28', color: 'Maroon', sku: `${p1}-SW-28`, price: 1099, stock: 30 },
      { size: '32', color: 'Maroon', sku: `${p1}-SW-32`, price: 1199, stock: 40 },
      { size: '36', color: 'Maroon', sku: `${p1}-SW-36`, price: 1299, stock: 25 }
    ]
  });

  // 6. Sports / PE - Breathable PE Sports T-Shirt
  await createFullProduct({
    name: `${s1.name} Breathable PE Sports T-Shirt`,
    slug: `${p1.toLowerCase()}-pe-sports-tshirt`,
    sku: `${p1}-PE-TSHIRT`,
    description: 'Dry-fit honeycomb moisture-wicking PE athletics jersey with school crest.',
    categorySlug: 'sports-uniforms',
    gender: 'UNISEX',
    basePrice: 549,
    images: [imgSportsUniform],
    schoolId: s1.id,
    variants: [
      { size: '28', color: 'White/Navy', sku: `${p1}-PE-28`, price: 549, stock: 40 },
      { size: '32', color: 'White/Navy', sku: `${p1}-PE-32`, price: 549, stock: 50 },
      { size: '36', color: 'White/Navy', sku: `${p1}-PE-36`, price: 599, stock: 35 }
    ]
  });

  // 7. Sports / PE - Track Pants
  const gvpsTrack = await createFullProduct({
    name: `${s1.name} PE Navy Track Pants`,
    slug: `${p1.toLowerCase()}-pe-track-pants`,
    sku: `${p1}-PE-TRACK`,
    description: 'Flexible athletic track pants with elasticated waistband, side pockets and school stripe.',
    categorySlug: 'sports-uniforms',
    gender: 'UNISEX',
    basePrice: 799,
    images: [imgTrouserNavy],
    schoolId: s1.id,
    variants: [
      { size: '28', color: 'Navy Blue', sku: `${p1}-TRK-28`, price: 799, stock: 30 },
      { size: '32', color: 'Navy Blue', sku: `${p1}-TRK-32`, price: 799, stock: 40 },
      { size: '36', color: 'Navy Blue', sku: `${p1}-TRK-36`, price: 849, stock: 25 }
    ]
  });

  // 8. House Uniform - 4 Houses (Agni, Varun, Prithvi, Vayu)
  await createFullProduct({
    name: `${s1.name} Inter-House Sports Polo`,
    slug: `${p1.toLowerCase()}-house-sports-polo`,
    sku: `${p1}-HOUSE-POLO`,
    description: 'Official CBSE house competition polo shirt. Select your allotted house color (Red / Blue / Green / Yellow).',
    categorySlug: 'house-t-shirts',
    gender: 'UNISEX',
    basePrice: 599,
    images: [imgHouseTee],
    schoolId: s1.id,
    variants: [
      { size: 'M', color: 'Red (Agni House)', sku: `${p1}-HSE-RED-M`, price: 599, stock: 40 },
      { size: 'M', color: 'Blue (Varun House)', sku: `${p1}-HSE-BLU-M`, price: 599, stock: 40 },
      { size: 'M', color: 'Green (Prithvi House)', sku: `${p1}-HSE-GRN-M`, price: 599, stock: 40 },
      { size: 'M', color: 'Yellow (Vayu House)', sku: `${p1}-HSE-YEL-M`, price: 599, stock: 40 },
      { size: 'L', color: 'Red (Agni House)', sku: `${p1}-HSE-RED-L`, price: 599, stock: 30 },
      { size: 'L', color: 'Blue (Varun House)', sku: `${p1}-HSE-BLU-L`, price: 599, stock: 30 }
    ]
  });

  // 9. Accessories - School Bag
  await createFullProduct({
    name: `${s1.name} Ergonomic 3-Compartment School Bag`,
    slug: `${p1.toLowerCase()}-ergonomic-school-bag`,
    sku: `${p1}-BAG-3C`,
    description: 'Heavy-duty water-resistant school backpack with padded spinal support and reflective safety accents.',
    categorySlug: 'bags',
    gender: 'UNISEX',
    basePrice: 1249,
    images: [imgBackpack],
    schoolId: s1.id,
    variants: [
      { size: 'Standard (28L)', color: 'Charcoal/Maroon', sku: `${p1}-BAG-STD`, price: 1249, stock: 50 },
      { size: 'Senior (34L)', color: 'Charcoal/Maroon', sku: `${p1}-BAG-SNR`, price: 1399, stock: 40 }
    ]
  });

  // 10. Accessories - Tie, Belt, Shoes, Bottle
  await createFullProduct({
    name: `${s1.name} Striped Maroon & Silver School Tie`,
    slug: `${p1.toLowerCase()}-striped-tie`,
    sku: `${p1}-TIE`,
    description: 'Woven micro-polyester formal striped school necktie with gold crest clip.',
    categorySlug: 'ties',
    gender: 'UNISEX',
    basePrice: 279,
    images: [imgTie],
    schoolId: s1.id,
    variants: [
      { size: 'Standard (14 in)', color: 'Maroon/Silver', sku: `${p1}-TIE-STD`, price: 279, stock: 60 }
    ]
  });

  await createFullProduct({
    name: `${s1.name} Heavy Canvas Uniform Belt`,
    slug: `${p1.toLowerCase()}-uniform-belt`,
    sku: `${p1}-BELT`,
    description: 'Braided webbed belt with metal slide buckle stamped with school crest.',
    categorySlug: 'belts',
    gender: 'UNISEX',
    basePrice: 229,
    images: [imgBelt],
    schoolId: s1.id,
    variants: [
      { size: 'Adjustable (24-34 in)', color: 'Maroon/Grey', sku: `${p1}-BLT-ADJ`, price: 229, stock: 70 }
    ]
  });

  await createFullProduct({
    name: `${s1.name} Oxford Black Leather School Shoes`,
    slug: `${p1.toLowerCase()}-black-oxford-shoes`,
    sku: `${p1}-SHOE-BLK`,
    description: 'High-shine formal black leather lace-up uniform shoes with anti-skid rubber sole.',
    categorySlug: 'school-shoes',
    gender: 'UNISEX',
    basePrice: 1199,
    images: [imgSchoolShoe],
    schoolId: s1.id,
    variants: [
      { size: '4 UK', color: 'Black', sku: `${p1}-SH-04`, price: 1199, stock: 25 },
      { size: '5 UK', color: 'Black', sku: `${p1}-SH-05`, price: 1199, stock: 30 },
      { size: '6 UK', color: 'Black', sku: `${p1}-SH-06`, price: 1199, stock: 35 },
      { size: '7 UK', color: 'Black', sku: `${p1}-SH-07`, price: 1299, stock: 30 }
    ]
  });

  await createFullProduct({
    name: `${s1.name} Stainless Steel Insulated Water Bottle (750ml)`,
    slug: `${p1.toLowerCase()}-insulated-water-bottle`,
    sku: `${p1}-BOTTLE-750`,
    description: 'Double-walled vacuum insulated food-grade stainless steel bottle keeping water cold for 18 hours.',
    categorySlug: 'accessories',
    gender: 'UNISEX',
    basePrice: 499,
    images: [imgBottle],
    schoolId: s1.id,
    variants: [
      { size: '750ml', color: 'Silver/Maroon', sku: `${p1}-BOT-750`, price: 499, stock: 60 }
    ]
  });


  // =========================================================================
  // SCHOOL 2: ICSE CATALOG — ST. MARY'S ACADEMY
  // =========================================================================
  const s2 = smaSchool;
  const p2 = 'SMA';

  // 1. Formal Uniform Boys - Light Blue Oxford Shirt
  await createFullProduct({
    name: `${s2.name} Light Blue Oxford Formal Shirt (Boys)`,
    slug: `${p2.toLowerCase()}-lightblue-oxford-shirt`,
    sku: `${p2}-SHIRT-B`,
    description: 'Traditional ICSE crisp sky blue Oxford cotton formal shirt with tailored French placket.',
    categorySlug: 'shirts',
    gender: 'BOYS',
    basePrice: 749,
    images: [imgBlueShirt],
    schoolId: s2.id,
    variants: [
      { size: '28', color: 'Sky Blue', sku: `${p2}-SH-28`, price: 749, stock: 35 },
      { size: '30', color: 'Sky Blue', sku: `${p2}-SH-30`, price: 749, stock: 45 },
      { size: '32', color: 'Sky Blue', sku: `${p2}-SH-32`, price: 799, stock: 40 },
      { size: '34', color: 'Sky Blue', sku: `${p2}-SH-34`, price: 799, stock: 30 }
    ]
  });

  // 2. Formal Uniform Girls - Light Blue Peter Pan Blouse
  await createFullProduct({
    name: `${s2.name} Light Blue Peter Pan Collar Blouse (Girls)`,
    slug: `${p2.toLowerCase()}-peterpan-blouse`,
    sku: `${p2}-BLOUSE-G`,
    description: 'Smart tailored ICSE light blue uniform blouse with Peter Pan rounded collar and shell buttons.',
    categorySlug: 'shirts',
    gender: 'GIRLS',
    basePrice: 749,
    images: [imgBlueShirt],
    schoolId: s2.id,
    variants: [
      { size: '28', color: 'Sky Blue', sku: `${p2}-BLS-28`, price: 749, stock: 30 },
      { size: '30', color: 'Sky Blue', sku: `${p2}-BLS-30`, price: 749, stock: 40 },
      { size: '32', color: 'Sky Blue', sku: `${p2}-BLS-32`, price: 799, stock: 35 }
    ]
  });

  // 3. Formal Uniform Boys - Deep Navy Trousers
  await createFullProduct({
    name: `${s2.name} Deep Navy Blue Uniform Trousers`,
    slug: `${p2.toLowerCase()}-deep-navy-trousers`,
    sku: `${p2}-TROUSER-NVY`,
    description: 'Classic British-cut deep navy blue trousers tailored with double pleats and crease retention.',
    categorySlug: 'trousers',
    gender: 'BOYS',
    basePrice: 949,
    images: [imgTrouserNavy],
    schoolId: s2.id,
    variants: [
      { size: '28', color: 'Navy Blue', sku: `${p2}-TR-28`, price: 949, stock: 35 },
      { size: '30', color: 'Navy Blue', sku: `${p2}-TR-30`, price: 949, stock: 45 },
      { size: '32', color: 'Navy Blue', sku: `${p2}-TR-32`, price: 999, stock: 35 }
    ]
  });

  // 4. Formal Uniform Girls - Navy Box-Pleated Skirt
  await createFullProduct({
    name: `${s2.name} Deep Navy Box-Pleated Uniform Skirt`,
    slug: `${p2.toLowerCase()}-box-pleated-skirt`,
    sku: `${p2}-SKIRT-NVY`,
    description: 'Structured ICSE box-pleated school skirt in premium navy gabardine fabric.',
    categorySlug: 'skirts',
    gender: 'GIRLS',
    basePrice: 899,
    images: [imgSkirt],
    schoolId: s2.id,
    variants: [
      { size: '26', color: 'Navy Blue', sku: `${p2}-SK-26`, price: 899, stock: 30 },
      { size: '28', color: 'Navy Blue', sku: `${p2}-SK-28`, price: 899, stock: 40 },
      { size: '30', color: 'Navy Blue', sku: `${p2}-SK-30`, price: 949, stock: 30 }
    ]
  });

  // 5. Winter Uniform - Navy Woolen Blazer with Gold Trim
  await createFullProduct({
    name: `${s2.name} Crested Navy Woolen Blazer with Gold Trim`,
    slug: `${p2.toLowerCase()}-navy-crested-blazer`,
    sku: `${p2}-BLZ-NVY`,
    description: 'Prestige ICSE navy wool-blend blazer featuring fine gold lapel piping and brass crest buttons.',
    categorySlug: 'blazers',
    gender: 'UNISEX',
    basePrice: 2499,
    images: [imgBlazerNavy],
    schoolId: s2.id,
    variants: [
      { size: '30', color: 'Navy Blue', sku: `${p2}-BLZ-30`, price: 2499, stock: 20 },
      { size: '32', color: 'Navy Blue', sku: `${p2}-BLZ-32`, price: 2599, stock: 25 },
      { size: '34', color: 'Navy Blue', sku: `${p2}-BLZ-34`, price: 2699, stock: 20 }
    ]
  });

  // 6. Winter Uniform - V-Neck Cable Knit Navy Sweater
  await createFullProduct({
    name: `${s2.name} V-Neck Cable-Knit Navy Sweater`,
    slug: `${p2.toLowerCase()}-cable-knit-sweater`,
    sku: `${p2}-SW-CBL`,
    description: 'Traditional cable-knit British-style V-neck navy sweater with light blue edge accents.',
    categorySlug: 'sweaters',
    gender: 'UNISEX',
    basePrice: 1199,
    images: [imgSweater],
    schoolId: s2.id,
    variants: [
      { size: '28', color: 'Navy Blue', sku: `${p2}-SW-28`, price: 1199, stock: 25 },
      { size: '32', color: 'Navy Blue', sku: `${p2}-SW-32`, price: 1299, stock: 35 },
      { size: '36', color: 'Navy Blue', sku: `${p2}-SW-36`, price: 1399, stock: 20 }
    ]
  });

  // 7. PE Uniform - PE Performance Polo T-Shirt
  await createFullProduct({
    name: `${s2.name} PE Performance Polo T-Shirt`,
    slug: `${p2.toLowerCase()}-pe-polo-tshirt`,
    sku: `${p2}-PE-POLO`,
    description: 'Breathable moisture-wicking white and navy contrast sports polo with ribbed collar.',
    categorySlug: 'sports-uniforms',
    gender: 'UNISEX',
    basePrice: 629,
    images: [imgPoloTee],
    schoolId: s2.id,
    variants: [
      { size: '28', color: 'White/Navy', sku: `${p2}-PE-28`, price: 629, stock: 35 },
      { size: '32', color: 'White/Navy', sku: `${p2}-PE-32`, price: 629, stock: 45 },
      { size: '36', color: 'White/Navy', sku: `${p2}-PE-36`, price: 679, stock: 30 }
    ]
  });

  // 8. House Uniform - Ruby, Sapphire, Emerald, Gold
  await createFullProduct({
    name: `${s2.name} Inter-House Athletics Team Polo`,
    slug: `${p2.toLowerCase()}-house-team-polo`,
    sku: `${p2}-HOUSE-POLO`,
    description: 'Official ICSE house sports regalia. Choose your house: Ruby (Crimson), Sapphire (Royal Blue), Emerald (Green), Gold (Amber).',
    categorySlug: 'house-t-shirts',
    gender: 'UNISEX',
    basePrice: 649,
    images: [imgHouseTee],
    schoolId: s2.id,
    variants: [
      { size: 'M', color: 'Ruby (Crimson Red)', sku: `${p2}-HSE-RUB-M`, price: 649, stock: 35 },
      { size: 'M', color: 'Sapphire (Royal Blue)', sku: `${p2}-HSE-SAP-M`, price: 649, stock: 35 },
      { size: 'M', color: 'Emerald (Forest Green)', sku: `${p2}-HSE-EME-M`, price: 649, stock: 35 },
      { size: 'M', color: 'Gold (Amber Yellow)', sku: `${p2}-HSE-GLD-M`, price: 649, stock: 35 },
      { size: 'L', color: 'Ruby (Crimson Red)', sku: `${p2}-HSE-RUB-L`, price: 649, stock: 25 },
      { size: 'L', color: 'Sapphire (Royal Blue)', sku: `${p2}-HSE-SAP-L`, price: 649, stock: 25 }
    ]
  });

  // 9. Accessories - Crested Navy Backpack, Tie, Belt, Shoes
  await createFullProduct({
    name: `${s2.name} Crested Heavy-Duty Backpack`,
    slug: `${p2.toLowerCase()}-crested-backpack`,
    sku: `${p2}-BAG-HD`,
    description: '30L durable ballistic polyester school rucksack with padded straps and water-resistant base.',
    categorySlug: 'bags',
    gender: 'UNISEX',
    basePrice: 1299,
    images: [imgBackpack],
    schoolId: s2.id,
    variants: [
      { size: 'Standard 30L', color: 'Deep Navy', sku: `${p2}-BAG-30L`, price: 1299, stock: 45 }
    ]
  });

  await createFullProduct({
    name: `${s2.name} Crested Navy & Gold Woven Tie`,
    slug: `${p2.toLowerCase()}-navy-gold-tie`,
    sku: `${p2}-TIE`,
    description: 'Official ICSE jacquard woven silk-feel school necktie with gold diagonal accents.',
    categorySlug: 'ties',
    gender: 'UNISEX',
    basePrice: 329,
    images: [imgTie],
    schoolId: s2.id,
    variants: [
      { size: 'Standard (14.5 in)', color: 'Navy/Gold', sku: `${p2}-TIE-STD`, price: 329, stock: 60 }
    ]
  });

  await createFullProduct({
    name: `${s2.name} Genuine Leather Belt with Brass Buckle`,
    slug: `${p2.toLowerCase()}-leather-brass-belt`,
    sku: `${p2}-BELT-LTH`,
    description: '100% genuine black leather belt with engraved antiqued brass institutional crest buckle.',
    categorySlug: 'belts',
    gender: 'UNISEX',
    basePrice: 349,
    images: [imgBelt],
    schoolId: s2.id,
    variants: [
      { size: 'Regular (26-32 in)', color: 'Black Leather', sku: `${p2}-BLT-REG`, price: 349, stock: 50 },
      { size: 'Large (32-38 in)', color: 'Black Leather', sku: `${p2}-BLT-LRG`, price: 389, stock: 40 }
    ]
  });

  await createFullProduct({
    name: `${s2.name} Formal Black Derby Leather Shoes`,
    slug: `${p2.toLowerCase()}-black-derby-shoes`,
    sku: `${p2}-SHOE-DRB`,
    description: 'Hand-burnished genuine leather lace-up Derby shoes with cushioned insole.',
    categorySlug: 'school-shoes',
    gender: 'BOYS',
    basePrice: 1349,
    images: [imgSchoolShoe],
    schoolId: s2.id,
    variants: [
      { size: '4 UK', color: 'Black', sku: `${p2}-SH-04`, price: 1349, stock: 20 },
      { size: '5 UK', color: 'Black', sku: `${p2}-SH-05`, price: 1349, stock: 25 },
      { size: '6 UK', color: 'Black', sku: `${p2}-SH-06`, price: 1349, stock: 30 },
      { size: '7 UK', color: 'Black', sku: `${p2}-SH-07`, price: 1449, stock: 25 }
    ]
  });


  // =========================================================================
  // SCHOOL 3: INTERNATIONAL SCHOOL — CHIREC INTERNATIONAL SCHOOL
  // =========================================================================
  const s3 = chirecSchool;
  const p3 = 'CHIREC';

  // 1. Everyday Uniform - Crested Moisture-Wicking Polo
  await createFullProduct({
    name: `${s3.name} Crested Moisture-Wicking Polo T-Shirt`,
    slug: `${p3.toLowerCase()}-crested-polo-tshirt`,
    sku: `${p3}-POLO-CREST`,
    description: 'International curriculum everyday uniform polo in ultra-soft piqué cotton with high-density embroidered maroon crest.',
    categorySlug: 'shirts',
    gender: 'UNISEX',
    basePrice: 799,
    images: [imgPoloTee],
    schoolId: s3.id,
    variants: [
      { size: '28', color: 'White', sku: `${p3}-POLO-28`, price: 799, stock: 40 },
      { size: '30', color: 'White', sku: `${p3}-POLO-30`, price: 799, stock: 50 },
      { size: '32', color: 'White', sku: `${p3}-POLO-32`, price: 799, stock: 50 },
      { size: '34', color: 'White', sku: `${p3}-POLO-34`, price: 849, stock: 35 },
      { size: '36', color: 'White', sku: `${p3}-POLO-36`, price: 849, stock: 25 }
    ]
  });

  // 2. Everyday Uniform - Beige Chino Trousers
  await createFullProduct({
    name: `${s3.name} Premium Beige Chino Formal Trousers`,
    slug: `${p3.toLowerCase()}-beige-chino-trousers`,
    sku: `${p3}-CHINO-BEG`,
    description: 'Stretch-cotton twill tailored beige chinos designed for active school day mobility and elegance.',
    categorySlug: 'trousers',
    gender: 'BOYS',
    basePrice: 1049,
    images: [imgTrouserGrey],
    schoolId: s3.id,
    variants: [
      { size: '28', color: 'Beige', sku: `${p3}-TR-28`, price: 1049, stock: 30 },
      { size: '30', color: 'Beige', sku: `${p3}-TR-30`, price: 1049, stock: 45 },
      { size: '32', color: 'Beige', sku: `${p3}-TR-32`, price: 1049, stock: 40 },
      { size: '34', color: 'Beige', sku: `${p3}-TR-34`, price: 1099, stock: 30 }
    ]
  });

  // 3. Everyday Uniform - Beige Chino Shorts
  await createFullProduct({
    name: `${s3.name} Tailored Beige Chino Shorts`,
    slug: `${p3.toLowerCase()}-beige-chino-shorts`,
    sku: `${p3}-SHORTS-BEG`,
    description: 'Smart tailored knee-length chino shorts with breathable pocket lining and inner waistband adjuster.',
    categorySlug: 'shorts',
    gender: 'BOYS',
    basePrice: 749,
    images: [imgShorts],
    schoolId: s3.id,
    variants: [
      { size: '24', color: 'Beige', sku: `${p3}-SH-24`, price: 749, stock: 25 },
      { size: '26', color: 'Beige', sku: `${p3}-SH-26`, price: 749, stock: 35 },
      { size: '28', color: 'Beige', sku: `${p3}-SH-28`, price: 749, stock: 30 }
    ]
  });

  // 4. Everyday Uniform - Pleated Tartan Skirt
  await createFullProduct({
    name: `${s3.name} Pleated Maroon Tartan Uniform Skirt`,
    slug: `${p3.toLowerCase()}-maroon-tartan-skirt`,
    sku: `${p3}-SKIRT-TRT`,
    description: 'International standard woven maroon & navy check pleated skirt with invisible side zipper.',
    categorySlug: 'skirts',
    gender: 'GIRLS',
    basePrice: 949,
    images: [imgSkirt],
    schoolId: s3.id,
    variants: [
      { size: '26', color: 'Maroon Tartan', sku: `${p3}-SK-26`, price: 949, stock: 25 },
      { size: '28', color: 'Maroon Tartan', sku: `${p3}-SK-28`, price: 949, stock: 35 },
      { size: '30', color: 'Maroon Tartan', sku: `${p3}-SK-30`, price: 949, stock: 30 }
    ]
  });

  // 5. Winter / Outerwear - Fleece-Lined School Hoodie
  await createFullProduct({
    name: `${s3.name} Premium Fleece-Lined School Hoodie`,
    slug: `${p3.toLowerCase()}-fleece-school-hoodie`,
    sku: `${p3}-HOODIE-MRN`,
    description: 'Ultra-warm 320 GSM brushed fleece hooded sweatshirt with kangaroo pockets and embroidered badge.',
    categorySlug: 'jackets',
    gender: 'UNISEX',
    basePrice: 1499,
    images: [imgHoodie],
    schoolId: s3.id,
    variants: [
      { size: 'S', color: 'Maroon', sku: `${p3}-HD-S`, price: 1499, stock: 25 },
      { size: 'M', color: 'Maroon', sku: `${p3}-HD-M`, price: 1499, stock: 35 },
      { size: 'L', color: 'Maroon', sku: `${p3}-HD-L`, price: 1599, stock: 25 }
    ]
  });

  // 6. Winter / Outerwear - All-Weather Heavy Insulated Jacket
  await createFullProduct({
    name: `${s3.name} All-Weather Heavy Insulated Winter Jacket`,
    slug: `${p3.toLowerCase()}-insulated-winter-jacket`,
    sku: `${p3}-JKT-WTR`,
    description: 'Waterproof and windproof thermal insulated winter jacket with detachable hood and storm flap.',
    categorySlug: 'jackets',
    gender: 'UNISEX',
    basePrice: 1999,
    images: [imgJacket],
    schoolId: s3.id,
    variants: [
      { size: 'S', color: 'Navy/Maroon', sku: `${p3}-JK-S`, price: 1999, stock: 20 },
      { size: 'M', color: 'Navy/Maroon', sku: `${p3}-JK-M`, price: 1999, stock: 30 },
      { size: 'L', color: 'Navy/Maroon', sku: `${p3}-JK-L`, price: 2099, stock: 20 }
    ]
  });

  // 7. PE / Sports - Dry-Fit Athletics T-Shirt
  await createFullProduct({
    name: `${s3.name} Dry-Fit PE Sports Athletic Jersey`,
    slug: `${p3.toLowerCase()}-dryfit-sports-jersey`,
    sku: `${p3}-PE-JERSEY`,
    description: 'Athletic moisture-management sports jersey engineered for football, basketball, and track PE.',
    categorySlug: 'sports-uniforms',
    gender: 'UNISEX',
    basePrice: 699,
    images: [imgSportsUniform],
    schoolId: s3.id,
    variants: [
      { size: '28', color: 'Maroon/White', sku: `${p3}-PE-28`, price: 699, stock: 30 },
      { size: '32', color: 'Maroon/White', sku: `${p3}-PE-32`, price: 699, stock: 45 },
      { size: '36', color: 'Maroon/White', sku: `${p3}-PE-36`, price: 749, stock: 30 }
    ]
  });

  // 8. House T-Shirts - Phoenix, Hydra, Pegasus, Auriga
  await createFullProduct({
    name: `${s3.name} Inter-House Competition Athletic Tee`,
    slug: `${p3.toLowerCase()}-house-athletic-tee`,
    sku: `${p3}-HOUSE-TEE`,
    description: 'CHIREC house system athletic performance t-shirt. Select your house: Phoenix (Red), Hydra (Blue), Pegasus (Green), Auriga (Yellow).',
    categorySlug: 'house-t-shirts',
    gender: 'UNISEX',
    basePrice: 649,
    images: [imgHouseTee],
    schoolId: s3.id,
    variants: [
      { size: 'M', color: 'Phoenix (Red)', sku: `${p3}-HSE-PHX-M`, price: 649, stock: 40 },
      { size: 'M', color: 'Hydra (Blue)', sku: `${p3}-HSE-HYD-M`, price: 649, stock: 40 },
      { size: 'M', color: 'Pegasus (Green)', sku: `${p3}-HSE-PEG-M`, price: 649, stock: 40 },
      { size: 'M', color: 'Auriga (Yellow)', sku: `${p3}-HSE-AUR-M`, price: 649, stock: 40 },
      { size: 'L', color: 'Phoenix (Red)', sku: `${p3}-HSE-PHX-L`, price: 649, stock: 30 },
      { size: 'L', color: 'Hydra (Blue)', sku: `${p3}-HSE-HYD-L`, price: 649, stock: 30 }
    ]
  });

  // 9. Accessories - Ergonomic Laptop Backpack, Shoes, Cap, Bottle
  await createFullProduct({
    name: `${s3.name} Ergonomic Padded Laptop & School Backpack`,
    slug: `${p3.toLowerCase()}-ergonomic-laptop-backpack`,
    sku: `${p3}-BAG-32L`,
    description: 'Multi-tiered 32L water-resistant school backpack with dedicated padded 15.6" laptop sleeve and organizer.',
    categorySlug: 'bags',
    gender: 'UNISEX',
    basePrice: 1399,
    images: [imgBackpack],
    schoolId: s3.id,
    variants: [
      { size: 'Senior 32L', color: 'Midnight Navy', sku: `${p3}-BAG-32L`, price: 1399, stock: 50 }
    ]
  });

  await createFullProduct({
    name: `${s3.name} Embroidered Campus Baseball Cap`,
    slug: `${p3.toLowerCase()}-campus-baseball-cap`,
    sku: `${p3}-CAP-BASE`,
    description: '100% cotton 6-panel athletic campus cap with 3D embroidered CHIREC crest and brass adjuster.',
    categorySlug: 'accessories',
    gender: 'UNISEX',
    basePrice: 399,
    images: [imgCap],
    schoolId: s3.id,
    variants: [
      { size: 'Free Size (Adjustable)', color: 'Maroon', sku: `${p3}-CAP-FREE`, price: 399, stock: 60 }
    ]
  });

  await createFullProduct({
    name: `${s3.name} Multi-Terrain PE Court Trainers`,
    slug: `${p3.toLowerCase()}-multi-court-trainers`,
    sku: `${p3}-SHOE-TRN`,
    description: 'Engineered non-marking rubber outsole trainers with breathable air-mesh upper for sports sessions.',
    categorySlug: 'sports-shoes',
    gender: 'UNISEX',
    basePrice: 1599,
    images: [imgSportsShoe],
    schoolId: s3.id,
    variants: [
      { size: '4 UK', color: 'White/Maroon', sku: `${p3}-SPT-04`, price: 1599, stock: 20 },
      { size: '5 UK', color: 'White/Maroon', sku: `${p3}-SPT-05`, price: 1599, stock: 25 },
      { size: '6 UK', color: 'White/Maroon', sku: `${p3}-SPT-06`, price: 1599, stock: 30 },
      { size: '7 UK', color: 'White/Maroon', sku: `${p3}-SPT-07`, price: 1699, stock: 25 }
    ]
  });

  await createFullProduct({
    name: `${s3.name} Metallic Enamel Crest Pin & Badge`,
    slug: `${p3.toLowerCase()}-metallic-crest-badge`,
    sku: `${p3}-BADGE-MET`,
    description: 'Polished gold-plated brass crest badge with magnetic backing for formal blazers and shirts.',
    categorySlug: 'accessories',
    gender: 'UNISEX',
    basePrice: 199,
    images: [imgBadge],
    schoolId: s3.id,
    variants: [
      { size: 'Standard (35mm)', color: 'Gold/Maroon', sku: `${p3}-BDG-STD`, price: 199, stock: 80 }
    ]
  });

  // 10. General Retail & Corporate Workwear Products
  await createFullProduct({
    name: 'Pro-Flex Antimicrobial Medical Scrubs Set',
    slug: 'proflex-antimicrobial-scrubs-set',
    sku: 'MED-SCRUB-SET',
    description: 'Hospital grade stretch scrub top and cargo jogger pants with 6 utility pockets.',
    categorySlug: 'healthcare-scrubs',
    gender: 'UNISEX',
    basePrice: 1499,
    images: ['https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&w=800&q=80'],
    variants: [
      { size: 'S', color: 'Ceil Blue', sku: 'SCRUB-BLU-S', price: 1499, stock: 40 },
      { size: 'M', color: 'Ceil Blue', sku: 'SCRUB-BLU-M', price: 1499, stock: 50 },
      { size: 'L', color: 'Teal Green', sku: 'SCRUB-TEA-L', price: 1499, stock: 35 }
    ]
  });

  await createFullProduct({
    name: 'Executive Non-Iron Corporate Oxford Shirt',
    slug: 'executive-non-iron-oxford-shirt',
    sku: 'CORP-SHIRT-OXF',
    description: 'Wrinkle-free 100% Supima cotton corporate dress shirt with spread collar.',
    categorySlug: 'corporate-workwear',
    gender: 'MEN',
    basePrice: 1299,
    images: ['https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=800&q=80'],
    companyId: techNovaOrg.id,
    variants: [
      { size: '39 (M)', color: 'Sky Blue', sku: 'CORP-SH-39', price: 1299, stock: 30 },
      { size: '40 (L)', color: 'White', sku: 'CORP-SH-40', price: 1299, stock: 40 },
      { size: '42 (XL)', color: 'White', sku: 'CORP-SH-42', price: 1299, stock: 25 }
    ]
  });

  // Seed sample initial order for parent
  const initialOrder = await prisma.order.create({
    data: {
      orderNumber: 'SMU-ORD-2026-02001',
      userId: parentUser.id,
      customerName: 'Ananya Sharma',
      customerEmail: parentUser.email,
      customerRole: UserRole.STUDENT_PARENT,
      schoolId: gvpsSchool.id,
      subtotal: 2147.00,
      discount: 0.00,
      tax: 171.76,
      shippingFee: 99.00,
      totalAmount: 2417.76,
      currency: 'INR',
      orderStatus: OrderStatus.CONFIRMED,
      paymentStatus: PaymentStatus.PAID,
      shippingStatus: ShippingStatus.LABEL_CREATED,
      deliveryType: DeliveryType.INDIVIDUAL_HOME,
      shippingAddress: 'Flat 402, Royal Palms Apartments, Madhapur, Hyderabad - 500081',
      items: {
        create: [
          {
            productId: gvpsShirt.id,
            productNameSnapshot: 'Green Valley Public School Classic White Formal Shirt (Boys)',
            skuSnapshot: 'GVPS-SH-B-30',
            productImage: imgWhiteShirt,
            selectedSize: '30',
            quantity: 2,
            unitPrice: 699.00,
            subtotal: 1398.00
          },
          {
            productId: gvpsTrack.id,
            productNameSnapshot: 'Green Valley Public School PE Navy Track Pants',
            skuSnapshot: 'GVPS-TRK-32',
            productImage: imgTrouserNavy,
            selectedSize: '32',
            quantity: 1,
            unitPrice: 799.00,
            subtotal: 799.00
          }
        ]
      },
      payments: {
        create: [
          {
            provider: 'UPI',
            amount: 2417.76,
            currency: 'INR',
            status: PaymentStatus.PAID,
            paidAt: new Date()
          }
        ]
      },
      fulfillmentOrders: {
        create: [
          {
            status: OrderStatus.CONFIRMED,
            trackingNumber: 'DELHIVERY-HYD-77889900',
            carrier: 'Delhivery Express'
          }
        ]
      }
    }
  });

  console.log(`✓ Seeded initial parent order #${initialOrder.orderNumber}`);
  console.log('✅ PostgreSQL Multi-School Database Seeding Completed Successfully!');
}

seed()
  .catch((e) => {
    console.error('❌ Error during PostgreSQL seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
