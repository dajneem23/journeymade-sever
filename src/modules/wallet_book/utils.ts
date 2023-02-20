import { Tags } from './types';

export const parseAddressFromUrl = (input) => {
  // https://pro.nansen.ai/wallet-profiler-for-token?address=0xfe177011cd1c75ad5467aae5f10ff260e67b3bdc&token_address=0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0&utm_source=smart-alerts&utm_medium=telegram&utm_campaign=31753

  if (input.includes('scan.com/address/')) {
    const el = input.split('/');
    return el.find(i => i.startsWith('0x'));
  }

  const search = input.split('?')[1];
  const searchParams = new URLSearchParams(search);
  return searchParams.get('address')
};

const PrefixIndicators = {
  CryptoExchanges: '🏦',
  SmartContract: '🤖',
  SmartMoney: '🤓',
  MarketMaker: 'Market Maker'
};

export const getTagsByPrefix = (name: string) => {
  const tags = [];
  for (const key in PrefixIndicators) {
    if (name.trim().includes(PrefixIndicators[key])) {
      tags.push(Tags[key]);
    }
  }

  return tags;
};
