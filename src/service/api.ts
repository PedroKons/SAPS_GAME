import { saveToken, getToken } from './auth';
import shuffle from 'shuffle-array';

const API_URL = 'https://saps-game-api-saps.a3mewz.easypanel.host';

interface WordItem {
    id: string;
    word: string;
    createdAt: string;
}

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

interface RankingResponse {
    success: boolean;
    data: RankingUser[] | MyPosition;
}

interface LoginResponse {
    success: boolean;
    token: string;
    flag: boolean; // true = admin, false = usuário normal
    user: {
        id: string;
        username: string;
        email: string;
    };
}

interface PaginatedWordsResponse {
    success: boolean;
    data: WordItem[];
    pagination: {
        currentPage: number;
        totalPages: number;
        totalWords: number;
        wordsPerPage: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
}

interface ApiResponse {
    success: boolean;
    message: string;
}

export async function register(data: {username: string, email: string, password: string}) {
    const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        throw new Error('Failed to register');
    }

    const result = await response.json();
    
    // O registro não retorna token, apenas confirmação
    return result;
}

export async function login(data: {email: string, password: string}): Promise<LoginResponse> {
    const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    
    if (!response.ok) {
        throw new Error('Failed to login');
    }

    const result: LoginResponse = await response.json();
    
    // Salvar o token se a resposta incluir um
    if (result.token) {
        saveToken(result.token, result.flag);
    }

    return result;
}

export async function words() {
    const response = await fetch(`${API_URL}/api/words`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        if (response.status === 401) {
            throw new Error('Token inválido ou expirado');
        }
        if (response.status === 404) {
            throw new Error('Endpoint de palavras não encontrado');
        }
        throw new Error(`Erro ao buscar palavras: ${response.status}`);
    }

    const result = await response.json();
    
    // Handle nested data structure and extract word field
    let wordsArray: string[];
    if (result.data && Array.isArray(result.data)) {
        wordsArray = result.data.map((item: WordItem) => item.word);
    } else if (Array.isArray(result)) {
        // If it's already an array, extract word field from each object
        wordsArray = result.map((item: WordItem | string) => typeof item === 'string' ? item : item.word);
    } else {
        throw new Error('Formato de resposta inválido');
    }
    
    // Embaralhar as palavras antes de retornar
    return shuffle(wordsArray);
}

// Funções de Ranking
export async function getLeaderboard(): Promise<RankingUser[]> {
    const token = getToken();
    if (!token) {
        throw new Error('Token não encontrado');
    }

    const response = await fetch(`${API_URL}/api/ranking/leaderboard`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error('Erro ao buscar leaderboard');
    }

    const result: RankingResponse = await response.json();
    return result.data as RankingUser[];
}

export async function getMyPosition(): Promise<MyPosition> {
    const token = getToken();
    if (!token) {
        throw new Error('Token não encontrado');
    }

    const response = await fetch(`${API_URL}/api/ranking/my-position`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error('Erro ao buscar posição');
    }

    const result: RankingResponse = await response.json();
    return result.data as MyPosition;
}

export async function addPoints(points: number): Promise<void> {
    const token = getToken();
    if (!token) {
        throw new Error('Token não encontrado');
    }

    const response = await fetch(`${API_URL}/api/ranking/add-points`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ points }),
    });

    if (!response.ok) {
        throw new Error('Erro ao adicionar pontos');
    }

    const result = await response.json();
    return result.data;
}

export async function getFullRanking(page: number = 1, limit: number = 20): Promise<RankingUser[]> {
    const token = getToken();
    if (!token) {
        throw new Error('Token não encontrado');
    }

    const response = await fetch(`${API_URL}/api/ranking/full-ranking?page=${page}&limit=${limit}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error('Erro ao buscar ranking completo');
    }

    const result = await response.json();
    return result.data;
}

// Funções de Administração
export async function getPaginatedWords(page: number = 1, limit: number = 50): Promise<PaginatedWordsResponse> {
    const token = getToken();
    if (!token) {
        throw new Error('Token não encontrado');
    }

    const response = await fetch(`${API_URL}/api/words/paginated?page=${page}&limit=${limit}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error('Erro ao buscar palavras paginadas');
    }

    const result: PaginatedWordsResponse = await response.json();
    return result;
}

export async function addWord(word: string): Promise<ApiResponse> {
    const token = getToken();
    if (!token) {
        throw new Error('Token não encontrado');
    }

    const response = await fetch(`${API_URL}/api/words`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ word: word.trim() }),
    });

    if (!response.ok) {
        if (response.status === 409) {
            throw new Error('Esta palavra já existe');
        }
        throw new Error('Erro ao adicionar palavra');
    }

    const result: ApiResponse = await response.json();
    return result;
}

export async function deleteWord(wordId: string): Promise<ApiResponse> {
    const token = getToken();
    if (!token) {
        throw new Error('Token não encontrado');
    }

    const response = await fetch(`${API_URL}/api/words?id=${wordId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error('Erro ao deletar palavra');
    }

    const result: ApiResponse = await response.json();
    return result;
}
