import {
  Router
} from 'express';
import sql from 'mssql';
import validate from 'express-validation';

import db from '../config/db';
import survey from '../../test/mock/survey.js'
import schema from '../validators/survey';
import logger from '../config/log';

const connection = db.connection();

var router = Router();
const SURVEY_PER_PAGE = 5;

router.get('/', (req, res, next) => {
  let page = (req.query.page > 0 ? req.query.page : 0);
  let surveys = survey.market.concat(survey.market);

  let start = page * SURVEY_PER_PAGE;
  let end = start + SURVEY_PER_PAGE;

  if (end - surveys.length > 0) {
    surveys = surveys.slice(start, start + (end - surveys.length));
  } else if (end >= surveys.length) {
    surveys = [];
  } else {
    surveys = surveys.slice(start, end);
  }

  res.status(200).send(surveys);
});

router.post('/', validate(schema.survey), (req, res, next) => {
  createSurvey(req.body)
    .then((recordset) => {
      logger.survey.debug("Survey Created with id: ", recordset[0][0])
      res.status(200).send(recordset);
    })
  .catch((err) => {
    return next(err);
  })
});

// Create or Edit survey
function createSurvey(survey) {
  logger.survey.debug({survey: survey}, " -> Creating survey");
  if(survey.surveyId === undefined){
    logger.survey.debug("Survey Id is null");
    survey.surveyId = null;
  }
  
  let loopTable = new sql.Table();
  
  // Columns must correspond with type we have created in database.
  loopTable.columns.add('SurveyID', sql.Int, {nullable: true});
  loopTable.columns.add('LoopID', sql.Int);

  survey.loops.forEach((loop) => {
    // Add rows
    loopTable.rows.add(survey.surveyId, loop.loopId); // Values are in same order as columns.
  });

  let attributeTable = new sql.Table();
  attributeTable.columns.add('SurveyID', sql.Int, {nullable: true});
  attributeTable.columns.add('ProfileAttributeID', sql.Int);

  survey.attributes.forEach((attribute) => {
    attributeTable.rows.add(survey.surveyId, attribute.attributeId);
  });
  
  let request = new sql.Request(connection);
  request.input('SurveyID', sql.Int, survey.surveyId);
  request.input('SurveyName', sql.VarChar, survey.surveyName);
  request.input('Description', sql.VarChar, survey.description);
  request.input('EditedBy', sql.Int, survey.profileId);
  request.input('LoopAssignmentList', loopTable);
  request.input('SurveyProfileAttributeAssignList', attributeTable);
  return request.execute('DBO.SURVEY_SAVE');
}

// Error handler for survey route
router.use((err, req, res, next) => {
  logger.survey.error(err);
  return next(err);
});

export default router;