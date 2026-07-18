import { Router } from 'express';
import { create, search, list, update, remove } from '../controllers/vehicle.controller';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

router.post('/', authenticate, create);
router.get('/search', authenticate, search);
router.get('/', authenticate, list);
router.put('/:id', authenticate, update);
router.delete('/:id', authenticate, requireAdmin, remove);  // admin-only per spec

export default router;