import Joi from 'joi';

const login = {
  options: {
    allowUnknownBody: false
  },
  body: {
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }
}

const signup = {
  body: {
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    passwordMatch: Joi.string().required(),
    firstName: Joi.string().required(),
    lastName: Joi.string().required()
  }
}

export default {
  login,
  signup
};