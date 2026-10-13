import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  type OnGatewayConnection,
  type OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  cors: {
    origin: [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'https://nyarachun.github.io',
    ],
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly connectedUsers = new Map<number, Set<string>>();

  constructor(private readonly jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token || client.handshake.headers.authorization?.split(' ')[1];
      
      if (!token) {
        client.disconnect();
        return;
      }

      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });
      const userId = Number(payload.sub);

      if (Number.isNaN(userId)) {
        client.disconnect();
        return;
      }

      client.join(`user:${userId}`);

      const sockets = this.connectedUsers.get(userId) ?? new Set<string>();
      sockets.add(client.id);
      this.connectedUsers.set(userId, sockets);
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    try {
      const token = client.handshake.auth?.token || client.handshake.headers.authorization?.split(' ')[1];
      
      if (!token) return;

      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });
      const userId = Number(payload.sub);

      const sockets = this.connectedUsers.get(userId);

      if (!sockets) {
        return;
      }

      sockets.delete(client.id);

      if (sockets.size === 0) {
        this.connectedUsers.delete(userId);
      }
    } catch {
      return;
    }
  }

  @SubscribeMessage('joinChat')
  joinChat(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { chatId: number },
  ) {
    if (!payload?.chatId) {
      return;
    }

    client.join(`chat:${payload.chatId}`);
  }

  @SubscribeMessage('leaveChat')
  leaveChat(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { chatId: number },
  ) {
    if (!payload?.chatId) {
      return;
    }

    client.leave(`chat:${payload.chatId}`);
  }

  notifyChatMessage(chatId: number, message: unknown) {
    this.server.to(`chat:${chatId}`).emit('newMessage', message);
  }

  notifyUnreadCount(userId: number, unreadCount: number) {
    this.server.to(`user:${userId}`).emit('unreadCount', unreadCount);
  }
}