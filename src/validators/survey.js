import Joi from 'joi';

const survey = {
  body: {
    name: Joi.string().required(),
    description: Joi.string().allow(''),
    loops: Joi.array().items(Joi.object()),
    attributes: Joi.array().items(Joi.object())
  }
}

export default {
  survey
};