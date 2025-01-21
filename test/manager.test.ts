import { test, describe } from 'node:test';
import assert from 'node:assert';
import { WebSocketServer } from 'ws';
import type { RawData } from 'ws';
import path from 'path';
import fs from 'fs';
import os from 'os';
import winston from 'winston';
import { WebSocketManager, Logger } from '../src/index';
import { WebSocketMessage, Message, AIMessage, MessageRole, BaseMessage } from '../src/types';

// Type guard for AIMessage
function isAIMessage(obj: unknown): obj is AIMessage {
    if (!obj || typeof obj !== 'object') return false;
    
    const msg = obj as Partial<BaseMessage>;
    return (
        msg.role === 'ai' &&
        typeof msg.content === 'string'
    );
}

describe('WebSocket Manager', () => {
    let wss: WebSocketServer;
    let manager: WebSocketManager;
    const testPort = 8091;

    test('should initialize with correct parameters', () => {
        manager = new WebSocketManager('ws://localhost', testPort);
        assert.strictEqual(manager.getUrl(), 'ws://localhost');
        assert.strictEqual(manager.getPort(), testPort);
        assert.strictEqual(manager.getConnectionStatus(), false);
        assert.strictEqual(manager.getClient(), null);
    });

    test('should start and connect to WebSocket server', async () => {
        // Create a WebSocket server
        await new Promise<void>((resolve) => {
            wss = new WebSocketServer({ port: testPort });
            wss.on('listening', resolve);
        });

        // Start the manager
        manager.start();

        // Wait for connection
        await new Promise<void>((resolve) => {
            const checkConnection = setInterval(() => {
                if (manager.getConnectionStatus()) {
                    clearInterval(checkConnection);
                    resolve();
                }
            }, 100);
        });

        assert.strictEqual(manager.getConnectionStatus(), true);
        assert.notStrictEqual(manager.getClient(), null);
    });

    test('should send and receive messages', async () => {
        let receivedMessage: AIMessage | null = null;

        // Set up server message handler
        wss.clients.forEach((client) => {
            client.on('message', (data: RawData) => {
                const message = data.toString();
                const response: AIMessage = {
                    role: 'ai',
                    type: 'analysis',
                    content: `Echo: ${message}`
                };
                client.send(JSON.stringify(response));
            });
        });

        // Send a message
        const testMessage: Message = {
            role: 'user',
            type: 'command',
            content: 'Test Message'
        };
        manager.send(JSON.stringify(testMessage));

        // Wait for the echo response
        await new Promise<void>((resolve) => {
            const messageHandler = (data: RawData) => {
                try {
                    const parsed = JSON.parse(data.toString());
                    if (isAIMessage(parsed)) {
                        receivedMessage = {
                            role: parsed.role,
                            type: parsed.type as 'completion' | 'analysis' | 'suggestion',
                            content: parsed.content
                        };
                        if (receivedMessage.content === `Echo: ${JSON.stringify(testMessage)}`) {
                            resolve();
                        }
                    }
                } catch (e) {
                    // Ignore parse errors
                }
            };

            // Add message handler to all clients
            wss.clients.forEach(client => {
                client.on('message', messageHandler);
            });

            // Cleanup handler after test
            setTimeout(() => {
                wss.clients.forEach(client => {
                    client.off('message', messageHandler);
                });
            }, 1000);
        });

        // At this point, receivedMessage is guaranteed to be an AIMessage due to the type guard
        if (!receivedMessage) {
            throw new Error('No message received');
        }

        const { role, type, content } = receivedMessage;
        assert.strictEqual(role, 'ai');
        assert.strictEqual(type, 'analysis');
        assert.strictEqual(content, `Echo: ${JSON.stringify(testMessage)}`);
    });

    test('should handle stop and cleanup', async () => {
        manager.stop();
        
        // Wait for disconnection
        await new Promise(resolve => setTimeout(resolve, 100));

        assert.strictEqual(manager.getConnectionStatus(), false);
        assert.strictEqual(manager.getClient(), null);

        // Cleanup
        wss.close();
    });
}); 