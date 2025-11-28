# Simulador de Reforma Tributária - Frontend

Interface web para o Simulador de Reforma Tributária brasileira.

## 🚀 Tecnologias

- React 18
- Vite
- Recharts (gráficos)
- jsPDF (exportação de relatórios)

## 📋 Pré-requisitos

- Node.js 18+ ou Docker
- npm ou yarn

## 🛠️ Instalação

### Local (sem Docker)

```bash
npm install
```

### Docker

```bash
docker build -t simulador-frontend .
docker run -p 3000:80 simulador-frontend
```

## 🏃 Executar

### Desenvolvimento

```bash
npm run dev
```

### Build para Produção

```bash
npm run build
```

### Preview do Build

```bash
npm run preview
```

## 🌐 Deploy

### Cloudflare Pages (Recomendado)

1. Conecte este repositório no Cloudflare Pages
2. Configure:
   - **Build Command**: `npm install && npm run build`
   - **Build Output**: `dist`
   - **Root Directory**: `/`

### Cloudflare Pages com Docker

Cloudflare Pages não suporta Docker diretamente. Use o build padrão.

### Variáveis de Ambiente

```
VITE_API_URL=https://seu-backend.onrender.com
```

## 📦 Estrutura

```
client/
├── src/
│   ├── components/       # Componentes React
│   ├── App.jsx           # Componente principal
│   └── main.jsx          # Entry point
├── public/               # Arquivos estáticos
├── index.html
├── vite.config.js
└── Dockerfile
```

## 🔧 Desenvolvimento

O servidor de desenvolvimento roda na porta 3000 por padrão. Para desenvolvimento local:

```bash
npm run dev
```

## 📝 Licença

MIT

