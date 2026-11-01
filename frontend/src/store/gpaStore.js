import { create } from 'zustand';
import { semesterAPI, courseAPI } from '../services/api.js';

const useGPAStore = create((set, get) => ({
  // State
  semesters: [],
  isLoading: false,
  error: null,

  // Local GPA calculator state (no backend needed for quick compute)
  localCourses: [],
  gradeScale: '4.0',

  // UI
  activeTab: 'calculator',

  // Actions
  setActiveTab: (tab) => set({ activeTab: tab }),
  setGradeScale: (scale) => set({ gradeScale: scale }),
  setError: (err) => set({ error: err }),
  clearError: () => set({ error: null }),

  // Local courses (single GPA calc - no DB save needed)
  addLocalCourse: (course) =>
    set((s) => ({ localCourses: [...s.localCourses, { ...course, id: Date.now() }] })),
  removeLocalCourse: (id) =>
    set((s) => ({ localCourses: s.localCourses.filter((c) => c.id !== id) })),
  clearLocalCourses: () => set({ localCourses: [] }),
  updateLocalCourse: (id, updates) =>
    set((s) => ({
      localCourses: s.localCourses.map((c) => (c.id === id ? { ...c, ...updates } : c))
    })),

  // ======= SEMESTER ACTIONS (MongoDB) =======
  fetchSemesters: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await semesterAPI.getAll();
      set({ semesters: data.data || [], isLoading: false });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to load semesters', isLoading: false });
    }
  },

  createSemester: async (semesterData) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await semesterAPI.create(semesterData);
      set((s) => ({ semesters: [...s.semesters, data.data], isLoading: false }));
      return { success: true, data: data.data };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create semester';
      set({ error: msg, isLoading: false });
      return { success: false, error: msg };
    }
  },

  updateSemester: async (id, updates) => {
    try {
      const { data } = await semesterAPI.update(id, updates);
      set((s) => ({
        semesters: s.semesters.map((sem) => (sem._id === id ? data.data : sem))
      }));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message };
    }
  },

  deleteSemester: async (id) => {
    try {
      await semesterAPI.delete(id);
      set((s) => ({ semesters: s.semesters.filter((sem) => sem._id !== id) }));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message };
    }
  },

  // ======= COURSE ACTIONS (MongoDB) =======
  addCourseToSemester: async (semesterId, courseData) => {
    try {
      const { data } = await courseAPI.create({ semesterId, ...courseData });
      // Refresh semesters to get updated GPA
      await get().fetchSemesters();
      return { success: true, data: data.data };
    } catch (err) {
      return { success: false, error: err.response?.data?.message };
    }
  },

  removeCourseFromSemester: async (courseId) => {
    try {
      await courseAPI.delete(courseId);
      await get().fetchSemesters();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message };
    }
  }
}));

export default useGPAStore;
