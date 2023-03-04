import TelegramBot from 'node-telegram-bot-api';
import Container, { Token } from 'typedi';
import config from '@/config';

export const telegramBotToken = new Token<any>('_telegramBot');

export default function initTelegramBot() {
  // Create a bot that uses 'polling' to fetch new updates
  const bot = new TelegramBot(config.telegram.botToken, {});

  const sendMessage = (text) => {
    bot.sendMessage(config.telegram.chatId, `[${config.nodeEnv}]\n--\n${text}`);
  };

  Container.set(telegramBotToken, {
    sendMessage,
  });

  return {
    sendMessage,
  };
}

// https://api.telegram.org/bot6228049691:AAEW_8Lm2hAXnz-WpGymi6tLOuCTJLwPoNo/getUpdates
