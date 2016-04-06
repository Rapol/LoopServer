import http from 'http';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

import config from './config/env/development';
import db from './db';
import user from './routes/user';

var app = express();
app.server = http.createServer(app);

app.use(cors({
  exposedHeaders: ['Link']
}));

app.use(bodyParser.json({
  limit: '100kb'
}));

db((err, connection) => {
  
  if(err){
    return;
  }
  
  app.server.listen(process.env.PORT || 5000);
  console.log(`Started on port ${app.server.address().port}`);
  
  app.use('/', user(connection));

  // handling all errors except 500
  app.use(function(err, req, res, next) {
    if (err.status == 500) {
      return next(err);
    }
    console.log(err.message);
    res.status(err.status).send({
      status: err.status,
      message: err.message,
      type: 'internal'
    });
  });

  // Last error handler
  app.use(function(err, req, res, next) {
    console.log(err.message);
    // send back a 500 with a generic message
    res.status(500).send({
      status: 500,
      message: 'internal error',
      type: 'internal'
    });
  });
});

export default app;