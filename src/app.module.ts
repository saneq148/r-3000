import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TelegramModule } from './telegram/telegram.module';
import { TasksModule } from './tasks/tasks.module';
import { ScheduleModule } from '@nestjs/schedule';
import { TasksController } from './tasks/tasks.controller';

@Module({
  imports: [ScheduleModule.forRoot(), TasksModule, TelegramModule],
  controllers: [AppController, TasksController],
  providers: [AppService],
})
export class AppModule {}
