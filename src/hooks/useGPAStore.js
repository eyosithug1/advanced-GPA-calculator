import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useGPAStore = create(
  persist(
    (set, get) => ({
      // Current active tab
      activeTab: 'gpa-calculator',
      
      // Loading state
      isLoading: true,
      
      // Grade scale setting
      gradeScale: '4.0',
      
      // Semesters data
      semesters: [],
      
      // Current semester being edited
      currentSemester: null,
      
      // Current CGPA
      currentCGPA: null,
      
      // Cumulative GPA semesters data
      cumulativeSemesters: [],
      
      // Single GPA Calculator data
      gpaCourses: [],
      
      // Prediction scenarios
      predictionScenarios: [],
      
      // Settings
      settings: {
        darkMode: false,
        animationsEnabled: true,
        autoSave: true
      },
      
      // Actions
      setActiveTab: (tab) => set({ activeTab: tab }),
      
      setLoading: (loading) => set({ isLoading: loading }),
      
      setGradeScale: (scale) => set({ gradeScale: scale }),
      
      addSemester: (semester) => {
        const newSemester = {
          ...semester,
          id: Date.now(),
          createdAt: new Date().toISOString()
        };
        set((state) => ({
          semesters: [...state.semesters, newSemester],
          currentSemester: null
        }));
      },
      
      updateSemester: (semesterId, updates) => {
        set((state) => ({
          semesters: state.semesters.map(sem =>
            sem.id === semesterId ? { ...sem, ...updates } : sem
          )
        }));
      },
      
      deleteSemester: (semesterId) => {
        set((state) => ({
          semesters: state.semesters.filter(sem => sem.id !== semesterId)
        }));
      },
      
      setCurrentCGPA: (cgpa) => {
        set({ currentCGPA: cgpa });
      },
      
      getCurrentCGPA: () => {
        return get().currentCGPA;
      },
      
      // Cumulative GPA semesters management
      setCumulativeSemesters: (semesters) => set({ cumulativeSemesters: semesters }),
      
      getCumulativeSemesters: () => {
        return get().cumulativeSemesters;
      },
      
      addCumulativeSemester: (semester) => {
        set((state) => ({
          cumulativeSemesters: [...state.cumulativeSemesters, semester]
        }));
      },
      
      clearCumulativeSemesters: () => set({ cumulativeSemesters: [] }),
      
      // Single GPA Calculator management
      setGpaCourses: (courses) => set({ gpaCourses: courses }),
      
      getGpaCourses: () => {
        return get().gpaCourses;
      },
      
      addGpaCourse: (course) => {
        set((state) => ({
          gpaCourses: [...state.gpaCourses, course]
        }));
      },
      
      removeGpaCourse: (courseId) => {
        set((state) => ({
          gpaCourses: state.gpaCourses.filter(course => course.id !== courseId)
        }));
      },
      
      clearGpaCourses: () => set({ gpaCourses: [] }),
      
      setCurrentSemester: (semester) => set({ currentSemester: semester }),
      
      addCourseToCurrent: (course) => set((state) => ({
        currentSemester: {
          ...state.currentSemester,
          courses: [...state.currentSemester.courses, { ...course, id: Date.now() }]
        }
      })),
      
      updateCourseInCurrent: (courseId, updates) => set((state) => ({
        currentSemester: {
          ...state.currentSemester,
          courses: state.currentSemester.courses.map(course =>
            course.id === courseId ? { ...course, ...updates } : course
          )
        }
      })),
      
      removeCourseFromCurrent: (courseId) => set((state) => ({
        currentSemester: {
          ...state.currentSemester,
          courses: state.currentSemester.courses.filter(course => course.id !== courseId)
        }
      })),
      
      clearCurrentSemester: () => set({
        currentSemester: { id: null, name: '', courses: [] }
      }),
      
      saveCurrentSemester: () => set((state) => {
        if (state.currentSemester.name && state.currentSemester.courses.length > 0) {
          const existingIndex = state.semesters.findIndex(sem => sem.id === state.currentSemester.id);
          let newSemesters;
          
          if (existingIndex >= 0) {
            newSemesters = [...state.semesters];
            newSemesters[existingIndex] = state.currentSemester;
          } else {
            newSemesters = [...state.semesters, { ...state.currentSemester, id: Date.now() }];
          }
          
          return {
            semesters: newSemesters,
            currentSemester: { id: null, name: '', courses: [] }
          };
        }
        return state;
      }),
      
      addPredictionScenario: (scenario) => set((state) => ({
        predictionScenarios: [...state.predictionScenarios, { ...scenario, id: Date.now() }]
      })),
      
      removePredictionScenario: (id) => set((state) => ({
        predictionScenarios: state.predictionScenarios.filter(scenario => scenario.id !== id)
      })),
      
      updateSettings: (settings) => set((state) => ({
        settings: { ...state.settings, ...settings }
      })),
      
      // Utility actions
      exportData: () => {
        const state = get();
        return {
          semesters: state.semesters,
          settings: state.settings,
          gradeScale: state.gradeScale,
          exportDate: new Date().toISOString()
        };
      },
      
      importData: (data) => set({
        semesters: data.semesters || [],
        settings: { ...get().settings, ...data.settings },
        gradeScale: data.gradeScale || '4.0'
      }),
      
      clearAllData: () => set({
        semesters: [],
        currentSemester: { id: null, name: '', courses: [] },
        predictionScenarios: []
      })
    }),
    {
      name: 'gpa-calculator-storage',
      partialize: (state) => ({
        semesters: state.semesters,
        settings: state.settings,
        gradeScale: state.gradeScale
      })
    }
  )
);

export default useGPAStore;
