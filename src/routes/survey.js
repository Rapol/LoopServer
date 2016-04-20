import {
	Router
} from 'express';
import sql from 'mssql';
import validate from 'express-validation';

import db from '../config/db';
import middleware from '../config/middleware';
import schema from '../validators/survey';
import logger from '../config/log';
import questionUtils from '../utils/question';

const connection = db.connection();

var router = Router();
const SURVEY_PER_PAGE = 5;

router.get('/', (req, res, next) => {
	let page = (req.query.page > 0 ? req.query.page : 0) * SURVEY_PER_PAGE;
	var request = new sql.Request(connection);
// 	request.query(`SELECT DISTINCT S.SURVEYID,SURVEYNAME, DESCRIPTION,CREATEDON,QUESTIONTEXT
//                   FROM DBO.SURVEY S JOIN DBO.QUESTIONHEADER Q ON S.SURVEYID = Q.SURVEYID 
//                   ORDER BY S.SURVEYID OFFSET ${page} ROWS FETCH NEXT ${SURVEY_PER_PAGE} ROWS ONLY`)
	request.query(`SELECT S.SURVEYID,SURVEYNAME, DESCRIPTION,CREATEDON
                  FROM DBO.SURVEY S
                  ORDER BY S.SURVEYID OFFSET ${page} ROWS FETCH NEXT ${SURVEY_PER_PAGE} ROWS ONLY`)
		.then((recordset) => {
			let result = recordset.map((survey) => {
				return {
					name: survey.SURVEYNAME,
					description: survey.DESCRIPTION,
					createdOn: survey.CREATEDON,
					questionTitle: survey.QUESTIONTEXT
				}
			});
			res.send(result);
		}).catch((err) => {
			return next(err)
		});
});

router.post('/', middleware.verifyToken, validate(schema.survey), (req, res, next) => {

	// Check question format
	checkQuestions(req.body.questions);
	
	createSurvey(req.id, req.body)
		.then((recordset) => {
			logger.survey.info("Survey Created with id: ", recordset[0][0]);
			// For all questions create a promise for the request to the db
			return req.body.questions.map((question) => {
				return createQuestion(recordset[0][0].SurveyID, req.id, question);
			});
		})
		.then((promises) => {
			// wait for all promises to finish
			return Promise.all(promises);
		})
		.then((questionResult) => {
			logger.survey.info(questionResult, "Question promises result:");
			res.send();
		})
		.catch((err) => {
			return next(err);
		});
});

// Error handler for survey route
router.use((err, req, res, next) => {
	logger.survey.error(err);
	return next(err);
});


// Create or Edit survey
function createSurvey(profileId, survey) {
	logger.survey.info(survey, "Creating survey:");
	// Its a new survey, set it to null
	if (survey.surveyId === undefined) {
		logger.survey.debug("Survey Id is null");
		survey.surveyId = null;
	}

	let loopTable = new sql.Table();

	// Columns must correspond with type we have created in database.
	loopTable.columns.add('SurveyID', sql.Int, {
		nullable: true
	});
	loopTable.columns.add('LoopID', sql.Int);

	survey.loops.forEach((loop) => {
		// Add rows
		loopTable.rows.add(survey.surveyId, loop.loopId); // Values are in same order as columns.
	});

	let attributeTable = new sql.Table();
	
	attributeTable.columns.add('SurveyID', sql.Int, {
		nullable: true
	});
	attributeTable.columns.add('ProfileAttributeID', sql.Int);

	survey.attributes.forEach((attribute) => {
		attributeTable.rows.add(survey.surveyId, attribute.attributeId);
	});

	let request = new sql.Request(connection);
	request.input('SurveyID', sql.Int, survey.surveyId);
	request.input('SurveyName', sql.VarChar, survey.name);
	request.input('Description', sql.VarChar, survey.description);
	request.input('EditedBy', sql.Int, profileId);
	request.input('LoopAssignmentList', loopTable);
	request.input('SurveyProfileAttributeAssignList', attributeTable);
	return request.execute('DBO.SURVEY_SAVE');
}

function checkQuestions(questions) {
	questions.forEach((question, index) => {
		question.typeId = questionUtils.getQuestionTypeId(question.questionType, index);
		question.detailsArray = questionUtils.getQuestionAttributesInfo(question, index);
	});
}

function createQuestion(surveyId, profileId, question) {
	logger.survey.info(question, "Creating question:");
	if (question.questionId === undefined) {
		logger.survey.debug("Question Id is null");
		question.questionId = null;
	}

	let questionDetails = new sql.Table();
	questionDetails.columns.add('QuestionID', sql.Int, {
		nullable: true
	});
	questionDetails.columns.add('QuestionAttributeID', sql.Int);
	questionDetails.columns.add('QuestionAttributeValue', sql.VarChar);

	question.detailsArray.forEach((attribute) => {
		questionDetails.rows.add(question.questionId, attribute.id, attribute.value);
	})

	let request = new sql.Request(connection);
	request.input('QuestionID', sql.Int, question.questionId);
	request.input('SurveyID', sql.Int, surveyId);
	request.input('QuestionTypeID', question.typeId);
	request.input('QuestionText', sql.VarChar, question.title);
	request.input('QuestionDetailSet', questionDetails);
	request.input('EditedBy', sql.Int, profileId);
	return request.execute('DBO.Question_Save');
}


export default router;