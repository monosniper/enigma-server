const UserModel = require('../models/user-model');
const ReferralModel = require('../models/referral-model');
const bcrypt = require('bcrypt');
require('dotenv').config();
const MailService = require('./mail-service');
const TokenService = require('./token-service');
const UserDto = require('../dtos/user-dto');
const ApiError = require('../exceptions/api-error');
const randomstring = require('randomstring');
const mongoose = require("mongoose");
const schedule = require("node-schedule");
const moment = require("moment");

class UserService {
    async register({email, name, password, bio}) {
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

        const user = await UserModel.findById(userData.id).populate('refs');
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

    async farmAllUsers() {
        await UserModel.find().exec((err, users) => {
            users.map(user => {
                try {
                    if(new Date(user.activeUntil) < Date.now()) {
                        user.isActive = false;
                        user.save({validateModifiedOnly: true})
                    }

                    if(user.isActive) {
                        const token_rate = parseFloat(user.token_rate / 1000).toFixed(4);
                        const balance = parseFloat(user.balance / 1000).toFixed(4);

                        user.balance = parseFloat((parseFloat(token_rate) + parseFloat(balance)) * 1000).toFixed(4)
                        user.save({validateModifiedOnly: true})
                    }
                } catch (e) {
                    console.log(e)
                }

                return user;
            })
        });
    }

    async start(user_id) {
        // const date = new Date(Date.now() + (3600 * 1000 * 24));
        const date = moment().add(1, 'day');
        console.log(date)
        await UserModel.findByIdAndUpdate(user_id, {isActive: true, activeUntil: date});
        await ReferralModel.findOneAndUpdate({user: user_id}, {isActive: true})

        return date;

        // Mine every hour
        // await schedule.scheduleJob({ start: Date.now(), end: date, rule: '0 * * * *' }, function(){
        //     UserModel.findById(user_id).exec((err, user) => {
        //         user.balance = (user.token_rate / 1000 + user.balance / 1000) * 1000
        //         user.save({validateModifiedOnly: true})
        //     });
        // });
        //
        // // Deactivate mining after 1 day
        // await schedule.scheduleJob(date, function() {
        //     UserModel.findByIdAndUpdate(user_id, {isActive: false});
        //     ReferralModel.findOneAndUpdate({user: user_id}, {isActive: false})
        // });
    }

    async end(user_id) {
        await UserModel.findByIdAndUpdate(user_id, {isActive: false, activeUntil: null});
        await ReferralModel.findOneAndUpdate({user: user_id}, {isActive: false})
    }

    async transfer(from, to, amount) {
        if(!to) throw ApiError.BadRequest('To field is required!');
        if(!amount) throw ApiError.BadRequest('Amount field is required!');

        const formatted_amount = parseFloat(amount).toFixed(2);
        console.log('formatted_amount',formatted_amount)
        const from_user = await UserModel.findOne({number: from});
        const to_user = await UserModel.findOne({number: to});

        if(!from_user) throw ApiError.BadRequest('Incorrect "from" number');
        if(!to_user) throw ApiError.BadRequest('Incorrect "to" number');

        const from_user_balance = parseFloat(from_user.balance / 1000);
        const to_user_balance = parseFloat(to_user.balance / 1000);
        console.log('from_user_balance',from_user_balance)
        console.log('to_user_balance',to_user_balance)

        if(from_user_balance < formatted_amount) {
            throw ApiError.BadRequest('Not enough money');
        }

        from_user.balance = parseFloat((from_user_balance - formatted_amount) * 1000).toFixed(4)
        to_user.balance = parseFloat((to_user_balance + formatted_amount) * 1000).toFixed(4)
        console.log('(from_user_balance - formatted_amount) * 1000',(from_user_balance - formatted_amount) * 1000)
        console.log('(to_user_balance + formatted_amount) * 1000',(to_user_balance + formatted_amount) * 1000)
        from_user.save({validateModifiedOnly: true})
        to_user.save({validateModifiedOnly: true})

        return 200
    }
}


module.exports = new UserService();