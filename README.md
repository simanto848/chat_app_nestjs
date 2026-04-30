# Anonymous Chat API

A real-time group chat service built with NestJS, PostgreSQL, Drizzle ORM, and Redis.

## Features

- **Anonymous Login**: Start chatting instantly with just a username.
- **Real-time Communication**: Group chat rooms powered by Socket.io.
- **Message History**: Paginated chat history stored in PostgreSQL.
- **High Performance**: Redis used for WebSocket adapter and pub/sub.
- **API Documentation**: Interactive Swagger UI.

---

## Prerequisites

- **Node.js**: v18 or higher
- **Docker & Docker Compose**: For running PostgreSQL and Redis
- **npm**: Package manager

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/simanto848/chat_app_nestjs.git
cd chat_app_nestjs
```

### 2. Environment Setup

Create a `.env` file in the root directory and configure your environment variables. You can use the provided `.env.example` as a template:

```bash
cp .env.example .env
```

#### Demo Environment Variables

| Variable | Description | Demo/Default Value |
| :--- | :--- | :--- |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://chatuser:chatpassword@localhost:5432/chatdb` |
| `POSTGRES_USER` | PostgreSQL username | `chatuser` |
| `POSTGRES_PASSWORD` | PostgreSQL password | `chatpassword` |
| `POSTGRES_DB` | PostgreSQL database name | `chatdb` |
| `REDIS_HOST` | Hostname for Redis | `localhost` |
| `REDIS_PORT` | Port for Redis | `6379` |
| `SESSION_EXPIRY_SECONDS` | Token expiration time | `86400` (24 hours) |
| `PORT` | Application port | `3000` |

### 3. Start Infrastructure

Use Docker Compose to spin up the required PostgreSQL and Redis instances:

```bash
docker-compose up -d
```

### 4. Install Dependencies

```bash
npm install
```

### 5. Database Migrations

Push the schema to your database using Drizzle Kit:

```bash
npx drizzle-kit push
```

### 6. Run the Application

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

---

## API & Documentation

### Swagger Documentation
The API documentation is available via Swagger UI. Once the application is running, you can access it at:

👉 **[http://localhost:3000/api/v1/docs](http://localhost:3000/api/v1/docs)**

This interactive documentation allows you to test the API endpoints directly from your browser.

### Key Endpoints
- **POST `/api/v1/login`**: Login with a username to get a session token.
- **GET `/api/v1/rooms`**: List all available chat rooms.
- **POST `/api/v1/rooms`**: Create a new chat room.
- **GET `/api/v1/rooms/:id/messages`**: Fetch message history for a room.

---

## WebSocket Interface

Connect to the WebSocket server at `ws://localhost:3000/chat`.

### Authentication
Include the following in your connection handshake:
- `token`: The session token obtained from the login endpoint.
- `roomId`: The ID of the room you wish to join.

---

## Tech Stack

- **Framework**: [NestJS](https://nestjs.com/)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
- **Cache/PubSub**: [Redis](https://redis.io/)
- **Real-time**: [Socket.io](https://socket.io/)
