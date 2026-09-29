import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { prisma } from '../database/db';
import { OrderStatus, PaymentStatus, ShippingStatus, DeliveryType } from '@prisma/client';

export async function getOrders(req: AuthenticatedRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const { id: userId, role, schoolId, companyId } = req.user;

    let where: any = {};

    if (role === 'STUDENT_PARENT' || role === 'GENERAL_CUSTOMER' || role === 'EMPLOYEE') {
      where.userId = userId;
    } else if (role === 'SCHOOL_ADMIN' && schoolId) {
      where.schoolId = schoolId;
    } else if (role === 'VENDOR') {
      // Vendors see all platform orders or scoped orders
      where = {};
    } else if (role === 'WAREHOUSE' || role === 'INTERNAL_ADMIN') {
      where = {};
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: true,
        fulfillmentOrders: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ orders });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch orders from database', details: err.message });
  }
}

export async function getOrderById(req: AuthenticatedRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const orderId = req.params.id;

    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { id: orderId },
          { orderNumber: orderId }
        ]
      },
      include: {
        items: true,
        fulfillmentOrders: {
          include: { events: true }
        },
        payments: true
      }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Role security check
    if (
      req.user.role !== 'INTERNAL_ADMIN' &&
      req.user.role !== 'WAREHOUSE' &&
      req.user.role !== 'VENDOR' &&
      order.userId !== req.user.id
    ) {
      return res.status(403).json({ error: 'Forbidden: Access denied to this order' });
    }

    res.json({ order });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch order', details: err.message });
  }
}

export async function createOrder(req: AuthenticatedRequest, res: Response) {
  const user = req.user;
  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const { items: inputItems, deliveryType = 'INDIVIDUAL_HOME', shippingAddress, paymentMethod = 'CREDIT_CARD' } = req.body;

  try {
    let orderItemsToProcess: Array<{
      productId: string;
      selectedSize: string;
      quantity: number;
    }> = [];

    // If items provided in body, use them; otherwise fetch from user's active Cart in PostgreSQL
    if (inputItems && Array.isArray(inputItems) && inputItems.length > 0) {
      orderItemsToProcess = inputItems;
    } else {
      const userCart = await prisma.cart.findUnique({
        where: { userId: user.id },
        include: { items: true }
      });

      if (!userCart || userCart.items.length === 0) {
        return res.status(400).json({ error: 'Your cart is empty. Please add items before checking out.' });
      }

      orderItemsToProcess = userCart.items.map(ci => ({
        productId: ci.productId,
        selectedSize: ci.selectedSize,
        quantity: ci.quantity
      }));
    }

    // 1. Revalidate Product, Variant, Price, Stock from PostgreSQL inside a transaction
    const newOrder = await prisma.$transaction(async (tx) => {
      let subtotal = 0;
      const validatedOrderItems = [];

      for (const item of orderItemsToProcess) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          include: { variants: true, inventory: true }
        });

        if (!product) {
          throw new Error(`Product ID ${item.productId} no longer exists.`);
        }

        const variant = product.variants.find(v => v.size === item.selectedSize) || product.variants[0];
        const unitPrice = variant ? variant.price : (product.salePrice || product.basePrice);

        // Verify Inventory Stock
        const currentStock = product.inventory ? product.inventory.stockAvailable : 100;
        if (currentStock < item.quantity) {
          throw new Error(`Insufficient stock for "${product.name}" (Size ${item.selectedSize}). Requested: ${item.quantity}, Available: ${currentStock}`);
        }

        const itemSubtotal = Number((unitPrice * item.quantity).toFixed(2));
        subtotal += itemSubtotal;

        validatedOrderItems.push({
          productId: product.id,
          productVariantId: variant ? variant.id : null,
          productNameSnapshot: product.name,
          skuSnapshot: variant ? variant.sku : product.sku,
          productImage: product.images[0] || '',
          selectedSize: item.selectedSize,
          quantity: item.quantity,
          unitPrice,
          subtotal: itemSubtotal
        });

        // Decrement Product Inventory Stock
        if (product.inventory) {
          await tx.inventory.update({
            where: { id: product.inventory.id },
            data: {
              stockAvailable: Math.max(0, product.inventory.stockAvailable - item.quantity),
              stockReserved: product.inventory.stockReserved + item.quantity
            }
          });

          await tx.stockMovement.create({
            data: {
              inventoryId: product.inventory.id,
              sku: variant ? variant.sku : product.sku,
              type: 'SALE',
              changeQuantity: -item.quantity,
              previousStock: product.inventory.stockAvailable,
              newStock: Math.max(0, product.inventory.stockAvailable - item.quantity),
              reason: 'Customer Order Checkout',
              updatedBy: user.email
            }
          });
        }
      }

      // Calculate final pricing in INR (₹)
      const tax = Number((subtotal * 0.08).toFixed(2)); // 8% GST/Tax
      const shippingFee = deliveryType === 'SCHOOL_BULK' ? 0.0 : 99.0; // ₹99 flat home delivery
      const totalAmount = Number((subtotal + tax + shippingFee).toFixed(2));

      const orderCount = await tx.order.count();
      const orderNumber = `SMU-ORD-${new Date().getFullYear()}-${String(orderCount + 1001).padStart(5, '0')}`;

      // Create Order
      const createdOrder = await tx.order.create({
        data: {
          orderNumber,
          userId: user.id,
          customerName: `${user.firstName} ${user.lastName}`,
          customerEmail: user.email,
          customerRole: user.role,
          schoolId: user.schoolId || null,
          companyId: user.companyId || null,
          subtotal,
          discount: 0.0,
          tax,
          shippingFee,
          totalAmount,
          currency: 'INR',
          orderStatus: OrderStatus.CONFIRMED,
          paymentStatus: PaymentStatus.PAID,
          shippingStatus: ShippingStatus.LABEL_CREATED,
          deliveryType: deliveryType as DeliveryType,
          shippingAddress: shippingAddress || '12 Financial District, Gachibowli, Hyderabad, Telangana 500032',
          items: {
            create: validatedOrderItems
          },
          payments: {
            create: [
              {
                provider: paymentMethod,
                amount: totalAmount,
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
                trackingNumber: `SMU-TRACK-${Math.floor(10000000 + Math.random() * 90000000)}`,
                carrier: 'Delhivery Express'
              }
            ]
          }
        },
        include: {
          items: true,
          fulfillmentOrders: true
        }
      });

      // Clear user active cart
      const cart = await tx.cart.findUnique({ where: { userId: user.id } });
      if (cart) {
        await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
      }

      // Log Audit Trail
      await tx.auditLog.create({
        data: {
          userId: user.id,
          userEmail: user.email,
          action: 'ORDER_CREATE',
          entityType: 'Order',
          entityId: createdOrder.id,
          newValue: `Created order #${orderNumber} for ₹${totalAmount}`
        }
      });

      return createdOrder;
    });

    res.status(201).json({
      message: 'Order placed successfully!',
      order: newOrder
    });
  } catch (err: any) {
    res.status(400).json({ error: 'Order creation failed', details: err.message });
  }
}

