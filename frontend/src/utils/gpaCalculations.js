// GPA Calculation utilities — client-side (no API call needed for instant feedback)

export const gradeScales = {
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

export const calculateSemesterGPA = (courses, scale = '4.0') => {
  if (!courses || courses.length === 0) return 0;
  const lookup = gradeScales[scale] || gradeScales['4.0'];

  let totalQP = 0;
  let totalCredits = 0;

  courses.forEach((course) => {
    const pts = lookup[course.grade] ?? 0;
    totalQP += pts * parseFloat(course.credits || 0);
    totalCredits += parseFloat(course.credits || 0);
  });

  return totalCredits > 0 ? parseFloat((totalQP / totalCredits).toFixed(2)) : 0;
};

export const calculateCumulativeGPA = (semesters, scale = '4.0') => {
  if (!semesters || semesters.length === 0) return 0;
  const lookup = gradeScales[scale] || gradeScales['4.0'];

  let totalQP = 0;
  let totalCredits = 0;

  semesters.forEach((semester) => {
    if (semester.isQuickAdd) {
      totalQP += parseFloat(semester.quickGPA || semester.semesterGPA || 0) * parseFloat(semester.quickTotalCredits || semester.totalCredits || 0);
      totalCredits += parseFloat(semester.quickTotalCredits || semester.totalCredits || 0);
    } else if (semester.courses && semester.courses.length > 0) {
      semester.courses.forEach((course) => {
        const pts = lookup[course.grade] ?? 0;
        totalQP += pts * parseFloat(course.credits || 0);
        totalCredits += parseFloat(course.credits || 0);
      });
    }
  });

  return totalCredits > 0 ? parseFloat((totalQP / totalCredits).toFixed(2)) : 0;
};

export const getGPACategory = (gpa, scale = '4.0') => {
  const val = parseFloat(gpa);
  const maxGPA = scale === '5.0' ? 5.0 : 4.0;
  const pct = (val / maxGPA) * 100;

  if (pct >= 95) return { label: 'Summa Cum Laude', color: 'text-emerald', badge: 'badge-green' };
  if (pct >= 90) return { label: 'Magna Cum Laude', color: 'text-blue', badge: 'badge-blue' };
  if (pct >= 85) return { label: 'Cum Laude', color: 'text-indigo', badge: 'badge-violet' };
  if (pct >= 80) return { label: 'Very Good', color: 'text-indigo', badge: 'badge-violet' };
  if (pct >= 70) return { label: 'Good Standing', color: 'text-amber', badge: 'badge-amber' };
  if (pct >= 60) return { label: 'Satisfactory', color: 'text-amber', badge: 'badge-amber' };
  return { label: 'Needs Improvement', color: 'text-rose', badge: 'badge-red' };
};

export const getGradeClass = (grade, scale = '4.0') => {
  const pts = (gradeScales[scale] || gradeScales['4.0'])[grade] ?? 0;
  const max = scale === '5.0' ? 5.0 : 4.0;
  const pct = (pts / max) * 100;

  if (pct >= 85) return 'grade-a';
  if (pct >= 70) return 'grade-b';
  if (pct >= 55) return 'grade-c';
  if (pct >= 40) return 'grade-d';
  return 'grade-f';
};

export const getGPAProgress = (gpa, scale = '4.0') => {
  const max = scale === '5.0' ? 5.0 : 4.0;
  return Math.min(100, (parseFloat(gpa) / max) * 100);
};

export const formatGPA = (gpa) => {
  if (gpa === null || gpa === undefined || isNaN(gpa)) return '—';
  return parseFloat(gpa).toFixed(2);
};

export const getTotalCredits = (semesters) => {
  if (!semesters || semesters.length === 0) return 0;
  return semesters.reduce((total, semester) => {
    if (semester.isQuickAdd) {
      return total + parseFloat(semester.quickTotalCredits || semester.totalCredits || 0);
    }
    if (semester.courses) {
      return total + semester.courses.reduce((sum, c) => sum + parseFloat(c.credits || 0), 0);
    }
    return total;
  }, 0);
};

export const predictFutureGPA = (currentGPA, currentCredits, futureSemesters) => {
  let totalQP = parseFloat(currentGPA) * parseFloat(currentCredits);
  let totalCredits = parseFloat(currentCredits);

  futureSemesters.forEach((sem) => {
    const gpa = parseFloat(sem.gpa);
    const credits = parseFloat(sem.credits);
    if (!isNaN(gpa) && !isNaN(credits) && credits > 0) {
      totalQP += gpa * credits;
      totalCredits += credits;
    }
  });

  return totalCredits > 0 ? parseFloat((totalQP / totalCredits).toFixed(2)) : 0;
};

export const requiredGPAForTarget = (currentGPA, currentCredits, targetGPA, remainingCredits) => {
  const totalCredits = parseFloat(currentCredits) + parseFloat(remainingCredits);
  const requiredQP = parseFloat(targetGPA) * totalCredits - parseFloat(currentGPA) * parseFloat(currentCredits);
  return parseFloat(remainingCredits) > 0
    ? parseFloat((requiredQP / parseFloat(remainingCredits)).toFixed(2))
    : 0;
};
