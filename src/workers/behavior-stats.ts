import { EAccountTags } from "../interfaces"
import { expose } from "threads/worker"

const tags = Object.values(EAccountTags);

const counter = {
  getStats(value) {
    const result = {
      buy: {},
      sell: {}
    }
    const buy = {}
    const sell = {}

    tags.forEach((tag) => {
      Object.keys(result).forEach((activity) => {
        result[activity][tag] = {
          count: 0,
          amount: 0,
          volume: 0,
          accounts: {}
        };
      });
    })

    value.forEach((item) => {
      tags.forEach((tag) => {
        Object.keys(result).forEach(activity => update(activity, tag, item))
      })
    })

    function update(activity, tag, data) {
      const accountField = activity === 'buy' ? 'to_account' : 'from_account';
      const tagField = activity === 'buy' ? 'to_account_tags' : 'from_account_tags';

      if (data[tagField] && data[tagField].includes(tag)) {
        const item = result[activity][tag];

        item.count += 1;
        item.amount += data.amount;
        item.volume += data.usd_value;

        if (!item.accounts[data[accountField]]) {
          item.accounts[data[accountField]] = {
            count: 0,
            amount: 0,
            volume: 0,
          }
        }

        item.accounts[data[accountField]].count += 1;
        item.accounts[data[accountField]].amount += +data.amount;
        item.accounts[data[accountField]].volume += +data.usd_value;
      }
    }

    return result;
  },
}

export type Counter = typeof counter

expose(counter)