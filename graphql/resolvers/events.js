const Event = require('../../models/event');
const User = require('../../models/user');

const { transformEvent } = require('./merge');
  
module.exports = {
    events: async () => {
        try {
            const events = await Event.find();
            return events.map(event => {
                return transformEvent(event);
            });
        } catch (err) {
            throw err;
        }
    },
    createEvent: async (args, req) => {
        if (!req.isAuth) {
            throw new Error('Unauthenticated.');
        }
        const event = new Event({
            title: args.eventInput.title,
            description: args.eventInput.description,
            type: args.eventInput.type,
            dateStart: new Date(args.eventInput.dateStart),
            dateEnd: new Date(args.eventInput.dateEnd),
            creator: req.userId
        });
        let createdEvent;
        try {
            const savedEvent = await event.save();
            createdEvent = transformEvent(savedEvent);

            const creator = await User.findById(req.userId);
            if (!creator) {
                throw new Error('User does not exist.');
            }
            creator.createdEvents.push(event);
            await creator.save();

            return createdEvent;
        } catch (err) {
            throw err;
        }
    }
};
