/**
 * Attendance routes.
 * Mounts attendance-related endpoints on an Express Router.
 */

import { Router } from 'express';
import {
  getAttendance,
  markAttendance,
  bulkMarkAttendance,
  resetAttendance,
  getStudentHistory,
} from '../controllers/attendanceController.js';

const router = Router();

router.get('/', getAttendance);
router.post('/', markAttendance);
router.post('/bulk', bulkMarkAttendance);
router.delete('/', resetAttendance);
router.get('/student/:id', getStudentHistory);

export default router;
