import { Router } from 'express';
import { create, search, list, update, remove, purchase, restock } from '../controllers/vehicle.controller';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

router.post('/', authenticate, create);
router.get('/search', authenticate, search);
router.get('/', authenticate, list);
router.put('/:id', authenticate, requireAdmin, update);
router.delete('/:id', authenticate, requireAdmin, remove);  // admin-only per spec
router.post('/:id/purchase', authenticate, purchase);
router.post('/:id/restock', authenticate, requireAdmin, restock);

export default router; 