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
            const token_rate = parseFloat(parent_user.token_rate / 1000);
            const ref_token_rate = parseFloat(process.env.REF_REGARD_TOKEN_RATE);

            parent_user.refs.push(ref)
            parent_user.token_rate = parseFloat((token_rate + ref_token_rate) * 1000).toFixed(4);
            parent_user.save({ validateModifiedOnly: true })

            return new ReferralDto(ref);
        } catch (e) {
            console.log(e)
            throw ApiError.BadRequest('Some error happened. Try again later');
        }
    }
}

module.exports = new ReferralService();