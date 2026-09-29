import { Request, Response } from 'express';
import { prisma } from '../database/db';

export async function getWishlist(req: Request, res: Response) {
  const userId = (req as any).user?.id;
  if (!userId) {
    return res.status(401).json({ error: 'Authentication Required' });
  }

  try {
    const items = await prisma.wishlistItem.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            variants: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const products = items.map(item => item.product);
    res.json({ products });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch wishlist', details: err.message });
  }
}

export async function addToWishlist(req: Request, res: Response) {
  const userId = (req as any).user?.id;
  if (!userId) {
    return res.status(401).json({ error: 'Authentication Required' });
  }

  const { productId } = req.body;
  if (!productId) {
    return res.status(400).json({ error: 'ProductId is required' });
  }

  try {
    const item = await prisma.wishlistItem.upsert({
      where: {
        userId_productId: { userId, productId }
      },
      create: { userId, productId },
      update: {},
      include: { product: true }
    });

    res.json({ message: 'Item added to wishlist', item });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to add item to wishlist', details: err.message });
  }
}

export async function removeFromWishlist(req: Request, res: Response) {
  const userId = (req as any).user?.id;
  if (!userId) {
    return res.status(401).json({ error: 'Authentication Required' });
  }

  const { productId } = req.params;
  try {
    await prisma.wishlistItem.deleteMany({
      where: { userId, productId }
    });

    res.json({ message: 'Item removed from wishlist' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to remove item from wishlist', details: err.message });
  }
}
