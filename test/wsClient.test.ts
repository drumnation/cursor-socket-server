import { test, describe } from 'node:test';
import assert from 'node:assert';
import { WebSocketServer } from 'ws';
import type { RawData } from 'ws';
import { spawn, ChildProcess } from 'child_process';
import path from 'path';
import { Message, WebSocketMessage } from '../src/types';

describe('WebSocket Client', () => {
    let wss: WebSocketServer;
    let clientProcess: ChildProcess;

    test.after(() => {
        // Cleanup resources
        if (wss) {
            wss.close();
        }
        if (clientProcess) {
            clientProcess.kill();
        }
    });

    test('should connect to WebSocket server', async () => {
        // Create a WebSocket server
        await new Promise<void>((resolve) => {
            wss = new WebSocketServer({ port: 8090 });
            wss.on('listening', resolve);
        });

        // Track connection status
        let isConnected = false;
        wss.on('connection', (ws) => {
            isConnected = true;
            ws.on('message', (data: RawData) => {
                const message = data.toString();
                const response: Message = {
                    role: 'ai',
                    type: 'analysis',
                    content: `Echo: ${message}`
                };
                ws.send(JSON.stringify(response));
            });
        });

        // Start client process
        const clientPath = path.join(__dirname, '..', 'src', 'wsClient.ts');
        clientProcess = spawn('tsx', [clientPath, 'ws://localhost', '8090']);
        assert(clientProcess.stdout, 'Client process stdout should exist');

        // Wait for connection message
        const connectionMessage = await new Promise<WebSocketMessage>((resolve) => {
            clientProcess.stdout!.on('data', (data: Buffer) => {
                const messages = data.toString().split('\n').filter(Boolean);
                for (const msg of messages) {
                    const parsed = JSON.parse(msg) as WebSocketMessage;
                    if (parsed.type === 'connection' && parsed.status === 'connected') {
                        resolve(parsed);
                    }
                }
            });
        });

        assert.strictEqual(connectionMessage.status, 'connected');
        assert.strictEqual(isConnected, true);
    });

    test('should handle message exchange', async () => {
        assert(clientProcess.stdin, 'Client process stdin should exist');
        assert(clientProcess.stdout, 'Client process stdout should exist');

        // Send a test message
        const testMessage: Message = {
            role: 'user',
            type: 'command',
            content: 'Test Command'
        };

        clientProcess.stdin.write(JSON.stringify(testMessage) + '\n');

        // Wait for echo response
        const response = await new Promise<WebSocketMessage>((resolve) => {
            clientProcess.stdout!.on('data', (data: Buffer) => {
                const messages = data.toString().split('\n').filter(Boolean);
                for (const msg of messages) {
                    const parsed = JSON.parse(msg) as WebSocketMessage;
                    if (parsed.type === 'message') {
                        resolve(parsed);
                    }
                }
            });
        });

        const responseData = JSON.parse(response.data as string) as Message;
        assert.strictEqual(responseData.role, 'ai');
        assert.strictEqual(responseData.type, 'analysis');
        assert.strictEqual(responseData.content, `Echo: ${JSON.stringify(testMessage)}`);
    });

    test('should handle disconnection', async () => {
        assert(clientProcess.stdout, 'Client process stdout should exist');

        // Close the server
        await new Promise<void>((resolve) => {
            wss.close(() => {
                resolve();
            });
        });

        // Wait for disconnection message
        const disconnectMessage = await new Promise<WebSocketMessage>((resolve) => {
            clientProcess.stdout!.on('data', (data: Buffer) => {
                const messages = data.toString().split('\n').filter(Boolean);
                for (const msg of messages) {
                    const parsed = JSON.parse(msg) as WebSocketMessage;
                    if (parsed.type === 'connection' && parsed.status === 'disconnected') {
                        resolve(parsed);
                    }
                }
            });
        });

        assert.strictEqual(disconnectMessage.status, 'disconnected');
    });
}); 