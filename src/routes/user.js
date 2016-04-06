import {
  Router
} from 'express';
import mssql from 'mssql';

export default function(connection) {
  var router = Router();

  router.get('/login', (req, res, next) => {
    var request = new mssql.Request(connection);
    request.query('select * from dbo.profile').then((recordset) => {
      console.dir(recordset);
      res.send(recordset);
    }).catch((err) => {
      console.log(err);
    });
  });

  router.post('/login', (req, res, next) => {
    var ps = new mssql.PreparedStatement(connection);
    ps.input('EmailAddress', mssql.VarChar);
    ps.prepare('select * from dbo.profile where EmailAddress = @EmailAddress')
      .then(() => {
        return ps.execute({
          EmailAddress: req.body.email
        })
      })
      .then((recordset) => {
        if (recordset.length == 0) {
          let error = new Error('No matching email');
          error.status = 401;
          throw error;
        }
        if (recordset[0].Password != req.body.password) {
          let error = new Error('Password does not match');
          error.status = 401;
          throw error;
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

  router.post('/signup', (req, res, next) => {
    console.log(req.body);
    if (!req.body.email || !req.body.firstName || !req.body.lastName || !req.body.password) {
      let error = new Error('Fields missing');
      error.status = 400;
      throw error;
    }

    var request = new mssql.Request(connection);
    request.input('Uname', mssql.VarChar, req.body.email);
    request.input('Fname', mssql.VarChar, req.body.firstName);
    request.input('LName', mssql.VarChar, req.body.lastName);
    request.input('Email', mssql.VarChar, req.body.email);
    request.input('pswd', mssql.VarChar, req.body.password);
    request.execute('dbo.profile_create')
      .then(function(recordsets) {
        res.send({
          email: req.body.email,
          firstName: req.body.firstName,
          lastName: req.body.lastName
        });
      })
      .catch(function(err) {
        if (err.number == 2627) {
          let error = new Error('Account already exist with the same email');
          error.status = 409;
          return next(error);
        }
        next(err);
      });
  });

  return router;
}