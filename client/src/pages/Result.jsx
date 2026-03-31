import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Result() {
  const navigate = useNavigate()
  const [result, setResult] = useState(null)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('examResult')
    if (!saved) {
      navigate('/')
      return
    }
    setResult(JSON.parse(saved))
    
    // Trigger details animation
    setTimeout(() => setShowDetails(true), 600)
  }, [])

  const handleGoHome = () => {
    localStorage.removeItem('examSession')
    localStorage.removeItem('examResult')
    navigate('/')
  }

  if (!result) return null

  const { firstName, lastName, group, correctCount, wrongCount, score, percentage, passed } = result

  const circumference = 2 * Math.PI * 54
  const offset = circumference - (percentage / 100) * circumference

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-lg animate-slide-up">
        {/* Result Card */}
        <div className="glass-card glow p-8 md:p-10 text-center">
          {/* Status Icon */}
          <div className={`w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center ${
            passed 
              ? 'bg-emerald-500/20 shadow-lg shadow-emerald-500/20' 
              : 'bg-red-500/20 shadow-lg shadow-red-500/20'
          }`}>
            {passed ? (
              <svg className="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </div>

          {/* Status Text */}
          <h1 className={`text-3xl font-bold mb-1 ${passed ? 'text-emerald-400' : 'text-red-400'}`}>
            {passed ? "Tabriklaymiz! 🎉" : "Afsuski... 😔"}
          </h1>
          <p className={`text-sm mb-8 ${passed ? 'text-emerald-400/70' : 'text-red-400/70'}`}>
            {passed ? "Siz imtihondan muvaffaqiyatli o'tdingiz!" : "Siz imtihondan o'ta olmadingiz"}
          </p>

          {/* Student Info */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
              {firstName[0]}{lastName[0]}
            </div>
            <div className="text-left">
              <p className="text-white font-semibold">{firstName} {lastName}</p>
              <p className="text-xs text-slate-400">{group}</p>
            </div>
          </div>

          {/* Score Circle */}
          <div className="relative w-36 h-36 mx-auto mb-8">
            <svg className="w-36 h-36 transform -rotate-90" viewBox="0 0 120 120">
              <circle
                cx="60" cy="60" r="54"
                fill="none"
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="8"
              />
              <circle
                cx="60" cy="60" r="54"
                fill="none"
                stroke={passed ? '#10b981' : '#ef4444'}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                className="transition-all duration-[1500ms] ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-black text-white">{score}</span>
              <span className="text-xs text-slate-400 font-medium">/100 ball</span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className={`grid grid-cols-3 gap-3 mb-8 transition-all duration-500 ${showDetails ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
              <div className="text-2xl font-bold text-emerald-400">{correctCount}</div>
              <div className="text-xs text-emerald-400/70 mt-1">To'g'ri</div>
            </div>
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
              <div className="text-2xl font-bold text-red-400">{wrongCount}</div>
              <div className="text-xs text-red-400/70 mt-1">Noto'g'ri</div>
            </div>
            <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4">
              <div className="text-2xl font-bold text-indigo-400">{percentage}%</div>
              <div className="text-xs text-indigo-400/70 mt-1">Foiz</div>
            </div>
          </div>

          {/* Pass/Fail Badge */}
          <div className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold mb-8 ${
            passed
              ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
              : 'bg-red-500/15 border border-red-500/30 text-red-400'
          }`}>
            {passed ? (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                O'tdi — {percentage}% ≥ 70%
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                O'tmadi — {percentage}% &lt; 70%
              </>
            )}
          </div>

          {/* Back Button */}
          <div>
            <button
              id="goHome"
              onClick={handleGoHome}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:from-indigo-500 hover:to-purple-500 transition-all duration-300 shadow-lg shadow-indigo-500/25 cursor-pointer flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Bosh sahifaga qaytish
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
