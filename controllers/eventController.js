const eventService = require('../services/eventService');

class EventController {
    async getEventsByUserId(req, res, next) {
        try {
            const userId = req.params.userId;
            const eventsData = await eventService.getEventsByUserId(userId);
            return res.json(eventsData);
        } catch (e) {
            next(e);
        }
    }

    async createEvent(req, res, next) {
        try {
            const eventParams = req.body;
            const userId = req.user.id;
            const eventData = await eventService.createEvent(eventParams, userId);
            return res.json(eventData);
        } catch (e) {
            next(e);
        }
    }

    async changeEvent(req, res, next) {
        try {
            const eventParams = req.body;
            const userId = req.user.id;

            const eventData = await eventService.changeEvent(eventParams, userId);
            return res.json(eventData);
        } catch (e) {
            next(e);
        }
    }

    async getEvent(req, res, next) {
        try {
            const id = req.params.id;
            const userId = req.user.id;
            const eventData = await eventService.getEvent(id, userId);
            return res.json(eventData);
        } catch (e) {
            next(e);
        }
    }

    async searchEventsByTitle(req, res, next) {
        try {
            const title = req.params.title;
            const events = await eventService.searchEventsByTitle(title);
            return res.json(events);
        } catch (e) {
            next(e);
        }
    }

    async deleteEvent(req, res, next) {
        try {
            const id = req.params.id;
            const userId = req.user.id;
            await eventService.deleteEvent(id, userId);
            return res.json();
        } catch (e) {
            next(e);
        }
    }
}

module.exports = new EventController();