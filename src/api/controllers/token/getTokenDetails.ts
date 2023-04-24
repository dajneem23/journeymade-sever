import { ErrorResponse, SuccessResponse } from '@/core';
import { ITokenDetailResponse } from '@/interfaces';
import CoinMarketService from '@/services/coinMarket';
import TokenService from '@/services/token';
import { NextFunction, Request, Response } from 'express';
import Container from 'typedi';
import { Logger } from 'winston';

export async function getTokenDetails(req: Request, res: Response, next: NextFunction) {
  const logger: Logger = Container.get('logger');
  logger.debug('Calling get endpoint with query: %o', req.query);

  const { id } = req.params;

  try {
    const service = Container.get(TokenService);
    const token = await service.getByID(id);
    if (!token) {
      const error = new ErrorResponse(res, {
        message: 'Token not found',
        code: 404,
        data: {},
        status: 404,
      });
      error.send();
      return;
    }

    const coinMarketService = Container.get(CoinMarketService);
    const market = await coinMarketService.getByID(id);

    const result = <ITokenDetailResponse>{
      ...token,
      market,
    };
    const success = new SuccessResponse(res, {
      data: result,
    });

    success.send();
  } catch (err) {
    next(err);
  }
}
