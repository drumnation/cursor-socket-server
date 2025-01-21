#!/usr/bin/env tsx

import path from 'path';
import os from 'os';
import winston from 'winston';
import { spawn } from 'child_process';
import { LogData } from './types';

const LOG_FILE = path.join(os.homedir(), '.cursor-socket.log');

// Create a logger instance just for querying
const logger = winston.createLogger({
    transports: [
        new winston.transports.File({
            filename: LOG_FILE,
            maxsize: 5242880, // 5MB
            maxFiles: 5,
            tailable: true
        })
    ]
});

async function tailLogs(lines: number = 10): Promise<string> {
    return new Promise((resolve) => {
        const options = {
            from: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
            until: new Date(),
            limit: lines,
            order: 'desc' as const,
            fields: ['timestamp', 'level', 'message', 'meta']
        };

        logger.query(options, (err: Error | null, results: any) => {
            if (err) {
                console.error('Error reading logs:', err);
                resolve('No logs available');
                return;
            }

            const logs = results.file.reverse();
            resolve(logs.map((log: LogData) => JSON.stringify(log)).join('\n'));
        });
    });
}

function followLogs(): void {
    const tail = spawn('tail', ['-f', LOG_FILE]);
    tail.stdout.on('data', (data: Buffer) => {
        process.stdout.write(data);
    });
    
    process.on('SIGINT', () => {
        tail.kill();
        process.exit(0);
    });
}

// Parse command line arguments
const args = process.argv.slice(2);
const command = args[0];
const lines = parseInt(args[1]) || 10;

switch (command) {
    case 'tail':
        tailLogs(lines).then(logs => console.log(logs));
        break;
    case 'follow':
        followLogs();
        break;
    default:
        console.log(`
Usage:
  cursor-socket-logs tail [lines]    Show last N lines of logs (default: 10)
  cursor-socket-logs follow          Follow logs in real-time
        `);
} 