export async function updateOrderStatus(req: AuthenticatedRequest, res: Response) {
  const { orderStatus, shippingStatus } = req.body;
  const authorEmail = req.user?.email || 'warehouse@shopmyuniform.com';

  try {
    const orderId = req.params.id;

    const existing = await prisma.order.findUnique({ where: { id: orderId } });
    if (!existing) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: {
        ...(orderStatus && { orderStatus: orderStatus as OrderStatus }),
        ...(shippingStatus && { shippingStatus: shippingStatus as ShippingStatus })
      },
      include: { items: true, fulfillmentOrders: true }
    });

    // Update fulfillment status if fulfillment order exists
    if (updated.fulfillmentOrders.length > 0) {
      const fulId = updated.fulfillmentOrders[0].id;
      await prisma.fulfillmentOrder.update({
        where: { id: fulId },
        data: {
          ...(orderStatus && { status: orderStatus as OrderStatus }),
          ...(orderStatus === 'SHIPPED' && { shippedAt: new Date() }),
          ...(orderStatus === 'DELIVERED' && { deliveredAt: new Date() })
        }
      });

      await prisma.fulfillmentEvent.create({
        data: {
          fulfillmentOrderId: fulId,
          status: (orderStatus || existing.orderStatus) as OrderStatus,
          note: `Status updated to ${orderStatus || existing.orderStatus} / ${shippingStatus || existing.shippingStatus}`,
          createdBy: authorEmail
        }
      });
    }

    res.json({ message: 'Order status updated successfully', order: updated });
  } catch (err: any) {
    res.status(400).json({ error: 'Failed to update order status', details: err.message });
  }
}
