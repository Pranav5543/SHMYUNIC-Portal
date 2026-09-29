import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { prisma } from '../database/db';
import { CatalogAvailability } from '@prisma/client';

// ============================================================
// 1. UNIFIED MASTER CATALOG CONSUMPTION API
// ============================================================

/**
 * GET /api/catalog
 * Single endpoint returning full or filtered master catalog hierarchy:
 * Query: schoolId, classId, uniformTypeId, category, gender, search, sort
 */
export async function getMasterCatalog(req: AuthenticatedRequest, res: Response) {
  try {
    const schoolId = (req.query.schoolId as string) || req.user?.schoolId || undefined;
    const classId = req.query.classId as string | undefined;
    const uniformTypeId = req.query.uniformTypeId as string | undefined;
    const category = req.query.category as string | undefined;
    const gender = req.query.gender as string | undefined;
    const search = req.query.search as string | undefined;
    const sort = req.query.sort as string | undefined;

    // 1. If schoolId provided, fetch the School with its Classes and Uniform Types
    let school = null;
    let classes: any[] = [];

    if (schoolId) {
      school = await prisma.school.findUnique({
        where: { id: schoolId },
        include: {
          academicYears: {
            where: { status: 'ACTIVE' },
            orderBy: { createdAt: 'desc' }
          },
          classes: {
            where: { status: 'ACTIVE' },
            orderBy: { displayOrder: 'asc' },
            include: {
              uniformTypes: {
                where: { status: 'ACTIVE' },
                orderBy: { displayOrder: 'asc' }
              }
            }
          }
        }
      });

      if (school) {
        classes = school.classes;
      }
    } else {
      // If no school specified, fetch default active schools list for discovery
      const allSchools = await prisma.school.findMany({
        where: { status: 'ACTIVE' },
        orderBy: { name: 'asc' },
        include: {
          classes: {
            where: { status: 'ACTIVE' },
            orderBy: { displayOrder: 'asc' },
            include: {
              uniformTypes: {
                where: { status: 'ACTIVE' },
                orderBy: { displayOrder: 'asc' }
              }
            }
          }
        }
      });
      if (allSchools.length > 0) {
        school = allSchools[0];
        classes = school.classes;
      }
    }

    // 2. Build where filter for Products
    const where: any = {
      status: 'ACTIVE'
    };

    if (schoolId) {
      where.OR = [
        { schoolId: schoolId },
        { schoolAssignments: { some: { schoolId: schoolId } } }
      ];
    }

    if (classId && classId !== 'All') {
      where.classId = classId;
    }

    if (uniformTypeId && uniformTypeId !== 'All') {
      where.uniformTypeId = uniformTypeId;
    }

    if (category && category !== 'All') {
      where.category = {
        name: { equals: category, mode: 'insensitive' }
      };
    }

    if (gender && gender !== 'All') {
      where.gender = {
        in: [gender.toUpperCase(), 'UNISEX', 'ALL']
      };
    }

    if (search && search.trim()) {
      const q = search.trim();
      where.AND = [
        ...(where.AND || []),
        {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
            { sku: { contains: q, mode: 'insensitive' } }
          ]
        }
      ];
    }

    // Sorting
    let orderBy: any = [{ displayOrder: 'asc' }, { createdAt: 'desc' }];
    if (sort === 'price_low_high') orderBy = { basePrice: 'asc' };
    if (sort === 'price_high_low') orderBy = { basePrice: 'desc' };
    if (sort === 'newest') orderBy = { createdAt: 'desc' };

    const rawProducts = await prisma.product.findMany({
      where,
      orderBy,
      include: {
        category: true,
        schoolClass: true,
        uniformType: true,
        academicYear: true,
        variants: {
          where: { status: 'ACTIVE' },
          orderBy: { displayOrder: 'asc' }
        },
        inventory: true,
        productImages: {
          orderBy: { sortOrder: 'asc' }
        }
      }
    });

    const products = rawProducts.map(p => {
      const variants = p.variants.map(v => ({
        id: v.id,
        sku: v.sku,
        size: v.size,
        color: v.color,
        price: v.price,
        isAvailable: v.isAvailable,
        stock: p.inventory ? Math.max(0, p.inventory.stockAvailable) : 25,
        imageUrl: v.imageUrl || p.images[0]
      }));

      const totalStock = p.inventory ? p.inventory.stockAvailable : variants.reduce((sum, v) => sum + v.stock, 0);

      // Collect sizes in display order
      const availableSizes = variants.filter(v => v.isAvailable).map(v => v.size);
      const allSizes = variants.map(v => ({
        id: v.id,
        size: v.size,
        isAvailable: v.isAvailable,
        price: v.price
      }));

      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        sku: p.sku,
        description: p.description,
        category: p.category.name,
        categorySlug: p.category.slug,
        gender: p.gender,
        price: p.salePrice || p.basePrice,
        basePrice: p.basePrice,
        salePrice: p.salePrice,
        originalPrice: p.originalPrice || p.basePrice,
        images: p.images.length > 0 ? p.images : ['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80'],
        schoolId: p.schoolId,
        classId: p.classId,
        className: p.schoolClass?.name || null,
        uniformTypeId: p.uniformTypeId,
        uniformTypeName: p.uniformType?.name || null,
        academicYearId: p.academicYearId,
        academicYear: p.academicYear?.year || null,
        displayOrder: p.displayOrder,
        availabilityStatus: p.availabilityStatus,
        isAvailableStudent: p.isAvailableStudent,
        isAvailableGeneral: p.isAvailableGeneral,
        isAvailableCorporate: p.isAvailableCorporate,
        stock: totalStock,
        variants,
        sizes: Array.from(new Set(variants.map(v => v.size))),
        availableSizes,
        sizeMatrix: allSizes,
        colors: Array.from(new Set(variants.map(v => v.color))),
        createdAt: p.createdAt,
        updatedAt: p.updatedAt
      };
    });

    res.json({
      school: school ? {
        id: school.id,
        name: school.name,
        code: school.code,
        address: school.address,
        logoUrl: school.logoUrl,
        contactEmail: school.contactEmail,
        phone: school.phone,
        status: school.status,
        totalStudents: school.totalStudents
      } : null,
      classes,
      activeClassId: classId || (classes.length > 0 ? classes[0].id : null),
      activeUniformTypeId: uniformTypeId || (classes.length > 0 && classes[0].uniformTypes?.length > 0 ? classes[0].uniformTypes[0].id : null),
      products,
      totalCount: products.length
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch master catalog', details: err.message });
  }
}

