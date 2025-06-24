import React from 'react';
import { useNavigate } from 'react-router-dom';
import { removeToken } from '../service/auth';
import LibrasGame from './LibrasGame';

export const GameLayout: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    removeToken();
    navigate('/login');
  };

  const handleRanking = () => {
    navigate('/ranking');
  };

  return (
    <>
      <LibrasGame />
      {/* Botões de navegação */}
      <div className="fixed top-4 left-4 flex gap-2 z-50">
        <button
          onClick={handleRanking}
          className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg shadow-lg transition-all duration-300"
        >
          🏆 Ranking
        </button>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg transition-all duration-300"
        >
          Sair
        </button>
      </div>
    </>
  );
}; 