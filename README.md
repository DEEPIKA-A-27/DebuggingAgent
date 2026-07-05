# AI Debugging Agent

A production-ready AI-powered web application for automated code debugging, error detection, code correction, optimization, and test case generation using Google Gemini LLM.

## Project Overview

The AI Debugging Agent helps developers debug programs written in **Java**, **Python**, **C++**, and **JavaScript**. It automatically detects syntax and logical errors, explains them in beginner-friendly language, generates corrected and optimized code, creates test cases, estimates algorithm complexity, and recommends learning topics.

## Features

- **Multi-Language Support** — Java, Python, C++, JavaScript
- **AI-Powered Error Detection** — Syntax and logical error identification
- **Beginner-Friendly Explanations** — Clear error descriptions
- **Code Correction & Optimization** — AI-generated fixes with explanations
- **Test Case Generation** — Normal, boundary, and edge test cases
- **Complexity Analysis** — Time and space complexity estimation
- **Learning Recommendations** — Personalized topic suggestions
- **Debug History** — Searchable analysis history stored in MySQL
- **PDF Reports** — Downloadable analysis reports
- **JWT Authentication** — Secure user registration and login
- **Dark/Light Mode** — Professional responsive UI
- **Docker Deployment** — One-command deployment with Docker Compose

## Technology Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React.js, Tailwind CSS, React Router, Axios, Monaco Editor |
| Backend | Node.js, Express.js |
| Database | MySQL |
| Authentication | JWT, bcrypt |
| AI | Google Gemini LLM |
| Deployment | Docker, Docker Compose |

## Folder Structure

```
DebuggingAgent/
├── backend/
│   ├── src/
│   │   ├── config/          # Database & Gemini configuration
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/      # Auth, validation, error handling
│   │   ├── models/          # Database models
│   │   ├── routes/          # API route definitions
│   │   ├── services/        # Business logic & AI agent
│   │   ├── utils/           # Prompt builder, PDF generator
│   │   ├── app.js           # Express app setup
│   │   └── server.js        # Server entry point
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── context/         # Auth & theme context
│   │   ├── pages/           # Application pages
│   │   ├── services/        # API service layer
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── Dockerfile
│   └── package.json
├── database/
│   └── init.sql             # MySQL schema
├── docker-compose.yml
└── README.md
```

## Installation

### Prerequisites

- Node.js 18+
- MySQL 8.0+
- Google Gemini API Key ([Get one here](https://aistudio.google.com/app/apikey))

### Clone the Repository

```bash
git clone <repository-url>
cd DebuggingAgent
```

## Environment Variables

### Backend (`backend/.env`)

```env
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=debugging_agent
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d
GEMINI_API_KEY=your_gemini_api_key
FRONTEND_URL=http://localhost:5173
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:5000/api
```

## MySQL Setup

1. Start MySQL server
2. Run the initialization script:

```bash
mysql -u root -p < database/init.sql
```

Or the schema will auto-initialize when using Docker Compose.

## Gemini API Configuration

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create an API key
3. Set `GEMINI_API_KEY` in your backend `.env` file

## Running Locally

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials
npm run dev
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Docker Deployment

1. Create a `.env` file in the project root:

```env
DB_PASSWORD=rootpassword
DB_NAME=debugging_agent
JWT_SECRET=your_production_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
```

2. Start all services:

```bash
docker compose up --build
```

3. Access the application at [http://localhost](http://localhost)

## API Documentation

### Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| GET | `/api/auth/profile` | Get user profile | Yes |

**Register Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```

**Login Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### Debug Analysis

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/debug/languages` | Get supported languages | No |
| POST | `/api/debug/analyze` | Run AI analysis | Yes |
| POST | `/api/debug/pdf` | Generate PDF report | Yes |

**Analyze Body:**
```json
{
  "code": "def add(a, b):\n    return a + b",
  "language": "Python",
  "saveHistory": true
}
```

**Analyze Response:**
```json
{
  "success": true,
  "data": {
    "historyId": 1,
    "originalCode": "...",
    "language": "Python",
    "syntaxErrors": [],
    "logicalErrors": [],
    "correctedCode": "...",
    "optimizedCode": "...",
    "optimizationExplanation": "...",
    "testCases": [],
    "boundaryTestCases": [],
    "edgeTestCases": [],
    "expectedOutputs": [],
    "bestPractices": [],
    "timeComplexity": "O(1)",
    "spaceComplexity": "O(1)",
    "learningTopics": []
  }
}
```

### History

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/history/save` | Save analysis | Yes |
| GET | `/api/history` | List all history | Yes |
| GET | `/api/history/stats` | Dashboard stats | Yes |
| GET | `/api/history/:id` | Get single record | Yes |
| DELETE | `/api/history/:id` | Delete record | Yes |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | API health status |

## Security Features

- JWT token-based authentication
- bcrypt password hashing (12 salt rounds)
- Helmet security headers
- CORS configuration
- Rate limiting (100 req/15min general, 10 req/min for analysis)
- Input validation with express-validator
- Centralized error handling
- Environment variable configuration

## Future Enhancements

- Real-time collaborative debugging
- IDE plugin integration (VS Code extension)
- Code execution sandbox
- Support for additional languages (Go, Rust, TypeScript)
- Team workspaces and shared history
- AI chat follow-up for clarifications
- CI/CD pipeline integration
- OAuth social login (Google, GitHub)

## License

This project is developed as a Final Year Project for academic purposes.