// ============================================================
// 2. SCHOOL MANAGEMENT
// ============================================================

export async function getAllSchools(req: Request, res: Response) {
  try {
    const schools = await prisma.school.findMany({
      orderBy: { name: 'asc' },
      include: {
        academicYears: {
          orderBy: { createdAt: 'desc' }
        },
        classes: {
          orderBy: { displayOrder: 'asc' },
          include: {
            uniformTypes: {
              orderBy: { displayOrder: 'asc' }
            },
            _count: { select: { products: true } }
          }
        },
        _count: {
          select: {
            classes: true,
            productAssignments: true
          }
        }
      }
    });

    const formatted = await Promise.all(schools.map(async s => {
      const productCount = await prisma.product.count({
        where: {
          OR: [
            { schoolId: s.id },
            { schoolAssignments: { some: { schoolId: s.id } } }
          ],
          status: 'ACTIVE'
        }
      });

      return {
        id: s.id,
        name: s.name,
        code: s.code,
        address: s.address,
        logoUrl: s.logoUrl,
        contactEmail: s.contactEmail,
        phone: s.phone,
        status: s.status,
        totalStudents: s.totalStudents,
        classesCount: s.classes.length,
        productsCount: productCount,
        academicYears: s.academicYears,
        classes: s.classes
      };
    }));

    res.json({ schools: formatted });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch schools', details: err.message });
  }
}

export async function createSchool(req: AuthenticatedRequest, res: Response) {
  try {
    const { name, code, address, contactEmail, phone, logoUrl, status = 'ACTIVE', totalStudents = 1000 } = req.body;

    if (!name || !code || !address || !contactEmail) {
      return res.status(400).json({ error: 'School name, unique code, address, and contact email are required.' });
    }

    const school = await prisma.school.create({
      data: {
        name,
        code: code.toUpperCase().trim(),
        address,
        contactEmail,
        phone: phone || null,
        logoUrl: logoUrl || 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=300&q=80',
        status,
        totalStudents: parseInt(totalStudents) || 1000
      }
    });

    await prisma.academicYear.create({
      data: {
        schoolId: school.id,
        year: '2025-2026',
        isCurrent: true,
        status: 'ACTIVE'
      }
    });

    const defaultClasses = [
      { name: 'Class 1', code: 'C1', displayOrder: 1 },
      { name: 'Class 2', code: 'C2', displayOrder: 2 },
      { name: 'Class 3', code: 'C3', displayOrder: 3 },
      { name: 'Class 4', code: 'C4', displayOrder: 4 },
      { name: 'Class 5', code: 'C5', displayOrder: 5 },
      { name: 'Class 6', code: 'C6', displayOrder: 6 },
      { name: 'Class 7', code: 'C7', displayOrder: 7 },
      { name: 'Class 8', code: 'C8', displayOrder: 8 },
      { name: 'Class 9', code: 'C9', displayOrder: 9 },
      { name: 'Class 10', code: 'C10', displayOrder: 10 },
      { name: 'Class 11', code: 'C11', displayOrder: 11 },
      { name: 'Class 12', code: 'C12', displayOrder: 12 }
    ];

    for (const c of defaultClasses) {
      const cls = await prisma.schoolClass.create({
        data: {
          schoolId: school.id,
          name: c.name,
          code: `${school.code}-${c.code}`,
          displayOrder: c.displayOrder,
          status: 'ACTIVE'
        }
      });

      if (c.name === 'Class 5' || c.name === 'Class 1') {
        await prisma.uniformType.createMany({
          data: [
            { classId: cls.id, name: 'Regular Uniform', slug: 'regular-uniform', displayOrder: 1, status: 'ACTIVE' },
            { classId: cls.id, name: 'Sports Uniform', slug: 'sports-uniform', displayOrder: 2, status: 'ACTIVE' },
            { classId: cls.id, name: 'Winter Uniform', slug: 'winter-uniform', displayOrder: 3, status: 'ACTIVE' }
          ]
        });
      }
    }

    if (req.user) {
      await prisma.auditLog.create({
        data: {
          userId: req.user.id,
          userEmail: req.user.email,
          action: 'CREATE_SCHOOL',
          entityType: 'School',
          entityId: school.id,
          newValue: JSON.stringify({ name: school.name, code: school.code })
        }
      });
    }

    res.status(201).json({ message: 'School created successfully with default classes', school });
  } catch (err: any) {
    res.status(400).json({ error: 'Failed to create school', details: err.message });
  }
}

