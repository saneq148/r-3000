import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TelegramModule } from '../telegram/telegram.module';

@Module({
  imports: [TelegramModule],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}
