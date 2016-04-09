import cors from 'cors';
import bodyParser from 'body-parser';

import routes from './routes';
import errorHandlers from './errorHandlers';
import logger from './log';

export default function express(app) {
  
  app.use(cors());
  app.use(bodyParser.json());
  
  // Log all request under logger 'loop'
  app.use((req, res, next) => {
    logger.app.info({req});
    next();
  });
  
  routes(app);
  errorHandlers(app);
}