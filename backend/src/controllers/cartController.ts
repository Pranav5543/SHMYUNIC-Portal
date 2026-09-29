import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { prisma } from '../database/db';

export async function getCart(req: AuthenticatedRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    let cart = await prisma.cart.findUnique({
      where: { userId: req.user.id },
      include: {
        items: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          userId: req.user.id,
          status: 'ACTIVE'
        },
        include: {
          items: true
        }
      });
    }

    const subtotal = cart.items.reduce((sum, item) => sum + (item.priceSnapshot * item.quantity), 0);

    res.json({
      cartId: cart.id,
      items: cart.items,
      itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch cart', details: err.message });
  }
}

export async function addToCart(req: AuthenticatedRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const { productId, selectedSize, quantity = 1, productVariantId } = req.body;

  if (!productId || !selectedSize) {
    return res.status(400).json({ error: 'productId and selectedSize are required' });
  }

  try {
    // 1. Verify Product & Variant from PostgreSQL
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { variants: true }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const variant = product.variants.find(v => v.size === selectedSize) || product.variants[0];
    const itemPrice = variant ? variant.price : (product.salePrice || product.basePrice);

    // 2. Fetch or create User Cart in PostgreSQL
    let cart = await prisma.cart.findUnique({
      where: { userId: req.user.id }
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: req.user.id, status: 'ACTIVE' }
      });
    }

    // 3. Upsert Cart Item
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId,
        selectedSize
      }
    });

    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity }
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          productVariantId: variant ? variant.id : productVariantId || null,
          productName: product.name,
          selectedSize,
          quantity,
          priceSnapshot: itemPrice,
          image: product.images[0] || ''
        }
      });
    }

    // Return updated cart
    const updatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: { items: true }
    });

    res.json({
      message: `Added ${product.name} (Size ${selectedSize}) to cart`,
      items: updatedCart?.items || [],
      itemCount: updatedCart?.items.reduce((sum, i) => sum + i.quantity, 0) || 0
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to add item to cart', details: err.message });
  }
}

export async function updateCartItem(req: AuthenticatedRequest, res: Response) {
  if (!req.user) return res.status(401).json({ error: 'Authentication required' });

  const itemId = req.params.id;
  const { quantity } = req.body;

  if (quantity === undefined || quantity < 1) {
    return res.status(400).json({ error: 'Valid quantity (>0) is required' });
  }

  try {
    const updated = await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity: Number(quantity) }
    });

    res.json({ message: 'Cart item updated', item: updated });
  } catch (err: any) {
    res.status(400).json({ error: 'Failed to update cart item', details: err.message });
  }
}

export async function removeFromCart(req: AuthenticatedRequest, res: Response) {
  if (!req.user) return res.status(401).json({ error: 'Authentication required' });

  const itemId = req.params.id;

  try {
    await prisma.cartItem.delete({
      where: { id: itemId }
    });

    res.json({ message: 'Item removed from cart' });
  } catch (err: any) {
    res.status(400).json({ error: 'Failed to remove cart item', details: err.message });
  }
}

export async function clearCart(req: AuthenticatedRequest, res: Response) {
  if (!req.user) return res.status(401).json({ error: 'Authentication required' });

  try {
    const cart = await prisma.cart.findUnique({
      where: { userId: req.user.id }
    });

    if (cart) {
      await prisma.cartItem.deleteMany({
        where: { cartId: cart.id }
      });
    }

    res.json({ message: 'Cart cleared' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to clear cart', details: err.message });
  }
}
