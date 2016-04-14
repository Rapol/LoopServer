import http from 'http';
import express from 'express';

import expressConfig from './config/express';
import db from './config/db';

var app = express();
app.server = http.createServer(app);

db.connect()
  .then(() => {

    app.server.listen(process.env.PORT || 5000);
    console.log(`Started on port ${app.server.address().port}`);
  
    expressConfig(app);

  })
  .catch((err) => console.log(err));