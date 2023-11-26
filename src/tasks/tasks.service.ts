import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { TelegramService } from '../telegram/telegram.service';

const startHour = 9;
const endHour = 19;
const totalToday = 19;
let sentToday = 0;

export const todaySentCount = 0;
export let range = generateSchedule();

function generateSchedule() {
  const today = new Date();
  today.setHours(startHour);
  today.setMinutes(0);

  const todayStartDate = new Date(today.toISOString());

  today.setHours(endHour);
  today.setMinutes(0);
  const todayEndDate = new Date(today.toISOString());

  range = Array.from({ length: totalToday })
    .map(() => getRandomInt(todayStartDate.getTime(), todayEndDate.getTime()))
    .sort()
    .map((v) => new Date(v));

  return range;
}

@Injectable()
export class TasksService {
  constructor(private readonly telegramService: TelegramService) {}

  @Cron('0 1 * * *')
  generateSchedule() {
    return generateSchedule();
  }
  @Cron('0 1 * * *')
  resetCounter() {
    sentToday = 0;
    return sentToday;
  }
  @Cron('*/15 * * * *')
  async checkForScheduleCome() {
    const curDFromStack = range?.[todaySentCount];

    const now = new Date();

    const currH = now.getHours();

    if (currH < startHour || currH > endHour) return;

    if (!curDFromStack) return;
    if (curDFromStack > new Date()) return;

    const res = await this.telegramService.sendMessageFromPool();

    return res;
  }
}

/**
 * Returns a random integer between min (inclusive) and max (inclusive).
 * The value is no lower than min (or the next integer greater than min
 * if min isn't an integer) and no greater than max (or the next integer
 * lower than max if max isn't an integer).
 * Using Math.round() will give you a non-uniform distribution!
 */
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
