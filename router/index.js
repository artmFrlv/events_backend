const Router = require('express');
const authRouter = require('./authRouter');
const userInfoRouter = require('./userInfoRouter');
const eventRouter = require('./eventRouter');

const router = new Router();

router.use('/auth', authRouter);
router.use('/users', userInfoRouter);
router.use('/events', eventRouter);

module.exports = router;
