import { Injectable } from '@nestjs/common';
import { Queue, Worker, QueueScheduler, JobsOptions } from 'bullmq';
import { Inject } from '@nestjs/common';
import { PrismaClient, MessageStatus } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { WebsocketGateway } from '../websocket/websocket.gateway';
import IORedis from 'ioredis';

@Injectable()
export class QueueService {
  private connection: IORedis;
  private campaignQueue: Queue;
  private scheduler: QueueScheduler;
  private worker: Worker;

  constructor(@Inject(PrismaClient) private prisma: PrismaClient, private config: ConfigService, private ws: WebsocketGateway) {
    this.connection = new IORedis(this.config.get<string>('REDIS_URL'));
    this.campaignQueue = new Queue('campaigns', { connection: this.connection });
    this.scheduler = new QueueScheduler('campaigns', { connection: this.connection });

    this.worker = new Worker('campaigns', async job => {
      const { campaignId } = job.data as { campaignId: string };
      const messages = await this.prisma.message.findMany({ where: { campaignId } });

      for (const message of messages) {
        // simulate send
        await this.updateStatus(message.id, MessageStatus.SENT);
        await this.sleep(randomBetween(200, 800));
        await this.updateStatus(message.id, MessageStatus.DELIVERED);
        await this.sleep(randomBetween(300, 1000));
        await this.updateStatus(message.id, MessageStatus.READ);

        // simulate possible reply
        if (Math.random() < 0.3) {
          await this.prisma.reply.create({ data: { campaignId, messageId: message.id, content: simulateReply() } });
          await this.updateStatus(message.id, MessageStatus.REPLIED);
        }
      }
    }, { connection: this.connection });
  }

  async enqueueCampaign(campaignId: string, scheduledAt: Date) {
    const delay = Math.max(0, scheduledAt.getTime() - Date.now());
    const opts: JobsOptions = { delay, removeOnComplete: true, removeOnFail: true };
    await this.campaignQueue.add('campaign', { campaignId }, opts);
  }

  private async updateStatus(messageId: string, status: MessageStatus) {
    const timestamps: Partial<Record<MessageStatus, keyof import('@prisma/client').Message>> = {
      [MessageStatus.SENT]: 'sentAt',
      [MessageStatus.DELIVERED]: 'deliveredAt',
      [MessageStatus.READ]: 'readAt',
      [MessageStatus.REPLIED]: 'repliedAt',
      [MessageStatus.QUEUED]: undefined as unknown as keyof import('@prisma/client').Message,
      [MessageStatus.FAILED]: undefined as unknown as keyof import('@prisma/client').Message,
    };

    const data: any = { status };
    const key = timestamps[status];
    if (key) data[key] = new Date();

    const updated = await this.prisma.message.update({ where: { id: messageId }, data });
    this.ws.emitEvent('message_status', updated);
  }

  private sleep(ms: number) {
    return new Promise(res => setTimeout(res, ms));
  }
}

function randomBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function simulateReply(): string {
  const replies = [
    'Thanks! I am interested.',
    'Please remove me from the list.',
    'Can you share more details?',
    'I will get back to you.',
  ];
  return replies[Math.floor(Math.random() * replies.length)];
}
