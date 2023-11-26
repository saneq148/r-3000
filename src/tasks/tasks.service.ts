import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { TelegramService } from '../telegram/telegram.service';
import { format } from 'date-fns';

const startHour = 15;
const endHour = 15 + 9;
const totalToday = 8;

export let todaySentCount = 0;
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
    .sort();
  console.log(
    '🚀 ~ file: tasks.service.ts:28 ~ generateSchedule ~ range:',
    range,
  );

  return range.map((v) => new Date(v));
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
    todaySentCount = 0;
    return todaySentCount;
  }
  @Cron('*/1 * * * *')
  async checkForScheduleCome() {
    const curDFromStack = range?.[todaySentCount];

    const now = new Date();

    const currH = now.getHours();
    console.log(
      '🚀 ~ file: tasks.service.ts:55 ~ TasksService ~ checkForScheduleCome ~ currH:',
      currH,
    );

    if (currH < startHour || currH > endHour) {
      console.log('SKIP');

      return;
    }
    console.log(
      '🚀 ~ file: tasks.service.ts:64 ~ TasksService ~ checkForScheduleCome ~ curDFromStack:',
      curDFromStack,
    );
    if (!curDFromStack) {
      console.log('SKIP');

      return;
    }

    if (curDFromStack > now) {
      console.log('SKIP');

      return;
    }

    const res = await this.telegramService.sendMessageFromPool();

    todaySentCount += 1;

    return res;
  }

  getSettings() {
    return {
      range: range.map((d) => format(new Date(d), 'dd/MM/yyyy HH:mm')),
      totalToday,
      todaySentCount,
      startHour,
      endHour,
    };
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
