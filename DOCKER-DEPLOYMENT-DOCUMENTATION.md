# Docker Deployment Documentation

## Overview

This project uses Docker to containerize both the frontend (React + Vite) and backend (Node.js + Express), push the images to Docker Hub, and deploy them to an AWS EC2 instance automatically using GitHub Actions.

---

## Project Structure

```
stack/
├── .github/
│   └── workflows/
│       └── ci.yml              # CI/CD pipeline (test → build → push → deploy)
├── backend/
│   ├── Dockerfile              # Backend Docker image definition
│   ├── .dockerignore           # Files excluded from Docker build
│   ├── .env                    # Environment variables (local only)
│   ├── package.json
│   └── src/
│       └── index.js            # Express server entry point
├── frontend/
│   ├── Dockerfile              # Frontend Docker image definition (multi-stage)
│   ├── .dockerignore           # Files excluded from Docker build
│   ├── nginx.conf              # Nginx config bundled inside the frontend image
│   ├── package.json
│   └── src/                    # React application source
├── docker-compose.yml          # Local development orchestration
└── DOCKER-DEPLOYMENT-DOCUMENTATION.md
```

---

## How Each File Works

### 1. Backend Dockerfile (`backend/Dockerfile`)

```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev
COPY src ./src
ENV PORT=3000
ENV MONGO_URI=mongodb+srv://...
ENV JWT_SECRET=...
ENV JWT_EXPIRES_IN=7d
EXPOSE 3000
CMD ["node", "src/index.js"]
```

**Line-by-line explanation:**

| Line | What it does |
|------|-------------|
| `FROM node:22-alpine` | Uses Node.js 22 on Alpine Linux as the base image. Alpine is a tiny Linux (~5MB) which keeps the image small. |
| `WORKDIR /app` | Sets `/app` as the working directory inside the container. All following commands run from here. |
| `COPY package.json ./` | Copies only `package.json` first. This is done separately so Docker can cache the `npm install` step — if `package.json` hasn't changed, Docker skips reinstalling dependencies. |
| `RUN npm install --omit=dev` | Installs only production dependencies (skips jest, etc.). This runs during image **build** time, not at runtime. |
| `COPY src ./src` | Copies your application source code into the image. |
| `ENV PORT=3000` | Sets environment variables directly inside the image. These are available to the Node.js app via `process.env.PORT`. |
| `EXPOSE 3000` | Documents that the container listens on port 3000. This is informational — the actual port mapping happens with `-p` flag at runtime. |
| `CMD ["node", "src/index.js"]` | The command that runs when the container starts. This starts your Express server. |

**How it works at runtime:**
1. Docker creates an isolated Linux environment
2. Node.js starts and reads the ENV variables
3. Express server starts on port 3000
4. The `-p 3000:3000` flag maps the host's port 3000 to the container's port 3000

---

### 2. Frontend Dockerfile (`frontend/Dockerfile`) — Multi-Stage Build

