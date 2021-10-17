const {like} = require('sequelize').Op;

const {User, UserInfo} = require('../models/models');
const ApiError = require('../exceptions/apiError');
const UserDto = require('../dtos/userDto');

class UserInfoService {
    async getUserById(id) {
        const user = await User.findOne({
            where: {id},
        });
        const userInfo = await UserInfo.findOne({
            where: {
                userId: id,
            }
        });
        if (!user || !UserInfo) {
            throw ApiError.BadRequest('Пользователя с данным id не существует');
        }
        const userDto = new UserDto(user, userInfo);
        return userDto;
    }

    async getUsersByLogin(login) {
        const users = await User.findAll({
            where: {
                login: {
                    [like]: `${login}%`,
                }
            },
            limit: 10,
        });

        if (!users.length) {
            throw ApiError.BadRequest('Пользователей с данным логином не существует');
        }

        const usersDto = [];
        for (const user of users) {
            const userInfo = await UserInfo.findOne({
                where: {
                    userId: user.id,
                }
            });
            const userDto = new UserDto(user, userInfo);
            usersDto.push(userDto);
        }

        return usersDto;
    }
}

module.exports = new UserInfoService();