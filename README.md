# KABAS
Kanban Board Assessment System (KABAS)

## Project Structure

```
server/
├── index.js                          # Entry point - starts the Express server
├── package.json
├── src/
│   ├── config/
│   │   ├── app.js                    # Express app setup, middleware registration, route mounting
│   │   └── db.js                     # Database connection configuration
│   ├── controllers/                  # Route handlers - parse requests and send responses
│   ├── db/
│   │   ├── migrations/               # Versioned database schema changes
│   │   └── seeds/                    # Initial or test data for populating tables
│   ├── middleware/                    # Reusable middleware functions (auth, validation, etc.)
│   │   └── errorHandler.js           # Global error handling middleware
│   ├── models/                       # Data shape and schema definitions
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

### Key Files

- **`server/index.js`** - Application entry point. Loads the Express app from `src/config/app.js` and starts listening on the configured port.
- **`src/config/app.js`** - Creates the Express app instance, registers global middleware (JSON parsing, URL encoding), and mounts all routes.
- **`src/config/db.js`** - Database connection setup. Configure your database credentials and connection pool here.
- **`src/routes/index.js`** - Central route file. As the app grows, import and mount sub-routers here (e.g. `/api/users`, `/api/boards`).
- **`src/middleware/errorHandler.js`** - Catches unhandled errors and returns a consistent JSON error response.
