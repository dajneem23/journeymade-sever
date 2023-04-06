import { sumArrayByField } from '../../utils/sumArrayByField';

const holdersSegments = [
  [0, 50], // [offset, limit]
  [50, 100],
  [100, 200],
  [200, 500],
  [500, 1000],
  [1000, 100000],
]

type TAction = {
  count: number;
  amount: number;
  usd_value: number;
  price: number;
  tags: any[];
  logs: any[];
}

type TGridZoneData = {
  time_frame: { from: number, to: number },
  segment_frame: { from: number, to: number, addresses: string[] },
  
  time_index: number,
  segment_index: number,
  activity_trend_score: number

  buy: TAction,
  sell: TAction,
} & TAction 

const counter = {
  getSegmentFrames() {
    return holdersSegments.map(([offset, limit]) => {
      return {
        id: `${offset}-${limit}`,
        offset,
        limit,
      }
    }).reverse();
  },
  getScore(timeFrames, segmentFrames, txLogs, holders) {
    // console.log("🚀 ~ file: counter.ts:44 ~ getScore ~ holders:", holders)
    const dataGrid: TGridZoneData[] = [];
    timeFrames.forEach((tf, tfIdx) => {
      segmentFrames.forEach((sf, sIdx) => {
        dataGrid.push({
          time_frame: { from: tf, to: timeFrames[tfIdx + 1] || (tf + (tf - timeFrames[tfIdx - 1])) },
          segment_frame: { from: sf.offset, to: sf.limit, addresses: holders?.slice(sf.offset, sf.limit).map((h) => h.toLowerCase()) || [] },
          
          time_index: tfIdx,
          segment_index: sIdx,
          
          activity_trend_score: 0,

          count: 0,
          amount: 0,
          usd_value: 0,
          price: 0,
          tags: [],
          logs: [],

          buy: {
            count: 0,
            amount: 0,
            usd_value: 0,
            price: 0,
            tags: [],
            logs: [],
          },

          sell: {
            count: 0,
            amount: 0,
            usd_value: 0,
            price: 0,
            tags: [],
            logs: [],
          }
        });
      });
    });

    txLogs.forEach((txLog) => {
      let foundIndex = dataGrid.findIndex(
        (zone) => txLog.time >= zone.time_frame.from &&
          txLog.time <= zone.time_frame.to &&
          zone.segment_frame.addresses.includes(txLog.address.toLowerCase())
      );
      
      if (foundIndex === -1) {
        foundIndex = dataGrid.findIndex(
          (zone) => txLog.time >= zone.time_frame.from &&
            txLog.time <= zone.time_frame.to &&
            zone.segment_index === 0
        )

        if (foundIndex === -1) {
          console.log("🚀 ~ file: behavior-stats.ts:131 ~ data.forEach ~ zoneIndex:", foundIndex, txLog)
          return;
        }
      }

      dataGrid[foundIndex].count += 1;
      dataGrid[foundIndex].amount += +txLog.amount;
      dataGrid[foundIndex].usd_value += +txLog.usd_value;

      dataGrid[foundIndex].logs.push(txLog);
      dataGrid[foundIndex][txLog.action].logs.push(txLog);
    });

    dataGrid.forEach((zone) => {
      zone.price = zone.amount > 0 ? zone.usd_value / zone.amount : 0;
      
      zone.buy.count = zone.buy.logs.length;
      zone.buy.amount = zone.buy.count > 0 ? sumArrayByField(zone.buy.logs, 'amount') : 0;
      zone.buy.usd_value = zone.buy.count > 0 ? sumArrayByField(zone.buy.logs, 'usd_value') : 0;
      zone.buy.price = zone.buy.amount > 0 ? zone.buy.usd_value / zone.buy.amount : 0;

      zone.sell.count = zone.sell.logs.length;
      zone.sell.amount = zone.sell.count > 0 ? sumArrayByField(zone.sell.logs, 'amount') : 0;
      zone.sell.usd_value = zone.sell.count > 0 ? sumArrayByField(zone.sell.logs, 'usd_value') : 0;
      zone.sell.price = zone.sell.amount > 0 ? zone.sell.usd_value / zone.sell.amount : 0;
      
      const tagList = Array.from(new Set(zone.logs.map(log => log.tags).flat())).filter(t => !!t);
      
      zone.tags = tagList.map(tag => {
        const count = zone.logs.filter(log => log.tags?.includes(tag)).length;
        const amount = count > 0 ? sumArrayByField(zone.logs.filter(log => log.tags?.includes(tag)), 'amount') / count : 0;
        const usd_value = count > 0 ? sumArrayByField(zone.logs.filter(log => log.tags?.includes(tag)), 'usd_value') / count : 0;
        return {
          id: tag,
          count,
          amount,
          usd_value,
        }
      })

      zone.activity_trend_score = zone.usd_value > 0 ? (zone.buy.usd_value - zone.sell.usd_value)/zone.usd_value : 0;
    })

    return dataGrid //.filter(zone => zone.count > 0);
  },
};

export type ActivityScoreCounterType = typeof counter;
export const activityScoreCounter = counter;
