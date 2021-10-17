const express = require('express');
const eventController = require('../controllers/eventController');
const authMiddleware = require('../middlewares/authMiddleware');

const eventRouter = express.Router();

eventRouter.get('/:id', authMiddleware, eventController.getEvent);
eventRouter.get('/users/:userId', authMiddleware, eventController.getEventsByUserId);
eventRouter.get('/search/:title', authMiddleware, eventController.searchEventsByTitle);
eventRouter.get('/delete/:id', authMiddleware, eventController.deleteEvent);
eventRouter.post('/create', authMiddleware, eventController.createEvent);
eventRouter.post('/change', authMiddleware, eventController.changeEvent);

module.exports = eventRouter;

