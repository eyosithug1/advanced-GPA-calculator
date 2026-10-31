import asyncHandler from 'express-async-handler';
import Semester from '../models/Semester.js';
import Course from '../models/Course.js';

// Grade points lookup
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

// @desc   Get all semesters for a user
// @route  GET /api/semesters
// @access Private
export const getSemesters = asyncHandler(async (req, res) => {
  const semesters = await Semester.find({ user: req.user._id })
    .populate('courses')
    .sort({ year: 1, order: 1, createdAt: 1 });

  res.json({ success: true, count: semesters.length, data: semesters });
});

// @desc   Get a single semester
// @route  GET /api/semesters/:id
// @access Private
export const getSemester = asyncHandler(async (req, res) => {
  const semester = await Semester.findById(req.params.id).populate('courses');

  if (!semester) {
    res.status(404);
    throw new Error('Semester not found');
  }

  if (semester.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to access this semester');
  }

  res.json({ success: true, data: semester });
});

// @desc   Create a semester
// @route  POST /api/semesters
// @access Private
export const createSemester = asyncHandler(async (req, res) => {
  const { name, year, season, gradeScale, isQuickAdd, quickGPA, quickTotalCredits, notes, order } = req.body;

  if (!name) {
    res.status(400);
    throw new Error('Semester name is required');
  }

  const semesterData = {
    name,
    year: year || new Date().getFullYear(),
    season: season || 'Fall',
    user: req.user._id,
    gradeScale: gradeScale || req.user.gradeScale || '4.0',
    notes: notes || '',
    order: order || 0
  };

  // Quick add mode
  if (isQuickAdd) {
    if (!quickGPA || !quickTotalCredits) {
      res.status(400);
      throw new Error('Quick add requires GPA and total credits');
    }
    semesterData.isQuickAdd = true;
    semesterData.quickGPA = parseFloat(quickGPA);
    semesterData.quickTotalCredits = parseFloat(quickTotalCredits);
    semesterData.semesterGPA = parseFloat(quickGPA);
    semesterData.totalCredits = parseFloat(quickTotalCredits);
    semesterData.totalQualityPoints = parseFloat(quickGPA) * parseFloat(quickTotalCredits);
  }

  const semester = await Semester.create(semesterData);
  const populated = await Semester.findById(semester._id).populate('courses');

  res.status(201).json({ success: true, data: populated });
});

// @desc   Update a semester
// @route  PUT /api/semesters/:id
// @access Private
export const updateSemester = asyncHandler(async (req, res) => {
  const semester = await Semester.findById(req.params.id);

  if (!semester) {
    res.status(404);
    throw new Error('Semester not found');
  }

  if (semester.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to update this semester');
  }

  const updated = await Semester.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    { new: true, runValidators: true }
  ).populate('courses');

  res.json({ success: true, data: updated });
});

// @desc   Delete a semester (and its courses)
// @route  DELETE /api/semesters/:id
// @access Private
export const deleteSemester = asyncHandler(async (req, res) => {
  const semester = await Semester.findById(req.params.id);

  if (!semester) {
    res.status(404);
    throw new Error('Semester not found');
  }

  if (semester.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to delete this semester');
  }

  // Delete all courses in this semester
  await Course.deleteMany({ semester: req.params.id });
  await semester.deleteOne();

  res.json({ success: true, message: 'Semester deleted successfully' });
});

// @desc   Recalculate semester GPA
// @route  POST /api/semesters/:id/recalculate
// @access Private
export const recalculateSemesterGPA = asyncHandler(async (req, res) => {
  const semester = await Semester.findById(req.params.id);

  if (!semester) {
    res.status(404);
    throw new Error('Semester not found');
  }

  if (semester.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized');
  }

  const courses = await Course.find({ semester: req.params.id });
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

  const updated = await Semester.findByIdAndUpdate(
    req.params.id,
    {
      semesterGPA: parseFloat(semesterGPA.toFixed(4)),
      totalCredits,
      totalQualityPoints,
      totalCourses: courses.length
    },
    { new: true }
  ).populate('courses');

  res.json({ success: true, data: updated });
});
