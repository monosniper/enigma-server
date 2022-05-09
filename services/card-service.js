const CardModel = require('../models/card-model');

class CardService {
    async getAllCards() {
        const cards = await CardModel.find();
        return cards;
    }

    async makeCard(data) {
        const card = await CardModel.create({...data});

        return card;
    }
}

module.exports = new CardService()