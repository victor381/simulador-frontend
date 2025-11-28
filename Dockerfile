# Dockerfile para Frontend - Simulador de Reforma Tributária
# Multi-stage build para otimização

# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências
RUN npm ci && npm cache clean --force

# Copiar código fonte
COPY . .

# Build da aplicação
RUN npm run build

# Stage 2: Production
FROM nginx:alpine

# Copiar arquivos de build
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuração do nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar headers e redirects para Cloudflare Pages
COPY _headers /usr/share/nginx/html/_headers
COPY _redirects /usr/share/nginx/html/_redirects

# Expor porta
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Comando de inicialização
CMD ["nginx", "-g", "daemon off;"]

