const sequelize = require('../db');
const {DataTypes} = require('sequelize');

const User = sequelize.define('user', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    login: {type: DataTypes.STRING, unique: true},
    email: {type: DataTypes.STRING, unique: true},
    isActivated: {type: DataTypes.BOOLEAN, defaultValue: false},
    activationLink: {type: DataTypes.STRING},
    password: {type: DataTypes.STRING},
});

const UserInfo = sequelize.define('userInfo', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    name: {type: DataTypes.STRING, allowNull: false},
    secondName: {type: DataTypes.STRING, allowNull: false},
    birthday: {type: DataTypes.DATE, allowNull: false},
});

const Token = sequelize.define('token', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    refreshToken: {type: DataTypes.STRING(511)},
});

const Event = sequelize.define('event', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    title: {type: DataTypes.STRING, allowNull: false},
    description: {type: DataTypes.STRING},
    start: {type: DataTypes.DATE, allowNull: false},
    end: {type: DataTypes.DATE, allowNull: false},
    isPrivate: {type: DataTypes.BOOLEAN, defaultValue: false},
});

const UserEvent = sequelize.define('user_event', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    role: {type: DataTypes.ENUM('MEMBER', 'ORGANIZER', 'CREATOR')},
});

User.hasOne(Token);
Token.belongsTo(User);

User.hasOne(UserInfo);
UserInfo.belongsTo(User);

User.belongsToMany(Event, {through: UserEvent});
Event.belongsToMany(User, {through: UserEvent});

module.exports = {
    User,
    UserInfo,
    Token,
    Event,
    UserEvent,
};