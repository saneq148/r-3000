import { Injectable } from '@nestjs/common';
import { TasksService } from './tasks/tasks.service';

@Injectable()
export class AppService {
  // constructor(private readonly telegramService: TelegramService) {}
  constructor(private readonly scheduleService: TasksService) {}

  async getHello() {
    return this.scheduleService.generateSchedule();

    return 'Hello World!';
  }
}
