// Funções para gerenciar cookies de autenticação
export function saveToken(token: string, isAdminFlag?: boolean) {
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 7); // 7 dias
    
    document.cookie = `token=${token}; expires=${expirationDate.toUTCString()}; path=/; SameSite=Strict; Secure=${window.location.protocol === 'https:'}`;
    
    // Salva a flag de admin em cookie separado se fornecida
    if (isAdminFlag !== undefined) {
        document.cookie = `isAdmin=${isAdminFlag}; expires=${expirationDate.toUTCString()}; path=/; SameSite=Strict; Secure=${window.location.protocol === 'https:'}`;
    }
}

export function getToken(): string | null {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'token' && value) {
            return value;
        }
    }
    return null;
}

export function removeToken() {
    // Remove do cookie
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Strict';
    document.cookie = 'isAdmin=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Strict';
}

export function isAuthenticated(): boolean {
    const token = getToken();
    return token !== null && token !== '';
}

// Função para decodificar token JWT (apenas a parte do payload)
export function decodeToken(token: string): any {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;
        
        const base64Url = parts[1];
        if (!base64Url) return null;
        
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Erro ao decodificar token:', error);
        return null;
    }
}

// Função para verificar se o usuário é admin
export function isAdmin(): boolean {
    const token = getToken();
    if (!token) return false;
    
    // Primeiro tenta decodificar o token JWT
    const decoded = decodeToken(token);
    if (decoded) {
        // Verifica se o token contém a flag de admin
        if (decoded.isAdmin === true || decoded.flag === true || decoded.role === 'admin') {
            return true;
        }
    }
    
    // Fallback: verifica o cookie isAdmin
    const adminFlag = getCookieValue('isAdmin');
    return adminFlag === 'true';
}

// Função para obter informações do usuário do token
export function getUserInfo(): any {
    const token = getToken();
    if (!token) return null;
    
    return decodeToken(token);
}

export function getCookieValue(name: string): string | null {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        const [cookieName, cookieValue] = cookie.trim().split('=');
        if (cookieName === name && cookieValue) {
            return cookieValue;
        }
    }
    return null;
}