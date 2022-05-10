const UserService = require('../services/user-service');
const ReferralService = require('../services/referral-service');
const ApiError = require("../exceptions/api-error");
const {validationResult} = require('express-validator');

class UserController {
    async register(req, res, next) {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return next(ApiError.BadRequest('Validation error', errors.array()));
            }

            const userData = await UserService.register(req.body);

            res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true, sameSite: "none", secure: true});

            return res.json(userData);
        } catch (e) {
            next(e);
        }
    }

    async login(req, res, next) {
        try {
            const userData = await UserService.login(req.body);

            res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true, sameSite: "none", secure: true});

            return res.json(userData);
        } catch (e) {
            next(e);
        }
    }

    async logout(req, res, next) {
        try {
            const {refreshToken} = req.cookies;
            const token = await UserService.logout(refreshToken);

            res.clearCookie('refreshToken');

            return res.json(token);
        } catch (e) {
            next(e);
        }
    }

    async refresh(req, res, next) {
        try {
            const {refreshToken} = req.cookies;
            const userData = await UserService.refresh(refreshToken);

            res.cookie('refreshToken', userData.refreshToken, {
                maxAge: 30 * 24 * 60 * 60 * 1000,
                httpOnly: true,
                sameSite: "none",
                secure: true
            });

            return res.json(userData);

        } catch (e) {
            next(e);
        }
    }

    async startFarm(req, res, next) {
        try {
            await UserService.farmAllUsers();

            return res.json(200)
        } catch (e) {
            next(e)
        }
    }

    async updateProfile(req, res, next) {
        try {
            const {id, data} = req.body
            const user = await UserService.updateUser(id, data)

            return res.json(user)
        } catch (e) {
            next(e)
        }
    }

    async changePassword(req, res, next) {
        try {
            const {id, data} = req.body
            const user = await UserService.changePassword(id, data)

            return res.json(user)
        } catch (e) {
            next(e)
        }
    }

    async makeRef(req, res, next) {
        try  {
            const {user_id, ref} = req.body

            const referral = await ReferralService.makeRef(user_id, ref);

            return res.json(referral);
        } catch (e) {
            next(e)
        }
    }

    async startEarn(req, res, next) {
        try {
            await UserService.start(req.params.userId);

            return res.json(200);
        } catch (e) {
            next(e)
        }
    }

    async transfer(req, res, next) {
        try {
            const {from, to, amount} = req.body;
            const result = await UserService.transfer(from, to, amount);

            return res.json(result);
        } catch (e) {
            next(e)
        }
    }
}

module.exports = new UserController();