import React, { useState, useEffect } from 'react';
import { getPaginatedWords, addWord, deleteWord } from '../service/api';
import { removeToken } from '../service/auth';
import { useNavigate } from 'react-router-dom';

interface WordItem {
    id: string;
    word: string;
    createdAt: string;
}

interface PaginationInfo {
    currentPage: number;
    totalPages: number;
    totalWords: number;
    wordsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

export const Admin: React.FC = () => {
    const navigate = useNavigate();
    const [words, setWords] = useState<WordItem[]>([]);
    const [newWord, setNewWord] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loadingWords, setLoadingWords] = useState(true);
    const [deletingWordId, setDeletingWordId] = useState<string | null>(null);
    const [pagination, setPagination] = useState<PaginationInfo>({
        currentPage: 1,
        totalPages: 1,
        totalWords: 0,
        wordsPerPage: 50,
        hasNextPage: false,
        hasPrevPage: false
    });

    useEffect(() => {
        loadWords(1);
    }, []);

    const loadWords = async (page: number) => {
        try {
            setLoadingWords(true);
            const response = await getPaginatedWords(page, 50);
            setWords(response.data);
            setPagination(response.pagination);
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
            setError('Erro ao carregar palavras: ' + errorMessage);
            console.error('Erro ao carregar palavras:', error);
        } finally {
            setLoadingWords(false);
        }
    };

    const handleAddWord = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newWord.trim()) {
            setError('Digite uma palavra válida');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            await addWord(newWord);
            setSuccess('Palavra adicionada com sucesso!');
            setNewWord('');
            // Recarrega a primeira página para ver a nova palavra
            loadWords(1);
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Erro ao adicionar palavra';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteWord = async (wordId: string, word: string) => {
        setDeletingWordId(wordId);
        setError('');
        setSuccess('');

        try {
            await deleteWord(wordId);
            setSuccess('Palavra ' + word + ' deletada com sucesso!');
            // Recarrega a página atual
            loadWords(pagination.currentPage);
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Erro ao deletar palavra';
            setError(errorMessage);
        } finally {
            setDeletingWordId(null);
        }
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            loadWords(newPage);
        }
    };

    const clearMessages = () => {
        setError('');
        setSuccess('');
    };

    const logout = () => {
        removeToken();
        navigate('/');
    };

    return (
        <div className={`max-w-full mx-auto p-5 bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 min-h-screen font-sans ${deletingWordId ? 'cursor-wait' : ''}`}>
            <div className="text-center mb-10 text-white">
                <div className="flex justify-center gap-4 mb-8">
                    <button 
                        onClick={() => logout()}
                        className="px-5 py-3 bg-white/20 text-white border-2 border-white/30 rounded-lg font-semibold hover:bg-white/30 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200"
                    >
                        Logout
                    </button>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold mb-3 text-shadow-lg">Painel de Administração</h1>
                <p className="text-xl opacity-90">Gerencie as palavras do jogo</p>
            </div>

            {/* Formulário para adicionar nova palavra */}
            <div className="bg-white rounded-2xl p-8 mb-8 shadow-2xl">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-3 border-b-4 border-purple-500">Adicionar Nova Palavra</h2>
                <form onSubmit={handleAddWord} className="space-y-4">
                    <div className="flex gap-4 flex-wrap items-center">
                        <input
                            type="text"
                            value={newWord}
                            onChange={(e) => {
                                setNewWord(e.target.value);
                                clearMessages();
                            }}
                            placeholder="Digite a nova palavra"
                            maxLength={50}
                            required
                            className="flex-1 min-w-64 px-4 py-4 border-2 border-gray-300 rounded-lg text-lg focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200"
                        />
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            {loading ? 'Adicionando...' : 'Adicionar Palavra'}
                        </button>
                    </div>
                </form>

                {error && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg font-medium">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg font-medium">
                        {success}
                    </div>
                )}
            </div>

            {/* Lista de palavras existentes */}
            <div className="bg-white rounded-2xl p-8 shadow-2xl">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-3 border-b-4 border-purple-500">
                    Palavras Existentes ({pagination.totalWords})
                </h2>
                
                {loadingWords ? (
                    <div className="text-center py-12 text-gray-600 text-xl">Carregando palavras...</div>
                ) : (
                    <>
                        {words.length === 0 ? (
                            <p className="text-center py-12 text-gray-500 text-lg">Nenhuma palavra encontrada.</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                                {words.map((wordItem) => (
                                    <div key={wordItem.id} className="bg-gray-50 border-2 border-gray-200 rounded-xl p-6 hover:-translate-y-1 hover:shadow-lg hover:border-purple-400 transition-all duration-200">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xl font-semibold text-gray-800 flex-1">
                                                {wordItem.word}
                                            </span>
                                            <div className="flex items-center gap-4">
                                                <span className="text-sm text-gray-600 whitespace-nowrap">
                                                    {new Date(wordItem.createdAt).toLocaleDateString('pt-BR')}
                                                </span>
                                                <button
                                                    onClick={() => handleDeleteWord(wordItem.id, wordItem.word)}
                                                    disabled={deletingWordId === wordItem.id}
                                                    className={`w-10 h-10 text-white rounded-full flex items-center justify-center text-lg transition-all duration-200 ${
                                                        deletingWordId === wordItem.id 
                                                            ? 'bg-gray-400 cursor-wait' 
                                                            : 'bg-red-500 hover:bg-red-600 hover:scale-110 cursor-pointer'
                                                    }`}
                                                    title={deletingWordId === wordItem.id ? 'Deletando...' : 'Deletar palavra'}
                                                >
                                                    {deletingWordId === wordItem.id ? (
                                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                    ) : (
                                                        '🗑️'
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Controles de Paginação */}
                        {pagination.totalPages > 1 && (
                            <div className="flex justify-between items-center p-6 bg-gray-50 rounded-xl">
                                <button
                                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                                    disabled={!pagination.hasPrevPage}
                                    className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:opacity-60 disabled:transform-none"
                                >
                                    ← Anterior
                                </button>
                                
                                <div className="text-center text-gray-800">
                                    <div className="font-semibold">
                                        Página {pagination.currentPage} de {pagination.totalPages}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        ({pagination.totalWords} palavras no total)
                                    </div>
                                </div>
                                
                                <button
                                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                                    disabled={!pagination.hasNextPage}
                                    className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:opacity-60 disabled:transform-none"
                                >
                                    Próxima →
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}; 