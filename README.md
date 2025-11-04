# 🧸 PitocosToys - Sistema de Gerenciamento de Brinquedos

## 📋 Visão Geral
O PitocosToys é um sistema completo para gerenciamento de brinquedos e produtos, com backend em Node.js/Express/MongoDB e frontend em React.

## 🚀 Funcionalidades

### Backend (API REST)
- CRUD completo de produtos/brinquedos
- Filtragem e busca avançada
- Paginação e ordenação
- Suporte a múltiplas categorias e tags
- Soft delete de itens
- Validação de dados
- CORS habilitado

### Frontend (React)
- Interface responsiva
- Listagem com paginação
- Formulários para cadastro/edição
- Filtros e busca em tempo real
- Confirmação para exclusão
- Feedback visual para ações

## 🛠️ Tecnologias

### Backend
- Node.js
- Express
- MongoDB (Mongoose)
- CORS
- dotenv

### Frontend
- React
- Vite
- CSS Modules
- React Icons
- React Modal

## 📦 Estrutura do Projeto

```
pitocosToys/
├── backend/               # Código do servidor
│   ├── models/           # Modelos do Mongoose
│   ├── routes/           # Rotas da API
│   ├── server.js         # Ponto de entrada do servidor
│   └── package.json      # Dependências do backend
├── frontend/             # Aplicação React
│   ├── public/           # Arquivos estáticos
│   ├── src/              # Código-fonte
│   └── package.json      # Dependências do frontend
└── README.md             # Documentação
```

## 🚀 Como Executar

### Pré-requisitos
- Node.js (v14+)
- MongoDB (local ou Atlas)
- npm ou yarn

### Configuração do Backend

1. Acesse a pasta do backend:
   ```bash
   cd backend
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Configure as variáveis de ambiente (crie um arquivo `.env`):
   ```env
   MONGODB_URI=mongodb://localhost:27017/produtos_DB
   PORT=3003
   ```

4. Inicie o servidor:
   ```bash
   npm start
   ```

### Configuração do Frontend

1. Acesse a pasta do frontend:
   ```bash
   cd frontend
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Configure a variável de ambiente (opcional):
   Crie um arquivo `.env` na pasta frontend:
   ```env
   VITE_API_BASE_URL=http://localhost:3003/api
   ```

4. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

## 📝 Modelo de Dados

### Item (Produto/Brinquedo)
- **nome**: String (obrigatório)
- **categoria**: String (obrigatório, indexado)
- **valor_pago**: Number (padrão: 0)
- **valor_vendido**: Number (opcional)
- **disponivel**: Boolean (padrão: true, indexado)
- **descricao**: String (opcional)
- **tags**: [String] (opcional)
- **data_cadastro**: Date (automático)
- **data_venda**: Date (opcional)
- **ativo**: Boolean (para soft delete, padrão: true)

## 📚 API Endpoints

### GET /api/items
Lista itens com filtros e paginação

**Parâmetros de consulta:**
- `q`: Termo de busca (opcional)
- `categoria`: Filtrar por categoria (opcional)
- `disponivel`: Filtrar por disponibilidade (true/false, opcional)
- `page`: Número da página (padrão: 1)
- `limit`: Itens por página (padrão: 50)
- `sortBy`: Campo para ordenação (padrão: 'data_cadastro')
- `sortDir`: Direção da ordenação ('asc' ou 'desc', padrão: 'desc')
- `ativo`: Filtrar itens ativos/inativos (true/false, opcional)

### GET /api/items/:id
Busca um item específico pelo ID

### POST /api/items
Cria um novo item

### PUT /api/items/:id
Atualiza um item existente

### DELETE /api/items/:id
Remove um item (soft delete)

## 🤝 Contribuição
1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas alterações (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença
Este projeto está sob a licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## ✨ Agradecimentos
- Time de desenvolvimento
- Comunidade de código aberto
- Todos os contribuidores