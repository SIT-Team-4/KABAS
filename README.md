# KABAS
Kanban Board Assessment System (KABAS)

## Prerequisites

### Node.js (v20+)
Download and install from [nodejs.org](https://nodejs.org/).

Verify installation:
```bash
node --version
npm --version
```

### Docker
Download and install [Docker Desktop](https://www.docker.com/products/docker-desktop/) for your OS.

Verify installation:
```bash
docker --version
docker-compose --version
```

## Getting Started

1. Clone the repository and install dependencies:
   ```bash
   git clone https://github.com/SIT-Team-4/KABAS.git
   cd KABAS/server
   npm install
   ```

2. Copy the environment template (from the repo root) and fill in your values:
   ```bash
   cd ..
   cp .env.example .env
   cd server
   ```

3. Start the MySQL container and Express server:
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3001/api/`.

## NPM Scripts

Run these from the `server/` directory:

| Script | Description |
|--------|-------------|
| `npm run dev` | Start MySQL container + Express with hot-reload |
| `npm start` | Start Express only (production) |
| `npm run db:up` | Start MySQL container |
| `npm run db:down` | Stop MySQL container |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/` | Welcome message |

## Project Structure

```
server/
├── index.js                          # Entry point - starts the Express server
├── package.json
├── src/
│   ├── config/
│   │   ├── app.js                    # Express app setup, middleware registration, route mounting
│   │   └── db.js                     # Database connection configuration (Sequelize + MySQL)
│   ├── controllers/                  # Route handlers - parse requests and send responses
│   ├── db/
│   │   ├── migrations/               # Versioned database schema changes
│   │   └── seeds/                    # Initial or test data for populating tables
│   ├── middleware/                    # Reusable middleware functions (auth, validation, etc.)
│   │   └── errorHandler.js           # Global error handling middleware
│   ├── models/                       # Sequelize model definitions
│   ├── repositories/                 # Database query layer - only layer that talks to the DB
│   ├── routes/                       # URL-to-controller mappings
│   │   └── index.js                  # Combines and exports all route definitions
│   ├── services/                     # Business logic layer
│   └── utils/                        # Shared helper functions
└── tests/                            # Unit and integration tests
```

### Request Flow

```
Route → Controller → Service → Repository → Database
```

| Layer          | Responsibility                                                                 |
|----------------|-------------------------------------------------------------------------------|
| **Routes**     | Define endpoints and HTTP methods, map them to controller functions            |
| **Controllers**| Parse incoming requests, call the appropriate service, and return a response   |
| **Services**   | Contain business logic and rules, orchestrate calls to repositories            |
| **Repositories**| Execute database queries. The only layer that interacts with the database directly |
| **Models**     | Define the shape and validation rules for data                                |
| **Middleware** | Functions that run before route handlers (authentication, logging, error handling) |
| **Config**     | Centralised app and database configuration                                    |