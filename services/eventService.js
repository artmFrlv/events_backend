const {like} = require('sequelize').Op;

const {UserEvent, Event} = require('../models/models');
const ApiError = require('../exceptions/apiError');
const selectDefinedValue = require('../utils/selectDefinedValue');
const arrayDifference = require('../utils/arrayDifference');
const EventDto = require('../dtos/eventDto');

class EventService {
    async getEvent(id, userId) {
        const event = await Event.findOne({where: {id}});
        if (!event) {
            throw ApiError.BadRequest('События с таким id нет');
        }

        const members = [];
        const organizers = [];
        let creator;

        const userEvent = await UserEvent.findAll({where: {eventId: id}});
        for (const item of userEvent) {
            if (item.role === 'MEMBER') {
                members.push(item.userId);
            }
            if (item.role === 'ORGANIZER') {
                organizers.push(item.userId);
            }
            if (item.role === 'CREATOR') {
                creator = item.userId;
            }
        }
        const eventDto = new EventDto(event);
        return {
            eventInfo: eventDto,
            creator,
            organizers,
            members,
            canBeDeleted: userId == creator,
            canBeChanged: userId == creator || organizers.includes(userId),
        }
    }

    async getEventsByUserId(userId) {
        const eventIds = await UserEvent.findAll({
            where: {
                userId,
            },
            attributes: ['eventId'],
        });

        const events = [];

        for (const item of eventIds) {
            const eventId = item.eventId;
            const event = await Event.findOne({where: {id: eventId}});
            const eventDto = new EventDto(event);
            const userEvents = await UserEvent.findAll({where: {eventId}});

            const members = [];
            const organizers = [];
            let creator = null;

            for (const userEvent of userEvents) {
                if (userEvent.role === 'MEMBER') {
                    members.push(userEvent.userId);
                }
                if (userEvent.role === 'ORGANIZER') {
                    organizers.push(userEvent.userId);
                }
                if (userEvent.role === 'CREATOR') {
                    creator = userEvent.userId;
                }
            }

            events.push(
                {
                    eventInfo: eventDto,
                    creator,
                    organizers,
                    members,
                    canBeDeleted: userId == creator,
                    canBeChanged: userId == creator || organizers.includes(userId),
                }
            );
        }

        return events;
    }

    async createEvent(eventParams, userId) {
        const {
            organizers = [],
            title,
            description = null,
            start,
            end,
            isPrivate = false,
            members = [],
        } = eventParams;

        if (!userId || !title || !start || !end) {
            throw ApiError.BadRequest('Не заполненны обязательные поля для создания события');
        }

        const event = await Event.create({title, description, start, end, isPrivate});
        const eventDto = new EventDto(event);

        await UserEvent.create({userId, eventId: event.id, role: 'CREATOR'});

        for (const organizer of organizers) {
            await UserEvent.create({userId: organizer, eventId: event.id, role: 'ORGANIZER'});
        }

        for (const member of members) {
            await UserEvent.create({userId: member, eventId: event.id, role: 'MEMBER'});
        }

        return {
            eventInfo: eventDto,
            creator: userId,
            organizers,
            members,
            canBeDeleted: true,
            canBeChanged: true,
        }
    }

    async changeEvent(eventParams, userId) {
        const {
            id,
            organizers = [],
            title,
            description,
            start,
            end,
            isPrivate,
            members = [],
        } = eventParams;

        const userEvent = await UserEvent.findOne({
            where: {
                userId,
                eventId: id,
            }
        });

        if (!userEvent) {
            throw ApiError.BadRequest('Нет события с таким id');
        }

        if (userEvent.role !== 'CREATOR' && userEvent.role !== 'ORGANIZER') {
            throw ApiError.BadRequest('Нет доступа для изменения события');
        }

        const event = await this.modifyEvent({title, description, start, end, isPrivate}, id);
        const eventDto = new EventDto(event);

        const usersEvents = await UserEvent.findAll({where: {eventId: id}});

        const organizersFromDb = [];
        const membersFromDb = [];

        for (const item of usersEvents) {
            if (item.role === 'MEMBER') {
                membersFromDb.push(item.userId);
            }
            if (item.role === 'ORGANIZER') {
                organizersFromDb.push(item.userId);
            }
        }

        if (userEvent.role === 'CREATOR') {
            await this.editUserList(organizersFromDb, organizers, 'ORGANIZER', id);
        }

        await this.editUserList(membersFromDb, members, 'MEMBER', id);

        return {
            eventInfo: eventDto,
            creator: userId,
            members,
            organizers,
            canBeDeleted: userEvent.role === 'CREATOR',
            canBeChanged: userEvent.role === 'ORGANIZER' || userEvent.role === 'CREATOR',
        }
    }

    async searchEventsByTitle(title) {
        const events = await Event.findAll({
            where: {
                title: {
                    [like]: `${title}%`
                }
            }
        });

        if (!events.length) {
            throw ApiError.BadRequest('Событий с данным названием не существует');
        }

        const eventsDto = [];

        for (const event of events) {
            const eventDto = new EventDto(event);
            eventsDto.push(eventDto);
        }

        return eventsDto;
    }

    async deleteEvent(id, userId) {
        const userEvent = await UserEvent.findOne({
            where: {
                userId,
                eventId: id,
            }
        });
        const event = await Event.findOne({where: {id: id}});

        if (!userEvent) {
            throw ApiError.BadRequest('Нет события с таким id');
        }

        if (userEvent.role !== 'CREATOR') {
            throw ApiError.BadRequest('Нет доступа для изменения события');
        }

        await event.destroy();
        await userEvent.destroy();
    }

    async modifyEvent({
        title,
        description,
        start,
        end,
        isPrivate
    }, id) {
        const event = await Event.findOne({where: {id}});

        event.title = title;
        event.description = description;
        event.isPrivate = isPrivate;
        event.end = end;
        event.start = start;

        await event.save();
        return event;
    }

    async editUserList(usersFromDb, newUsers, role, id) {
        const [needDestroyMembers, needCreateMembers] = arrayDifference(usersFromDb, newUsers);
        const promises = [];
        for (const i of needDestroyMembers) {
            const promise = UserEvent.destroy({
                where: {
                    userId: i,
                    eventId: id,
                }
            });
            promises.push(promise);
        }

        for (const i of needCreateMembers) {
            const promise = UserEvent.create({
                where: {
                    userId: i,
                    eventId: id,
                    role,
                }
            });
            promises.push(promise);
        }

        await Promise.all(promises);
    }
}

module.exports = new EventService();
