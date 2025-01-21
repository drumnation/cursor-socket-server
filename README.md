# Cursor WebSocket Client

A globally installable WebSocket client that runs as a child process with structured logging capabilities, designed for communication between Cursor IDE and Roo extension.

## Requirements

- Node.js >= 18.0.0
- pnpm >= 8.0.0

## Installation

Install globally using pnpm (recommended):

```bash
pnpm add -g @cursor/socket-server
```

Or using npm:

```bash
npm install -g @cursor/socket-server
```

Or using yarn:

```bash
yarn global add @cursor/socket-server
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

### Message Protocol

The client uses a structured message protocol for communication:

1. **System Messages**:

```typescript
{
    role: 'system',
    type: 'initialization' | 'configuration' | 'termination',
    content: string
}
```

2. **User Messages**:

```typescript
{
    role: 'user',
    type: 'command' | 'query' | 'response',
    content: string
}
```

3. **AI Messages**:

```typescript
{
    role: 'ai',
    type: 'completion' | 'analysis' | 'suggestion',
    content: string
}
```

### WebSocket Events

The client handles these WebSocket events:

1. **Connection Events**:

```json
{
    "type": "connection",
    "status": "connected",
    "data": "ws://localhost:8080"
}
```

2. **Message Events**:

```json
{
    "type": "message",
    "data": {
        "role": "user",
        "type": "command",
        "content": "analyze code"
    }
}
```

3. **Error Events**:

```json
{
    "type": "error",
    "message": "Connection failed"
}
```

### Viewing Logs

The client uses Winston for robust logging, writing all activity to `~/.cursor-socket.log`. Logs are automatically rotated (5MB max size, keeping last 5 files) and include colorized console output.

View logs using the built-in commands:

```bash
# View last 10 lines of logs
cursor-socket-logs tail

# View last N lines of logs
cursor-socket-logs tail 20

# Follow logs in real-time
cursor-socket-logs follow
```

### Log Format

Logs are stored in a concise JSON format with Winston enhancements:

```json
{
    "t": "10:30:45 PM",
    "l": "INFO",
    "m": "WebSocket connected",
    "d": {
        "url": "ws://localhost:8080",
        "data": {
            "role": "system",
            "type": "initialization",
            "content": "Connected to Roo instance"
        }
    }
}
```

Fields:

- `t`: Timestamp (human-readable time)
- `l`: Log level (INFO, ERROR, DEBUG)
- `m`: Message
- `d`: Additional data (optional)
- `meta`: Structured message data (when applicable)

### Log Features

1. **Log Rotation**:
   - Maximum file size: 5MB
   - Keeps last 5 log files
   - Automatic rotation

2. **Console Output**:
   - Colorized by log level
   - Real-time display
   - Formatted for readability

3. **Log Types**:

   Connection Events:

   ```json
   {"t":"10:30:45 PM","l":"INFO","m":"WebSocket connected","d":{"url":"ws://localhost:8080"}}
   {"t":"10:30:46 PM","l":"INFO","m":"WebSocket disconnected"}
   ```

   Message Events:

   ```json
   {"t":"10:30:47 PM","l":"DEBUG","m":"Sent message to WebSocket","d":{"message":"Hello"}}
   {"t":"10:30:48 PM","l":"DEBUG","m":"Received WebSocket message","d":{"data":"Response"}}
   ```

   Error Events (with stack traces):

   ```json
   {"t":"10:30:49 PM","l":"ERROR","m":"Failed to send message","d":{"reason":"Client not connected","stack":"..."}}
   ```

## Architecture

- `index.ts`: Main WebSocket manager that spawns and manages the client process
- `wsClient.ts`: WebSocket client implementation that runs as a child process
- `logs.ts`: Command-line interface for viewing logs
- `types.ts`: TypeScript type definitions for messages and logging

## Development

1. Clone the repository:

```bash
git clone https://github.com/cursor/socket-server.git
cd socket-server
```

2. Install dependencies:

```bash
pnpm install
```

3. Run locally:

```bash
pnpm start
```

4. Run tests:

```bash
# Run tests once
pnpm test

# Run tests in watch mode
pnpm test:watch
```

5. Lint code:

```bash
# Check for linting issues
pnpm lint

# Fix linting issues
pnpm lint:fix
```

## License

ISC

# cursor-socket-server
