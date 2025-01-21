#!/usr/bin/env tsx

import WebSocket from 'ws';
import { URL } from 'url';
import { WebSocketMessage } from './types';

// Parse command line arguments
const args = process.argv.slice(2);
const baseUrl = args[0] || 'ws://localhost:8080';
const port = args[1] ? parseInt(args[1], 10) : null;

// Parse and modify URL if port is provided
let targetUrl = baseUrl;
if (port) {
    const parsedUrl = new URL(baseUrl);
    parsedUrl.port = port.toString();
    targetUrl = parsedUrl.toString();
}

// Create WebSocket connection
const ws = new WebSocket(targetUrl);

function sendMessage(message: WebSocketMessage): void {
    process.stdout.write(JSON.stringify(message) + '\n');
}

// Handle WebSocket events
ws.on('open', () => {
    sendMessage({ 
        type: 'connection', 
        status: 'connected', 
        data: targetUrl 
    });
});

ws.on('message', (data: WebSocket.RawData) => {
    sendMessage({ 
        type: 'message', 
        data: data.toString() 
    });
});

ws.on('close', () => {
    sendMessage({ 
        type: 'connection', 
        status: 'disconnected' 
    });
    process.exit(0);
});

ws.on('error', (error: Error) => {
    process.stderr.write(JSON.stringify({ 
        type: 'error', 
        message: error.message 
    }) + '\n');
});

// Handle process input
process.stdin.setEncoding('utf8');
process.stdin.on('data', (data: Buffer) => {
    try {
        const message = data.toString().trim();
        if (message) {
            ws.send(message);
        }
    } catch (error) {
        process.stderr.write(JSON.stringify({ 
            type: 'error', 
            message: 'Failed to send message' 
        }) + '\n');
    }
}); 