import mssql from 'mssql';
import config from './config/env/development';

export default function(cb) {
  const connection = new mssql.Connection(config);

  connection.connect(function(err) {
    if (err) {
      console.log(err);
      cb(err);
    } else {
      console.log("Connected");
      cb(null, connection);
    }
  });
}