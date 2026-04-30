# Anonymous Chat API

A real-time group chat service built with NestJS, PostgreSQL, Drizzle ORM, and Redis.

## Prerequisites

- Node.js (v18+)
- Docker and Docker Compose

## Quick Start

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd chat-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start infrastructure**
   ```bash
   docker-compose up -d
   ```

4. **Run migrations**
   ```bash
   npx drizzle-kit push
   ```

5. **Start the application**
   ```bash
   npm run start:dev
   ```

The API will be available at `http://localhost:3000/api/v1`.

## API Documentation

- **POST /login**: `{"username": "string"}` - Returns session token.
- **GET /rooms**: List all rooms.
- **POST /rooms**: `{"name": "string"}` - Create a room.
- **GET /rooms/:id**: Get room details.
- **DELETE /rooms/:id**: Delete a room (Creator only).
- **GET /rooms/:id/messages**: Paginated history.
- **POST /rooms/:id/messages**: `{"content": "string"}` - Send message.

## WebSocket

Connect to `ws://localhost:3000/chat` with:
- `token`: Session token
- `roomId`: Target room ID

### Events
- `room:joined`: Current active users.
- `room:user_joined`: Notification of new user.
- `message:new`: New message broadcast.
- `room:user_left`: Notification of user leaving.
- `room:deleted`: Room closed notification.

## Tech Stack

- **Framework**: NestJS
- **Database**: PostgreSQL + Drizzle ORM
- **Cache/PubSub**: Redis
- **Real-time**: Socket.io
