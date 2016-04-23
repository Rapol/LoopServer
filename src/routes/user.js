import {
	Router
} from 'express';
import validate from 'express-validation';

import schema from '../validators/user';
import middleware from '../config/middleware';
import userService from '../services/user';

var router = Router();

router.get('/', userService.testRoute);

router.post('/login', validate(schema.login), userService.login);

router.post('/signup', validate(schema.signup), userService.signUp);

router.get('/loops', middleware.verifyToken, validate(schema.loop), userService.getLoops);

router.get('/attributes', userService.getAttributes)

// Error handler for user route
router.use(userService.errorHandler);

export default router;