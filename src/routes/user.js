import {
	Router
} from 'express';
import sql from 'mssql';
import validate from 'express-validation';
import jwt from 'jsonwebtoken';

import db from '../config/db';
import env from '../config/env/development'
import schema from '../validators/user';
import logger from '../config/log';
import middleware from '../config/middleware';

const connection = db.connection();

var router = Router();

router.get('/', (req, res, next) => {
	let request = new sql.Request(connection);
	request.query('select * from dbo.profile').then((recordset) => {
		res.send(recordset);
	}).catch((err) => {
		return next(err)
	});
});

router.post('/login', validate(schema.login), (req, res, next) => {
	let request = new sql.Request(connection);
	request.query(`SELECT ProfileiD, FirstName, LastName, Password FROM DBO.PROFILE WHERE EmailAddress = '${req.body.email}'`)
		.then((recordset) => {
			if (recordset.length == 0 || recordset[0].Password != req.body.password) {
				let error = new Error('Username or password is incorrect.');
				error.status = 401;
				return next(error);
			}
			let token = jwt.sign({
				profileId: recordset[0].ProfileiD
			}, env.jwt.secret, {
				expiresIn: "1d"
			});
			let user = {
				firstName: recordset[0].FirstName,
				lastName: recordset[0].LastName,
				token: token
			}
			res.send(user);
		})
		.catch((err) => {
			return next(err);
		});
});

router.post('/signup', validate(schema.signup), (req, res, next) => {
	if (req.body.password != req.body.confirmedPassword) {
		let error = new Error('Password does not match');
		error.status = 400;
		return next(error);
	}

	let request = new sql.Request(connection);
	request.input('Fname', sql.VarChar, req.body.firstName);
	request.input('LName', sql.VarChar, req.body.lastName);
	request.input('Email', sql.VarChar, req.body.email);
	request.input('pswd', sql.VarChar, req.body.password);
	request.execute('DOB.PROFILE_CREATE')
		.then((recordsets) => {
			// TODO: check if proc returns profileId
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

router.get('/loops', middleware.verifyToken, validate(schema.loop), (req, res, next) => {
	let request = new sql.Request(connection);
	request.query(`SELECT L.LoopId, Name FROM DBO.PROFILE AS P JOIN DBO.LoopMembership AS M ON
	        P.ProfileId = M.ProfileId
	        JOIN DBO.LOOP AS L ON
	        M.LoopId = L.LoopId
	        WHERE P.ProfileId = ${req.profileId}`)
		.then((recordset) => {
			if (recordset.length == 0) {
				res.sendStatus(404);
			}
			res.send(recordset);
		})
		.catch((err) => {
			return next(err)
		});
});

router.get('/attributes', (req, res, next) => {
	let ps = new sql.Request(connection);
	ps.query("SELECT * FROM DBO.ProfileAttribute")
		.then((recordset) => {
			res.send(recordset);
		})
		.catch((err) => {
			return next(err)
		});
});

// Error handler for user route
router.use((err, req, res, next) => {
	logger.user.error(err);
	return next(err);
});

export default router;