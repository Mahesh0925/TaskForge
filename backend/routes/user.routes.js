import express from 'express';
import { deleteUser, getUsers, updateUserRole, updateProfile } from '../controllers/user.controller.js';
import { isAdmin, verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', verifyToken, getUsers);
router.put('/profile', verifyToken, updateProfile);
router.put('/:id/role', verifyToken, isAdmin, updateUserRole);
router.delete('/:id', verifyToken, isAdmin, deleteUser);

export default router;
