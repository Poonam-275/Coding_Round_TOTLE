import { Injectable } from '@nestjs/common';
import { PrismaClient, MessageStatus } from '@prisma/client';
import { Inject } from '@nestjs/common';

@Injectable()
export class AnalyticsService {
  constructor(@Inject(PrismaClient) private prisma: PrismaClient) {}

  async campaignMetrics(campaignId: string) {
    const total = await this.prisma.message.count({ where: { campaignId } });
    const delivered = await this.prisma.message.count({ where: { campaignId, status: MessageStatus.DELIVERED } });
    const read = await this.prisma.message.count({ where: { campaignId, status: MessageStatus.READ } });
    const replied = await this.prisma.message.count({ where: { campaignId, status: MessageStatus.REPLIED } });
    return { total, delivered, read, replied };
  }
}
