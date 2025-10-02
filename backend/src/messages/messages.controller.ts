import { Body, Controller, Get, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { ApiTags } from '@nestjs/swagger';
import { Roles } from '../shared/roles.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { parse } from 'csv-parse/sync';

@ApiTags('messages')
@Controller('messages')
export class MessagesController {
  constructor(private messages: MessagesService) {}

  @Post('campaigns')
  @Roles('ADMIN', 'USER')
  async createCampaign(@Body() body: { name: string; message: string; createdById: string; recipients: { phone: string; name?: string }[]; scheduledAt?: string }) {
    const scheduledAt = body.scheduledAt ? new Date(body.scheduledAt) : undefined;
    return this.messages.createCampaign(body.name, body.message, body.createdById, body.recipients, scheduledAt);
  }

  @Get('campaigns')
  @Roles('ADMIN', 'USER', 'VIEWER')
  async listCampaigns() {
    return this.messages.listCampaigns();
  }

  @Post('campaigns/upload')
  @UseInterceptors(FileInterceptor('file'))
  @Roles('ADMIN', 'USER')
  async uploadCsv(@UploadedFile() file: Express.Multer.File, @Body() body: { name: string; message: string; createdById: string; scheduledAt?: string }) {
    const content = file.buffer.toString('utf8');
    const rows = parse(content, { columns: true, skip_empty_lines: true });
    const recipients = rows.map((r: any) => ({ phone: r.phone, name: r.name }));
    const scheduledAt = body.scheduledAt ? new Date(body.scheduledAt) : undefined;
    return this.messages.createCampaign(body.name, body.message, body.createdById, recipients, scheduledAt);
  }
}
