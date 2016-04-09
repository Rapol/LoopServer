import {
  Router
} from 'express';
import mssql from 'mssql';
import validate from 'express-validation';

import db from '../db';
import schema from '../validators/user';
import logger from '../config/log';

const connection = db.connection();

var router = Router();

router.get('/login', (req, res, next) => {
  var request = new mssql.Request(connection);
  request.query('select * from dbo.profile').then((recordset) => {
    res.send(recordset);
  }).catch((err) => {
    return next(err)
  });
});

router.post('/login', validate(schema.login), (req, res, next) => {
  var ps = new mssql.PreparedStatement(connection);
  ps.input('EmailAddress', mssql.VarChar);
  ps.prepare('select * from dbo.profile where EmailAddress = @EmailAddress')
    .then(() => {
      return ps.execute({
        EmailAddress: req.body.email
      })
    })
    .then((recordset) => {
      if (recordset.length == 0 || recordset[0].Password != req.body.password) {
        let error = new Error('Username or password is incorrect.');
        error.status = 401;
        return next(error);
      }
      var user = {
        email: recordset[0].EmailAddress,
        firstName: recordset[0].FirstName,
        lastName: recordset[0].LastName
      }
      res.send(user);
      return ps.unprepare();
    })
    .catch((err) => {
      return next(err);
    });
});

router.post('/signup', validate(schema.signup), (req, res, next) => {
  logger.user.debug(req.body);
  if (req.body.password != req.body.passwordMatch) {
    let error = new Error('Password does not match');
    error.status = 400;
    return next(error);
  }

  var request = new mssql.Request(connection);
  request.input('Fname', mssql.VarChar, req.body.firstName);
  request.input('LName', mssql.VarChar, req.body.lastName);
  request.input('Email', mssql.VarChar, req.body.email);
  request.input('pswd', mssql.VarChar, req.body.password);
  request.execute('dbo.profile_create')
    .then((recordsets) => {
      res.send({
        email: req.body.email,
        firstName: req.body.firstName,
        lastName: req.body.lastName
      });
    })
    .catch((err) => {
      if (err.number == 2627) {
        let error = new Error('Account already exist with the same email');
        error.status = 409;
        return next(error);
      }
      next(err);
    });
});

// Error handler for user route. Pass the 'user' logger to the global error handlers
router.use((err, req, res, next) => {
  req.logger = logger.user;
  return next(err);
});

export default router;