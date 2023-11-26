import { Controller, Get } from '@nestjs/common';
import { TasksService } from './tasks.service';

@Controller()
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get('/checkForScheduleCome')
  checkForScheduleCome() {
    return this.tasksService.checkForScheduleCome();
  }

  @Get('/generateSchedule')
  generateSchedule() {
    return this.tasksService.generateSchedule();
  }
}
