import './App.css'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Login } from './components/Login'
import { Register } from './components/Register'
import { GameLayout } from './components/GameLayout'
import { PrivateRoute } from './components/PrivateRoute'
import Ranking from './components/Ranking'

function App() {
  return (
    <Router>
      <Routes>
        {/* Rota raiz redireciona para login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Rotas públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Rota protegida do jogo */}
        <Route 
          path="/game" 
          element={
            <PrivateRoute>
              <GameLayout />
            </PrivateRoute>
          } 
        />
        
        {/* Rota protegida do ranking */}
        <Route 
          path="/ranking" 
          element={
            <PrivateRoute>
              <Ranking />
            </PrivateRoute>
          } 
        />
        
        {/* Rota catch-all redireciona para login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  )
}

export default App
