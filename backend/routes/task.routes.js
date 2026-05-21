import express from 'express';
import { addComment, createTask, deleteTask, getTasks, updateTask } from '../controllers/task.controller.js';
import { isAdmin, verifyToken } from '../middleware/auth.middleware.js';
import Task from '../models/Task.js';

const router = express.Router();

router.get('/', verifyToken, getTasks);
router.post('/', verifyToken, isAdmin, createTask);
router.put('/:id', verifyToken, updateTask);
// Bulk delete — must come before /:id
router.delete('/all', verifyToken, isAdmin, async (req, res) => {
  try {
    await Task.deleteMany({});
    res.status(200).json({ message: 'All tasks deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});
router.delete('/:id', verifyToken, isAdmin, deleteTask);
router.post('/:id/comments', verifyToken, addComment);

export default router;
