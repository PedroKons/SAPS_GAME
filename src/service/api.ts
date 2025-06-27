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
    data: RankingUser[] | MyPosition | any;
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

export async function login(data: {email: string, password: string}) {
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

    const result = await response.json();
    
    // Salvar o token se a resposta incluir um
    if (result.token) {
        saveToken(result.token);
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

export async function addPoints(points: number): Promise<any> {
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

export async function getFullRanking(page: number = 1, limit: number = 20): Promise<any> {
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
