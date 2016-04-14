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
    confirmedPassword: Joi.string().required(),
    firstName: Joi.string().required(),
    lastName: Joi.string().required()
  }
}

const loop = {
  options: {
    allowUnknownBody: false
  }
}

export default {
  login,
  signup,
  loop
};