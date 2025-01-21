/**
 * WebSocket Communication Task Sequences
 *
 * This file defines task sequences for interacting with Roo Cline via WebSocket using the websocket-bridge tool.
 * Each sequence represents a series of interactions that can be executed in order.
 */

export interface WebSocketCommand {
  command: string;
  parameters: Record<string, any>;
}

export interface WebSocketTask {
  description: string;
  command: WebSocketCommand;
  subtasks?: WebSocketTask[];
}

export interface WebSocketTaskSequence {
  name: string;
  description: string;
  tasks: WebSocketTask[];
}

// Example task sequences
export const webSocketTasks: WebSocketTaskSequence[] = [
  {
    name: 'Global Refactoring',
    description: 'Perform a global refactoring operation using Roo Cline.',
    tasks: [
      {
        description: 'Connect to Roo Cline on a specific port',
        command: {
          command: 'cursor-socket',
          parameters: {
            url: 'ws://localhost',
            port: 8081, // Custom port
          },
        },
      },
      {
        description: 'Initiate global refactoring',
        command: {
          command: 'websocket-bridge',
          parameters: {
            command: 'global_refactor',
            files: ['src/main.ts', 'src/utils.ts', 'src/models/User.ts'],
            instructions:
              'Rename function `calculateTotal` to `computeTotalPrice` and update all references.',
          },
        },
      },
    ],
  },
  {
    name: 'Context Summary and Code Review',
    description:
      'Get a context summary of specific files and then request a code review.',
    tasks: [
      {
        description: 'Connect to Roo Cline on default port',
        command: {
          command: 'cursor-socket',
          parameters: {},
        },
      },
      {
        description: 'Get context summary',
        command: {
          command: 'websocket-bridge',
          parameters: {
            command: 'context_summary',
            files: [
              'src/controllers/AuthController.ts',
              'src/routes/AuthRoutes.ts',
            ],
          },
        },
      },
      {
        description: 'Request code review',
        command: {
          command: 'websocket-bridge',
          parameters: {
            command: 'code_review',
            files: [
              'src/feature/new-module.ts',
              'src/utils/helper.ts',
              'src/feature/new-module.test.ts',
            ],
          },
        },
      },
    ],
  },
  {
    name: 'Log Retrieval and Analysis',
    description: 'Retrieve and analyze logs from the cursor-socket-server.',
    tasks: [
      {
        description: 'Connect to Roo Cline',
        command: {
          command: 'cursor-socket',
          parameters: {},
        },
      },
      {
        description: 'Get recent error logs',
        command: {
          command: 'websocket-bridge',
          parameters: {
            command: 'get_logs',
            log_type: 'error',
            lines: 50,
          },
        },
      },
      {
        description: 'Analyze logs for common issues',
        command: {
          command: 'websocket-bridge',
          parameters: {
            command: 'context_summary',
            files: ['~/.cursor-socket-server.log'],
          },
        },
      },
    ],
  },
  {
    name: 'Dependency Resolution and Performance Optimization',
    description:
      'Resolve dependency conflicts and identify performance bottlenecks.',
    tasks: [
      {
        description: 'Connect to Roo Cline on a specific port',
        command: {
          command: 'cursor-socket',
          parameters: {
            url: 'ws://localhost',
            port: 8082, // Another custom port
          },
        },
      },
      {
        description: 'Resolve dependency issues',
        command: {
          command: 'websocket-bridge',
          parameters: {
            command: 'dependency_resolution',
            issue_description: 'Conflicting versions of library X',
            files: ['package.json', 'src/main.ts'],
          },
        },
      },
      {
        description: 'Identify performance bottlenecks',
        command: {
          command: 'websocket-bridge',
          parameters: {
            command: 'performance_optimization',
          },
        },
      },
    ],
  },
]; 