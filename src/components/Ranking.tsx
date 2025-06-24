import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLeaderboard, getMyPosition } from '../service/api';

interface RankingUser {
  id: string;
  username: string;
  score: number;
  createdAt: string;
  position: number;
}

interface MyPosition {
  id: string;
  username: string;
  score: number;
  position: number;
  totalUsers: number;
}

const Ranking = () => {
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState<RankingUser[]>([]);
  const [myPosition, setMyPosition] = useState<MyPosition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRanking = async () => {
      try {
        setLoading(true);
        setError(null);

        // Carregar leaderboard e posição do usuário em paralelo
        const [leaderboardData, myPositionData] = await Promise.all([
          getLeaderboard(),
          getMyPosition()
        ]);

        setLeaderboard(leaderboardData);
        setMyPosition(myPositionData);
      } catch (err) {
        console.error('Erro ao carregar ranking:', err);
        setError('Erro ao carregar o ranking. Tente novamente.');
      } finally {
        setLoading(false);
      }
    };

    loadRanking();
  }, []);

  const handleBackToGame = () => {
    navigate('/game');
  };

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${position}`;
    }
  };

  const getPositionColor = (position: number) => {
    switch (position) {
      case 1: return 'bg-yellow-100 border-yellow-400 text-yellow-800';
      case 2: return 'bg-gray-100 border-gray-400 text-gray-800';
      case 3: return 'bg-orange-100 border-orange-400 text-orange-800';
      default: return 'bg-white border-gray-200 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 p-4">
      {/* Botão voltar */}
      <button
        onClick={handleBackToGame}
        className="fixed top-4 left-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg transition-all duration-300 z-50"
      >
        ← Voltar ao Jogo
      </button>

      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 to-blue-500 text-white p-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-2">🏆 Ranking 🏆</h1>
          <p className="text-xl opacity-90">Veja os melhores jogadores!</p>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-xl text-gray-600">Carregando ranking...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-12">
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
                <p className="text-lg font-semibold">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Tentar Novamente
                </button>
              </div>
            </div>
          )}

          {/* Ranking Content */}
          {!loading && !error && (
            <>
              {/* My Position */}
              {myPosition && (
                <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border-2 border-blue-200">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Sua Posição</h2>
                  <div className="flex items-center justify-center space-x-6">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-blue-600 mb-2">
                        {getPositionIcon(myPosition.position)}
                      </div>
                      <div className="text-lg text-gray-600">
                        Posição {myPosition.position} de {myPosition.totalUsers}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-800 mb-1">
                        {myPosition.username}
                      </div>
                      <div className="text-xl text-green-600 font-semibold">
                        {myPosition.score} pontos
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Leaderboard */}
              <div className="bg-gray-50 rounded-2xl p-6">
                <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Top 10 Jogadores</h2>
                
                <div className="space-y-4">
                  {leaderboard.map((user) => (
                    <div
                      key={user.id}
                      className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-300 hover:shadow-lg ${
                        getPositionColor(user.position)
                      } ${myPosition && user.id === myPosition.id ? 'ring-4 ring-blue-400' : ''}`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="text-2xl font-bold min-w-[60px]">
                          {getPositionIcon(user.position)}
                        </div>
                        <div>
                          <div className="text-xl font-bold text-gray-800">
                            {user.username}
                            {myPosition && user.id === myPosition.id && (
                              <span className="ml-2 text-blue-600">(Você)</span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">
                            Membro desde {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">
                          {user.score.toLocaleString('pt-BR')}
                        </div>
                        <div className="text-sm text-gray-500">pontos</div>
                      </div>
                    </div>
                  ))}
                </div>

                {leaderboard.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500 text-lg">Nenhum jogador encontrado.</p>
                  </div>
                )}
              </div>

              {/* Stats */}
              {myPosition && (
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-xl text-center">
                    <div className="text-2xl font-bold text-blue-600">{myPosition.position}</div>
                    <div className="text-gray-600">Sua Posição</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-xl text-center">
                    <div className="text-2xl font-bold text-green-600">{myPosition.score}</div>
                    <div className="text-gray-600">Seus Pontos</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-xl text-center">
                    <div className="text-2xl font-bold text-purple-600">{myPosition.totalUsers}</div>
                    <div className="text-gray-600">Total de Jogadores</div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Ranking; 