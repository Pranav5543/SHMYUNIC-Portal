import { Router } from 'express';
import { authenticateToken, requireAuth, requirePermission, enforceTenantIsolation } from '../middleware/auth';
import {
  getMasterCatalog,
  getAllSchools,
  createSchool,
  updateSchool,
  getSchoolClasses,
  createClass,
  updateClass,
  getClassUniformTypes,
  createUniformType,
  updateUniformType,
  updateProductSizesAndAvailability
} from '../controllers/catalogController';

const router = Router();

// ============================================================
// Public / Consumer Master Catalog Hierarchy
// ============================================================
router.get('/catalog', authenticateToken, enforceTenantIsolation, getMasterCatalog);

// ============================================================
// School Management Routes
// ============================================================
router.get('/catalog/schools', getAllSchools);
router.post('/catalog/schools', authenticateToken, requireAuth, requirePermission('SCHOOL_MANAGE'), createSchool);
router.put('/catalog/schools/:id', authenticateToken, requireAuth, requirePermission('SCHOOL_MANAGE'), updateSchool);

// ============================================================
// Class Management Routes
// ============================================================
router.get('/schools/:schoolId/classes', getSchoolClasses);
router.post('/schools/:schoolId/classes', authenticateToken, requireAuth, requirePermission('SCHOOL_MANAGE'), createClass);
router.put('/classes/:id', authenticateToken, requireAuth, requirePermission('SCHOOL_MANAGE'), updateClass);

// ============================================================
// Uniform Type Management Routes
// ============================================================
router.get('/classes/:classId/uniform-types', getClassUniformTypes);
router.post('/classes/:classId/uniform-types', authenticateToken, requireAuth, requirePermission('PRODUCT_CREATE'), createUniformType);
router.put('/uniform-types/:id', authenticateToken, requireAuth, requirePermission('PRODUCT_UPDATE'), updateUniformType);

// ============================================================
// Product Size Matrix & Availability Management
// ============================================================
router.put('/products/:id/catalog', authenticateToken, requireAuth, requirePermission('PRODUCT_UPDATE'), updateProductSizesAndAvailability);

export default router;
