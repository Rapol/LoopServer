import {
  Router
} from 'express';
import sql from 'mssql';

import db from '../config/db';
import logger from '../config/log';
import refData from '../utils/refData'

const connection = db.connection();

var router = Router();

router.get('/attributes', (req, res, next) => {
	res.send(refData.getQuestionAttributes());
});

router.get('/types', (req, res, next) => {
	res.send(refData.getQuestionTypes());
});

router.get('/map', (req, res, next) => {
	res.send(refData.getAttributeTypeMap());
});

// Error handler for question route
router.use((err, req, res, next) => {
	logger.question.error(err);
	return next(err);
});

export default router;