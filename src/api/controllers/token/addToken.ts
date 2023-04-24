import { SuccessResponse } from '@/core';
import { IToken } from '@/interfaces/IToken';
import TokenService from '@/services/token';
import { NextFunction } from 'express';
import Container from 'typedi';
import { Logger } from 'winston';

export async function addToken(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const logger: Logger = Container.get('logger');
  logger.debug('Calling add endpoint with body: %o', req.body);

  const { tokens } = req.body as any;

  try {
    const insertData = tokens.map(
      (token) =>
        <IToken>{
          ...token,
        },
    );

    const serviceInstance = Container.get(TokenService);
    await serviceInstance.insert(insertData);

    const success = new SuccessResponse(res, {
      data: {},
    });

    success.send();
  } catch (err) {
    next(err);
  }
}
