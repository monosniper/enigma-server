const ApiError = require('../exceptions/api-error');

module.exports = function (req, res, next) {
    try {
        const authorizationHeader = req.headers.authorization;
        if (!authorizationHeader) {
            return next(ApiError.UnauthorizedError());
        }

        const accessToken = authorizationHeader.split(' ')[1];
        if (!accessToken) {
            return next(ApiError.UnauthorizedError());
        }

        const [login, password] = new Buffer(accessToken, 'base64').toString('ascii').split(':');
        console.log(login, password)
        if (!login || !password || (login !== process.env.ROOT_LOGIN && password !== process.env.ROOT_PASSWORD)) {
            return next(ApiError.UnauthorizedError());
        }

        next();
    } catch (e) {
        return next(ApiError.UnauthorizedError());
    }
}