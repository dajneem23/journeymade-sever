import { ITokenResponse } from '@/interfaces';
import { Container } from 'typedi';
import { Logger } from 'winston';

export type Metadata = {
  token?: ITokenResponse
}

const attachMetadata = async (req, res, next) => {
  const Logger: Logger = Container.get('logger');
  try {
    req.metadata = {};
    return next();
  } catch (e) {
    Logger.error('🔥 Error attaching user to req: %o', e);
    return next(e);
  }
};

export default attachMetadata;