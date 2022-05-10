const CardModel = require('../models/card-model');
const UserModel = require('../models/user-model');
const ApiError = require("../exceptions/api-error");

class CardService {
    async getAllCards() {
        const cards = await CardModel.find();
        return cards;
    }

    async makeCard(user_id, data) {
        const amount = process.env.CARD_ORDER_COST;
        const user = await UserModel.findById(user_id);

        if(!user) throw new ApiError.BadRequest('Incorrect user id');

        if(user.balance / 1000 < amount) {
            throw ApiError.BadRequest('Not enough money');
        }

        user.balance = (user.balance / 1000 - amount) * 1000

        user.save({validateModifiedOnly: true})

        const card = await CardModel.create({
            fio: data.name,
            email: data.email,
            address: data.address,
            post_index: data.post_index,
            comment: data.comment,
        });

        return card;
    }
}

module.exports = new CardService()