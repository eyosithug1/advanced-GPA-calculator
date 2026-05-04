// GPA Calculation utilities
export const gradeScales = {
  '4.0': {
    'A+': 4.0,
    'A': 4.0,
    'A-': 3.7,
    'B+': 3.3,
    'B': 3.0,
    'B-': 2.7,
    'C+': 2.3,
    'C': 2.0,
    'C-': 1.7,
    'D+': 1.3,
    'D': 1.0,
    'D-': 0.7,
    'F': 0.0
  },
  '5.0': {
    'A+': 5.0,
    'A': 4.75,
    'A-': 4.5,
    'B+': 4.0,
    'B': 3.5,
    'B-': 3.0,
    'C+': 2.5,
    'C': 2.0,
    'C-': 1.5,
    'D+': 1.0,
    'D': 0.5,
    'F': 0.0
  }
};

export const calculateSemesterGPA = (courses, scale = '4.0') => {
  if (!courses || courses.length === 0) return 0;
  
  let totalQualityPoints = 0;
  let totalCredits = 0;
  
  courses.forEach(course => {
    const gradePoints = gradeScales[scale][course.grade] || 0;
    totalQualityPoints += gradePoints * course.credits;
    totalCredits += course.credits;
  });
  
  return totalCredits > 0 ? (totalQualityPoints / totalCredits).toFixed(2) : 0;
};

export const calculateCumulativeGPA = (semesters, scale = '4.0') => {
  if (!semesters || semesters.length === 0) return 0;
  
  let totalQualityPoints = 0;
  let totalCredits = 0;
  
  semesters.forEach(semester => {
    if (semester.courses && semester.courses.length > 0) {
      semester.courses.forEach(course => {
        const gradePoints = gradeScales[scale][course.grade] || 0;
        totalQualityPoints += gradePoints * course.credits;
        totalCredits += course.credits;
      });
    }
  });
  
  return totalCredits > 0 ? (totalQualityPoints / totalCredits).toFixed(2) : 0;
};

export const predictGPA = (currentSemesters, hypotheticalGPA, predictedCredits, scale = '4.0') => {
  const currentGPA = parseFloat(calculateCumulativeGPA(currentSemesters, scale));
  const currentCredits = getCurrentTotalCredits(currentSemesters);
  
  const totalQualityPoints = currentGPA * currentCredits + hypotheticalGPA * predictedCredits;
  const totalCredits = currentCredits + predictedCredits;
  
  return totalCredits > 0 ? (totalQualityPoints / totalCredits).toFixed(2) : 0;
};

export const getCurrentTotalCredits = (semesters) => {
  if (!semesters || semesters.length === 0) return 0;
  
  return semesters.reduce((total, semester) => {
    if (semester.courses && semester.courses.length > 0) {
      return total + semester.courses.reduce((sum, course) => sum + course.credits, 0);
    }
    return total;
  }, 0);
};

export const getRequiredGPAForTarget = (currentSemesters, targetGPA, remainingCredits, scale = '4.0') => {
  const currentGPA = parseFloat(calculateCumulativeGPA(currentSemesters, scale));
  const currentCredits = getCurrentTotalCredits(currentSemesters);
  const totalCredits = currentCredits + remainingCredits;
  
  const requiredQualityPoints = targetGPA * totalCredits - currentGPA * currentCredits;
  
  return remainingCredits > 0 ? (requiredQualityPoints / remainingCredits).toFixed(2) : 0;
};

export const getGradeColor = (grade, scale = '4.0') => {
  const gradePoints = gradeScales[scale][grade] || 0;
  
  if (gradePoints >= 3.7) return 'text-green-600 bg-green-50 border-green-200';
  if (gradePoints >= 3.0) return 'text-blue-600 bg-blue-50 border-blue-200';
  if (gradePoints >= 2.0) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
  if (gradePoints >= 1.0) return 'text-orange-600 bg-orange-50 border-orange-200';
  return 'text-red-600 bg-red-50 border-red-200';
};

export const getGPACategory = (gpa, scale = '4.0') => {
  const gpaValue = parseFloat(gpa);
  const maxGPA = scale === '5.0' ? 5.0 : 4.0;
  const percentage = (gpaValue / maxGPA) * 100;
  
  if (percentage >= 90) return { category: 'Excellent', color: 'text-green-600' };
  if (percentage >= 80) return { category: 'Very Good', color: 'text-blue-600' };
  if (percentage >= 70) return { category: 'Good', color: 'text-yellow-600' };
  if (percentage >= 60) return { category: 'Satisfactory', color: 'text-orange-600' };
  return { category: 'Needs Improvement', color: 'text-red-600' };
};
