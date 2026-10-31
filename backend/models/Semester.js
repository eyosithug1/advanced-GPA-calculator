import mongoose from 'mongoose';

const semesterSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Semester name is required'],
      trim: true,
      maxlength: [100, 'Semester name cannot exceed 100 characters']
    },
    year: {
      type: Number,
      min: [2000, 'Year must be 2000 or later'],
      max: [2100, 'Year cannot exceed 2100'],
      default: new Date().getFullYear()
    },
    season: {
      type: String,
      enum: ['Fall', 'Spring', 'Summer', 'Winter'],
      default: 'Fall'
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    gradeScale: {
      type: String,
      enum: ['4.0', '5.0'],
      default: '4.0'
    },
    // Quick-add mode: store GPA directly
    isQuickAdd: {
      type: Boolean,
      default: false
    },
    quickGPA: {
      type: Number,
      min: 0,
      max: 5,
      default: null
    },
    quickTotalCredits: {
      type: Number,
      min: 0,
      default: null
    },
    // Computed fields (updated when courses change)
    semesterGPA: {
      type: Number,
      default: 0
    },
    totalCredits: {
      type: Number,
      default: 0
    },
    totalCourses: {
      type: Number,
      default: 0
    },
    totalQualityPoints: {
      type: Number,
      default: 0
    },
    order: {
      type: Number,
      default: 0
    },
    notes: {
      type: String,
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
      default: ''
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Index for efficient user queries
semesterSchema.index({ user: 1, createdAt: -1 });
semesterSchema.index({ user: 1, year: 1, season: 1 });

// Virtual to populate courses
semesterSchema.virtual('courses', {
  ref: 'Course',
  localField: '_id',
  foreignField: 'semester'
});

const Semester = mongoose.model('Semester', semesterSchema);
export default Semester;
