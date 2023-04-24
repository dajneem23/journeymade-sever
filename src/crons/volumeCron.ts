import config from '@/config';
import { EPeriod, ITokenResponse, ITokenVolume } from '@/interfaces';
import { volumeCounterToken } from '@/loaders/worker';
import TokenService from '@/services/token';
import TransactionEventService from '@/services/transactionEvent';
import VolumeService from '@/services/volume';
import { flattenArray, getTimeFramesByPeriod } from '@/utils';
import dayjs from '@/utils/dayjs';
import sequentially from '@/utils/sequentially';
import schedule from 'node-schedule';
import Container from 'typedi';

export default async function volumeCron () {
  // schedule.scheduleJob(config.cron.VOLUME, async function () {
    console.log("🚀 ~ file: volumeCron.ts:6 ~ config.cron.VOLUME:", config.cron.VOLUME)
    
    const now = dayjs();
    const timeFrames = getTimeFramesByPeriod({
      period: EPeriod['1h'],
      limit: 3,
      to_time: now.unix()
    });

    const tokenService = Container.get(TokenService);
    const volumeService = Container.get(VolumeService);
    const txEventService = Container.get(TransactionEventService);
    const volumeWorker = Container.get(volumeCounterToken);

    const { items: tokens } = await tokenService.getEnabledTokenList();

    const maticTokens = tokens.filter(token => token.id === 'matic-network');
    console.log("🚀 ~ file: volumeCron.ts:30 ~ maticTokens:", maticTokens)

    await Promise.all(maticTokens.map(async token => {
      console.time(`volumeCron: ${token.address}`);

        console.time(`getListByFilters: ${token.address}`);
        const txLogGroupedByTimeFrame = await Promise.all(
          timeFrames.map(async (timeFrame) => {
            const value = await txEventService.getListByFilters({
              symbol: token.symbol,
              addresses: [token.address],
              min_usd_value: 0,
              time_frame: timeFrame,
              actions: ['swap'],
            });

            return await volumeWorker.getBuySellData(value, timeFrame);
          }),
        );
        console.timeEnd(`getListByFilters: ${token.address}`);
        
        console.time(`getChartData: ${token.address}`);
        const txLogs = flattenArray(txLogGroupedByTimeFrame);
        const volumeByTimeFrames = await volumeWorker.getChartData(timeFrames, txLogs);
        console.timeEnd(`getChartData: ${token.address}`);

        const updateData = volumeByTimeFrames.map((item) => {
          return <ITokenVolume>{
            token_address: token.address,
            from_time: item.time_frame.from,
            to_time: item.time_frame.to,

            chain_id: token.chainId,
            token_id: token.id,
            token_symbol: token.symbol,

            count: item.count,
            amount: item.amount,
            usd_value: item.usd_value,
            price: item.price,
            tags: item.tags,
            change_percentage: item.change_percentage,

            buy: item.buy,
            sell: item.sell,
          }
        })

        await volumeService.bulkSave(updateData);

        console.log("🚀 ~ file: volumeCron.ts:54 ~ awaitPromise.all ~ volumeFrames:", token.address, updateData.length);
        console.timeEnd(`volumeCron: ${token.address}`);
    }))

    // await sequentially(
    //   maticTokens,
    //   async (token) => {
    //     console.time('volumeCron');

    //     const txLogGroupedByTimeFrame = await Promise.all(
    //       timeFrames.map(async (timeFrame) => {
    //         const value = await txEventService.getListByFilters({
    //           symbol: token.symbol,
    //           addresses: [token.address],
    //           min_usd_value: 0,
    //           time_frame: timeFrame,
    //           actions: ['swap'],
    //         });

    //         return await volumeWorker.getBuySellData(value, timeFrame);
    //       }),
    //     );
        
    //     const txLogs = txLogGroupedByTimeFrame.flat();
    //     const volumeByTimeFrames = await volumeWorker.getChartData(timeFrames, txLogs);

    //     const updateData = volumeByTimeFrames.map((item) => {
    //       return <ITokenVolume>{
    //         token_address: token.address,
    //         from_time: item.time_frame.from,
    //         to_time: item.time_frame.to,

    //         chain: token.chain,
    //         chain_id: token.chain_id,
    //         token_id: token.id,
    //         token_symbol: token.symbol,

    //         count: item.count,
    //         amount: item.amount,
    //         usd_value: item.usd_value,
    //         price: item.price,
    //         tags: item.tags,

    //         buy: item.buy,
    //         sell: item.sell,
    //       }
    //     })

    //     await volumeService.bulkSave(updateData);

    //     console.log("🚀 ~ file: volumeCron.ts:54 ~ awaitPromise.all ~ volumeFrames:", token.address, updateData.length);
    //     console.timeEnd('volumeCron');
    //   },
    //   100,
    // );
  // });
}