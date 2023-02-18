import { groupBy } from '@/core/utils';
import { getResults } from '@/modules/debank/services/getResults';
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

export default router;