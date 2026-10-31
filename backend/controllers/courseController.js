import asyncHandler from 'express-async-handler';
import Course from '../models/Course.js';
import Semester from '../models/Semester.js';

const gradePointsLookup = {
  '4.0': {
    'A+': 4.0, 'A': 4.0, 'A-': 3.7,
    'B+': 3.3, 'B': 3.0, 'B-': 2.7,
    'C+': 2.3, 'C': 2.0, 'C-': 1.7,
    'D+': 1.3, 'D': 1.0, 'D-': 0.7,
    'F': 0.0
  },
  '5.0': {
    'A+': 5.0, 'A': 4.75, 'A-': 4.5,
    'B+': 4.0, 'B': 3.5, 'B-': 3.0,
    'C+': 2.5, 'C': 2.0, 'C-': 1.5,
    'D+': 1.0, 'D': 0.5,
    'F': 0.0
  }
};

// Helper: update semester GPA after course changes
const updateSemesterStats = async (semesterId) => {
  const semester = await Semester.findById(semesterId);
  if (!semester || semester.isQuickAdd) return;

  const courses = await Course.find({ semester: semesterId });
  const scale = semester.gradeScale || '4.0';
  const lookup = gradePointsLookup[scale];

  let totalQualityPoints = 0;
  let totalCredits = 0;

  courses.forEach((course) => {
    const pts = lookup[course.grade] || 0;
    totalQualityPoints += pts * course.credits;
    totalCredits += course.credits;
  });

  const semesterGPA = totalCredits > 0 ? totalQualityPoints / totalCredits : 0;

  await Semester.findByIdAndUpdate(semesterId, {
    semesterGPA: parseFloat(semesterGPA.toFixed(4)),
    totalCredits,
    totalQualityPoints,
    totalCourses: courses.length
  });
};

// @desc   Get courses for a semester
// @route  GET /api/courses/semester/:semesterId
// @access Private
export const getCoursesForSemester = asyncHandler(async (req, res) => {
  const semester = await Semester.findById(req.params.semesterId);

  if (!semester) {
    res.status(404);
    throw new Error('Semester not found');
  }

  if (semester.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized');
  }

  const courses = await Course.find({ semester: req.params.semesterId }).sort({ createdAt: 1 });
  res.json({ success: true, count: courses.length, data: courses });
});

// @desc   Add a course to a semester
// @route  POST /api/courses
// @access Private
export const createCourse = asyncHandler(async (req, res) => {
  const { semesterId, name, code, credits, grade, notes } = req.body;

  if (!semesterId || !name || !credits || !grade) {
    res.status(400);
    throw new Error('Please provide semesterId, name, credits, and grade');
  }

  const semester = await Semester.findById(semesterId);
  if (!semester) {
    res.status(404);
    throw new Error('Semester not found');
  }

  if (semester.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized');
  }

  const scale = semester.gradeScale || '4.0';
  const gradePoints = gradePointsLookup[scale][grade] || 0;
  const qualityPoints = gradePoints * parseFloat(credits);

  const course = await Course.create({
    name,
    code: code || '',
    credits: parseFloat(credits),
    grade,
    gradePoints,
    qualityPoints,
    semester: semesterId,
    user: req.user._id,
    notes: notes || ''
  });

  // Recalculate semester GPA
  await updateSemesterStats(semesterId);

  res.status(201).json({ success: true, data: course });
});

// @desc   Update a course
// @route  PUT /api/courses/:id
// @access Private
export const updateCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  if (course.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to update this course');
  }

  // Get semester for grade scale
  const semester = await Semester.findById(course.semester);
  const scale = semester?.gradeScale || '4.0';
  const grade = req.body.grade || course.grade;
  const credits = parseFloat(req.body.credits || course.credits);
  const gradePoints = gradePointsLookup[scale][grade] || 0;
  const qualityPoints = gradePoints * credits;

  const updated = await Course.findByIdAndUpdate(
    req.params.id,
    { ...req.body, gradePoints, qualityPoints },
    { new: true, runValidators: true }
  );

  // Recalculate semester GPA
  await updateSemesterStats(course.semester);

  res.json({ success: true, data: updated });
});

// @desc   Delete a course
// @route  DELETE /api/courses/:id
// @access Private
export const deleteCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  if (course.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to delete this course');
  }

  const semesterId = course.semester;
  await course.deleteOne();

  // Recalculate semester GPA
  await updateSemesterStats(semesterId);

  res.json({ success: true, message: 'Course deleted successfully' });
});
