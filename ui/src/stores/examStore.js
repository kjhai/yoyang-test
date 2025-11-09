import { create } from 'zustand'

const useExamStore = create((set) => ({
  currentAttempt: null,
  questions: [],
  answers: {},
  currentQuestionIndex: 0,
  isSubmitted: false,
  score: null,

  // 액션
  setCurrentAttempt: (attempt) => set({ currentAttempt: attempt }),
  setQuestions: (questions) => set({ questions }),
  setAnswer: (questionId, answer) =>
    set((state) => ({
      answers: { ...state.answers, [questionId]: answer },
    })),
  setCurrentQuestionIndex: (index) => set({ currentQuestionIndex: index }),
  submitExam: (score) => set({ isSubmitted: true, score }),
  resetExam: () =>
    set({
      currentAttempt: null,
      questions: [],
      answers: {},
      currentQuestionIndex: 0,
      isSubmitted: false,
      score: null,
    }),
}))

export default useExamStore

