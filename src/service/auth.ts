// Funções para gerenciar cookies de autenticação
export function saveToken(token: string) {
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 7); // 7 dias
    
    document.cookie = `token=${token}; expires=${expirationDate.toUTCString()}; path=/; SameSite=Strict; Secure=${window.location.protocol === 'https:'}`;
    
    // Mantém também no localStorage como fallback
    localStorage.setItem('token', token);
}

export function getToken(): string | null {
    // Primeiro tenta obter do cookie
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'token') {
            return value;
        }
    }
    
    // Fallback para localStorage se não encontrar no cookie
    return localStorage.getItem('token');
}

export function removeToken() {
    // Remove do cookie
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Strict';
    
    // Remove do localStorage também
    localStorage.removeItem('token');
}

export function isAuthenticated(): boolean {
    const token = getToken();
    return token !== null && token !== '';
}

export function getCookieValue(name: string): string | null {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        const [cookieName, cookieValue] = cookie.trim().split('=');
        if (cookieName === name) {
            return cookieValue;
        }
    }
    return null;
}