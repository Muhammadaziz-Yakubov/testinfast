import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Home() {
  const navigate = useNavigate()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [group, setGroup] = useState('')
  const [errors, setErrors] = useState({})
  const [isHovered, setIsHovered] = useState(false)

  const validate = () => {
    const newErrors = {}
    if (!firstName.trim()) newErrors.firstName = 'Ismingizni kiriting'
    if (!lastName.trim()) newErrors.lastName = 'Familiyangizni kiriting'
    if (!group) newErrors.group = 'Guruhni tanlang'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleStart = (e) => {
    e.preventDefault()
    if (!validate()) return

    // Check for existing exam session
    const existingSession = localStorage.getItem('examSession')
    if (existingSession) {
      const session = JSON.parse(existingSession)
      if (session.submitted) {
        // Clear old submitted session
        localStorage.removeItem('examSession')
      }
    }

    const examSession = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      group,
      answers: {},
      currentQuestion: 0,
      startTime: Date.now(),
      timeRemaining: 30 * 60, // 30 minutes in seconds
      submitted: false,
    }

    localStorage.setItem('examSession', JSON.stringify(examSession))
    navigate('/exam')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="animate-fade-in w-full max-w-md">
        {/* Logo Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 mb-4 shadow-lg shadow-indigo-500/30">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Frontend Final Exam
          </h1>
          <p className="text-slate-400 mt-2 text-sm">
            30 ta savol · 30 daqiqa · 70% o'tish bali
          </p>
        </div>

        {/* Form Card */}
        <form onSubmit={handleStart} className="glass-card glow p-8 space-y-5">
          {/* First Name */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Ism
            </label>
            <input
              id="firstName"
              type="text"
              value={firstName}
              onChange={(e) => {
                setFirstName(e.target.value)
                if (errors.firstName) setErrors({ ...errors, firstName: '' })
              }}
              placeholder="Ismingizni kiriting..."
              className={`w-full px-4 py-3 rounded-xl bg-white/5 border ${
                errors.firstName ? 'border-red-500/50' : 'border-white/10'
              } text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300`}
            />
            {errors.firstName && (
              <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                {errors.firstName}
              </p>
            )}
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Familiya
            </label>
            <input
              id="lastName"
              type="text"
              value={lastName}
              onChange={(e) => {
                setLastName(e.target.value)
                if (errors.lastName) setErrors({ ...errors, lastName: '' })
              }}
              placeholder="Familiyangizni kiriting..."
              className={`w-full px-4 py-3 rounded-xl bg-white/5 border ${
                errors.lastName ? 'border-red-500/50' : 'border-white/10'
              } text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300`}
            />
            {errors.lastName && (
              <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                {errors.lastName}
              </p>
            )}
          </div>

          {/* Group Select */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Guruh
            </label>
            <div className="grid grid-cols-2 gap-3">
              {['1-Group', '2-Group'].map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => {
                    setGroup(g)
                    if (errors.group) setErrors({ ...errors, group: '' })
                  }}
                  className={`py-3 px-4 rounded-xl border text-sm font-medium transition-all duration-300 cursor-pointer ${
                    group === g
                      ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300 shadow-lg shadow-indigo-500/10'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
            {errors.group && (
              <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                {errors.group}
              </p>
            )}
          </div>

          {/* Start Button */}
          <button
            id="startExam"
            type="submit"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-base hover:from-indigo-500 hover:to-purple-500 active:scale-[0.98] transition-all duration-300 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Imtihonni boshlash</span>
            <svg
              className={`w-5 h-5 transition-transform duration-300 ${isHovered ? 'translate-x-1' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>

          {/* Info */}
          <div className="flex items-center gap-3 pt-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              30 daqiqa
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              30 ta savol
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              70% o'tish
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
