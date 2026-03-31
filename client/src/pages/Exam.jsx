import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Exam() {
  const navigate = useNavigate()
  const [questions, setQuestions] = useState([])
  const [session, setSession] = useState(null)
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState({})
  const [timeRemaining, setTimeRemaining] = useState(30 * 60)
  const [showModal, setShowModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const timerRef = useRef(null)
  const submittedRef = useRef(false)
  const questionsRef = useRef([])

  // Fetch questions dynamically
  useEffect(() => {
    fetch('/quiz.json')
      .then((res) => res.json())
      .then((data) => {
        setQuestions(data)
        questionsRef.current = data
        setLoading(false)
      })
      .catch((err) => {
        console.error('Failed to load questions:', err)
        navigate('/')
      })
  }, [])

  // Load session from localStorage
  useEffect(() => {
    if (loading) return

    const saved = localStorage.getItem('examSession')
    if (!saved) {
      navigate('/')
      return
    }

    const parsed = JSON.parse(saved)
    if (parsed.submitted) {
      navigate('/result')
      return
    }

    setSession(parsed)
    setAnswers(parsed.answers || {})
    setCurrentQ(parsed.currentQuestion || 0)

    // Calculate remaining time
    const elapsed = Math.floor((Date.now() - parsed.startTime) / 1000)
    const remaining = Math.max(0, 30 * 60 - elapsed)
    setTimeRemaining(remaining)

    if (remaining <= 0) {
      handleAutoSubmit(parsed)
    }
  }, [loading])

  // Timer countdown
  useEffect(() => {
    if (!session || session.submitted || loading) return

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current)
          handleAutoSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timerRef.current)
  }, [session, loading])

  // Save to localStorage on changes
  useEffect(() => {
    if (!session) return
    const updated = {
      ...session,
      answers,
      currentQuestion: currentQ,
    }
    localStorage.setItem('examSession', JSON.stringify(updated))
  }, [answers, currentQ, session])

  // Warn before leaving
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (session && !session.submitted) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [session])

  const handleAutoSubmit = useCallback((sessionOverride) => {
    if (submittedRef.current) return
    submittedRef.current = true
    const currentSession = sessionOverride || JSON.parse(localStorage.getItem('examSession'))
    const currentAnswers = currentSession?.answers || answers
    submitExam(currentSession, currentAnswers)
  }, [answers])

  const submitExam = async (currentSession, currentAnswers) => {
    if (isSubmitting) return
    setIsSubmitting(true)

    const sess = currentSession || session
    const ans = currentAnswers || answers
    const qs = questionsRef.current

    let correctCount = 0
    let wrongCount = 0

    qs.forEach((q) => {
      if (ans[q.id] === q.correctAnswer) {
        correctCount++
      } else {
        wrongCount++
      }
    })

    const percentage = Math.round((correctCount / 30) * 100)
    const score = percentage
    const passed = score >= 70

    const result = {
      firstName: sess.firstName,
      lastName: sess.lastName,
      group: sess.group,
      correctCount,
      wrongCount,
      score,
      percentage,
      passed,
    }

    // Save result
    localStorage.setItem('examResult', JSON.stringify(result))

    // Mark session as submitted
    const updatedSession = { ...sess, submitted: true, answers: ans }
    localStorage.setItem('examSession', JSON.stringify(updatedSession))

    // Send to backend (non-blocking)
    try {
      await fetch('/api/submit-result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result),
      })
    } catch (err) {
      console.error('Backend submission error:', err)
    }

    navigate('/result')
  }

  const selectAnswer = (questionId, option) => {
    setAnswers((prev) => ({ ...prev, [questionId]: option }))
  }

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  // Loading state
  if (loading || !session || questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card glow p-10 text-center animate-fade-in">
          <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-300 text-sm">Savollar yuklanmoqda...</p>
        </div>
      </div>
    )
  }

  const answeredCount = Object.keys(answers).length
  const progressPercent = (answeredCount / 30) * 100
  const question = questions[currentQ]
  const isTimeLow = timeRemaining < 5 * 60

  const topicColors = {
    HTML: 'from-orange-500 to-red-500',
    CSS: 'from-blue-500 to-cyan-500',
    JavaScript: 'from-yellow-500 to-amber-500',
    React: 'from-cyan-400 to-blue-500',
  }

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-4xl mx-auto animate-fade-in">
        {/* Top Bar */}
        <div className="glass-card p-4 mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
              {session.firstName[0]}{session.lastName[0]}
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{session.firstName} {session.lastName}</p>
              <p className="text-xs text-slate-400">{session.group}</p>
            </div>
          </div>

          {/* Timer */}
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${
            isTimeLow 
              ? 'bg-red-500/20 border border-red-500/30 timer-warning' 
              : 'bg-white/5 border border-white/10'
          }`}>
            <svg className={`w-5 h-5 ${isTimeLow ? 'text-red-400' : 'text-indigo-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className={`text-lg font-bold font-mono ${isTimeLow ? 'text-red-400' : 'text-white'}`}>
              {formatTime(timeRemaining)}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="glass-card p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400">Jarayon</span>
            <span className="text-xs text-slate-400">{answeredCount}/30 javob berildi</span>
          </div>
          <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4">
          {/* Question Area */}
          <div className="glass-card glow p-6 md:p-8">
            {/* Topic Badge + Question Number */}
            <div className="flex items-center gap-3 mb-6">
              <span className={`px-3 py-1 rounded-lg text-xs font-semibold text-white bg-gradient-to-r ${topicColors[question.topic] || 'from-gray-500 to-gray-600'}`}>
                {question.topic}
              </span>
              <span className="text-xs text-slate-500">
                Savol {currentQ + 1} / 30
              </span>
            </div>

            {/* Question Text */}
            <h2 className="text-lg md:text-xl font-semibold text-white mb-8 leading-relaxed">
              {question.question}
            </h2>

            {/* Options */}
            <div className="space-y-3">
              {Object.entries(question.options).map(([key, value]) => {
                const isSelected = answers[question.id] === key
                return (
                  <button
                    key={key}
                    onClick={() => selectAnswer(question.id, key)}
                    className={`w-full text-left p-4 rounded-xl border transition-all duration-300 cursor-pointer group flex items-center gap-4 ${
                      isSelected
                        ? 'bg-indigo-500/15 border-indigo-500/40 shadow-lg shadow-indigo-500/10'
                        : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.06] hover:border-white/20'
                    }`}
                  >
                    <span className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 transition-all duration-300 ${
                      isSelected
                        ? 'bg-indigo-500 text-white'
                        : 'bg-white/10 text-slate-400 group-hover:bg-white/15'
                    }`}>
                      {key.toUpperCase()}
                    </span>
                    <span className={`text-sm md:text-base ${isSelected ? 'text-indigo-200' : 'text-slate-300'}`}>
                      {value}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/5">
              <button
                onClick={() => setCurrentQ(Math.max(0, currentQ - 1))}
                disabled={currentQ === 0}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 text-sm font-medium cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Oldingi
              </button>

              {currentQ < 29 ? (
                <button
                  onClick={() => setCurrentQ(currentQ + 1)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-500 hover:to-purple-500 transition-all duration-300 text-sm font-medium cursor-pointer"
                >
                  Keyingi
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ) : (
                <button
                  onClick={() => setShowModal(true)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-500 hover:to-teal-500 transition-all duration-300 text-sm font-medium cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Yakunlash
                </button>
              )}
            </div>
          </div>

          {/* Sidebar - Question Navigator */}
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-slate-300 mb-4">Savollar</h3>
            <div className="grid grid-cols-5 gap-2">
              {questions.map((q, idx) => {
                const isAnswered = answers[q.id] !== undefined
                const isCurrent = idx === currentQ
                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQ(idx)}
                    className={`w-full aspect-square rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                      isCurrent
                        ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30 scale-110'
                        : isAnswered
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-white/5 text-slate-500 border border-white/10 hover:bg-white/10'
                    }`}
                  >
                    {idx + 1}
                  </button>
                )
              })}
            </div>

            <div className="mt-5 pt-4 border-t border-white/5 space-y-2">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <div className="w-3 h-3 rounded bg-emerald-500/20 border border-emerald-500/30" />
                Javob berilgan ({answeredCount})
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <div className="w-3 h-3 rounded bg-white/5 border border-white/10" />
                Javob berilmagan ({30 - answeredCount})
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <div className="w-3 h-3 rounded bg-indigo-500" />
                Hozirgi savol
              </div>
            </div>

            {/* Finish Button */}
            <button
              id="finishExam"
              onClick={() => setShowModal(true)}
              className="w-full mt-5 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold text-sm hover:from-emerald-500 hover:to-teal-500 transition-all duration-300 shadow-lg shadow-emerald-500/20 cursor-pointer"
            >
              Imtihonni yakunlash
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="glass-card glow p-8 max-w-sm w-full animate-scale-in text-center">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Imtihonni yakunlaysizmi?</h3>
            <p className="text-sm text-slate-400 mb-2">
              Siz <span className="text-white font-semibold">{answeredCount}</span> ta savolga javob berdingiz.
            </p>
            {answeredCount < 30 && (
              <p className="text-xs text-amber-400 mb-6">
                ⚠️ {30 - answeredCount} ta savol javobsiz qoldi
              </p>
            )}
            {answeredCount >= 30 && <div className="mb-6" />}
            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-300 font-medium hover:bg-white/10 transition-all duration-300 cursor-pointer"
              >
                Orqaga
              </button>
              <button
                onClick={() => {
                  setShowModal(false)
                  submitExam()
                }}
                disabled={isSubmitting}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-medium hover:from-emerald-500 hover:to-teal-500 transition-all duration-300 disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? 'Yuborilmoqda...' : 'Ha, yakunlash'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