```dockerfile
# Stage 1: Build
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**This is a multi-stage build — it uses two separate images:**

#### Stage 1: Build Stage
| Line | What it does |
|------|-------------|
| `FROM node:22-alpine AS build` | Creates a temporary build environment with Node.js. The `AS build` gives it a name so we can reference it later. |
| `RUN npm install` | Installs ALL dependencies (including devDependencies like Vite) because we need them to build. |
| `COPY . .` | Copies all frontend source code. |
| `RUN npm run build` | Runs `vite build` which compiles React/JSX into static HTML/CSS/JS files in the `dist/` folder. |

#### Stage 2: Production Stage
| Line | What it does |
|------|-------------|
| `FROM nginx:alpine` | Starts a fresh image with only Nginx. The entire Node.js build environment from Stage 1 is thrown away. |
| `COPY --from=build /app/dist ...` | Copies ONLY the built static files from Stage 1 into Nginx's web directory. |
| `COPY nginx.conf ...` | Copies our custom Nginx configuration. |
| `CMD ["nginx", "-g", "daemon off;"]` | Starts Nginx in the foreground (required for Docker — if the process goes to background, Docker thinks the container exited). |

**Why multi-stage?**
- Stage 1 image with Node.js + all dependencies = ~500MB+
- Final image with just Nginx + static files = ~30MB
- You get a tiny, fast, production-ready image

---

### 3. Nginx Configuration (`frontend/nginx.conf`)

```nginx
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    location /api/ {
        proxy_pass http://backend:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

**This file lives INSIDE the frontend Docker image** — you do NOT install Nginx on the EC2 server.

| Block | What it does |
|-------|-------------|
| `listen 80` | Nginx listens on port 80 (HTTP) inside the container. |
| `root /usr/share/nginx/html` | Serves static files from this directory (where we copied the Vite build output). |
| `location /api/` | Any request starting with `/api/` gets forwarded to the backend container on port 3000. `backend` is the container name — Docker's internal DNS resolves it to the backend container's IP. |
| `proxy_set_header` | Passes the original client IP and hostname to the backend so it knows who the real client is. |
| `location /` | For all other routes, tries to serve the file directly. If no file is found, serves `index.html` — this is essential for React Router to handle client-side routing (e.g., `/login`, `/dashboard`). |

**How API requests flow:**
```
Browser → http://your-ec2:80/api/auth/login
  → Nginx (inside frontend container) sees /api/ prefix
  → Proxies to http://backend:3000/api/auth/login
  → Backend Express server handles the request
  → Response flows back: Backend → Nginx → Browser
```

---

### 4. Docker Compose (`docker-compose.yml`)

```yaml
services:
  backend:
    build: ./backend
    image: ${DOCKERHUB_USERNAME}/stack-backend:latest
    ports:
      - "3000:3000"
    env_file:
      - ./backend/.env

  frontend:
    build: ./frontend
    image: ${DOCKERHUB_USERNAME}/stack-frontend:latest
    ports:
      - "80:80"
```

This file is for **local development** — it lets you build and run both containers with one command.

| Field | What it does |
|-------|-------------|
| `build: ./backend` | Tells Docker to build the image using the Dockerfile in the `./backend` directory. |
| `image: .../stack-backend:latest` | Tags the built image with this name so it can be pushed to Docker Hub. |
| `ports: "3000:3000"` | Maps host port 3000 → container port 3000. Format is `host:container`. |
| `env_file` | Loads environment variables from the `.env` file (for local use). |

**Usage:**
```bash
# Build and start both containers
docker compose up -d

# Stop both
docker compose down

# Rebuild after code changes
docker compose up -d --build
```

---

### 5. `.dockerignore` Files

**`backend/.dockerignore`:**
```
node_modules
.env
npm-debug.log
```

**`frontend/.dockerignore`:**
```
node_modules
dist
npm-debug.log
```

These work like `.gitignore` but for Docker. They prevent files from being copied into the image during `COPY` commands.

| Excluded | Why |
|----------|-----|
| `node_modules` | Dependencies are installed fresh inside the container via `npm install`. Copying local `node_modules` would be slow and may have wrong platform binaries (Windows vs Linux). |
| `.env` | Prevents secrets from being baked into the image (though in our case, ENV vars are set in the Dockerfile). |
| `dist` | Frontend build output — regenerated inside the container during the multi-stage build. |

---

## CI/CD Pipeline (`.github/workflows/ci.yml`)

### Complete Flow

```
Developer pushes to main
         │
         ▼
┌─────────────────┐
│   TEST JOB      │
│                 │
│  1. Checkout    │
│  2. Setup Node  │
│  3. npm install │  (backend + frontend)
│  4. npm test    │  (Jest + Vitest)
│  5. npm build   │  (Vite build check)
│                 │
│  If tests fail  │──→ Pipeline stops. No deployment.
└────────┬────────┘
         │ Tests pass
         ▼
┌─────────────────────┐
│  DOCKER BUILD &     │
│  PUSH JOB           │
│                     │
│  1. Checkout code   │
│  2. Login to        │
│     Docker Hub      │
│  3. docker build    │  (backend image)
│  4. docker push     │  (backend → Docker Hub)
│  5. docker build    │  (frontend image)
│  6. docker push     │  (frontend → Docker Hub)
│                     │
│  If build fails     │──→ Pipeline stops. No deployment.
└────────┬────────────┘
         │ Images pushed
         ▼
┌─────────────────────┐
│  DEPLOY JOB         │
│                     │
│  1. SSH into EC2    │
│  2. docker pull     │  (pull latest backend image)
│  3. docker pull     │  (pull latest frontend image)
│  4. docker stop     │  (stop old containers)
│  5. docker rm       │  (remove old containers)
│  6. docker network  │  (create network if needed)
│  7. docker run      │  (start new backend)
│  8. docker run      │  (start new frontend)
│  9. docker prune    │  (clean up old images)
│                     │
└─────────────────────┘
         │
         ▼
    App is live!
```

### GitHub Secrets Required

These are stored in: **GitHub Repo → Settings → Secrets and variables → Actions**

| Secret | Value | Used For |
|--------|-------|----------|
| `DOCKERHUB_USERNAME` | Your Docker Hub username | Tagging and pushing images |
| `DOCKERHUB_TOKEN` | Docker Hub access token | Authenticating with Docker Hub (NOT your password — generate a token at hub.docker.com → Account Settings → Security) |
| `EC2_HOST` | EC2 public IP or DNS | SSH connection target |
| `EC2_USER` | `ubuntu` or `ec2-user` | SSH username |
| `EC2_SSH_KEY` | Contents of your `.pem` file | SSH authentication |

---

## How Docker Networking Works

When both containers run on the same Docker network, they can talk to each other using container names as hostnames.

```
┌──────────────────── Docker Network: "stack" ────────────────────┐
│                                                                  │
│  ┌─────────────────────┐       ┌─────────────────────────────┐  │
│  │  Container: backend │       │  Container: frontend        │  │
│  │                     │       │                             │  │
│  │  Node.js + Express  │◄──────│  Nginx                     │  │
│  │  Listening on :3000 │       │  Proxies /api/ → backend   │  │
│  │                     │       │  Serves static files       │  │
│  │  Accessible as:     │       │  Listening on :80          │  │
│  │  "backend:3000"     │       │                             │  │
│  └─────────────────────┘       └─────────────────────────────┘  │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
         │                                │
         │ -p 3000:3000                   │ -p 80:80
         ▼                                ▼
    Host port 3000                   Host port 80
    (optional, for                   (public access)
     direct API access)
```

**Key concept:** `docker network create stack` creates an internal network. When you run containers with `--network stack`, Docker provides built-in DNS — the container name becomes a hostname. So `http://backend:3000` inside the frontend container resolves to the backend container's IP.

Without a Docker network, containers are isolated and cannot find each other by name.

---

## EC2 Server Setup

### What you need on EC2

Only **Docker**. Nothing else — no Node.js, no Nginx, no pm2.

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
sudo apt install docker.io -y
sudo systemctl start docker
sudo systemctl enable docker

# Allow your user to run docker without sudo
sudo usermod -aG docker $USER

# IMPORTANT: Logout and login again for the group change to take effect
exit
# Then SSH back in
```

### EC2 Security Group (Inbound Rules)

| Port | Protocol | Source | Purpose |
|------|----------|--------|---------|
| 22 | TCP | Your IP | SSH access |
| 80 | TCP | 0.0.0.0/0 | Frontend (Nginx serves the React app) |
| 3000 | TCP | 0.0.0.0/0 | Backend API (optional — Nginx already proxies /api/) |

---

## Useful Docker Commands (Run on EC2)

### Viewing Logs
```bash
# See backend logs (live)
docker logs -f backend

# See frontend/nginx logs (live)
docker logs -f frontend

# See last 100 lines of backend logs
docker logs --tail 100 backend
```

### Container Status
```bash
# See running containers
docker ps

# See all containers (including stopped)
docker ps -a

# Check container resource usage (CPU, memory)
docker stats
```

### Debugging
```bash
# Open a shell inside the backend container
docker exec -it backend sh

# Open a shell inside the frontend container
docker exec -it frontend sh

# Check if backend is actually responding
docker exec frontend curl http://backend:3000/api/health
```

### Restarting
```bash
# Restart a specific container
docker restart backend
docker restart frontend

# Stop and remove everything, then redeploy
docker stop backend frontend
docker rm backend frontend
docker network create stack 2>/dev/null || true
docker pull YOUR_USERNAME/stack-backend:latest
docker pull YOUR_USERNAME/stack-frontend:latest
docker run -d --name backend --network stack --restart always -p 3000:3000 YOUR_USERNAME/stack-backend:latest
docker run -d --name frontend --network stack --restart always -p 80:80 YOUR_USERNAME/stack-frontend:latest
```

### Cleanup
```bash
# Remove unused images (saves disk space)
docker image prune -f

# Remove everything (containers, images, networks)
docker system prune -a
```

---

## Auto-Restart on Crash

Use `--restart always` when running containers to ensure they automatically restart if they crash or if the EC2 instance reboots:

```bash
docker run -d --name backend --network stack --restart always -p 3000:3000 YOUR_USERNAME/stack-backend:latest
```

| Restart Policy | Behavior |
|---------------|----------|
| `no` | Never restart (default) |
| `always` | Always restart, even after reboot |
| `on-failure` | Restart only if the container exits with an error |
| `unless-stopped` | Like `always`, but not if you manually stopped it |

---

## How to Access the Application

Once deployed, your app is available at:

- **Frontend:** `http://<EC2-PUBLIC-IP>` or `http://<EC2-PUBLIC-DNS>`
- **Backend API:** Requests to `http://<EC2-PUBLIC-IP>/api/...` are automatically proxied to the backend by Nginx

No domain name is required — the EC2 public IP or public DNS works directly.

---

## Summary: What Runs Where

| Component | Where it runs | What it does |
|-----------|--------------|-------------|
| GitHub Actions | GitHub servers | Runs tests, builds Docker images, pushes to Docker Hub, SSHes into EC2 |
| Docker Hub | Docker's cloud | Stores your built images so any server can pull them |
| EC2 Instance | AWS cloud | Runs Docker, which runs your frontend and backend containers |
| Nginx | Inside frontend container | Serves React app + proxies API requests to backend |
| Node.js + Express | Inside backend container | Handles API requests, connects to MongoDB Atlas |
| MongoDB Atlas | MongoDB's cloud | Database (not in Docker — runs as a managed cloud service) |
