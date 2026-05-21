import express from 'express';
import { createProject, deleteProject, getProjectById, getProjects, updateProject } from '../controllers/project.controller.js';
import { isAdmin, verifyToken } from '../middleware/auth.middleware.js';
import Project from '../models/Project.js';
import Task from '../models/Task.js';

const router = express.Router();

router.get('/', verifyToken, getProjects);
router.get('/:id', verifyToken, getProjectById);
router.post('/', verifyToken, isAdmin, createProject);
router.put('/:id', verifyToken, isAdmin, updateProject);
// Bulk delete — must come before /:id to avoid conflict
router.delete('/all', verifyToken, isAdmin, async (req, res) => {
  try {
    await Task.deleteMany({});
    await Project.deleteMany({});
    res.status(200).json({ message: 'All projects and tasks deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});
router.delete('/:id', verifyToken, isAdmin, deleteProject);

export default router;
