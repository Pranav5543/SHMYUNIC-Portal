import { Request, Response } from 'express';
import { prisma } from '../database/db';

export async function createQuoteRequest(req: Request, res: Response) {
  const userId = (req as any).user?.id || null;
  const { orgName, contactName, email, phone, quantity, notes } = req.body;

  if (!orgName || !contactName || !email) {
    return res.status(400).json({ error: 'Organization name, contact name, and email are required' });
  }

  try {
    const quote = await prisma.quoteRequest.create({
      data: {
        userId,
        orgName,
        contactName,
        email: email.toLowerCase().trim(),
        phone: phone || null,
        quantity: Number(quantity) || 500,
        notes: notes || null,
        status: 'NEW'
      }
    });

    res.json({ message: 'Bulk quote inquiry submitted successfully', quote });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to submit quote request', details: err.message });
  }
}

export async function getQuoteRequests(req: Request, res: Response) {
  try {
    const quotes = await prisma.quoteRequest.findMany({
      orderBy: { createdAt: 'desc' }
    });

    res.json({ quotes });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch quote requests', details: err.message });
  }
}
