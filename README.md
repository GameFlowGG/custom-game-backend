# game-backend

<a href="https://console.deno.com/new?clone=https://github.com/GameFlowGG/game-backend"><img src="https://deno.com/button" alt="Deploy on Deno"/></a>

A lightweight game backend template using **Deno**, **SQLite**, **WebSockets**, and **KV Store**, designed to be deployed to [Deno Deploy](https://deno.com/deploy) in seconds.

## Features

- **SQLite** for persistent account storage
- **KV Store** for lobby and session management
- **Native WebSockets** for real-time multiplayer
- **Discord OAuth Integration**
- **Lobby System** for team-based games
- **Real-time Updates** via WebSocket pub/sub
- **Game Server Allocation** via [GameFlow API](https://docs.gameflow.gg/api/gameflow-api)

## Setup

1. **Copy environment variables:**
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` and set your JWT secret:**
   ```
   PORT=3000
   JWT_SECRET=your-secret-key
   ```

## Running the Server

### Development mode (with auto-reload):
```bash
deno task dev
```

### Production mode:
```bash
deno task start
```

The server will start on `http://localhost:3000` (or the port specified in `.env`).

## API Endpoints

### REST API

- `GET /` - API information
- `POST /auth/discord` - Authenticate with Discord token
- `POST /auth/anonymous` - Anonymous authentication
- `GET /accounts/me` - Get current user info (requires auth)
- `GET /lobbies` - List all public lobbies (requires auth)

### WebSocket

Connect to `ws://localhost:3000/_ws?token=JWT_TOKEN`

### WebSocket Messages

**Game Client → Backend**

| Type | Payload | Description |
|------|---------|-------------|
| `ping` | - | Ping server |
| `lobby:create` | `isPrivate: boolean` | Create lobby |
| `lobby:join` | `lobbyId?: string, code?: string, team?: "A"\|"B"` | Join lobby |
| `lobby:leave` | - | Leave current lobby |
| `lobby:ready` | `ready: boolean` | Toggle ready status |
| `lobby:start` | - | Start match (owner only) |
| `lobby:fill-bots` | - | Fill empty slots with bots (owner only) |

**Backend → Game Client**

| Type | Payload | Description |
|------|---------|-------------|
| `connected` | `accountId, username` | Connection established |
| `pong` | - | Pong response |
| `lobby:created` | `lobby` | Lobby created |
| `lobby:updated` | `lobby` | Lobby state changed |
| `lobby:deleted` | `lobbyId` | Lobby deleted |
| `lobby:left` | - | Left lobby |
| `match:started` | `matchData` | Match started |
| `error` | `message` | Error occurred |

## Authentication Flow

### Discord Authentication

1. Client obtains Discord OAuth token
2. Client sends POST to `/auth/discord` with `{ discordToken: "..." }`
3. Server validates with Discord API
4. Server creates/updates account and returns JWT
5. Client uses JWT for API calls and WebSocket connection

```bash
curl -X POST http://localhost:3000/auth/discord \
  -H "Content-Type: application/json" \
  -d '{"discordToken":"your-discord-oauth-token"}'
```

### Anonymous Authentication

```bash
curl -X POST http://localhost:3000/auth/anonymous \
  -H "Content-Type: application/json" \
  -d '{"username":"joedoe"}'
```

## Production Deployment

### Deploy to [Deno Deploy](https://deno.com/deploy)

The quickest way to deploy is using the button below:

<a href="https://console.deno.com/new?clone=https://github.com/GameFlowGG/game-backend-template"><img src="https://deno.com/button" alt="Deploy on Deno"/></a>

Alternatively, deploy manually via the CLI:

1. Install Deno Deploy CLI: `deno install -Arf https://deno.land/x/deploy/deployctl.ts`
2. Deploy: `deployctl deploy --project=your-project main.ts`
