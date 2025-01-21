#!/usr/bin/env tsx

import { spawn, ChildProcess } from 'child_process';
import path from 'path';
import fs from 'fs';
import os from 'os';
import winston from 'winston';
import { WebSocketMessage, LogData, ILogger } from './types';

const LOG_FILE = path.join(os.homedir(), '.cursor-socket.log');

// Custom format for concise JSON logs
const conciseFormat = winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const log = {
        t: timestamp,
        l: level.toUpperCase(),
        m: message
    } as LogData;
    
    if (Object.keys(meta).length > 0) {
        log.d = meta;
    }
    return JSON.stringify(log);
});

// Create the logger
const winstonLogger = winston.createLogger({
    level: 'debug',
    format: winston.format.combine(
        winston.format.timestamp({
            format: () => new Date().toLocaleTimeString()
        }),
        winston.format.errors({ stack: true }),
        conciseFormat
    ),
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                conciseFormat
            )
        }),
        new winston.transports.File({
            filename: LOG_FILE,
            maxsize: 5242880, // 5MB
            maxFiles: 5,
            tailable: true
        })
    ]
});

// Create a typed logger interface
export const Logger: ILogger = {
    info: (message: string, data?: LogData) => winstonLogger.info(message, data),
    error: (message: string, error?: LogData) => winstonLogger.error(message, error),
    debug: (message: string, data?: LogData) => winstonLogger.debug(message, data),
    tail: async (lines: number = 10) => {
        try {
            const output = require('child_process').execSync(`tail -n ${lines} ${LOG_FILE}`);
            return output.toString();
        } catch (error) {
            return 'No logs available';
        }
    }
};

export class WebSocketManager {
    private url: string;
    private port: number | null;
    private client: ChildProcess | null;
    private isConnected: boolean;

    constructor(url: string = 'ws://localhost:8080', port: number | null = null) {
        this.url = url;
        this.port = port;
        this.client = null;
        this.isConnected = false;
        Logger.info('WebSocket manager initialized', { url: this.url, port: this.port });
    }

    getUrl(): string {
        return this.url;
    }

    getPort(): number | null {
        return this.port;
    }

    getConnectionStatus(): boolean {
        return this.isConnected;
    }

    getClient(): ChildProcess | null {
        return this.client;
    }

    start(): void {
        const clientPath = path.join(__dirname, 'wsClient.js');
        const args = [clientPath, this.url];
        if (this.port) args.push(this.port.toString());
        
        this.client = spawn('node', args, {
            stdio: ['pipe', 'pipe', 'pipe']
        });

        Logger.info('Starting WebSocket client process', { 
            pid: this.client.pid,
            url: this.url,
            port: this.port
        });

        if (!this.client.stdout || !this.client.stderr) {
            throw new Error('Failed to create client process streams');
        }

        // Handle client output
        this.client.stdout.setEncoding('utf8');
        this.client.stdout.on('data', (data: string) => {
            try {
                const messages = data.split('\n').filter(Boolean);
                messages.forEach(message => {
                    const parsed = JSON.parse(message) as WebSocketMessage;
                    this.handleClientMessage(parsed);
                });
            } catch (error) {
                Logger.error('Failed to parse client output', {
                    error: error instanceof Error ? error.message : 'Unknown error',
                    raw: data
                });
            }
        });

        // Handle client errors
        this.client.stderr.setEncoding('utf8');
        this.client.stderr.on('data', (data: string) => {
            try {
                const error = JSON.parse(data) as WebSocketMessage;
                Logger.error('Client error occurred', {
                    message: error.message,
                    data: error.data,
                    meta: typeof error.data === 'object' ? error.data : undefined
                });
            } catch {
                Logger.error('Raw client error', { message: data });
            }
        });

        // Handle client exit
        this.client.on('exit', (code: number | null) => {
            this.isConnected = false;
            Logger.info('Client process exited', { 
                code,
                wasConnected: this.isConnected
            });
        });
    }

    private handleClientMessage(message: WebSocketMessage): void {
        switch (message.type) {
            case 'connection':
                this.isConnected = message.status === 'connected';
                Logger.info(`WebSocket ${message.status}`, {
                    url: this.url,
                    status: message.status
                });
                break;
            case 'message':
                Logger.debug('Received WebSocket message', {
                    data: message.data,
                    timestamp: Date.now(),
                    meta: typeof message.data === 'object' ? message.data : undefined
                });
                break;
            default:
                Logger.debug('Unknown message type received', {
                    message: typeof message === 'string' ? message : JSON.stringify(message)
                });
        }
    }

    send(message: string): void {
        if (this.client && this.client.stdin && this.isConnected) {
            this.client.stdin.write(message + '\n');
            Logger.debug('Sent message to WebSocket', { message });
        } else {
            Logger.error('Failed to send message', {
                reason: 'Client not connected',
                clientExists: !!this.client,
                isConnected: this.isConnected
            });
        }
    }

    stop(): void {
        if (this.client) {
            Logger.info('Stopping WebSocket client', { pid: this.client.pid });
            this.client.kill();
            this.client = null;
            this.isConnected = false;
        }
    }
}

// Only run the example usage if this file is being run directly
if (require.main === module) {
    // Parse command line arguments
    const args = process.argv.slice(2);
    const url = args[0] || 'ws://localhost:8080';
    const port = args[1] ? parseInt(args[1], 10) : null;

    // Example usage
    const manager = new WebSocketManager(url, port);
    manager.start();

    // Send a test message after 2 seconds
    setTimeout(() => {
        manager.send('Hello from parent process!');
    }, 2000);

    // Handle process termination
    process.on('SIGINT', () => {
        Logger.info('Received shutdown signal');
        manager.stop();
        process.exit(0);
    });
} 