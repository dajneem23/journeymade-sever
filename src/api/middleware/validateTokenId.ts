import { ErrorResponse } from '@/core';
import { CustomRequestType } from '@/loaders/express';
import TokenService from '@/services/token';
import { NextFunction, Request, Response } from 'express';
import Container from 'typedi';
import { Logger } from 'winston';

const validateTokenId = async (
  tokenId,
  req: CustomRequestType,
  res: Response,
  next: NextFunction,
) => {
  const Logger: Logger = Container.get('logger');
  const tokenService = Container.get(TokenService);

  try {
    const token = tokenId && (await tokenService.getByID(tokenId));

    if (!token) {
      const error = new ErrorResponse(res, {
        message: 'Token not found',
        code: 404,
        data: {},
        status: 404,
      });

      return error.send();
    }

    req.metadata.token = token;
    return next();
  } catch (e) {
    Logger.error('🔥 Error attaching user to req: %o', e);
    return next(e);
  }
};

const fromReqParams = async (
  req: CustomRequestType,
  res: Response,
  next: NextFunction,
) => {
  const { tokenId } = req.params;
  console.log("🚀 ~ file: validateTokenId.ts:45 ~ tokenId:", tokenId)
  return await validateTokenId(tokenId, req, res, next);
};

const fromReqQuery = async (
  req: CustomRequestType,
  res: Response,
  next: NextFunction,
) => {
  const { tokenId } = req.query;
  return await validateTokenId(tokenId, req, res, next);
};

export default {
  fromReqParams,
  fromReqQuery
};
