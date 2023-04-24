import { Router } from 'express';
import apicache from 'apicache';

const route = Router();

export default (app: Router) => {
  app.use('/cache', route);

  // add route to display cache performance (courtesy of @killdash9)
  route.get('/performance', (req, res) => {
    res.json(apicache.getPerformance());
  });

  // add route to display cache index
  route.get('/index', (req, res) => {
    res.json(apicache.getIndex());
  });

  // add route to manually clear target/group
  app.get('/cache/clear/:target?', (req, res) => {
    res.json(apicache.clear(req.params.target));
  });
};
