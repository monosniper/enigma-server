const UserModel = require('../models/user-model');
const bcrypt = require('bcrypt');
require('dotenv').config();
const MailService = require('./mail-service');
const TokenService = require('./token-service');
const UserDto = require('../dtos/user-dto');
const ApiError = require('../exceptions/api-error');
const randomstring = require('randomstring');

class UserService {
    async register({ email, name, password, bio }) {
        if (await UserModel.findOne({email})) {
            throw ApiError.BadRequest('User with this email address already exists.');
        }

        const hashPassword = await bcrypt.hash(password, 1);
        const number = '0x' + randomstring.generate({
            length: 40,
            charset: 'alphanumeric'
        });
        const ref_code = randomstring.generate(8);
        // const activationLink = await uuid.v4();

        const user = await UserModel.create({
            name,
            email,
            bio,
            password: hashPassword,
            number,
            ref_code,
        });

        // Send verification emails
        // await MailService.sendActivationMail(email, `${process.env.API_URL}/api/activate/${activationLink}`);

        const userDto = new UserDto(user);
        const tokens = await TokenService.generateTokens({...userDto});

        await TokenService.saveToken(userDto.id, tokens.refreshToken);

        return {
            ...tokens, user: userDto
        };
    }

    async updateUser(_id, data) {
        try {
            const user = await UserModel.findOneAndUpdate({_id}, data, {new: true});
            return new UserDto(user);
        } catch (e) {
            throw ApiError.BadRequest('This email is already taken.');
        }
    }

    async changePassword(id, data) {
        const {oldPassword, newPassword} = data;
        const user = await UserModel.findById(id);

        if (oldPassword !== newPassword) {
            const isPassEquals = await bcrypt.compare(oldPassword, user.password);

            if (isPassEquals) {
                user.password = await bcrypt.hash(newPassword, 1);
                user.save();
            } else {
                throw ApiError.BadRequest('The old password is incorrect.');
            }
        } else {
            throw ApiError.BadRequest('The new password can not be like old.');
        }

        return new UserDto(user);
    }

    async login({email, password}) {
        const user = await UserModel.findOne({email});

        if (!user) {
            throw ApiError.BadRequest('No user with this email address.');
        }

        const isPassEquals = await bcrypt.compare(password, user.password);

        if (!isPassEquals) {
            throw ApiError.BadRequest('Incorrect email or password.');
        }

        const userDto = new UserDto(user);
        const tokens = await TokenService.generateTokens({...userDto});

        await TokenService.saveToken(userDto.id, tokens.refreshToken);

        return {
            ...tokens, user: userDto
        };
    }

    async logout(refreshToken) {
        const token = await TokenService.removeToken(refreshToken);
        return token;
    }

    async refresh(refreshToken) {
        if (!refreshToken) {
            throw ApiError.UnauthorizedError();
        }

        const userData = TokenService.validateRefreshToken(refreshToken);
        const tokenData = TokenService.findToken(refreshToken);

        if (!userData || !tokenData) {
            throw ApiError.UnauthorizedError();
        }

        const user = await UserModel.findById(userData.id);
        const userDto = new UserDto(user);
        const tokens = await TokenService.generateTokens({...userDto});

        await TokenService.saveToken(userDto.id, tokens.refreshToken);

        return {
            ...tokens, user: userDto
        };
    }

    async getAllUsers() {
        const users = await UserModel.find();
        const usersDtos = await users.map(user => new UserDto(user));

        return usersDtos;
    }

    async changePassword(id, data) {
        const {oldPassword, newPassword} = data;
        const user = await UserModel.findById(id);

        if (oldPassword !== newPassword) {
            const isPassEquals = await bcrypt.compare(oldPassword, user.password);

            if (isPassEquals) {
                user.password = await bcrypt.hash(newPassword, 1);
                user.save();
            } else {
                throw ApiError.BadRequest('Старый пароль не верный');
            }
        } else {
            throw ApiError.BadRequest('Новый пароль не может быть таким же как старый');
        }

        return new UserDto(user);
    }
}


module.exports = new UserService();