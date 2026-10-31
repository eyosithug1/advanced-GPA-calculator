import asyncHandler from 'express-async-handler';
import Semester from '../models/Semester.js';
import Course from '../models/Course.js';

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

// @desc   Calculate cumulative GPA for current user
// @route  GET /api/gpa/cumulative
// @access Private
export const getCumulativeGPA = asyncHandler(async (req, res) => {
  const semesters = await Semester.find({ user: req.user._id }).populate('courses');
  const scale = req.user.gradeScale || '4.0';
  const lookup = gradePointsLookup[scale];

  let totalQualityPoints = 0;
  let totalCredits = 0;
  const semesterBreakdown = [];

  for (const sem of semesters) {
    let semQP = 0;
    let semCred = 0;

    if (sem.isQuickAdd) {
      semQP = sem.quickGPA * sem.quickTotalCredits;
      semCred = sem.quickTotalCredits;
    } else {
      const courses = await Course.find({ semester: sem._id });
      courses.forEach((course) => {
        const pts = lookup[course.grade] || 0;
        semQP += pts * course.credits;
        semCred += course.credits;
      });
    }

    totalQualityPoints += semQP;
    totalCredits += semCred;

    semesterBreakdown.push({
      _id: sem._id,
      name: sem.name,
      year: sem.year,
      season: sem.season,
      semesterGPA: semCred > 0 ? parseFloat((semQP / semCred).toFixed(4)) : 0,
      totalCredits: semCred,
      totalQualityPoints: semQP,
      isQuickAdd: sem.isQuickAdd
    });
  }

  const cumulativeGPA = totalCredits > 0
    ? parseFloat((totalQualityPoints / totalCredits).toFixed(4))
    : 0;

  res.json({
    success: true,
    data: {
      cumulativeGPA,
      totalCredits,
      totalQualityPoints,
      totalSemesters: semesters.length,
      gradeScale: scale,
      semesterBreakdown
    }
  });
});

// @desc   Predict future GPA
// @route  POST /api/gpa/predict
// @access Private
export const predictGPA = asyncHandler(async (req, res) => {
  const { futureSemesters } = req.body;

  if (!futureSemesters || !Array.isArray(futureSemesters)) {
    res.status(400);
    throw new Error('Please provide an array of future semesters');
  }

  // Get current cumulative stats
  const semesters = await Semester.find({ user: req.user._id }).populate('courses');
  const scale = req.user.gradeScale || '4.0';
  const lookup = gradePointsLookup[scale];

  let currentQP = 0;
  let currentCredits = 0;

  for (const sem of semesters) {
    if (sem.isQuickAdd) {
      currentQP += sem.quickGPA * sem.quickTotalCredits;
      currentCredits += sem.quickTotalCredits;
    } else {
      const courses = await Course.find({ semester: sem._id });
      courses.forEach((course) => {
        const pts = lookup[course.grade] || 0;
        currentQP += pts * course.credits;
        currentCredits += course.credits;
      });
    }
  }

  // Add future semesters
  let futureQP = 0;
  let futureCredits = 0;
  futureSemesters.forEach((sem) => {
    const gpa = parseFloat(sem.gpa);
    const credits = parseFloat(sem.credits);
    if (!isNaN(gpa) && !isNaN(credits) && credits > 0) {
      futureQP += gpa * credits;
      futureCredits += credits;
    }
  });

  const totalQP = currentQP + futureQP;
  const totalCredits = currentCredits + futureCredits;
  const predictedGPA = totalCredits > 0 ? parseFloat((totalQP / totalCredits).toFixed(4)) : 0;
  const currentGPA = currentCredits > 0 ? parseFloat((currentQP / currentCredits).toFixed(4)) : 0;

  res.json({
    success: true,
    data: {
      currentGPA,
      predictedGPA,
      currentCredits,
      futureCredits,
      totalCredits,
      gpaDelta: parseFloat((predictedGPA - currentGPA).toFixed(4)),
      trend: predictedGPA > currentGPA ? 'increasing' : predictedGPA < currentGPA ? 'decreasing' : 'stable'
    }
  });
});

