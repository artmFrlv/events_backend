const {User, UserInfo} = require('../models/models');
const bcrypt = require('bcrypt');
const uuid = require('uuid');
const tokenService = require('../services/tokenService');
const UserDto = require('../dtos/userDto');
const ApiError = require('../exceptions/apiError');

class UserService {
    async registration(login, email, password, name, secondName, birthday) {
        let candidate = await User.findOne({where: {email}});
        if (candidate) {
            throw ApiError.BadRequest('Пользователь с данным email уже существует');
        }
        candidate = await User.findOne({where: {login}});
        if (candidate) {
            throw ApiError.BadRequest('Пользователь с данным login уже существует');
        }
        const hashPassword = await bcrypt.hash(password, 3);
        const activationLink = uuid.v4();
        const user = await User.create({login, email, activationLink, password: hashPassword});
        const userInfo = await UserInfo.create({name, secondName, birthday, userId: user.id});

        const userDto = new UserDto(user, userInfo);
        const tokens = tokenService.generateToken({...userDto});

        await tokenService.saveToken(user.id, tokens.refreshToken);

        return {
            ...tokens,
            user: userDto,
        }
    }

    async login(login, password) {
        const user = await User.findOne({where: {login}});
        if (!user) {
            throw ApiError.BadRequest('Пользователь с таким логином не найден');
        }
        const isPassEquals = bcrypt.compareSync(password, user.password);
        if (!isPassEquals) {
            throw ApiError.BadRequest('Неверный пароль');
        }
        const userInfo = await UserInfo.findOne({where: {userId: user.id}});
        const userDto = new UserDto(user, userInfo);
        const tokens = tokenService.generateToken({...userDto});
        await tokenService.saveToken(user.id, tokens.refreshToken);

        return {
            ...tokens,
            user: userDto,
        }
    }

    async logout(refreshToken) {
        return await tokenService.removeToken(refreshToken);
    }

    async refresh(refreshToken) {
        if (!refreshToken) {
            throw ApiError.UnauthorizedError();
        }
        const userData = tokenService.validateRefreshToken(refreshToken);
        const authData = await tokenService.findToken(refreshToken);
        if (!userData || !authData) {
            throw ApiError.UnauthorizedError();
        }
        const user = await User.findOne({where: {id: userData.id}});
        const userInfo = await UserInfo.findOne({where: {userId: user.id}});
        const userDto = new UserDto(user, userInfo);
        const tokens = tokenService.generateToken({...userDto});
        await tokenService.saveToken(user.id, tokens.refreshToken);

        return {
            ...tokens,
            user: userDto,
        }
    }
}

module.exports = new UserService();