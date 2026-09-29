import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import schoolRoutes from './routes/schoolRoutes';
import catalogRoutes from './routes/catalogRoutes';
import { authenticateToken, requireAuth, requirePermission, enforceTenantIsolation } from './middleware/auth';
import { requireRole } from './middleware/auth';
import { getProducts, getProductById, createProduct, updateProduct } from './controllers/productController';
import { getInventory, updateStock } from './controllers/inventoryController';
import { getOrders, getOrderById, createOrder, updateOrderStatus } from './controllers/orderController';
import { getCart, addToCart, updateCartItem, removeFromCart, clearCart } from './controllers/cartController';
import { getWishlist, addToWishlist, removeFromWishlist } from './controllers/wishlistController';
import { createReturnRequest, getReturnRequestByOrder, getAllReturnRequests, updateReturnRequestStatus } from './controllers/returnController';
import { createQuoteRequest, getQuoteRequests } from './controllers/quoteController';
import { getSchoolAdminMetrics } from './controllers/schoolAdminController';
import { getVendorPurchaseOrders } from './controllers/vendorController';
import { prisma } from './database/db';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  'http://localhost:3000',
  'http://127.0.0.1:3000'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());

// Health Check Endpoint
app.get('/api/health', async (_req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'HEALTHY',
      service: 'ShopMyUniform Enterprise REST API',
      database: 'PostgreSQL Active',
      timestamp: new Date().toISOString(),
      env: process.env.NODE_ENV || 'development'
    });
  } catch (err: any) {
    res.status(500).json({
      status: 'UNHEALTHY',
      error: 'PostgreSQL database connection failed',
      details: err.message
    });
  }
});

// Authentication Routes
app.use('/api/auth', authRoutes);

// School & Organization Routes
app.use('/api', schoolRoutes);
app.use('/api', catalogRoutes);

// Children Management Routes for Student / Parent
app.get('/api/children', authenticateToken, requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    let children = await prisma.child.findMany({
      where: { parentId: userId },
      include: { school: true },
      orderBy: { createdAt: 'asc' }
    });

    // If no children in Child table yet, check StudentParentProfile as primary child
    if (children.length === 0) {
      const profile = await prisma.studentParentProfile.findUnique({
        where: { userId },
        include: { school: true }
      });
      if (profile) {
        const createdChild = await prisma.child.create({
          data: {
            parentId: userId,
            name: profile.studentName,
            schoolId: profile.schoolId,
            schoolName: profile.schoolName,
            grade: profile.grade,
            studentId: profile.studentId
          },
          include: { school: true }
        });
        children = [createdChild];
      }
    }

    res.json({ children });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch children profiles', details: err.message });
  }
});

app.post('/api/children', authenticateToken, requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { name, schoolId, schoolName, grade, studentId } = req.body;

    if (!name || !grade) {
      return res.status(400).json({ error: 'Child name and grade are required' });
    }

    let targetSchoolName = schoolName;
    if (schoolId && !targetSchoolName) {
      const s = await prisma.school.findUnique({ where: { id: schoolId } });
      if (s) targetSchoolName = s.name;
    }

    const child = await prisma.child.create({
      data: {
        parentId: userId,
        name,
        schoolId: schoolId || null,
        schoolName: targetSchoolName || 'Partner School',
        grade,
        studentId: studentId || `SMU-${Math.floor(1000 + Math.random() * 9000)}`
      },
      include: { school: true }
    });

    res.json({ message: 'Child added successfully', child });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create child profile', details: err.message });
  }
});

app.put('/api/children/:id', authenticateToken, requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { id } = req.params;
    const { name, schoolId, schoolName, grade, studentId } = req.body;

    const existing = await prisma.child.findUnique({ where: { id } });
    if (!existing || existing.parentId !== userId) {
      return res.status(404).json({ error: 'Child profile not found' });
    }

    const updated = await prisma.child.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(schoolId && { schoolId }),
        ...(schoolName && { schoolName }),
        ...(grade && { grade }),
        ...(studentId && { studentId })
      },
      include: { school: true }
    });

    res.json({ message: 'Child profile updated', child: updated });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update child profile', details: err.message });
  }
});