export async function updateSchool(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const { name, code, address, contactEmail, phone, logoUrl, status, totalStudents } = req.body;

    const existing = await prisma.school.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'School not found' });
    }

    const updated = await prisma.school.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(code && { code: code.toUpperCase().trim() }),
        ...(address && { address }),
        ...(contactEmail && { contactEmail }),
        ...(phone !== undefined && { phone }),
        ...(logoUrl && { logoUrl }),
        ...(status && { status }),
        ...(totalStudents !== undefined && { totalStudents: parseInt(totalStudents) })
      }
    });

    if (req.user) {
      await prisma.auditLog.create({
        data: {
          userId: req.user.id,
          userEmail: req.user.email,
          action: 'UPDATE_SCHOOL',
          entityType: 'School',
          entityId: id,
          oldValue: JSON.stringify({ status: existing.status, name: existing.name }),
          newValue: JSON.stringify({ status: updated.status, name: updated.name })
        }
      });
    }

    res.json({ message: 'School updated successfully', school: updated });
  } catch (err: any) {
    res.status(400).json({ error: 'Failed to update school', details: err.message });
  }
}

// ============================================================
// 3. CLASS MANAGEMENT
// ============================================================

export async function getSchoolClasses(req: Request, res: Response) {
  try {
    const { schoolId } = req.params;
    const classes = await prisma.schoolClass.findMany({
      where: { schoolId },
      orderBy: { displayOrder: 'asc' },
      include: {
        uniformTypes: {
          orderBy: { displayOrder: 'asc' },
          include: {
            _count: { select: { products: true } }
          }
        },
        _count: { select: { products: true } }
      }
    });

    res.json({ classes });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch classes', details: err.message });
  }
}

export async function createClass(req: AuthenticatedRequest, res: Response) {
  try {
    const { schoolId } = req.params;
    const { name, code, displayOrder = 0, status = 'ACTIVE' } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Class name is required (e.g. "Class 5").' });
    }

    const school = await prisma.school.findUnique({ where: { id: schoolId } });
    if (!school) {
      return res.status(404).json({ error: 'School not found' });
    }

    const classCode = code || `${school.code}-${name.toLowerCase().replace(/[^a-z0-9]/g, '')}`;

    const newClass = await prisma.schoolClass.create({
      data: {
        schoolId,
        name,
        code: classCode,
        displayOrder: parseInt(displayOrder) || 0,
        status
      }
    });

    await prisma.uniformType.createMany({
      data: [
        { classId: newClass.id, name: 'Regular Uniform', slug: 'regular-uniform', displayOrder: 1, status: 'ACTIVE' },
        { classId: newClass.id, name: 'Sports Uniform', slug: 'sports-uniform', displayOrder: 2, status: 'ACTIVE' },
        { classId: newClass.id, name: 'Winter Uniform', slug: 'winter-uniform', displayOrder: 3, status: 'ACTIVE' }
      ]
    });

    res.status(201).json({ message: 'Class created successfully', schoolClass: newClass });
  } catch (err: any) {
    res.status(400).json({ error: 'Failed to create class', details: err.message });
  }
}

export async function updateClass(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const { name, code, displayOrder, status } = req.body;

    const updated = await prisma.schoolClass.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(code && { code }),
        ...(displayOrder !== undefined && { displayOrder: parseInt(displayOrder) }),
        ...(status && { status })
      }
    });

    res.json({ message: 'Class updated successfully', schoolClass: updated });
  } catch (err: any) {
    res.status(400).json({ error: 'Failed to update class', details: err.message });
  }
}

