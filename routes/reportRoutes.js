/**
 * Report routes.
 * Mounts report-related endpoints on an Express Router.
 */

import { Router } from 'express';
import {
  getReports,
  getReport,
  generateReport,
  deleteReport,
} from '../controllers/reportController.js';

const router = Router();

router.get('/', getReports);
router.post('/generate', generateReport);
router.get('/:date', getReport);
router.delete('/:id', deleteReport);

export default router;
