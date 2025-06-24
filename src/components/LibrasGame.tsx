import { useState, useEffect } from 'react';
import { words as fetchWords, addPoints } from '../service/api';
import { getToken } from '../service/auth';


const LibrasGame = () => {
  // Alfabeto LIBRAS com caracteres da fonte libras2002
  const librasAlphabet: Record<string, string> = {
    'A': 'A', 'B': 'B', 'C': 'C', 'D': 'D', 'E': 'E',
    'F': 'F', 'G': 'G', 'H': 'H', 'I': 'I', 'J': 'J',
    'K': 'K', 'L': 'L', 'M': 'M', 'N': 'N', 'O': 'O',
    'P': 'P', 'Q': 'Q', 'R': 'R', 'S': 'S', 'T': 'T',
    'U': 'U', 'V': 'V', 'W': 'W', 'X': 'X', 'Y': 'Y', 'Z': 'Z'
  };

  // Constantes do jogo
  const QUESTIONS_PER_GAME = 8;

  // Palavras do jogo
  const [gameWords, setGameWords] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados do jogo
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentLetterIndex, setCurrentLetterIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [usedLetters, setUsedLetters] = useState<Set<string>>(new Set());
  const [wordProgress, setWordProgress] = useState<string[]>([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const [incorrectLetter, setIncorrectLetter] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [submittingScore, setSubmittingScore] = useState(false);

  const currentWord = gameWords[currentWordIndex];

  // Carregar palavras da API
  useEffect(() => {
    const loadWords = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Verificar se o usuário está autenticado
        const token = getToken();
        if (!token) {
          setError('Você precisa estar logado para jogar');
          setLoading(false);
          return;
        }

        const response = await fetchWords();
        
        // Verificar se a resposta contém as palavras
        if (response && Array.isArray(response)) {
          // Limitar a 10 palavras para o jogo
          const limitedWords = response.slice(0, QUESTIONS_PER_GAME);
          setGameWords(limitedWords);
        } else {
          throw new Error('Formato de resposta inválido');
        }
      } catch (err) {
        console.error('Erro ao carregar palavras:', err);
        setError('Erro ao carregar as palavras. Tente novamente.');
        // Fallback para palavras padrão em caso de erro
        const fallbackWords = ['CASA', 'AMOR', 'FELIZ', 'JOGO', 'LIBRAS', 'PAZ', 'SOL', 'MAR', 'LUZ', 'VIDA'];
        setGameWords(fallbackWords);
      } finally {
        setLoading(false);
      }
    };

    loadWords();
  }, []);

  // Inicializar progresso da palavra
  useEffect(() => {
    if (currentWord) {
      setWordProgress(new Array(currentWord.length).fill(''));
      setCurrentLetterIndex(0);
      setUsedLetters(new Set());
    }
  }, [currentWord]);

  // Função para selecionar uma letra
  const selectLetter = (letter: string) => {
    if (!currentWord || currentLetterIndex >= currentWord.length) {
      return;
    }

    const targetLetter = currentWord[currentLetterIndex];
    
    // Verificar se targetLetter existe
    if (!targetLetter) {
      return;
    }
    
    // Normalizar ambas as letras para maiúsculo para comparação
    const normalizedLetter = letter.toUpperCase();
    const normalizedTargetLetter = targetLetter.toUpperCase();
    
    if (normalizedLetter === normalizedTargetLetter) {
      // Letra correta
      const newProgress = [...wordProgress];
      newProgress[currentLetterIndex] = letter;
      setWordProgress(newProgress);
      
      const newUsedLetters = new Set(usedLetters);
      newUsedLetters.add(letter);
      setUsedLetters(newUsedLetters);
      
      setScore(prev => prev + 10);
      setCurrentLetterIndex(prev => prev + 1);
      
      // Verificar se a palavra foi completada
      if (currentLetterIndex + 1 >= currentWord.length) {
        setTimeout(() => {
          setShowCelebration(true);
          setTimeout(() => setShowCelebration(false), 2000);
        }, 500);
      }
    } else {
      // Letra incorreta
      setIncorrectLetter(letter);
      setTimeout(() => setIncorrectLetter(null), 800);
      setScore(prev => Math.max(0, prev - 5));
    }
  };

  // Próxima palavra
  const nextWord = () => {
    if (currentWordIndex + 1 >= gameWords.length) {
      // Jogo finalizado - enviar pontuação para o ranking
      submitFinalScore();
    } else {
      setCurrentWordIndex(prev => prev + 1);
    }
  };

  // Enviar pontuação final para o ranking
  const submitFinalScore = async () => {
    try {
      setSubmittingScore(true);
      await addPoints(score);
      setGameCompleted(true);
    } catch (err) {
      console.error('Erro ao enviar pontuação:', err);
      // Mesmo com erro, mostrar tela de conclusão
      setGameCompleted(true);
    } finally {
      setSubmittingScore(false);
    }
  };

  // Reiniciar jogo
  const restartGame = () => {
    setCurrentWordIndex(0);
    setScore(0);
    setGameCompleted(false);
    setCurrentLetterIndex(0);
    setUsedLetters(new Set());
    setWordProgress([]);
    setSubmittingScore(false);
  };

  // Verificar se pode avançar para próxima palavra
  const canProceed = currentWord ? currentLetterIndex >= currentWord.length : false;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 p-4">
      {/* Help Button */}
      <button
        onClick={() => setShowHelp(true)}
        className="fixed top-4 right-4 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-2xl font-bold text-blue-600 hover:bg-blue-50 transition-all duration-300 z-50"
      >
        ?
      </button>

      <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 to-blue-500 text-white p-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-2">🤟 Jogo de LIBRAS 🤟</h1>
          <p className="text-xl opacity-90">Aprenda o alfabeto em LIBRAS de forma divertida!</p>
        </div>

        {/* Game Area */}
        <div className="p-8">
          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-xl text-gray-600">Carregando palavras...</p>
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

          {/* Submitting Score State */}
          {submittingScore && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-xl text-gray-600">Salvando sua pontuação...</p>
            </div>
          )}

          {/* Game Completed State */}
          {gameCompleted && !submittingScore && (
            <div className="text-center py-12">
              <div className="bg-green-100 border border-green-400 text-green-700 px-8 py-6 rounded-2xl mb-6">
                <h2 className="text-4xl font-bold mb-4">🎉 Parabéns! 🎉</h2>
                <p className="text-2xl mb-4">Você completou o jogo!</p>
                <p className="text-xl">Pontuação final: <span className="font-bold text-green-600">{score}</span></p>
                <p className="text-lg mt-2 text-green-600">Sua pontuação foi salva no ranking!</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={restartGame}
                  className="bg-gradient-to-r from-green-400 to-blue-500 text-white px-8 py-4 rounded-full text-xl font-bold hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                >
                  Jogar Novamente
                </button>
                <button
                  onClick={() => window.location.href = '/ranking'}
                  className="bg-gradient-to-r from-purple-400 to-pink-500 text-white px-8 py-4 rounded-full text-xl font-bold hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                >
                  Ver Ranking
                </button>
              </div>
            </div>
          )}

          {/* Game Content - Only show when not loading, no error, and game not completed */}
          {!loading && !error && !gameCompleted && !submittingScore && currentWord && (
            <>
              {/* Score Area */}
              <div className="flex justify-between items-center mb-8 p-6 bg-gray-50 rounded-2xl">
                <div className="text-2xl font-bold text-gray-700">
                  Pontuação: <span className="text-blue-600">{score}</span>
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={nextWord}
                    disabled={!canProceed}
                    className={`px-6 py-3 rounded-full text-lg font-bold transition-all duration-300 ${
                      canProceed 
                        ? 'bg-gradient-to-r from-green-400 to-blue-500 text-white hover:shadow-lg hover:-translate-y-1' 
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Próxima Palavra
                  </button>
                  <button
                    onClick={nextWord}
                    className="px-6 py-3 rounded-full text-lg font-bold bg-gradient-to-r from-orange-400 to-red-500 text-white hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                  >
                    Pular Palavra
                  </button>
                </div>
                <div className="text-2xl font-bold text-gray-700">
                  Palavra: <span className="text-purple-600">{currentWordIndex + 1}/{gameWords.length}</span>
                </div>
              </div>

              {/* Word Display */}
              <div className="text-center mb-10">
                <div className="text-5xl md:text-6xl font-bold text-gray-800 mb-8 tracking-wider">
                  {currentWord}
                </div>
                
                {/* Word Progress */}
                <div className="flex justify-center gap-4 mb-8">
                  {wordProgress.map((letter, index) => (
                    <div
                      key={index}
                      className={`w-16 h-16 border-4 rounded-xl flex items-center justify-center text-3xl font-bold transition-all duration-300 ${
                        letter 
                          ? 'bg-green-400 text-white border-green-400 transform scale-110 animate-bounce' 
                          : 'bg-gray-50 border-gray-300'
                      }`}
                    >
                      {letter && <span className="libras-font">{letter}</span>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Alphabet Grid */}
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-4">
                {Object.entries(librasAlphabet).map(([letter, sign]) => (
                  <div
                    key={letter}
                    onClick={() => selectLetter(letter)}
                    className={`bg-white border-4 rounded-2xl p-6 text-center cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${
                      usedLetters.has(letter)
                        ? 'bg-green-100 border-green-300'
                        : incorrectLetter === letter
                        ? 'bg-red-500 text-white border-red-500 animate-pulse'
                        : 'border-gray-200 hover:border-blue-400'
                    }`}
                  >
                    <div className="text-6xl libras-font">{sign}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setShowHelp(false)}
          ></div>
          <div className="bg-white rounded-3xl p-8 max-w-4xl w-full mx-4 relative z-10">
            <button
              onClick={() => setShowHelp(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
            <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Alfabeto em LIBRAS</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {Object.entries(librasAlphabet).map(([letter, sign]) => (
                <div
                  key={letter}
                  className="bg-gray-50 rounded-xl p-4 text-center"
                >
                  <div className="text-4xl mb-2 libras-font">{sign}</div>
                  <div className="text-xl font-bold text-gray-700">{letter}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Celebration Modal */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black bg-opacity-50"></div>
          <div className="bg-white rounded-3xl p-12 text-center z-10 transform animate-bounce">
            <h2 className="text-5xl font-bold text-green-500 mb-6">🎉 Parabéns! 🎉</h2>
            <p className="text-2xl text-gray-700">Você completou a palavra!</p>
            <div className="text-6xl mt-4">⭐✨🌟</div>
          </div>
        </div>
      )}

      <style>
        {`
          @keyframes bounce {
            0%, 20%, 60%, 100% { transform: translateY(0) scale(1.1); }
            40% { transform: translateY(-10px) scale(1.1); }
            80% { transform: translateY(-5px) scale(1.1); }
          }
          
          .animate-bounce {
            animation: bounce 0.6s ease;
          }
        `}
      </style>
    </div>
  );
};

export default LibrasGame;