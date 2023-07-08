import { Router } from 'express';
import { healthCheck } from '@/controllers/base';

const route = Router();

export default (app: Router) => {
  app.use('/health', route);

  route.get('/', healthCheck);
};
