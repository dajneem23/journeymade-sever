import { groupBy, sortArray } from '@/core/utils';
import dayjs from 'dayjs';
import { getTopHoldersBySymbol } from '@/modules/debank/services';
import {
  SegmentIDType,
  SegmentOptions,
  SegmentResult,
  SegmentResults,
  Segments,
} from '@/modules/debank/types';
import { addSignalsToMongoDB } from '../services/addSignalsToMongoDB';

const groupSegments = (segments: Segments): SegmentResults => {
  const results = <SegmentResults>[];
  const groups = groupBy(segments, 'id');

  for (const key in groups) {
    const history: SegmentResult[] = sortArray(groups[key], 'crawl_id', 'desc');

    history.forEach((item, index) => {
      const prev = history[index + 1];
      if (prev && +prev.avg_balance > 0) {
        item.percentage_change =
          ((+item.avg_balance - +prev.avg_balance) / +prev.avg_balance) * 100;
      } else {
        item.percentage_change = 0;
      }

      // if (item.addresses) {
      //   item.addresses.length = 0;
      // }
    });

    // console.table(history);

    results.push({
      id: key as SegmentIDType,
      history,
    });
  }

  return results;
};

const getData = async ({ id, symbol, offset, limit }) => {
  return (await getTopHoldersBySymbol({ symbol, offset, limit })).map(
    (item) => {
      return {
        segment_id: id,
        updated_at: dayjs(item.updated_at).format(),
        count: +item.count,
        crawl_id: +item.crawl_id,
        avg_balance: +item.avg_balance,
        addresses: item.user_address,
      };
    },
  );
};

const topHolders = async ({ symbol }) => {
  const signals = new Array<SegmentResult>();
  const data = [];
  await Promise.all(
    SegmentOptions.map(async ({ id, limit, offset }) => {
      return data.push(...(await getData({ id, offset, limit, symbol })));
    }),
  );

  console.log('topHolders', symbol, data.length);
  const groups = groupSegments(data);

  groups.forEach((group) => {
    group.history.forEach((item) => {
      const within30mins = dayjs().diff(dayjs(item.updated_at), 'minute') < 15;
      if (item.percentage_change !== 0 && within30mins) {
        signals.push({
          symbol,
          ...item,
          // percentage_change: `${item.percentage_change.toFixed(2)}%`,
        });
      }
    });
  });

  if (signals.length > 0) {
    const logs = signals.map(
      ({
        symbol,
        avg_balance,
        count,
        crawl_id,
        updated_at,
        segment_id,
        percentage_change,
      }) => {
        return {
          symbol,
          avg_balance,
          count,
          crawl_id,
          updated_at,
          segment_id,
          percentage_change,
        };
      },
    );
    console.table(logs);

    signals.map(async (signal) => {
      await addSignalsToMongoDB(signal);
    });
  }
};

export default topHolders;
