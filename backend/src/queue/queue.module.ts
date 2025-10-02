import { Module } from '@nestjs/common';
import { QueueService } from './queue.service';
import { WebsocketModule } from '../websocket/websocket.module';

@Module({
  imports: [WebsocketModule],
  providers: [QueueService],
  exports: [QueueService],
})
export class QueueModule {}
