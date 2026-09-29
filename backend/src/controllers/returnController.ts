import { Request, Response } from 'express';
import { prisma } from '../database/db';

export async function createReturnRequest(req: Request, res: Response) {
  const userId = (req as any).user?.id;
  if (!userId) {
    return res.status(401).json({ error: 'Authentication Required' });
  }

  const { orderId } = req.params;
  const { orderItemId, reason, targetSize, comments } = req.body;

  if (!reason) {
    return res.status(400).json({ error: 'Reason for return/exchange is required' });
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!order || (order.userId !== userId && (req as any).user?.role !== 'INTERNAL_ADMIN')) {
      return res.status(404).json({ error: 'Order not found or unauthorized' });
    }

    const returnRequest = await prisma.returnRequest.create({
      data: {
        orderId,
        userId,
        orderItemId: orderItemId || null,
        reason,
        targetSize: targetSize || null,
        comments: comments || null,
        status: 'PENDING'
      }
    });

    res.json({ message: 'Return/exchange request submitted successfully', returnRequest });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create return request', details: err.message });
  }
}

export async function getReturnRequestByOrder(req: Request, res: Response) {
  const userId = (req as any).user?.id;
  if (!userId) {
    return res.status(401).json({ error: 'Authentication Required' });
  }

  const { orderId } = req.params;

  try {
    const requests = await prisma.returnRequest.findMany({
      where: { orderId, userId },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ returnRequests: requests });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch return request', details: err.message });
  }
}

export async function getAllReturnRequests(req: Request, res: Response) {
  try {
    const requests = await prisma.returnRequest.findMany({
      include: {
        user: { select: { email: true, firstName: true, lastName: true } },
        order: { select: { orderNumber: true, totalAmount: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ returnRequests: requests });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch return requests', details: err.message });
  }
}

export async function updateReturnRequestStatus(req: Request, res: Response) {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ error: 'Status is required' });
  }

  try {
    const updated = await prisma.returnRequest.update({
      where: { id },
      data: { status }
    });

    res.json({ message: 'Return request status updated', returnRequest: updated });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update return request status', details: err.message });
  }
}
