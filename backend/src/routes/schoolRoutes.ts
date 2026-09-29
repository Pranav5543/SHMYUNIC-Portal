import { Router, Request, Response } from 'express';
import { prisma } from '../database/db';
import { getProducts } from '../controllers/productController';

const router = Router();

// GET /api/schools - List all partner schools
router.get('/schools', async (req: Request, res: Response) => {
  try {
    const schools = await prisma.school.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { name: 'asc' }
    });
    res.json({ schools });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch schools', details: err.message });
  }
});

// GET /api/schools/:id/products - Get products for specific school with composite filters
router.get('/schools/:id/products', (req: Request, res: Response) => {
  req.query.schoolId = req.params.id;
  return getProducts(req as any, res);
});

// GET /api/companies - List corporate companies
router.get('/companies', async (req: Request, res: Response) => {
  try {
    const companies = await prisma.organization.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { name: 'asc' }
    });
    res.json({ companies });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch companies', details: err.message });
  }
});

// GET /api/companies/:id/products - Get products for corporate company with composite filters
router.get('/companies/:id/products', (req: Request, res: Response) => {
  req.query.companyId = req.params.id;
  return getProducts(req as any, res);
});

export default router;
