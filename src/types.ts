import { ChildProcess } from 'child_process';
import { WebSocket } from 'ws';

export type MessageRole = 'system' | 'user' | 'ai';

export interface BaseMessage {
    role: MessageRole;
    content: string;
}

export interface SystemMessage extends BaseMessage {
    role: 'system';
    type?: 'configuration' | 'initialization' | 'termination';
}

export interface UserMessage extends BaseMessage {
    role: 'user';
    type?: 'command' | 'query' | 'response';
}

export interface AIMessage extends BaseMessage {
    role: 'ai';
    type?: 'completion' | 'analysis' | 'suggestion';
}

export type Message = SystemMessage | UserMessage | AIMessage;

export interface WebSocketMessage {
    type: 'connection' | 'message' | 'error';
    status?: 'connected' | 'disconnected';
    data?: string | Message;
    message?: string;
}

export interface LogData {
    t?: string;
    l?: string;
    m?: string;
    d?: unknown;
    url?: string;
    port?: number | null;
    pid?: number;
    status?: string;
    data?: string | Message;
    message?: string;
    timestamp?: number;
    error?: Error | string;
    reason?: string;
    clientExists?: boolean;
    isConnected?: boolean;
    stack?: string;
    raw?: string;
    code?: number | null;
    wasConnected?: boolean;
    meta?: unknown;
}

export interface ILogger {
    info(message: string, data?: LogData): void;
    error(message: string, error?: LogData): void;
    debug(message: string, data?: LogData): void;
    tail(lines?: number): string | Promise<string>;
} 