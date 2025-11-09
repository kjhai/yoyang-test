import { create } from 'zustand'

const useExamStore = create((set) => ({
  currentAttempt: null,
  questions: [],
  answers: {},
  currentQuestionIndex: 0,
  isSubmitted: false,
  score: null,
  correct: null,
  wrong: null,

  // 액션
  setCurrentAttempt: (attempt) => set({ currentAttempt: attempt }),
  setQuestions: (questions) => set({ questions }),
  setAnswer: (questionId, answer) =>
    set((state) => ({
      answers: { ...state.answers, [questionId]: answer },
    })),
  setCurrentQuestionIndex: (index) => set({ currentQuestionIndex: index }),
  submitExam: (score, correct, wrong) => 
    set({ 
      isSubmitted: true, 
      score,
      correct: correct ?? null,
      wrong: wrong ?? null,
    }),
  resetExam: () =>
    set({
      currentAttempt: null,
      questions: [],
      answers: {},
      currentQuestionIndex: 0,
      isSubmitted: false,
      score: null,
      correct: null,
      wrong: null,
    }),
}))

export default useExamStore

