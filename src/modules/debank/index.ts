import { getCoinList } from "./services"
import { getSignals } from "./signals"
import schedule from "node-schedule"

export default async () => {
  // (await getCoinList()).map(async symbol => await getSignals(symbol))
  schedule.scheduleJob('*/10 * * * *', async function(){
    (await getCoinList()).map(async symbol => await getSignals(symbol))
  });
}