import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Course name is required'],
      trim: true,
      maxlength: [100, 'Course name cannot exceed 100 characters']
    },
    code: {
      type: String,
      trim: true,
      default: ''
    },
    credits: {
      type: Number,
      required: [true, 'Credits are required'],
      min: [0.5, 'Credits must be at least 0.5'],
      max: [35, 'Credits cannot exceed 35']
    },
    grade: {
      type: String,
      required: [true, 'Grade is required'],
      enum: ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F']
    },
    gradePoints: {
      type: Number,
      default: 0
    },
    qualityPoints: {
      type: Number,
      default: 0
    },
    semester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Semester',
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    notes: {
      type: String,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
      default: ''
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Grade points lookup by scale
const gradePointsMap = {
  '4.0': {
    'A+': 4.0, 'A': 4.0, 'A-': 3.7,
    'B+': 3.3, 'B': 3.0, 'B-': 2.7,
    'C+': 2.3, 'C': 2.0, 'C-': 1.7,
    'D+': 1.3, 'D': 1.0, 'D-': 0.7,
    'F': 0.0
  }
};

// Pre-save: calculate grade points and quality points
courseSchema.pre('save', function (next) {
  const scale = '4.0'; // default — extended when semester is populated
  this.gradePoints = gradePointsMap[scale][this.grade] || 0;
  this.qualityPoints = this.gradePoints * this.credits;
  next();
});

const Course = mongoose.model('Course', courseSchema);
export default Course;
