# 🏗️ SiteForge

A modern full-stack Construction Project Management System designed to streamline project planning, budgeting, resource allocation, daily site operations, and team collaboration.

## 📖 Project Overview

SiteForge is a web-based Construction Project Management System that enables organizations to efficiently manage construction projects from planning to completion.

The platform provides secure authentication, project and phase management, budget tracking, resource allocation, daily site logs, document management, and reporting through an intuitive dashboard.

## ✨ Features

- 🔐 Secure User Authentication (JWT)
- 👥 Role-Based Access Control
- 📁 Project Management
- 🏗️ Project Phase Management
- 💰 Budget Planning & Tracking
- 👷 Resource Allocation
- 📝 Daily Site Logs
- 📄 Document Management
- 📊 Reports & Analytics
- 📱 Responsive User Interface

## 📸 Screenshots
1 login.png

## 🛠️ Technology Stack

### Frontend
- React
- Vite
- CSS

### Backend
- Node.js
- Express.js

### Database
- PostgreSQL

### Authentication
- JWT

### Deployment
- Vercel
- Render

### Version Control
- Git
- GitHub

## 🏛️ System Architecture

![Architecture](screenshots/architecture.png)

## 📂 Project Structure

siteforge/
├── client/
├── server/
├── docs/
├── screenshots/
├── README.md
└── docker-compose.yml

## 🚀 Installation

```bash
git clone https://github.com/shriharini31/siteforge.git

cd siteforge

docker compose up --build
```

## 💻 Local Development

### Clone the Repository

```bash
git clone https://github.com/shriharini31/siteforge.git
cd siteforge
```

### Run with Docker

```bash
docker compose up --build
```

Open the application:

- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:4000

### Run without Docker

```bash
# Backend
cd server
npm install
npm run dev

# Frontend
cd client
npm install
npm run dev
```

## 🌐 Deployment

- **Frontend:** Vercel
- **Backend:** Render
- **Database:** PostgreSQL

### Environment Variables

**Render**

- DATABASE_URL
- CLIENT_ORIGIN
- JWT_SECRET
- REFRESH_SECRET
- NODE_ENV=production

**Vercel**

- VITE_API_BASE_URL

✅ After adding the environment variables, redeploy both the frontend and backend.

🏗️ SiteForge
📖 Project Overview
✨ Features
📸 Screenshots
🛠️ Technology Stack
📂 Project Structure
💻 Local Development
🌐 Deployment
🚀 Future Enhancements
👩‍💻 Author
