import bunyan from 'bunyan';
import cors from 'cors';
import bodyParser from 'body-parser';

import routes from './routes';
import errorHandlers from './errorHandlers';

var logger = bunyan.createLogger({
  name: 'loop',
  serializers: {
    req: reqSerializer
  }
});

function reqSerializer(req) {
  return {
    method: req.method,
    url: req.url,
    body: req.body
  };
}

export default function express(app) {
  
  app.use(cors());
  app.use(bodyParser.json());
  
  // Log all request under logger 'loop'
  app.use((req, res, next) => {
    logger.info({req});
    next();
  });
  
  routes(app);
  errorHandlers(app);
}