import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';
import input from 'input';
import { Injectable } from '@nestjs/common';

const targetChatId: any = -4030325181n;
const sourceChatId: any = -4037656313n;
const notificationChatId: any = -4099468337n;

const apiId = 2249653;
const apiHash = '488d867946545c941940ea1909e19480';

const key = process.env.TELEGRAM_STRING;
console.log('🚀 ~ file: telegram.service.ts:14 ~ process.env:', process.env);
console.log('🚀 ~ file: telegram.service.ts:14 ~ key:', key);

const stringSession = new StringSession(key); // fill this later with the value from session.save()

@Injectable()
export class TelegramService {
  private readonly client = new TelegramClient(stringSession, apiId, apiHash, {
    connectionRetries: 5,
  });

  constructor() {
    console.log('Loading interactive example...');

    this.client.connect();

    // (async () => {
    //   await this.client.start({
    //     phoneNumber: async () => await input.text('Please enter your number: '),
    //     password: async () => await input.text('Please enter your password: '),
    //     phoneCode: async () =>
    //       await input.text('Please enter the code you received: '),
    //     onError: (err) => console.log(err),
    //   });
    //   console.log('You should now be connected.');
    //   console.log(this.client.session.save()); // Save this string to avoid logging in again
    // })();
  }

  async sendMessageFromPool() {
    const messages = await this.client.getMessages(sourceChatId, { limit: 50 });

    if (messages.length <= 1) {
      return await this.client.sendMessage(notificationChatId, {
        message: 'no data',
      });
    }

    const res = await this.client.forwardMessages(targetChatId, {
      messages: [messages[0].id],
      fromPeer: messages[0].peerId,
    });

    await this.client.deleteMessages(sourceChatId, [messages[0].id], {});

    return res[0].message;
  }

  async getDialogs() {
    return await this.client.getDialogs({ limit: 30 });
  }
}
