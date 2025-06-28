import './App.css'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Login } from './components/Login'
import { Register } from './components/Register'
import { GameLayout } from './components/GameLayout'
import { PrivateRoute } from './components/PrivateRoute'
import { AdminRoute } from './components/AdminRoute'
import Ranking from './components/Ranking'
import { Admin } from './components/Admin'
import { isAuthenticated } from './service/auth'

// Componente para verificar autenticação na rota raiz
const RootRedirect = () => {
  return isAuthenticated() ? <Navigate to="/game" replace /> : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Rota raiz verifica autenticação e redireciona adequadamente */}
        <Route path="/" element={<RootRedirect />} />
        
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
        
        {/* Rota protegida do admin - apenas usuários ADMIN podem acessar */}
        <Route 
          path="/admin" 
          element={
            <AdminRoute>
              <Admin />
            </AdminRoute>
          } 
        />
        
        {/* Rota catch-all redireciona para login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  )
}

export default App
