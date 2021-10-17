module.exports = class EventDto {
    constructor(model) {
        this.id = model.id;
        this.title = model.title;
        this.description = model.description;
        this.start = model.start;
        this.end = model.end;
        this.isPrivate = model.isPrivate;
    }
};
