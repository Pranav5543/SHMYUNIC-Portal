import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { prisma } from '../database/db';
import { UserRole } from '../permissions/roles';

export async function getProducts(req: AuthenticatedRequest, res: Response) {
  try {
    const role = (req.query.role as UserRole) || req.user?.role || 'GENERAL_CUSTOMER';
    const schoolId = (req.query.schoolId as string) || req.user?.schoolId || undefined;
    const companyId = (req.query.companyId as string) || req.user?.companyId || undefined;
    const category = req.query.category as string;
    const productType = req.query.productType as string;
    const gender = req.query.gender as string;
    const color = req.query.color as string;
    const size = req.query.size as string;
    const search = req.query.search as string;
    const sort = req.query.sort as string;

    const where: any = {
      status: 'ACTIVE'
    };

    // Role & Tenant scope filtering
    if (schoolId) {
      where.OR = [
        { schoolId: schoolId },
        { schoolAssignments: { some: { schoolId: schoolId } } }
      ];
    } else if (companyId) {
      where.OR = [
        { companyId: companyId },
        { orgAssignments: { some: { organizationId: companyId } } }
      ];
    }

    // Category and ProductType filter
    const effectiveCategory = (category && category !== 'All') ? category : (productType && productType !== 'All' ? productType : undefined);
    if (effectiveCategory) {
      const slugified = effectiveCategory.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      where.category = {
        OR: [
          { name: { equals: effectiveCategory, mode: 'insensitive' } },
          { slug: { equals: effectiveCategory, mode: 'insensitive' } },
          { slug: { equals: slugified, mode: 'insensitive' } },
          { name: { contains: effectiveCategory, mode: 'insensitive' } }
        ]
      };
    }

    // Gender filter
    if (gender && gender !== 'All') {
      where.gender = {
        in: [gender.toUpperCase(), 'UNISEX', 'ALL']
      };
    }

    // Variant Color filter
    if (color && color !== 'All') {
      where.variants = {
        some: { color: { equals: color, mode: 'insensitive' } }
      };
    }

    // Variant Size filter
    if (size && size !== 'All') {
      where.variants = {
        some: { size: { equals: size, mode: 'insensitive' } }
      };
    }

    // Search query filter
    if (search && search.trim()) {
      const q = search.trim();
      where.AND = [
        ...(where.AND || []),
        {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
            { sku: { contains: q, mode: 'insensitive' } },
            { category: { name: { contains: q, mode: 'insensitive' } } },
            { variants: { some: { sku: { contains: q, mode: 'insensitive' } } } }
          ]
        }
      ];
    }

    // Sorting
    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'price_low_high') orderBy = { basePrice: 'asc' };
    if (sort === 'price_high_low') orderBy = { basePrice: 'desc' };
    if (sort === 'newest') orderBy = { createdAt: 'desc' };

    const products = await prisma.product.findMany({
      where,
      orderBy,
      include: {
        category: true,
        variants: {
          where: { status: 'ACTIVE' },
          orderBy: { price: 'asc' }
        },
        inventory: true,
        schoolAssignments: { include: { school: true } },
        orgAssignments: { include: { organization: true } }
      }
    });

    // Compute stock status and price range for frontend compatibility
    const formattedProducts = products.map(p => {
      const variants = p.variants.map(v => {
        // Match variant stock if present or derive from aggregated inventory
        const variantStock = p.inventory ? Math.max(0, p.inventory.stockAvailable) : 25;
        return {
          id: v.id,
          sku: v.sku,
          size: v.size,
          color: v.color,
          price: v.price,
          stock: variantStock,
          imageUrl: v.imageUrl || p.images[0]
        };
      });

      const totalStock = p.inventory ? p.inventory.stockAvailable : variants.reduce((sum, v) => sum + v.stock, 0);

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
        images: p.images,
        schoolId: p.schoolId,
        companyId: p.companyId,
        stock: totalStock,
        variants: variants,
        sizes: Array.from(new Set(variants.map(v => v.size))),
        colors: Array.from(new Set(variants.map(v => v.color))),
        createdAt: p.createdAt
      };
    });

    res.json({
      products: formattedProducts,
      counts: {
        total: formattedProducts.length,
        inStock: formattedProducts.filter(p => p.stock > 0).length
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Database product query error', details: err.message });
  }
}

export async function getProductById(req: Request, res: Response) {
  try {
    const idOrSlug = req.params.id;

    const product = await prisma.product.findFirst({
      where: {
        OR: [
          { id: idOrSlug },
          { slug: idOrSlug }
        ]
      },
      include: {
        category: true,
        variants: {
          where: { status: 'ACTIVE' },
          orderBy: { price: 'asc' }
        },
        inventory: true,
        schoolAssignments: { include: { school: true } },
        orgAssignments: { include: { organization: true } }
      }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const totalStock = product.inventory ? product.inventory.stockAvailable : 25;

    const formattedVariants = product.variants.map(v => ({
      id: v.id,
      sku: v.sku,
      size: v.size,
      color: v.color,
      price: v.price,
      stock: totalStock > 0 ? 15 : 0,
      imageUrl: v.imageUrl || product.images[0]
    }));

    const formatted = {
      id: product.id,
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      description: product.description,
      category: product.category.name,
      categorySlug: product.category.slug,
      gender: product.gender,
      price: product.salePrice || product.basePrice,
      basePrice: product.basePrice,
      salePrice: product.salePrice,
      images: product.images,
      schoolId: product.schoolId,
      companyId: product.companyId,
      stock: totalStock,
      variants: formattedVariants,
      sizes: Array.from(new Set(formattedVariants.map(v => v.size))),
      colors: Array.from(new Set(formattedVariants.map(v => v.color)))
    };

    res.json({ product: formatted });
  } catch (err: any) {
    res.status(500).json({ error: 'Database product fetch error', details: err.message });
  }
}

export async function createProduct(req: AuthenticatedRequest, res: Response) {
  try {
    const {
      name,
      slug,
      sku,
      description,
      categoryId,
      gender,
      basePrice,
      originalPrice,
      images,
      schoolId,
      classId,
      uniformTypeId,
      academicYearId,
      companyId,
      displayOrder,
      availabilityStatus,
      variants,
      sizes
    } = req.body;

    if (!name || !sku || !description || !categoryId || basePrice === undefined) {
      return res.status(400).json({ error: 'Missing required product fields (name, sku, description, categoryId, basePrice)' });
    }

    const generatedSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const newProduct = await prisma.product.create({
      data: {
        name,
        slug: generatedSlug,
        sku,
        description,
        categoryId,
        gender: gender || 'UNISEX',
        basePrice: parseFloat(basePrice),
        originalPrice: originalPrice ? parseFloat(originalPrice) : parseFloat(basePrice),
        images: Array.isArray(images) && images.length > 0 ? images : ['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80'],
        schoolId: schoolId || null,
        classId: classId || null,
        uniformTypeId: uniformTypeId || null,
        academicYearId: academicYearId || null,
        companyId: companyId || null,
        displayOrder: displayOrder ? parseInt(displayOrder) : 0,
        availabilityStatus: availabilityStatus || 'AVAILABLE'
      }
    });

    // Create default sizes / variants
    const sizeList = (variants && Array.isArray(variants) && variants.length > 0)
      ? variants
      : (sizes && Array.isArray(sizes) && sizes.length > 0)
        ? sizes.map((s: string) => ({ size: s, price: newProduct.basePrice, isAvailable: true }))
        : [
            { size: '28', price: newProduct.basePrice, isAvailable: true },
            { size: '30', price: newProduct.basePrice, isAvailable: true },
            { size: '32', price: newProduct.basePrice, isAvailable: true },
            { size: '34', price: newProduct.basePrice, isAvailable: true },
            { size: '36', price: newProduct.basePrice, isAvailable: true }
          ];

    for (let i = 0; i < sizeList.length; i++) {
      const v = sizeList[i];
      await prisma.productVariant.create({
        data: {
          productId: newProduct.id,
          sku: `${newProduct.sku}-${(v.size || v).toString().toUpperCase().replace(/[^A-Z0-9]/g, '')}`,
          size: (v.size || v).toString(),
          color: v.color || 'Standard',
          price: v.price ? parseFloat(v.price) : newProduct.basePrice,
          isAvailable: v.isAvailable !== undefined ? Boolean(v.isAvailable) : true,
          displayOrder: i,
          status: 'ACTIVE'
        }
      });
    }

    // Create inventory entry
    await prisma.inventory.create({
      data: {
        productId: newProduct.id,
        sku,
        productName: name,
        stockAvailable: 50,
        warehouseLocation: 'Rack-A1-HYD'
      }
    });

    res.status(201).json({ message: 'Product created successfully in Master Catalog', product: newProduct });
  } catch (err: any) {
    res.status(400).json({ error: 'Failed to create product', details: err.message });
  }
}

export async function updateProduct(req: AuthenticatedRequest, res: Response) {
  try {
    const productId = req.params.id;
    const {
      name,
      basePrice,
      originalPrice,
      salePrice,
      description,
      status,
      availabilityStatus,
      images,
      schoolId,
      classId,
      uniformTypeId,
      displayOrder,
      variants
    } = req.body;

    const updated = await prisma.product.update({
      where: { id: productId },
      data: {
        ...(name && { name }),
        ...(basePrice !== undefined && { basePrice: parseFloat(basePrice) }),
        ...(originalPrice !== undefined && { originalPrice: parseFloat(originalPrice) }),
        ...(salePrice !== undefined && { salePrice: salePrice ? parseFloat(salePrice) : null }),
        ...(description && { description }),
        ...(status && { status }),
        ...(availabilityStatus && { availabilityStatus }),
        ...(images && Array.isArray(images) && { images }),
        ...(schoolId !== undefined && { schoolId }),
        ...(classId !== undefined && { classId }),
        ...(uniformTypeId !== undefined && { uniformTypeId }),
        ...(displayOrder !== undefined && { displayOrder: parseInt(displayOrder) })
      }
    });

    if (variants && Array.isArray(variants)) {
      for (let i = 0; i < variants.length; i++) {
        const v = variants[i];
        if (v.id) {
          await prisma.productVariant.update({
            where: { id: v.id },
            data: {
              size: v.size,
              price: v.price ? parseFloat(v.price) : updated.basePrice,
              isAvailable: v.isAvailable !== undefined ? Boolean(v.isAvailable) : true,
              displayOrder: i,
              status: v.status || 'ACTIVE'
            }
          });
        } else if (v.size) {
          await prisma.productVariant.create({
            data: {
              productId,
              sku: `${updated.sku}-${v.size.toString().toUpperCase().replace(/[^A-Z0-9]/g, '')}`,
              size: v.size.toString(),
              color: v.color || 'Standard',
              price: v.price ? parseFloat(v.price) : updated.basePrice,
              isAvailable: v.isAvailable !== undefined ? Boolean(v.isAvailable) : true,
              displayOrder: i,
              status: 'ACTIVE'
            }
          });
        }
      }
    }

    res.json({ message: 'Product updated successfully', product: updated });
  } catch (err: any) {
    res.status(400).json({ error: 'Failed to update product', details: err.message });
  }
}
