const express = require('express');
const userInfoRouter = express.Router();
const userInfoController = require('../controllers/userInfoController');

userInfoRouter.get('/:id', userInfoController.getUserInfo);
userInfoRouter.get('/search/:login', userInfoController.searchUsersByLogin);

module.exports = userInfoRouter;
