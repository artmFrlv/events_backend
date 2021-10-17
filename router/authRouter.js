const authController = require('../controllers/userController');
const express = require('express');
const authRouter = express.Router();
const {body} = require('express-validator');
const authMiddleware = require('../middlewares/authMiddleware');

authRouter.post('/registration',
    body('email').isEmail(),
    body('password').isLength({min: 6, max: 16}),
    body('login').isLength({min: 6, max: 16}),
    authController.registration);
authRouter.post('/login', authController.login);
authRouter.get('/logout', authMiddleware, authController.logout);
authRouter.get('/activate/:link', authMiddleware, authController.activate);
authRouter.get('/refresh', authController.refresh);

module.exports = authRouter;