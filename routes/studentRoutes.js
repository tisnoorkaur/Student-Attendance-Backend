/**
 * Student routes.
 * Mounts student-related endpoints on an Express Router.
 */

import { Router } from 'express';
import {
  getStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent,
  searchStudents,
} from '../controllers/studentController.js';

const router = Router();

// Search must be registered before the /:id param route to avoid "search" being captured as an id
router.get('/search', searchStudents);

router.get('/', getStudents);
router.get('/:id', getStudent);
router.post('/', createStudent);
router.put('/:id', updateStudent);
router.delete('/:id', deleteStudent);

export default router;
