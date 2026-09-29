import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { prisma } from '../database/db';

export async function getInventory(_req: AuthenticatedRequest, res: Response) {
  try {
    const inventory = await prisma.inventory.findMany({
      include: {
        product: { select: { name: true, sku: true, category: true } }
      },
      orderBy: { updatedAt: 'desc' }
    });

    const movements = await prisma.stockMovement.findMany({
      take: 50,
      orderBy: { timestamp: 'desc' }
    });

    res.json({ inventory, movements });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch inventory from database', details: err.message });
  }
}

export async function updateStock(req: AuthenticatedRequest, res: Response) {
  const { sku, newStock, reason } = req.body;
  const authorEmail = req.user?.email || 'admin@shopmyuniform.com';

  if (!sku || newStock === undefined) {
    return res.status(400).json({ error: 'SKU and newStock are required' });
  }

  try {
    const numericStock = Number(newStock);

    const existing = await prisma.inventory.findFirst({
      where: { sku }
    });

    if (!existing) {
      return res.status(404).json({ error: `Inventory item with SKU ${sku} not found` });
    }

    const previousStock = existing.stockAvailable;

    const updated = await prisma.$transaction(async (tx) => {
      const inv = await tx.inventory.update({
        where: { id: existing.id },
        data: {
          stockAvailable: numericStock,
          status: numericStock > 0 ? 'IN_STOCK' : 'OUT_OF_STOCK'
        }
      });

      await tx.stockMovement.create({
        data: {
          inventoryId: inv.id,
          sku,
          type: 'ADJUSTMENT',
          changeQuantity: numericStock - previousStock,
          previousStock,
          newStock: numericStock,
          reason: reason || 'Manual Admin Stock Adjustment',
          updatedBy: authorEmail
        }
      });

      return inv;
    });

    res.json({ message: 'Stock updated successfully in PostgreSQL', inventory: updated });
  } catch (err: any) {
    res.status(400).json({ error: 'Failed to update stock', details: err.message });
  }
}
