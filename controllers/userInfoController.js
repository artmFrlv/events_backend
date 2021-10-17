const userInfoService = require('../services/userInfoService');

class UserInfoController {
    async getUserInfo(req, res, next) {
        try {
            const userId = req.params.id;
            const userData = await userInfoService.getUserById(userId);
            return res.json(userData);
        } catch (e) {
            next(e);
        }
    }

    async searchUsersByLogin(req, res, next) {
        try {
            const userLogin = req.params.login;
            const users = await userInfoService.getUsersByLogin(userLogin);
            return res.json(users);
        } catch (e) {
            next(e);
        }
    }
}

module.exports = new UserInfoController();