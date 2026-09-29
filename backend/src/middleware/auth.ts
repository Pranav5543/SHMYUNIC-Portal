import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole, Permission, ROLE_PERMISSIONS } from '../permissions/roles';
import { prisma } from '../database/db';

const JWT_SECRET = process.env.JWT_SECRET || 'shopmyuniform-super-secret-jwt-key-2026-prod-dev';

export interface AuthenticatedUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  schoolId?: string | null;
  companyId?: string | null;
  vendorId?: string | null;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

export async function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    // Guest access: request proceeds without req.user populated
    req.user = undefined;
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      email: string;
      role: UserRole;
      schoolId?: string;
      companyId?: string;
    };

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        schoolId: true,
        companyId: true,
        vendorId: true,
        status: true
      }
    });

    if (!user || user.status !== 'ACTIVE') {
      return res.status(401).json({ error: 'Unauthorized: User account suspended or non-existent' });
    }

    req.user = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role as UserRole,
      schoolId: user.schoolId,
      companyId: user.companyId,
      vendorId: user.vendorId
    };

    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired session token' });
  }
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({
      error: 'Authentication Required',
      message: 'Please sign in to complete this action.'
    });
  }
  next();
}

export function requireRole(allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication Required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Access Denied: 403 Forbidden',
        message: `Account (${req.user.email}) registered as ${req.user.role} is not authorized for this resource.`
      });
    }
    next();
  };
}

export function requirePermission(permission: Permission) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const userPermissions = ROLE_PERMISSIONS[req.user.role] || [];
    if (!userPermissions.includes(permission)) {
      return res.status(403).json({
        error: 'Forbidden: Missing Permission',
        message: `Role ${req.user.role} lacks permission ${permission}`
      });
    }
    next();
  };
}

export function enforceTenantIsolation(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) return next(); // Guest access allowed

  if (req.user.role === 'INTERNAL_ADMIN') return next();

  if (req.user.role === 'STUDENT_PARENT' && req.query.schoolId) {
    if (req.user.schoolId && req.query.schoolId !== req.user.schoolId) {
      return res.status(403).json({ error: 'Forbidden: Cannot access another school catalog' });
    }
  }

  if (req.user.role === 'EMPLOYEE' && req.query.companyId) {
    if (req.user.companyId && req.query.companyId !== req.user.companyId) {
      return res.status(403).json({ error: 'Forbidden: Cannot access another corporate catalog' });
    }
  }

  next();
}
