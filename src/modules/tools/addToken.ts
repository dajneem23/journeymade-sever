import { getCoingeckoTokens } from '../statistics/services/getCoingeckoTokens';
import { insertOnchainWorkerToken } from '../statistics/services/insertOnchainWorkerToken';

export default async function () {
  const tokens = await getCoingeckoTokens();
  await insertOnchainWorkerToken(tokens);
  console.log('🚀 ~ file: index.ts:15 ~ tokens:', tokens);
}
