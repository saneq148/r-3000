import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TelegramModule } from './telegram/telegram.module';
import { TasksModule } from './tasks/tasks.module';
import { ScheduleModule } from '@nestjs/schedule';
import { TasksController } from './tasks/tasks.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: process.env.ENV_FILE_PATH ?? null }),
    ScheduleModule.forRoot(),
    TasksModule,
    TelegramModule,
  ],
  controllers: [AppController, TasksController],
  providers: [AppService],
})
export class AppModule {}
