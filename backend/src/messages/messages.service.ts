import { Injectable } from '@nestjs/common';
import { PrismaClient, MessageStatus } from '@prisma/client';
import { Inject } from '@nestjs/common';
import { QueueService } from '../queue/queue.service';

@Injectable()
export class MessagesService {
  constructor(@Inject(PrismaClient) private prisma: PrismaClient, private queue: QueueService) {}

  async createCampaign(name: string, message: string, createdById: string, recipients: { phone: string; name?: string }[], scheduledAt?: Date) {
    const campaign = await this.prisma.campaign.create({
      data: { name, message, createdById, scheduledAt },
    });
    await this.prisma.recipient.createMany({
      data: recipients.map(r => ({ phone: r.phone, name: r.name, campaignId: campaign.id })),
    });

    const createdRecipients = await this.prisma.recipient.findMany({ where: { campaignId: campaign.id } });
    await this.prisma.message.createMany({
      data: createdRecipients.map(r => ({ campaignId: campaign.id, recipientId: r.id, status: MessageStatus.QUEUED })),
    });

    await this.queue.enqueueCampaign(campaign.id, scheduledAt ?? new Date());
    return campaign;
  }

  async listCampaigns() {
    return this.prisma.campaign.findMany({ include: { recipients: true, messages: true, replies: true } });
  }
}
