module.exports = class UserDto {
    constructor(model, modelInfo) {
        this.id = model.id;
        this.email = model.email;
        this.login = model.login;
        this.isActivated = model.isActivated;
        this.name = modelInfo.name;
        this.secondName = modelInfo.secondName;
        this.birthday = modelInfo.birthday;
    }
};
