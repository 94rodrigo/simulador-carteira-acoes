# Simulador de Carteiras de Ações

Este projeto é um simulador de carteiras de ações, permitindo ao usuário criar, gerenciar e analisar carteiras de investimentos de forma simples e intuitiva. O sistema é composto por um backend em Go e um frontend moderno utilizando React com Vite.

## Funcionalidades
- Cadastro e simulação de carteiras de ações
- Visualização de histórico e desempenho das carteiras
- Interface intuitiva e responsiva
- Backend robusto para cálculos e manipulação de dados

## Tecnologias Utilizadas
- **Frontend:** React, TypeScript, Vite
- **Backend:** Go (Golang)
- **Lint:** ESLint com regras para React e TypeScript
- **API de Dados:** [brapi](https://brapi.dev/) para informações de ações

## Uso da API brapi
Este projeto utiliza a API [brapi](https://brapi.dev/) para obter dados de ações. Para o funcionamento correto do backend, é necessário criar um arquivo `.env` na pasta `backend` com o seguinte conteúdo:

```env
BRAPI_TOKEN=SEU_TOKEN_AQUI
```

Substitua `SEU_TOKEN_AQUI` pelo seu token de acesso à brapi. Você pode obter um token gratuito em [brapi.dev](https://brapi.dev/).

## Estrutura do Projeto
```
├── backend/         # Código-fonte do backend em Go
│   ├── handlers/    # Handlers das rotas
│   ├── models/      # Modelos de dados
│   └── utils/       # Utilitários
├── frontend/        # Código-fonte do frontend em React
│   ├── src/         # Componentes e páginas
│   ├── public/      # Arquivos públicos (ex: stocklist.json)
│   └── ...
├── README.md        # Este arquivo
```

## Como rodar o projeto

### Backend (Go)
1. Acesse a pasta `backend`:
   ```sh
   cd backend
   ```
2. Instale as dependências e rode o servidor:
   ```sh
   go run main.go
   ```

### Frontend (React + Vite)
1. Acesse a pasta `frontend`:
   ```sh
   cd frontend
   ```
2. Instale as dependências:
   ```sh
   npm install
   ```
3. Rode o servidor de desenvolvimento:
   ```sh
   npm run dev
   ```

Acesse o frontend normalmente em `http://localhost:5173` (ou porta configurada pelo Vite).

## Lint e Qualidade de Código
O projeto utiliza ESLint com regras recomendadas para React e TypeScript. Veja o arquivo `frontend/eslint.config.js` para customizações.

## Contribuição
Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou pull requests.

## Licença
Este projeto está sob a licença MIT.
