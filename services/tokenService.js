const jwt = require('jsonwebtoken');
const {Token} = require('../models/models');

class TokenService {
    generateToken(payload) {
        const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {expiresIn: '30m'});
        const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {expiresIn: '30d'});
        return {
            accessToken,
            refreshToken,
        }
    }

    validateAccessToken(token) {
        try {
            return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
        } catch (e) {
            return null;
        }
    }

    validateRefreshToken(token) {
        try {
            return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
        } catch (e) {
            return null;
        }
    }

    async saveToken(userId, refreshToken) {
        const authData = await Token.findOne({where: {userId}});
        if (authData) {
            authData.refreshtoken = refreshToken;
            await authData.save();
        }
        await Token.create({userId, refreshToken});
    }

    async removeToken(refreshToken) {
        await Token.destroy({where: {refreshToken}});
    }

    async findToken(refreshToken) {
        return await Token.findOne({where: {refreshToken}});
    }
}

module.exports = new TokenService();