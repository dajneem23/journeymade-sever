import { groupBy } from '@/core/utils';
import { getResults } from '@/modules/_temp/debank/services/getResults';
import { getBySymbol } from '@/modules/_temp/statistics/services/getBySymbol';
import { getSymbols } from '@/modules/_temp/statistics/services/getSymbols';
import express from 'express';
const router = express.Router();

// middleware that is specific to this router
router.use((req, res, next) => {
  // console.log('Time: ', Date.now())
  next();
});

// define the home page route
router.get('/', (req, res) => {
  res.send('onchain apis');
});

router.get('/top-holders-segments', async function (req, res) {
  const {
    limit = 100,
    offset = 0,
    type = null,
    symbol,
    show_holders = false,
    min_pc = 5,
    max_pc = 10000,
  } = req.query || {};

  if (limit > 500) {
    return res.status(400).send('Invalid query');
  }

  const rows = await getResults({
    symbol,
    limit,
    offset,
    min_pc,
    max_pc,
  });
  let result = rows.map((row: any) => {
    const { symbol, crawl_id, holders } = row;
    return {
      ...row,
      holders: show_holders === false ? 'hidden' : holders,
      _key: `${symbol}-${crawl_id}`,
    };
  });

  if (type === 'bullish') {
    result = result.filter((item) => item.percentage_change > 0);
  } else if (type === 'bearish') {
    result = result.filter((item) => item.percentage_change < 0);
  }

  const groups = groupBy(result, '_key');

  res.send(groups);
});

router.get('/top-holders-statistics', async function (req, res) {
  const { symbol, cid } = req.query || {};
  if (!symbol && !cid) {
    return res.status(400).send('Invalid query');
  }

  const rows = await getBySymbol({
    symbol,
    crawl_id: cid,
  });

  const result = rows.map((row: any) => {
    return {
      ...row,
      holders: null,
      // hot_wallets: cid ? row.hot_wallets : null,
    };
  });

  const groups = groupBy(result, 'crawl_id');

  res.send(groups);
});

router.get('/symbols', async function (req, res) {
  try {
    const rows = await getSymbols();
    res.send(rows);
  } catch (e) {
    return res.status(500).send(e);
  }
});

export default router;
