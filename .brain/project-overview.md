# Cursor WebSocket Bridge - Project Overview

## Purpose

This project serves as a WebSocket communication bridge between Cursor IDE and the Roo VSCode extension. It enables real-time bidirectional communication by:

1. Running as a child process within Cursor's terminal
2. Connecting to the WebSocket server hosted by the Roo extension
3. Facilitating message passing between Cursor and Roo

## System Architecture

```
┌─────────────┐         ┌──────────────────┐         ┌────────────┐
│   Cursor    │         │  WebSocket       │         │    Roo     │
│    IDE      │◄─────►  │  Bridge Client   │◄─────►  │ Extension  │
│             │         │  (Child Process)  │         │ (Server)   │
└─────────────┘         └──────────────────┘         └────────────┘
    Parent               Intermediary                 WebSocket Server
```

## Key Components

1. **WebSocket Client Manager** (`index.js`)
   - Spawned as a child process by Cursor
   - Manages the WebSocket connection lifecycle
   - Handles process communication with Cursor
   - Provides structured logging

2. **WebSocket Client** (`wsClient.js`)
   - Maintains WebSocket connection with Roo
   - Handles message serialization/deserialization
   - Implements reconnection logic
   - Reports connection status

3. **Logging System** (`logs.js`)
   - Provides structured JSON logging
   - Enables global log access
   - Facilitates debugging and monitoring

## Communication Flow

1. **Cursor → Roo**
   ```
   Cursor → stdin → WebSocket Client → WebSocket → Roo Extension
   ```

2. **Roo → Cursor**
   ```
   Roo Extension → WebSocket → WebSocket Client → stdout → Cursor
   ```

## Integration Points

1. **Cursor Integration**
   - Spawns the WebSocket client as a child process
   - Communicates via stdin/stdout
   - Monitors client health and logs

2. **Roo Extension Integration**
   - Runs WebSocket server
   - Accepts connections from the client
   - Processes and responds to messages

## Logging Strategy

The logging system is designed to be:
1. Machine-readable (JSON format)
2. Globally accessible
3. Real-time monitorable
4. Concise for agent consumption

## Future Considerations

1. **Security**
   - Message encryption
   - Authentication mechanisms
   - Connection validation

2. **Reliability**
   - Automatic reconnection
   - Message queuing
   - Error recovery

3. **Scalability**
   - Multiple client support
   - Message batching
   - Performance optimization