// @desc   Calculate required GPA to reach target
// @route  POST /api/gpa/target
// @access Private
export const calculateTargetGPA = asyncHandler(async (req, res) => {
  const { targetGPA, remainingCredits } = req.body;

  if (!targetGPA || !remainingCredits) {
    res.status(400);
    throw new Error('Please provide targetGPA and remainingCredits');
  }

  const semesters = await Semester.find({ user: req.user._id }).populate('courses');
  const scale = req.user.gradeScale || '4.0';
  const lookup = gradePointsLookup[scale];

  let currentQP = 0;
  let currentCredits = 0;

  for (const sem of semesters) {
    if (sem.isQuickAdd) {
      currentQP += sem.quickGPA * sem.quickTotalCredits;
      currentCredits += sem.quickTotalCredits;
    } else {
      const courses = await Course.find({ semester: sem._id });
      courses.forEach((course) => {
        const pts = lookup[course.grade] || 0;
        currentQP += pts * course.credits;
        currentCredits += course.credits;
      });
    }
  }

  const currentGPA = currentCredits > 0 ? currentQP / currentCredits : 0;
  const totalCredits = currentCredits + parseFloat(remainingCredits);
  const requiredQP = parseFloat(targetGPA) * totalCredits - currentQP;
  const requiredGPA = parseFloat(remainingCredits) > 0
    ? parseFloat((requiredQP / parseFloat(remainingCredits)).toFixed(4))
    : 0;

  const maxGPA = scale === '5.0' ? 5.0 : 4.0;
  const isAchievable = requiredGPA <= maxGPA && requiredGPA >= 0;

  res.json({
    success: true,
    data: {
      currentGPA: parseFloat(currentGPA.toFixed(4)),
      targetGPA: parseFloat(targetGPA),
      requiredGPA,
      remainingCredits: parseFloat(remainingCredits),
      isAchievable,
      maxGPA,
      message: isAchievable
        ? `You need a ${requiredGPA} GPA in your remaining ${remainingCredits} credits`
        : `Target GPA is not achievable in ${remainingCredits} remaining credits`
    }
  });
});

// @desc   Get user GPA analytics
// @route  GET /api/gpa/analytics
// @access Private
export const getAnalytics = asyncHandler(async (req, res) => {
  const semesters = await Semester.find({ user: req.user._id }).populate('courses');
  const scale = req.user.gradeScale || '4.0';
  const lookup = gradePointsLookup[scale];

  // Grade distribution across all courses
  const gradeDistribution = {};
  let totalCredits = 0;
  let totalQP = 0;
  const semesterGPAs = [];

  for (const sem of semesters) {
    let semQP = 0;
    let semCred = 0;

    if (sem.isQuickAdd) {
      semQP = sem.quickGPA * sem.quickTotalCredits;
      semCred = sem.quickTotalCredits;
    } else {
      const courses = await Course.find({ semester: sem._id });
      courses.forEach((course) => {
        const pts = lookup[course.grade] || 0;
        semQP += pts * course.credits;
        semCred += course.credits;
        gradeDistribution[course.grade] = (gradeDistribution[course.grade] || 0) + 1;
      });
    }

    totalQP += semQP;
    totalCredits += semCred;

    semesterGPAs.push({
      name: sem.name,
      year: sem.year,
      gpa: semCred > 0 ? parseFloat((semQP / semCred).toFixed(2)) : 0,
      credits: semCred
    });
  }

  const cumulativeGPA = totalCredits > 0 ? parseFloat((totalQP / totalCredits).toFixed(4)) : 0;

  // GPA category
  const maxGPA = scale === '5.0' ? 5.0 : 4.0;
  const pct = (cumulativeGPA / maxGPA) * 100;
  let category;
  if (pct >= 90) category = 'Excellent';
  else if (pct >= 80) category = 'Very Good';
  else if (pct >= 70) category = 'Good';
  else if (pct >= 60) category = 'Satisfactory';
  else category = 'Needs Improvement';

  res.json({
    success: true,
    data: {
      cumulativeGPA,
      totalCredits,
      totalSemesters: semesters.length,
      gradeDistribution,
      semesterGPAs,
      category,
      gradeScale: scale,
      bestSemester: semesterGPAs.reduce((best, s) => s.gpa > (best?.gpa || 0) ? s : best, null),
      worstSemester: semesterGPAs.reduce((worst, s) => s.gpa < (worst?.gpa ?? 999) ? s : worst, null)
    }
  });
});
