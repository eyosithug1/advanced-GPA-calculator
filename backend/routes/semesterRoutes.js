import express from 'express';
import {
  getSemesters,
  getSemester,
  createSemester,
  updateSemester,
  deleteSemester,
  recalculateSemesterGPA
} from '../controllers/semesterController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getSemesters)
  .post(createSemester);

router.route('/:id')
  .get(getSemester)
  .put(updateSemester)
  .delete(deleteSemester);

router.post('/:id/recalculate', recalculateSemesterGPA);

export default router;
