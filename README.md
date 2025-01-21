# Cursor WebSocket Client

A globally installable WebSocket client that runs as a child process with structured logging capabilities.

## Installation

Install globally using npm:

```bash
npm install -g @cursor/socket-server
```

Or using yarn:

```bash
yarn global add @cursor/socket-server
```

Using pnpm:

```bash
pnpm add -g @cursor/socket-server
```

## Usage

### Starting the WebSocket Client

Basic usage with default URL (ws://localhost:8080):
```bash
cursor-socket
```

Specify a different URL:
```bash
cursor-socket "ws://example.com:8080"
```

Connect to a specific port (useful for multiple Roo instances):
```bash
cursor-socket "ws://localhost" 8080
cursor-socket "ws://localhost" 8081  # Another instance
```

You can run multiple instances of the client to connect to different Roo servers:
```bash
# Terminal 1 - Connect to Roo instance on port 8080
cursor-socket "ws://localhost" 8080

# Terminal 2 - Connect to another Roo instance on port 8081
cursor-socket "ws://localhost" 8081
```

### Viewing Logs

The client logs all activity to `~/.cursor-socket.log` in a structured JSON format. Two commands are available to view logs:

```bash
# View last 10 lines of logs
cursor-socket-logs tail

# View last N lines of logs
cursor-socket-logs tail 20

# Follow logs in real-time
cursor-socket-logs follow
```

### Log Format

Logs are stored in a concise JSON format:

```json
{"t":"10:30:45 PM","l":"INFO","m":"WebSocket connected","d":{"url":"ws://localhost:8080"}}
```

Fields:

- `t`: Timestamp
- `l`: Log level (INFO, ERROR, DEBUG)
- `m`: Message
- `d`: Additional data (optional)

### Log Types

1. Connection Events:

```json
{"t":"10:30:45 PM","l":"INFO","m":"WebSocket connected","d":{"url":"ws://localhost:8080"}}
{"t":"10:30:46 PM","l":"INFO","m":"WebSocket disconnected"}
```

2. Message Events:

```json
{"t":"10:30:47 PM","l":"DEBUG","m":"Sent message to WebSocket","d":{"message":"Hello"}}
{"t":"10:30:48 PM","l":"DEBUG","m":"Received WebSocket message","d":{"data":"Response"}}
```

3. Error Events:

```json
{"t":"10:30:49 PM","l":"ERROR","m":"Failed to send message","d":{"reason":"Client not connected"}}
```

## Architecture

- `index.js`: Main WebSocket manager that spawns and manages the client process
- `wsClient.js`: WebSocket client implementation that runs as a child process
- `logs.js`: Command-line interface for viewing logs

## Development

1. Clone the repository:

```bash
git clone https://github.com/cursor/socket-server.git
```

2. Install dependencies:

```bash
# Using npm
npm install

# Using yarn
yarn install

# Using pnpm
pnpm install
```

3. Run locally:

```bash
# Using npm
npm start

# Using yarn
yarn start

# Using pnpm
pnpm start
```

## License

ISC
# cursor-socket-server
