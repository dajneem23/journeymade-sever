import TelegramBot from 'node-telegram-bot-api';
import Container, { Token } from 'typedi';
import { nodeEnv } from './vars';

const token = '6228049691:AAEW_8Lm2hAXnz-WpGymi6tLOuCTJLwPoNo';
const chatIds = {
  minhphamquang: 71480983,
};

export const telegramBotToken = new Token<any>('_telegramBot');

export const initTelegramBot = () => {
  // Create a bot that uses 'polling' to fetch new updates
  const bot = new TelegramBot(token, {});

  const sendMessage = (text) => {
    bot.sendMessage(chatIds.minhphamquang, `[${nodeEnv}]\n--\n${text}`);
  };

  Container.set(telegramBotToken, {
    sendMessage,
  });

  return {
    sendMessage,
  };
};
