# ==========================================
# STAGE 1: Backend Service
# ==========================================
FROM node:20-alpine AS backend-target
WORKDIR /app

COPY Backend/package*.json ./
RUN npm ci --omit=dev

COPY Backend/server.js Backend/postgres_schema.sql ./
COPY Backend/src/ ./src/
 
ENV NODE_ENV=production
ENV PORT=5000
EXPOSE 5000

USER node
CMD ["node", "server.js"]

# ==========================================
# STAGE 2: Frontend Build
# ==========================================
FROM node:20-alpine AS frontend-builder
WORKDIR /app

COPY ChatBot-Dashboard/package*.json ./
RUN npm ci

COPY ChatBot-Dashboard/ ./
RUN npm run build

# ==========================================
# STAGE 3: Frontend Runtime (CORS Header Override)
# ==========================================
FROM nginx:alpine AS frontend-target

COPY --from=frontend-builder /app/dist /usr/share/nginx/html

RUN printf 'server {\n\
    listen 80;\n\
\n\
    location /api/ {\n\
        # Intercept and answer preflight OPTIONS checks\n\
        if ($request_method = "OPTIONS") {\n\
            add_header "Access-Control-Allow-Origin" "$http_origin" always;\n\
            add_header "Access-Control-Allow-Methods" "GET, POST, PUT, DELETE, OPTIONS" always;\n\
            add_header "Access-Control-Allow-Headers" "Content-Type, Authorization, X-Requested-With, Accept" always;\n\
            add_header "Access-Control-Allow-Credentials" "true" always;\n\
            add_header "Content-Length" 0;\n\
            add_header "Content-Type" "text/plain charset=UTF-8";\n\
            return 204;\n\
        }\n\
\n\
        # Strip the hardcoded localhost:5173 header sent by Express\n\
        proxy_hide_header Access-Control-Allow-Origin;\n\
        proxy_hide_header Access-Control-Allow-Credentials;\n\
\n\
        # Inject the actual origin making the request (localhost:8085)\n\
        add_header "Access-Control-Allow-Origin" "$http_origin" always;\n\
        add_header "Access-Control-Allow-Credentials" "true" always;\n\
\n\
        proxy_pass http://backend:5000/api/;\n\
        proxy_http_version 1.1;\n\
        proxy_set_header Upgrade $http_upgrade;\n\
        proxy_set_header Connection "upgrade";\n\
        proxy_set_header Host $host;\n\
        proxy_set_header X-Real-IP $remote_addr;\n\
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\n\
        proxy_set_header X-Forwarded-Proto $scheme;\n\
    }\n\
\n\
    location / {\n\
        root /usr/share/nginx/html;\n\
        index index.html index.htm;\n\
        try_files $uri $uri/ /index.html;\n\
    }\n\
}\n' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]