import { SuccessResponse } from "@/core";
import AppError from "@/core/appError";
import TransactionEventService from "@/services/transactionEvent";
import { NextFunction, Request, Response } from "express";
import Container from "typedi";
import { Logger } from "winston";

export async function getLogsByTxHash(req: Request, res: Response, next: NextFunction) {
  const logger: Logger = Container.get('logger');
  logger.debug('Calling get endpoint with query: %o', req.query);

  const { hash } = req.params;
  if (!hash) throw new AppError(400, 'fail', 'tx_hash is required');

  try {
    const serviceInstance = Container.get(TransactionEventService);
    const logs = await serviceInstance.getByTxHash({ tx_hash: String(hash) })

    const success = new SuccessResponse(res, {
      data: logs,
    });

    success.send();
  } catch (err) {
    next(err);
  }
}