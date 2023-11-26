import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';
import input from 'input';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const targetChatId: any = -4016869973n;
const sourceChatId: any = -4037656313n;
const notificationChatId: any = -4099468337n;

const apiId = 2249653;
const apiHash = '488d867946545c941940ea1909e19480';

@Injectable()
export class TelegramService {
  private readonly client: TelegramClient;
  constructor(
    private configService: ConfigService<{
      TELEGRAM_STRING: string;
      TEST_USER_ACTIVATION_CODE: string;
    }>,
  ) {
    const key = this.configService.get('TELEGRAM_STRING', {
      infer: true,
    });
    const test1 = this.configService.get('TEST_USER_ACTIVATION_CODE', {
      infer: true,
    });
    console.log(
      '🚀 ~ file: telegram.service.ts:29 ~ TelegramService ~ test1:',
      test1,
    );

    const stringSession = new StringSession(key); // fill this later with the value from session.save()
    this.client = new TelegramClient(stringSession, apiId, apiHash, {
      connectionRetries: 5,
    });
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
    console.log(
      '🚀 ~ file: telegram.service.ts:55 ~ TelegramService ~ sendMessageFromPool ~ messages.length:',
      messages.length,
    );

    console.log(
      '🚀 ~ file: telegram.service.ts:62 ~ TelegramService ~ sendMessageFromPool ~ messages?.[0].id:',
      messages?.[0].id,
    );
    console.log(
      '🚀 ~ file: telegram.service.ts:62 ~ TelegramService ~ sendMessageFromPool ~ messages?.[0].message:',
      messages?.[0].message,
    );

    if (messages.length <= 1) {
      return await this.client.sendMessage(notificationChatId, {
        message: 'no data',
      });
    }
    console.log(
      '🚀 ~ file: telegram.service.ts:78 ~ TelegramService ~ sendMessageFromPool ~ messages[0].peerId:',
      messages[0].peerId,
    );

    const res = await this.client.forwardMessages(targetChatId, {
      messages: [messages[0].id],
      fromPeer: messages[0].peerId,
    });

    await this.client.deleteMessages(sourceChatId, [messages[0].id], {});

    return res[0].message;
  }

  async getDialogs() {
    return (await this.client.getDialogs({ limit: 30 })).map((d) => ({
      id: d.id,
      name: d.name,
    }));
  }
}
