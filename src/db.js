import mssql from 'mssql';
import config from './config/env/development';

const connection = new mssql.Connection(config);

export default {
  connect: () => { return connection.connect()},
  connection: () => { return connection}
}