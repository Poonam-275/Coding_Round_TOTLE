import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class WebsocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private onlineUsers = new Set<string>();

  handleConnection(client: Socket) {
    const userId = (client.handshake.auth?.userId as string) || 'anonymous';
    this.onlineUsers.add(userId);
    this.broadcastPresence();
  }

  handleDisconnect(client: Socket) {
    const userId = (client.handshake.auth?.userId as string) || 'anonymous';
    this.onlineUsers.delete(userId);
    this.broadcastPresence();
  }

  emitEvent(event: string, payload: unknown) {
    this.server.emit(event, payload);
  }

  private broadcastPresence() {
    this.server.emit('presence', { count: this.onlineUsers.size, users: Array.from(this.onlineUsers) });
  }
}
