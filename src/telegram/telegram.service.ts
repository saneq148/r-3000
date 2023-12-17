import { Api, TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';
import input from 'input';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { fromUnixTime, isAfter, subDays } from 'date-fns';

const targetChatId: any = -4016869973n;
const sourceChatId: any = -4096720079;
const notificationChatId: any = -4099468337n;

const invasionChannelId = -1001752194298;
const ukraineWarVideoChannelId = -1001307447520;
const warLifeChannelId: any = -1001647775391n;

const apiId = 2249653;
const apiHash = '488d867946545c941940ea1909e19480';

enum Reactions {
  LIKE = '👍',
  FIRE = '🔥',
  DISLIKE = '👎',
  CLOWN = '🤡',
  FUCK = '🤬',
  BLYAT = '🤮',
}

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

  async getTopMessages() {
    const allMessages = [
      ...(await this.client.getMessages(ukraineWarVideoChannelId, {
        limit: 100,
      })),
      ...(await this.client.getMessages(invasionChannelId, {
        limit: 100,
      })),
      // ...(await this.client.getMessages(warLifeChannelId, {
      //   limit: 100,
      // })),
    ];
    console.log(
      '🚀 ~ file: telegram.service.ts:72 ~ TelegramService ~ getTopMessages ~ allMessages:',
      allMessages,
    );

    const allTodayMessages = allMessages.filter((m) => {
      const date = fromUnixTime(m.date);

      const today = subDays(new Date(), 2); // !EDITABLE

      return isAfter(date, subDays(today, 1));
    });

    return this.filterMessagesWithMedia(
      (await this.sortByPositiveReactions(allTodayMessages)).filter(
        ({ rate }) => rate > 200,
      ),
    );
  }

  filterMessagesWithMedia(
    messages: Awaited<ReturnType<typeof this.sortByPositiveReactions>>,
  ) {
    return messages?.filter(({ media }) => !!media);
  }

  async sendTopMessagesToSourceGroup() {
    const messages = await this.getTopMessages();
    console.log(
      '🚀 ~ file: telegram.service.ts:86 ~ TelegramService ~ sendTopMessagesToSourceGroup ~ messages.length:',
      messages.length,
    );

    if (!messages.length) return [];

    await this.client.forwardMessages(sourceChatId, {
      messages: messages?.map(({ id }) => id),
      fromPeer: messages?.find(({ peerId }) => !!peerId).peerId,
    });

    return messages?.map(({ message, rate }) => ({ message, rate }));
  }

  async sortByPositiveReactions(messages: Api.Message[], hasFire = false) {
    const messagesWithPositiveReactionRate = messages.map((m) => {
      let positiveCount = 0;
      let negativeCount = 0;

      const like = m.reactions?.results?.find(
        (r) => (r.reaction as any).emoticon === Reactions.LIKE,
      )?.count;
      const fire = m.reactions?.results?.find(
        (r) => (r.reaction as any).emoticon === Reactions.FIRE,
      )?.count;
      const dislike = m.reactions?.results?.find(
        (r) => (r.reaction as any).emoticon === Reactions.DISLIKE,
      )?.count;
      const clown = m.reactions?.results?.find(
        (r) => (r.reaction as any).emoticon === Reactions.CLOWN,
      )?.count;
      const fuck = m.reactions?.results?.find(
        (r) => (r.reaction as any).emoticon === Reactions.FUCK,
      )?.count;
      const blyat = m.reactions?.results?.find(
        (r) => (r.reaction as any).emoticon === Reactions.BLYAT,
      )?.count;

      positiveCount += like ?? 0;
      positiveCount += (fire ?? 0) * 50 ?? 0;
      negativeCount += dislike ?? 0;
      negativeCount += (blyat ?? 0) * 3 ?? 0;
      negativeCount += (clown ?? 0) * 5 ?? 0;
      negativeCount += (fuck ?? 0) * 20 ?? 0;

      const topReactionIsPositive = (() => {
        switch ((m.reactions?.results?.[0]?.reaction as any)?.emoticon) {
          case Reactions.LIKE:
          case Reactions.FIRE:
            return true;
          default:
            return false;
        }
      })();

      const rate =
        positiveCount > 20 &&
        (hasFire ? fire > 10 : true) &&
        topReactionIsPositive
          ? positiveCount / negativeCount
          : -1000;
      return {
        message: m,
        rate,
      };
    });

    const sorted = messagesWithPositiveReactionRate
      .filter(({ rate }) => !isNaN(rate) && !!rate)
      .sort(({ rate }, { rate: ratePrev }) => (rate > ratePrev ? 1 : -1))
      .map(({ message, rate }) => ({
        ...message,
        rate: rate === Infinity ? 1000 : rate,
      }));

    return sorted;
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
      fromPeer: messages?.find(({ peerId }) => !!peerId).peerId,
    });

    await this.client.deleteMessages(sourceChatId, [messages[0].id], {});

    return res[0].message;
  }

  async getDialogs() {
    return (await this.client.getDialogs({ limit: 100 })).map((d) => ({
      id: d.id,
      name: d.name,
    }));
  }
}
