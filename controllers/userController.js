const userService = require('../services/userService');
const {validationResult} = require('express-validator');
const ApiError = require('../exceptions/apiError');

class UserController {
    async registration(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return next(ApiError.BadRequest('Ошибка при валидации', errors.array()))
            }
            const {login, email, password, name, secondName, birthday} = req.body;

            const userData = await userService.registration(login, email, password, name, secondName, birthday);

            res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true});
            res.cookie('accessToken', userData.accessToken, {maxAge: 60 * 60 * 1000});
            return res.json(userData.user);
        } catch (e) {
            next(e);
        }
    }

    async login(req, res, next) {
        try {
            const {login, password} = req.body;
            const userData = await userService.login(login, password);
            res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true});
            res.cookie('accessToken', userData.accessToken, {maxAge: 60 * 60 * 1000});
            return res.json(userData.user);
        } catch (e) {
            next(e);
        }
    }

    async logout(req, res, next) {
        try {
            const {refreshToken} = req.cookies;
            await userService.logout(refreshToken);
            res.clearCookie('refreshToken');
            res.clearCookie('accessToken');
            return res.json();
        } catch (e) {
            next(e);
        }
    }

    async activate(req, res, next) {
        try {

        } catch (e) {

        }
    }

    async refresh(req, res, next) {
        try {
            const {refreshToken} = req.cookies;
            const userData = await userService.refresh(refreshToken);
            res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true});
            res.cookie('accessToken', userData.accessToken, {maxAge: 60 * 60 * 1000});
            return res.json(userData.user);
        } catch (e) {
            next(e);
        }
    }
}

module.exports = new UserController();