// ============================================================
// 4. UNIFORM TYPE MANAGEMENT
// ============================================================

export async function getClassUniformTypes(req: Request, res: Response) {
  try {
    const { classId } = req.params;
    const uniformTypes = await prisma.uniformType.findMany({
      where: { classId },
      orderBy: { displayOrder: 'asc' },
      include: {
        products: {
          where: { status: 'ACTIVE' },
          orderBy: { displayOrder: 'asc' },
          include: {
            variants: { where: { status: 'ACTIVE' }, orderBy: { displayOrder: 'asc' } },
            inventory: true
          }
        },
        _count: { select: { products: true } }
      }
    });

    res.json({ uniformTypes });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch uniform types', details: err.message });
  }
}

export async function createUniformType(req: AuthenticatedRequest, res: Response) {
  try {
    const { classId } = req.params;
    const { name, slug, description, imageUrl, displayOrder = 0, status = 'ACTIVE' } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Uniform type name is required (e.g. "Sports Uniform").' });
    }

    const generatedSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const uniformType = await prisma.uniformType.create({
      data: {
        classId,
        name,
        slug: generatedSlug,
        description: description || null,
        imageUrl: imageUrl || null,
        displayOrder: parseInt(displayOrder) || 0,
        status
      }
    });

    res.status(201).json({ message: 'Uniform type created successfully', uniformType });
  } catch (err: any) {
    res.status(400).json({ error: 'Failed to create uniform type', details: err.message });
  }
}

export async function updateUniformType(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const { name, slug, description, imageUrl, displayOrder, status } = req.body;

    const updated = await prisma.uniformType.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(slug && { slug }),
        ...(description !== undefined && { description }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(displayOrder !== undefined && { displayOrder: parseInt(displayOrder) }),
        ...(status && { status })
      }
    });

    res.json({ message: 'Uniform type updated successfully', uniformType: updated });
  } catch (err: any) {
    res.status(400).json({ error: 'Failed to update uniform type', details: err.message });
  }
}

// ============================================================
// 5. PRODUCT DETAILS, SIZES & AVAILABILITY MANAGEMENT
// ============================================================

export async function updateProductSizesAndAvailability(req: AuthenticatedRequest, res: Response) {
  try {
    const { id: productId } = req.params;
    const { variants, availabilityStatus, basePrice, originalPrice, images, name, description, displayOrder } = req.body;

    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
      include: { variants: true }
    });

    if (!existingProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // 1. Update basic product info
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(basePrice !== undefined && { basePrice: parseFloat(basePrice) }),
        ...(originalPrice !== undefined && { originalPrice: parseFloat(originalPrice) }),
        ...(availabilityStatus && { availabilityStatus: availabilityStatus as CatalogAvailability }),
        ...(images && Array.isArray(images) && { images }),
        ...(displayOrder !== undefined && { displayOrder: parseInt(displayOrder) })
      }
    });

    // 2. Upsert/Update variants (sizes, availability, prices)
    if (variants && Array.isArray(variants)) {
      for (let i = 0; i < variants.length; i++) {
        const v = variants[i];
        if (v.id) {
          await prisma.productVariant.update({
            where: { id: v.id },
            data: {
              size: v.size,
              price: v.price ? parseFloat(v.price) : updatedProduct.basePrice,
              isAvailable: v.isAvailable !== undefined ? Boolean(v.isAvailable) : true,
              displayOrder: i,
              status: v.status || 'ACTIVE'
            }
          });
        } else if (v.size) {
          await prisma.productVariant.create({
            data: {
              productId,
              sku: `${existingProduct.sku}-${v.size.toString().toUpperCase().replace(/[^A-Z0-9]/g, '')}`,
              size: v.size.toString(),
              color: v.color || 'Standard',
              price: v.price ? parseFloat(v.price) : updatedProduct.basePrice,
              isAvailable: v.isAvailable !== undefined ? Boolean(v.isAvailable) : true,
              displayOrder: i,
              status: 'ACTIVE'
            }
          });
        }
      }
    }

    // 3. Audit trail
    if (req.user) {
      await prisma.auditLog.create({
        data: {
          userId: req.user.id,
          userEmail: req.user.email,
          action: 'UPDATE_PRODUCT_CATALOG',
          entityType: 'Product',
          entityId: productId,
          newValue: JSON.stringify({
            name: updatedProduct.name,
            basePrice: updatedProduct.basePrice,
            availabilityStatus: updatedProduct.availabilityStatus
          })
        }
      });
    }

    res.json({ message: 'Product catalog details updated successfully', product: updatedProduct });
  } catch (err: any) {
    res.status(400).json({ error: 'Failed to update product details', details: err.message });
  }
}
