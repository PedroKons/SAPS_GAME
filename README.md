# Jogo de LIBRAS

Um jogo educativo para aprender o alfabeto em LIBRAS de forma divertida e interativa.

## Funcionalidades

- **Sistema de Autenticação**: Login e registro de usuários
- **Jogo Educativo**: Aprenda o alfabeto em LIBRAS através de palavras
- **Interface Responsiva**: Funciona em desktop e dispositivos móveis
- **Sistema de Pontuação**: Acompanhe seu progresso
- **Design Moderno**: Interface bonita e intuitiva
- **Roteamento Inteligente**: Navegação com React Router

## Como Funciona a Autenticação

O jogo possui um sistema de autenticação robusto usando React Router:

1. **Primeiro Acesso**: Ao acessar o jogo, o usuário é redirecionado para `/login`
2. **Registro**: Usuários novos podem criar uma conta em `/register`
3. **Login**: Usuários existentes fazem login com email e senha
4. **Redirecionamento Inteligente**: Após login, o usuário é redirecionado para a página que tentou acessar originalmente
5. **Acesso ao Jogo**: Apenas usuários autenticados podem acessar `/game`
6. **Logout**: Botão "Sair" no canto superior esquerdo para sair da conta

## Estrutura de Rotas

- `/` - Redireciona para `/login`
- `/login` - Tela de login
- `/register` - Tela de registro
- `/game` - Jogo principal (protegida)
- `/*` - Qualquer rota não encontrada redireciona para `/login`

## Tecnologias Utilizadas

- React + TypeScript
- React Router DOM
- Vite
- Tailwind CSS
- Local Storage para persistência de tokens

## Configuração da API

O sistema espera uma API backend rodando em `http://localhost:3000` com os seguintes endpoints:

- `POST /register` - Para registro de usuários
- `POST /login` - Para autenticação de usuários

### Estrutura da API

**Registro:**
```json
POST /register
{
  "name": "Nome do Usuário",
  "email": "usuario@email.com",
  "password": "senha123"
}
```

**Login:**
```json
POST /login
{
  "email": "usuario@email.com",
  "password": "senha123"
}
```

**Resposta esperada:**
```json
{
  "token": "jwt_token_aqui",
  "user": {
    "id": "user_id",
    "name": "Nome do Usuário",
    "email": "usuario@email.com"
  }
}
```

## Instalação e Execução

1. Clone o repositório
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Execute o projeto:
   ```bash
   npm run dev
   ```
4. Acesse `http://localhost:5173` no navegador

## Estrutura do Projeto

```
src/
├── components/
│   ├── Auth.css          # Estilos para autenticação
│   ├── Login.tsx         # Componente de login
│   ├── Register.tsx      # Componente de registro
│   ├── PrivateRoute.tsx  # Componente de proteção de rotas
│   ├── GameLayout.tsx    # Layout do jogo com botão de logout
│   └── LibrasGame.tsx    # Jogo principal
├── service/
│   ├── api.ts           # Funções de API
│   └── auth.ts          # Funções de autenticação
└── App.tsx              # Componente principal com rotas
```

## Segurança

- **Rotas Protegidas**: Componente `PrivateRoute` verifica autenticação
- **Redirecionamento Inteligente**: Usuários são redirecionados para a página original após login
- **Tokens JWT**: Armazenados no localStorage
- **Validação de Formulários**: Validação no frontend
- **Tratamento de Erros**: Tratamento adequado de erros de autenticação

## Vantagens do React Router

- **Navegação Limpa**: URLs amigáveis e navegação via browser
- **Proteção de Rotas**: Controle granular de acesso
- **Redirecionamento Inteligente**: Preserva a intenção do usuário
- **Histórico do Browser**: Funciona com botões voltar/avançar
- **SEO Friendly**: URLs podem ser indexadas por motores de busca
- **Manutenibilidade**: Código mais organizado e fácil de manter

## Contribuição

Sinta-se à vontade para contribuir com melhorias no projeto!
