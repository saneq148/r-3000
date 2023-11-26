import { Module } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: process.env.ENV_FILE_PATH ?? null }),
  ],
  providers: [TelegramService],
  exports: [TelegramService],
})
export class TelegramModule {}
