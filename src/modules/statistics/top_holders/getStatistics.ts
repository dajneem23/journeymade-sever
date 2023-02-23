import { sumArrayByField } from '@/core/utils';
import { avgValue } from '../utils/avgValue';
import calculatePercentage from '../utils/calculatePercentage';

export default function ({ portfolios, crawl_ids, filter: { address = '' } }) {
  const period0Raw = address
    ? portfolios['0'].filter((p) => p.wallet_address === address)
    : portfolios['0'];

  const period0Values = {
    amount: sumArrayByField(period0Raw, 'amount'),
    usd_value: sumArrayByField(period0Raw, 'usd_value'),
  };

  const result = crawl_ids.map(({ period, from_time, to_time }) => {
    const raw =
      (address
        ? portfolios[String(period)].filter((p) => p.wallet_address === address)
        : portfolios[String(period)]) || [];

    if (raw.length === 0) return;

    const values = {
      period,
      amount: +sumArrayByField(raw, 'amount').toFixed(3),
      usd_value: +sumArrayByField(raw, 'usd_value').toFixed(3),
      from_time,
      to_time
    };

    const price =
      raw.length > 0 ? avgValue(raw, 'price') : null;
    if (price > 0) {
      values['price'] = +price.toFixed(3);
    }

    if (period !== 0 && raw.length > 0) {
      values['percentage_change'] = calculatePercentage(
        period0Values.amount,
        values.amount,
      );
      values['usd_percentage_change'] = calculatePercentage(
        period0Values.usd_value,
        values.usd_value,
      );
    }

    if (address) {
      const chains = Array.from(new Set(raw.map((i) => i.chain))).join(',');
      if (chains) values['chains'] = chains;

      const poolAdapterIds = Array.from(
        new Set(new Set(raw.map((i) => i.pool_adapter_id))),
      ).join(',');
      if (poolAdapterIds) values['pool_adapter_ids'] = poolAdapterIds;
    }

    return values;
  });

  return result.filter(el => el)
}
