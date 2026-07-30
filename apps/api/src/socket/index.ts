import { Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'node:http';
import { logger } from '../utils/logger.js';
import { env } from '../config/env.js';

let io: SocketIOServer | null = null;

export function initSocketIO(server: HttpServer) {
  const allowedOrigins = env.CORS_ORIGIN
    ? env.CORS_ORIGIN.split(',').map((o) => o.trim()).filter(Boolean)
    : [env.FRONTEND_URL, 'http://localhost:3000'];

  io = new SocketIOServer(server, {
    cors: {
      origin: allowedOrigins,
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    logger.info(`[Socket.IO] Client connected: ${socket.id}`);

    socket.on('join_room', (room: string) => {
      socket.join(room);
      logger.info(`[Socket.IO] ${socket.id} joined room: ${room}`);
    });

    socket.on('leave_room', (room: string) => {
      socket.leave(room);
    });

    socket.on('disconnect', () => {
      logger.info(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });

  return io;
}

export function emitToUser(userId: string, event: string, payload: any) {
  if (io) {
    io.to(`user:${userId}`).emit(event, payload);
  }
}

export function emitToAdmin(event: string, payload: any) {
  if (io) {
    io.to('room:admin').emit(event, payload);
  }
}

export function broadcastEvent(event: string, payload: any) {
  if (io) {
    io.emit(event, payload);
  }
}
