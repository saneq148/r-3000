import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/sendMessageFromPool')
  getHello() {
    return this.appService.sendMessageFromPool();
  }
  @Get('/getDialogs')
  getDialogs() {
    return this.appService.getDialogs();
  }
}
