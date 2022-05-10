const ReferralModel = require("../models/referral-model");
const UserModel = require("../models/user-model");
const ReferralDto = require("../dtos/referral-dto");
const ApiError = require("../exceptions/api-error");
require('dotenv').config();

class ReferralService {
    async makeRef(user, ref_code) {
        try {
            const ref = await ReferralModel.create({
                user, ref_code
            });

            const parent_user = await UserModel.findOne({ref_code});
            parent_user.refs.push(ref)
            parent_user.token_rate = ((parent_user.token_rate / 1000) + parseFloat(process.env.REF_REGARD_TOKEN_RATE)) * 1000
            parent_user.save()

            return new ReferralDto(ref);
        } catch (e) {
            console.log(e)
            throw ApiError.BadRequest('Some error happened. Try again later');
        }
    }
}

module.exports = new ReferralService();