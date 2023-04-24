import { SuccessResponse } from '@/core';
import { ITokenResponse } from '@/interfaces';
import TokenService from '@/services/token';
import { groupBy } from '@/utils';
import { NextFunction, Request, Response } from 'express';
import Container from 'typedi';
import { Logger } from 'winston';

export async function getTokenList(req: Request, res: Response, next: NextFunction) {
  const logger: Logger = Container.get('logger');
  logger.debug('Calling get endpoint with query: %o', req.query);

  // const { symbols, page = 1, limit = 50 } = req.query;
  try {
    const serviceInstance = Container.get(TokenService);
    const { items } = await serviceInstance.getEnabledTokenList();

    const tokens = groupBy(items, 'id');
    const tokenIds = Object.keys(tokens);
    const result = tokenIds.map((id) => {
      const items = tokens[id];
      return <ITokenResponse>{
        id: items[0].id,
        name: items[0].name,
        symbol: items[0].symbol,
        coingeckoId: items[0].coingeckoId,
        logoURI: items[0].logoURI,

        chains: items.map((t) => t.chainId),
        addresses: items.map((t) => t.address),
      };
    });

    const success = new SuccessResponse(res, {
      data: {
        items: result,
        has_more: false,
        page: 1,
        total: result.length,
      },
    });

    success.send();
  } catch (err) {
    next(err);
  }
}
