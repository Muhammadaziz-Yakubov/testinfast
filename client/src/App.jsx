import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Exam from './pages/Exam'
import Result from './pages/Result'
import ParticlesBackground from './components/ParticlesBackground'

function App() {
  return (
    <div className="relative min-h-screen">
      <ParticlesBackground />
      <div className="relative z-10">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/exam" element={<Exam />} />
          <Route path="/result" element={<Result />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  )
}

export default App
