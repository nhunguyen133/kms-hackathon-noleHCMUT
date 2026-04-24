# ThinkFirst - Smart LMS Platform

ThinkFirst is an innovative Learning Management System (LMS) designed to combat passive learning and "brainrot" through the integration of Socratic AI. Instead of providing direct answers, the platform employs an AI Tutor that guides students through critical thinking, adaptive testing, and personalized learning paths.

This project was developed for the HCMUT Education Hackathon 2026.

## Core Features

### Socratic AI Tutor
A specialized AI Teaching Assistant that uses the Socratic method. It encourages students to arrive at answers through guided questioning and step-by-step reasoning. The AI transitions from purely questioning to providing scaffolding as students demonstrate effort.

### Adaptive Quiz Engine
An intelligent testing system that adjusts the difficulty level (Easy, Medium, Hard) in real-time based on student performance. It analyzes weak topics and provides detailed summaries to help students focus their studies.

### Early Warning System (EWS)
An automated monitoring system that identifies students at risk of falling behind. It triggers alerts based on consecutive low scores, inactivity, or stagnant progress, allowing instructors to intervene early.

### Personalized Learning Path
Dynamic roadmap generation that prioritizes lessons based on a student's analyzed weak topics and overall progress, ensuring a customized educational journey for every user.

## Technology Stack

### Frontend
- Framework: React 18 with Vite
- Styling: Vanilla CSS / TailwindCSS
- Icons: Lucide React
- Routing: React Router DOM
- Animation: Framer Motion

### Backend
- Runtime: Node.js
- Framework: Express.js
- Database: PostgreSQL (Neon)
- AI Integration: Google Gemini 2.0 / OpenAI API
- Task Scheduling: Node-cron

## Project Structure

- /frontend: React application (Vite)
- /backend: Express.js API server
- /docs: Project documentation
- docker-compose.yml: Container orchestration

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- Docker and Docker Compose
- PostgreSQL database (or access to a Neon DB instance)
- Gemini API Key

### Running with Docker (Recommended)

The easiest way to get the full stack running is using Docker Compose:

1. Clone the repository.
2. Ensure you have a `.env` file in the `backend/` directory with the required variables.
3. Run the following command in the root directory:
   
   docker-compose up --build

The frontend will be accessible at http://localhost:80 and the backend at http://localhost:5000.

### Manual Setup

#### Backend
1. Navigate to the backend directory: `cd backend`
2. Install dependencies: `npm install`
3. Configure `.env` file.
4. (Optional) Initialize database: `npm run db:init`
5. Start the server: `npm run dev`

#### Frontend
1. Navigate to the frontend directory: `cd frontend`
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`

## Environment Variables

Create a `.env` file in the `backend/` directory with the following keys:

- DATABASE_URL: PostgreSQL connection string
- JWT_SECRET: Secret key for token signing
- GEMINI_API_KEY: Google Generative AI API Key
- PORT: Server port (default: 5000)

## Architecture

For a detailed breakdown of the system architecture, database schema, and module designs, please refer to ARCHITECTURE.md.

## Team
Developed by the ThinkFirst Team for the HCMUT Education Hackathon 2026.
