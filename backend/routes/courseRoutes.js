import express from 'express';
import {
  getCoursesForSemester,
  createCourse,
  updateCourse,
  deleteCourse
} from '../controllers/courseController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/').post(createCourse);
router.get('/semester/:semesterId', getCoursesForSemester);
router.route('/:id').put(updateCourse).delete(deleteCourse);

export default router;
