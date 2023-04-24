import { ChainList } from '@/constants';
import { SuccessResponse } from '@/core/responseTemplate';
import { CustomRequestType } from '@/loaders/express';
import BlockService from '@/services/block';
import RawTxService from '@/services/rawTx';
import TokenService from '@/services/token';
import { flattenArray } from '@/utils';
import { Job } from 'bullmq';
import { NextFunction } from 'express';
import Container from 'typedi';
import { Logger } from 'winston';
import TxEventQueue from './queue/TxEventQueue';

export async function addTxEventJobs(
  req: CustomRequestType,
  res: Response,
  next: NextFunction,
): Promise<any> {
  const logger: Logger = Container.get('logger');
  logger.debug('Calling get endpoint with body: %o', req.body);

  const { filter, opts } = req.body;

  const { token_id: tokenId, from_time: fromTime } = filter;
  const { force_all, limit } = opts || {};

  const blockService = Container.get(BlockService);
  const tokenService = Container.get(TokenService);
  const rawTxService = Container.get(RawTxService);

  const token = await tokenService.getByID(tokenId);

  const params = await Promise.all(
    token.chains.map(async (chain) => {
      const chainKey = ChainList.find((item) => item.id === chain.id)?.key;
      if (!chainKey) return;

      const block = await blockService.getBlockStatByTimestamp(
        chainKey,
        +fromTime,
      );
      return {
        filter: {
          address: chain.address,
          chain_id: chain.id,
          from_block: +block.block,
        },
        opts: {
          force_all: force_all || false,
          limit: limit || 2000,
        }
      };
    }),
  );

  const txHashList = await Promise.all(
    params.map(async (item) => {
      return await rawTxService.getRawTxByHashListByAddress(item as any);
    }),
  );

  const jobs = flattenArray(txHashList).map((tx) => {
    return <Job>{
      name: 'tx-event',
      data: tx,
      opts: {
        jobId: `tx-event:${tx.tx_hash}`,
        priority: 5,
        removeOnComplete: true,
        removeOnFail: true,
      },
    };
  });

  const queue = new TxEventQueue('tx-event');
  queue.addJobs(jobs);

  const success = new SuccessResponse(res, {
    data: {
      message: 'success',
      numberOfJobs: jobs.length,
    },
  });

  success.send();
}
