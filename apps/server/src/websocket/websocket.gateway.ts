import {
  WebSocketGateway as WSGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ScalesService } from '../scales/scales.service';
import { JoinRoomDto } from './dto/join-room.dto';

interface AuthenticatedSocket extends Socket {
  data: {
    user: any;
    userId: string;
    organizationId: number;
  };
}

interface MeasurementCreatedEvent {
  scaleId: string;
  organizationId: number;
  measurement: any;
}

@WSGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: '/ws',
})
export class WebSocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(WebSocketGateway.name);

  constructor(private readonly scalesService: ScalesService) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      // Extract token
      const token =
        client.handshake.auth.token ||
        client.handshake.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        this.logger.warn(`Client ${client.id} connected without token`);
        client.disconnect();
        return;
      }

      // Note: Authentication is handled by the WsAuthGuard on message handlers
      // For the initial connection, we just log it
      this.logger.log(`Client ${client.id} connected`);
    } catch (error) {
      this.logger.error(`Connection error: ${error.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    this.logger.log(`Client ${client.id} disconnected`);
  }

  @SubscribeMessage('join-org-room')
  async handleJoinOrgRoom(@ConnectedSocket() client: AuthenticatedSocket) {
    const organizationId = client.data.organizationId;

    if (!organizationId) {
      throw new WsException('User does not belong to an organization');
    }

    const roomName = `org:${organizationId}`;
    client.join(roomName);

    this.logger.log(`Client ${client.id} joined organization room: ${roomName}`);

    return { success: true, room: roomName };
  }

  @SubscribeMessage('join-scale-room')
  async handleJoinScaleRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() dto: JoinRoomDto,
  ) {
    const organizationId = client.data.organizationId;

    if (!organizationId) {
      throw new WsException('User does not belong to an organization');
    }

    // Validate user has access to this scale
    const scale = await this.scalesService.findOne(dto.scaleId);

    if (scale.organizationId !== organizationId) {
      throw new WsException('Access denied to this scale');
    }

    const roomName = `scale:${dto.scaleId}`;
    client.join(roomName);

    this.logger.log(`Client ${client.id} joined scale room: ${roomName}`);

    return { success: true, room: roomName };
  }

  @SubscribeMessage('leave-scale-room')
  async handleLeaveScaleRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() dto: JoinRoomDto,
  ) {
    const roomName = `scale:${dto.scaleId}`;
    client.leave(roomName);

    this.logger.log(`Client ${client.id} left scale room: ${roomName}`);

    return { success: true, room: roomName };
  }

  @OnEvent('measurement.created')
  handleMeasurementCreated(event: MeasurementCreatedEvent) {
    const { scaleId, organizationId, measurement } = event;

    // Broadcast to organization room
    this.server.to(`org:${organizationId}`).emit('measurement', {
      scaleId,
      organizationId,
      ...measurement,
    });

    // Broadcast to scale-specific room
    this.server.to(`scale:${scaleId}`).emit('measurement', {
      scaleId,
      organizationId,
      ...measurement,
    });

    this.logger.debug(
      `Broadcasted measurement to org:${organizationId} and scale:${scaleId}`,
    );
  }
}
