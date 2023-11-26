import { Injectable } from '@nestjs/common';
import { TasksService } from './tasks/tasks.service';
import { TelegramService } from './telegram/telegram.service';

@Injectable()
export class AppService {
  // constructor(private readonly telegramService: TelegramService) {}
  constructor(
    private readonly scheduleService: TasksService,
    private readonly telegramService: TelegramService,
  ) {}

  async getHello() {
    return this.telegramService.sendMessageFromPool();
  }
  async getDialogs() {
    return this.telegramService.getDialogs();
  }
}
