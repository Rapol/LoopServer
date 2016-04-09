import ev from 'express-validation'
import logger from './log';

export default function errorHandlers(app){
   // handle Validation errors
  app.use(function(err, req, res, next) {
    // Every route attatches a logger to the request. We can determine from where this error was originated
    req.logger.error(err);
    if (err instanceof ev.ValidationError) {
      res.status(err.status).send(err);
    } else {
      return next(err);
    }
  });

  // handling all errors except 500
  app.use(function(err, req, res, next) {
    if (err.status == 500) {
      return next(err);
    }
    res.status(err.status).send({
      status: err.status,
      message: err.message
    });
  });

  // 500 error handler
  app.use(function(err, req, res, next) {
    logger.app.error(err);
    res.status(500).send({
      status: 500,
      message: 'internal error',
      type: 'internal'
    });
  });
}