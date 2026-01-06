import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import websocketConfig from '../config/websocket.config';
import { WebSocketGateway } from './websocket.gateway';
import { AuthModule } from '../auth/auth.module';
import { ScalesModule } from '../scales/scales.module';

@Module({
  imports: [ConfigModule.forFeature(websocketConfig), AuthModule, ScalesModule],
  providers: [WebSocketGateway],
  exports: [WebSocketGateway],
})
export class WebSocketModule {}
