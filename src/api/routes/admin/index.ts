import { Router } from 'express';
import trigger from './trigger';

const route = Router();

export default (app: Router) => {
  trigger(route);

  app.use('/admin', route);
  
  return app;
};