app.delete('/api/children/:id', authenticateToken, requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { id } = req.params;

    const existing = await prisma.child.findUnique({ where: { id } });
    if (!existing || existing.parentId !== userId) {
      return res.status(404).json({ error: 'Child profile not found' });
    }

    await prisma.child.delete({ where: { id } });
    res.json({ message: 'Child profile deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete child profile', details: err.message });
  }
});

// Category Routes
app.get('/api/categories', async (_req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { name: 'asc' }
    });
    res.json({ categories });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch categories', details: err.message });
  }
});

// Public & Filtered Product Routes
app.get('/api/products', authenticateToken, enforceTenantIsolation, getProducts);
app.get('/api/products/:id', authenticateToken, getProductById);
app.post('/api/products', authenticateToken, requireAuth, requirePermission('PRODUCT_CREATE'), createProduct);
app.put('/api/products/:id', authenticateToken, requireAuth, requirePermission('PRODUCT_UPDATE'), updateProduct);

// Cart Routes
app.get('/api/cart', authenticateToken, getCart);
app.post('/api/cart/items', authenticateToken, addToCart);
app.put('/api/cart/items/:id', authenticateToken, updateCartItem);
app.delete('/api/cart/items/:id', authenticateToken, removeFromCart);
app.delete('/api/cart', authenticateToken, clearCart);

// Inventory & Stock Routes
app.get('/api/inventory', authenticateToken, requireAuth, requirePermission('INVENTORY_VIEW'), getInventory);
app.post('/api/inventory/update', authenticateToken, requireAuth, requirePermission('INVENTORY_UPDATE'), updateStock);

// Order Lifecycle & Fulfillment Routes
app.get('/api/orders', authenticateToken, requireAuth, getOrders);
app.get('/api/orders/:id', authenticateToken, requireAuth, getOrderById);
app.post('/api/orders', authenticateToken, requireAuth, createOrder);
app.put('/api/orders/:id/status', authenticateToken, requireAuth, requirePermission('ORDER_UPDATE'), updateOrderStatus);

// Wishlist Routes
app.get('/api/wishlist', authenticateToken, getWishlist);
app.post('/api/wishlist/items', authenticateToken, addToWishlist);
app.delete('/api/wishlist/items/:productId', authenticateToken, removeFromWishlist);

// Return & Size Exchange Routes
app.post('/api/orders/:orderId/exchange', authenticateToken, requireAuth, createReturnRequest);
app.get('/api/orders/:orderId/exchange', authenticateToken, requireAuth, getReturnRequestByOrder);
app.get('/api/returns', authenticateToken, requireAuth, requirePermission('ORDER_UPDATE'), getAllReturnRequests);
app.put('/api/returns/:id/status', authenticateToken, requireAuth, requirePermission('ORDER_UPDATE'), updateReturnRequestStatus);

// Bulk Quote Routes
app.post('/api/quote', authenticateToken, createQuoteRequest);
app.get('/api/quotes', authenticateToken, requireAuth, requirePermission('ADMIN_ACCESS'), getQuoteRequests);

// School Admin Metrics Route
app.get('/api/school-admin/metrics', authenticateToken, requireAuth, requireRole(['SCHOOL_ADMIN', 'INTERNAL_ADMIN']), getSchoolAdminMetrics);

// Vendor Operations & PO Route
app.get('/api/vendor/purchase-orders', authenticateToken, requireAuth, requireRole(['VENDOR', 'INTERNAL_ADMIN']), getVendorPurchaseOrders);

// Master Admin Audit Log Endpoint
app.get('/api/admin/audit-logs', authenticateToken, requireAuth, requirePermission('ADMIN_ACCESS'), async (_req: Request, res: Response) => {
  try {
    const auditLogs = await prisma.auditLog.findMany({
      take: 100,
      orderBy: { timestamp: 'desc' }
    });
    res.json({ auditLogs });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch audit logs', details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`[ShopMyUniform Enterprise REST API] Running on http://localhost:${PORT}`);
});
